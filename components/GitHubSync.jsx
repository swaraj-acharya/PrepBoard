"use client";
import { useEffect, useSyncExternalStore } from "react";
import { getState, replaceState, subscribe } from "@/lib/store";
import { mergeStates } from "@/lib/merge";
import { useData, resolveItem } from "@/lib/data";
import { buildReadme, buildHistoryMd } from "@/lib/progressReadme";

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
  const s = getState();
  if (snapshot(s) === lastSynced) return 0;
  const d = diff(lastSynced ? JSON.parse(lastSynced) : null, s);
  const n = d.solved.length + d.revisit.length + d.revised.length + d.cleared.length + d.other.length;
  return n || 1; // only activity or history changed
}
const refreshPending = () => { const pending = countPending(); if (pending !== status.pending) setStatus({ pending }); };

async function call(method, body) {
  const r = await fetch("/api/progress", { method, headers: { "Content-Type": "application/json", "x-sync-secret": secret() }, body: body ? JSON.stringify(body) : undefined });
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

function commitMessage(prev, next) {
  const d = diff(prev, next);
  const name = id => resolveItem(id, dataRef)?.name || id;
  const list = ids => ids.slice(0, 3).map(name).join(", ") + (ids.length > 3 ? ` and ${ids.length - 3} more` : "");
  const parts = [];
  if (d.solved.length) parts.push(d.solved.length === 1 ? `Solved ${name(d.solved[0])}` : `Solved ${d.solved.length} questions (${list(d.solved)})`);
  if (d.revisit.length) parts.push(`${d.revisit.length} marked for revision`);
  if (d.revised.length) parts.push(`${d.revised.length} revised`);
  if (d.cleared.length) parts.push(`${d.cleared.length} unmarked`);
  if (!parts.length && d.other.length) parts.push(`Updated notes on ${d.other.length} question${d.other.length === 1 ? "" : "s"}`);
  return parts.length ? parts.join("; ") : "Update DSA progress";
}

async function push() {
  if (!secret() || pushing) return;
  pushing = true;
  try {
    // Load the latest from GitHub first, so progress pushed from another device isn't overwritten.
    if (!(await pull({ quiet: true }))) return;
    const s = getState();
    if (snapshot(s) === lastSynced) {
      setStatus({ state: "ok", at: new Date(), pending: 0, message: "Nothing new to push. GitHub already has all your progress." });
      return;
    }
    setStatus({ state: "syncing", message: `Pushing ${status.pending} change${status.pending === 1 ? "" : "s"} to GitHub…` });
    const prev = lastSynced ? JSON.parse(lastSynced) : null;
    const j = await call("POST", { state: s, message: commitMessage(prev, s), readme: buildReadme(s, dataRef), history: buildHistoryMd(s, dataRef) });
    lastSynced = snapshot(j.state);
    const merged = mergeStates(getState(), j.state);
    if (snapshot(merged) !== snapshot(getState())) replaceState(merged);
    setStatus({ state: "ok", at: new Date(), message: j.message || "Pushed to GitHub.", commit: j.commit || null, pending: countPending() });
  } catch (e) { setStatus({ state: "error", message: `${e.message} Your progress is still saved in this browser. Try Push Progress Now again.` }); }
  finally { pushing = false; }
}

export const syncActions = {
  async connect(pw) {
    localStorage.setItem(KEY, JSON.stringify({ secret: pw.trim() }));
    lastSynced = null;
    await pull();
    if (status.state === "error") { localStorage.removeItem(KEY); setStatus({ connected: false }); }
  },
  disconnect() { localStorage.removeItem(KEY); lastSynced = null; setStatus({ connected: false, state: "off", message: "", commit: null, pending: 0 }); },
  pushNow: push,
};

export default function GitHubSync() {
  const data = useData();
  useEffect(() => { dataRef = data; }, [data]);
  useEffect(() => {
    if (secret()) pull();
    // Changes are only counted here, not pushed. Pushing happens when you click the button.
    const unsub = subscribe(() => { if (secret()) refreshPending(); });
    const onVis = () => { if (secret() && document.visibilityState === "visible" && !pushing) pull({ quiet: true }); };
    document.addEventListener("visibilitychange", onVis);
    return () => { unsub(); document.removeEventListener("visibilitychange", onVis); };
  }, []);
  return null;
}
