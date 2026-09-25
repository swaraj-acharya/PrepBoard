"use client";
import { useEffect, useSyncExternalStore } from "react";
import { getState, replaceState, subscribe } from "@/lib/store";
import { mergeStates } from "@/lib/merge";
import { useData, resolveItem } from "@/lib/data";
import { buildReadme, buildHistoryMd } from "@/lib/progressReadme";
import { initSolutions, getSolutionIndex, subscribeSolutions, solutionActions } from "@/lib/solutionStore";

// Saves your progress to GitHub through /api/progress, only when you click "Push Progress Now" in Settings.
// Everything you changed since the last push goes up together as one commit.
// Opening the site (or coming back to the tab) still loads progress from GitHub, so your devices stay in sync.
const KEY = "prepboard:sync";
let status = { connected: false, state: "off", at: null, message: "", commit: null, pending: 0 };
const listeners = new Set();
const setStatus = patch => { status = { ...status, ...patch }; listeners.forEach(f => f()); };
export const useSyncStatus = () => useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb); }, () => status, () => status);

const secret = () => { try { return JSON.parse(localStorage.getItem(KEY) || "null")?.secret || ""; } catch { return ""; } };
const snapshot = s => JSON.stringify({ problems: s.problems, activity: s.activity, log: s.log || {} });
let lastSynced = null, dataRef = null, pushing = false;
// Saved solutions: what GitHub had at the last pull or push, as { id: { h, n, r } } (null before the first pull).
// A question whose local hash differs from this has changes to push.
let remoteSol = null;
const solPendingIds = () => {
  if (remoteSol === null) return [];
  const { items } = getSolutionIndex();
  return Object.keys(items).filter(id => items[id].h !== remoteSol[id]?.h);
};

// What changed since the last push, question by question.
function diff(prev, next) {
  const out = { solved: [], revisit: [], revised: [], cleared: [], other: [] };
  const before = prev?.problems || {};
  for (const [id, v] of Object.entries(next.problems || {})) {
    const p = before[id];
    if (p && JSON.stringify(p) === JSON.stringify(v)) continue;
    if (v.status && v.status !== p?.status) (v.status === "solved" ? out.solved : out.revisit).push(id);
    else if (!v.status && p?.status) out.cleared.push(id);
    else if ((v.stage || 0) !== (p?.stage || 0)) out.revised.push(id);
    else out.other.push(id);
  }
  return out;
}
function countPending() {
  if (lastSynced === null) return 0;
  const sol = solPendingIds().length;
  const s = getState();
  if (snapshot(s) === lastSynced) return sol;
  const d = diff(lastSynced ? JSON.parse(lastSynced) : null, s);
  const n = d.solved.length + d.revisit.length + d.revised.length + d.cleared.length + d.other.length;
  return (n || 1) + sol; // n is 0 when only activity or history changed
}
const refreshPending = () => { const pending = countPending(); if (pending !== status.pending) setStatus({ pending }); };

async function call(method, body, query = "") {
  const r = await fetch(`/api/progress${query}`, { method, headers: { "Content-Type": "application/json", "x-sync-secret": secret() }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || `Saving to GitHub failed (${r.status}).`);
  return j;
}

async function pull({ quiet = false } = {}) {
  if (!secret()) return false;
  setStatus({ connected: true, ...(quiet ? {} : { state: "syncing", message: "Loading your progress from GitHub…" }) });
  try {
    const j = await call("GET");
    const local = getState();
    const merged = mergeStates(local, j.state);
    lastSynced = j.state ? snapshot(j.state) : "";
    if (snapshot(merged) !== snapshot(local)) replaceState(merged);
    await pullSolutions(j.solutions || {});
    const pending = countPending();
    if (!quiet) setStatus({
      state: "ok", at: new Date(), pending,
      message: !j.state ? `Connected to ${j.repo}. Click Push Progress Now to create progress/progress.json there.`
        : pending ? `Connected to ${j.repo}.` : `Up to date with ${j.repo}.`,
    });
    else setStatus({ pending });
    return true;
  } catch (e) { setStatus({ state: "error", message: e.message }); return false; }
}

// Downloads only the saved solutions that changed on GitHub since this browser last looked,
// and merges them in (every attempt from both sides is kept).
async function pullSolutions(remote) {
  await initSolutions();
  const { items } = getSolutionIndex();
  // Skip versions already merged at an earlier pull (local may differ only by unpushed edits),
  // but always fetch what this browser doesn't have at all (e.g. after "Delete all progress").
  const need = Object.keys(remote).filter(id => remote[id]?.h && items[id]?.h !== remote[id].h && (!items[id] || remoteSol?.[id]?.h !== remote[id].h));
  for (let i = 0; i < need.length; i += 40) {
    const ids = need.slice(i, i + 40);
    const j = await call("GET", null, `?solutions=${ids.map(encodeURIComponent).join(",")}`);
    await solutionActions.mergeIn(j.records || {});
  }
  remoteSol = remote;
}

// Groups changed solutions into requests small enough for Vercel (bodies over ~4.5 MB are refused).
function batches(records, maxBytes = 2_500_000, maxCount = 50) {
  const out = [];
  let cur = [], size = 0;
  for (const r of records) {
    const n = JSON.stringify(r).length;
    if (cur.length && (size + n > maxBytes || cur.length >= maxCount)) { out.push(cur); cur = []; size = 0; }
    cur.push(r); size += n;
  }
  if (cur.length) out.push(cur);
  return out;
}

// "saved 2 solutions; 1 AI review", from the attempt and review counts before and after.
function solutionPhrase(ids) {
  const { items } = getSolutionIndex();
  let attempts = 0, reviews = 0, removed = 0;
  for (const id of ids) {
    const d = (items[id]?.n || 0) - (remoteSol?.[id]?.n || 0);
    if (d > 0) attempts += d; else removed -= d;
    reviews += Math.max(0, (items[id]?.r || 0) - (remoteSol?.[id]?.r || 0));
  }
  const parts = [];
  if (attempts) parts.push(`saved ${attempts} solution${attempts === 1 ? "" : "s"}`);
  if (reviews) parts.push(`${reviews} AI review${reviews === 1 ? "" : "s"}`);
  if (removed) parts.push(`removed ${removed} saved attempt${removed === 1 ? "" : "s"}`);
  if (!parts.length && ids.length) parts.push(`updated saved solutions on ${ids.length} question${ids.length === 1 ? "" : "s"}`);
  return parts.join("; ");
}

function commitMessage(prev, next, solIds = []) {
  const d = diff(prev, next);
  const name = id => resolveItem(id, dataRef)?.name || id;
  const list = ids => ids.slice(0, 3).map(name).join(", ") + (ids.length > 3 ? ` and ${ids.length - 3} more` : "");
  const parts = [];
  if (d.solved.length) parts.push(d.solved.length === 1 ? `Solved ${name(d.solved[0])}` : `Solved ${d.solved.length} questions (${list(d.solved)})`);
  if (d.revisit.length) parts.push(`${d.revisit.length} marked for revision`);
  if (d.revised.length) parts.push(`${d.revised.length} revised`);
  if (d.cleared.length) parts.push(`${d.cleared.length} unmarked`);
  if (!parts.length && d.other.length) parts.push(`Updated notes on ${d.other.length} question${d.other.length === 1 ? "" : "s"}`);
  const sol = solutionPhrase(solIds);
  if (sol) parts.push(parts.length ? sol : sol[0].toUpperCase() + sol.slice(1));
  return parts.length ? parts.join("; ") : "Update DSA progress";
}

async function push() {
  if (!secret() || pushing) return;
  pushing = true;
  try {
    // Load the latest from GitHub first, so progress pushed from another device isn't overwritten.
    if (!(await pull({ quiet: true }))) return;
    const s = getState();
    const solIds = solPendingIds();
    if (snapshot(s) === lastSynced && !solIds.length) {
      setStatus({ state: "ok", at: new Date(), pending: 0, message: "Nothing new to push. GitHub already has all your progress." });
      return;
    }
    setStatus({ state: "syncing", message: `Pushing ${status.pending} change${status.pending === 1 ? "" : "s"} to GitHub…` });
    const prev = lastSynced ? JSON.parse(lastSynced) : null;
    const records = Object.values(await solutionActions.getMany(solIds));
    // Usually one commit. Only a very large first push (say, after restoring a big backup) is split.
    const parts = records.length ? batches(records) : [[]];
    const message = commitMessage(prev, s, solIds);
    const counts = getSolutionIndex().items;
    let j;
    for (let i = 0; i < parts.length; i++) {
      const suffix = parts.length > 1 ? ` (part ${i + 1} of ${parts.length})` : "";
      j = await call("POST", {
        state: s,
        message: i === 0 ? message + suffix : `Saved solutions for ${parts[i].length} more question${parts[i].length === 1 ? "" : "s"}${suffix}`,
        ...(i === 0 ? { readme: buildReadme(s, dataRef, notebookCounts(counts)), history: buildHistoryMd(s, dataRef) } : {}),
        solutions: parts[i].map(record => ({ record, base: remoteSol?.[record.id]?.h || null })),
      });
      if (j.solutions) remoteSol = j.solutions;
      if (j.records && Object.keys(j.records).length) await solutionActions.mergeIn(j.records);
    }
    lastSynced = snapshot(j.state);
    const merged = mergeStates(getState(), j.state);
    if (snapshot(merged) !== snapshot(getState())) replaceState(merged);
    setStatus({ state: "ok", at: new Date(), message: j.message || "Pushed to GitHub.", commit: j.commit || null, pending: countPending() });
  } catch (e) { setStatus({ state: "error", message: `${e.message} Your progress is still saved in this browser. Try Push Progress Now again.` }); }
  finally { pushing = false; }
}

// Totals for progress/README.md.
export function notebookCounts(items) {
  const all = Object.values(items || {});
  return { questions: all.filter(x => x.n).length, reviewed: all.filter(x => x.r).length, attempts: all.reduce((n, x) => n + (x.n || 0), 0) };
}

export const syncActions = {
  async connect(pw) {
    localStorage.setItem(KEY, JSON.stringify({ secret: pw.trim() }));
    lastSynced = null; remoteSol = null;
    await pull();
    if (status.state === "error") { localStorage.removeItem(KEY); setStatus({ connected: false }); }
  },
  disconnect() { localStorage.removeItem(KEY); lastSynced = null; remoteSol = null; setStatus({ connected: false, state: "off", message: "", commit: null, pending: 0 }); },
  pushNow: push,
};

export default function GitHubSync() {
  const data = useData();
  useEffect(() => { dataRef = data; }, [data]);
  useEffect(() => {
    if (secret()) pull();
    // Changes are only counted here, not pushed. Pushing happens when you click the button.
    const unsub = subscribe(() => { if (secret()) refreshPending(); });
    const unsubSol = subscribeSolutions(() => { if (secret()) refreshPending(); });
    const onVis = () => { if (secret() && document.visibilityState === "visible" && !pushing) pull({ quiet: true }); };
    document.addEventListener("visibilitychange", onVis);
    return () => { unsub(); unsubSol(); document.removeEventListener("visibilitychange", onVis); };
  }, []);
  return null;
}
