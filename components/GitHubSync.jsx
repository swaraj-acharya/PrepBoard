"use client";
import { useEffect, useSyncExternalStore } from "react";
import { getState, replaceState, subscribe } from "@/lib/store";
import { mergeStates } from "@/lib/merge";
import { useData, resolveItem } from "@/lib/data";
import { buildReadme, buildHistoryMd } from "@/lib/progressReadme";

// Commits your progress to GitHub through /api/progress, about 10 seconds after your last change.
const KEY = "prepboard:sync";
const DELAY = 10000;
let status = { connected: false, state: "off", at: null, message: "", commit: null };
const listeners = new Set();
const setStatus = patch => { status = { ...status, ...patch }; listeners.forEach(f => f()); };
export const useSyncStatus = () => useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb); }, () => status, () => status);

const secret = () => { try { return JSON.parse(localStorage.getItem(KEY) || "null")?.secret || ""; } catch { return ""; } };
const snapshot = s => JSON.stringify({ problems: s.problems, activity: s.activity, log: s.log || {} });
let lastSynced = null, dataRef = null, timer = null;
const schedule = (ms = DELAY) => { clearTimeout(timer); timer = setTimeout(push, ms); };

async function call(method, body) {
  const r = await fetch("/api/progress", { method, headers: { "Content-Type": "application/json", "x-sync-secret": secret() }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || `Saving to GitHub failed (${r.status}).`);
  return j;
}

async function pull() {
  if (!secret()) return;
  setStatus({ connected: true, state: "syncing", message: "Loading your progress from GitHub…" });
  try {
    const j = await call("GET");
    const local = getState();
    const merged = mergeStates(local, j.state);
    lastSynced = j.state ? snapshot(j.state) : "";
    if (snapshot(merged) !== snapshot(local)) replaceState(merged);
    setStatus({ state: "ok", at: new Date(), message: j.state ? `Up to date with ${j.repo}.` : `Connected to ${j.repo}. Your next tick creates progress/progress.json there.` });
    if (snapshot(merged) !== lastSynced) schedule(1500);
  } catch (e) { setStatus({ state: "error", message: e.message }); }
}

function commitMessage(prev, next) {
  const solved = [], revisit = [];
  for (const [id, v] of Object.entries(next.problems || {})) {
    if (v.status && v.status !== prev?.problems?.[id]?.status) (v.status === "solved" ? solved : revisit).push(id);
  }
  const name = id => resolveItem(id, dataRef)?.name || id;
  const list = ids => ids.slice(0, 3).map(name).join(", ") + (ids.length > 3 ? ` and ${ids.length - 3} more` : "");
  if (solved.length) return `Solved ${list(solved)}`;
  if (revisit.length) return `Marked for revision: ${list(revisit)}`;
  return "Update DSA progress";
}

async function push() {
  if (!secret()) return;
  const s = getState();
  if (snapshot(s) === lastSynced) return;
  setStatus({ state: "syncing", message: "Saving to GitHub…" });
  try {
    const prev = lastSynced ? JSON.parse(lastSynced) : null;
    const j = await call("POST", { state: s, message: commitMessage(prev, s), readme: buildReadme(s, dataRef), history: buildHistoryMd(s, dataRef) });
    lastSynced = snapshot(j.state);
    const merged = mergeStates(getState(), j.state);
    if (snapshot(merged) !== snapshot(getState())) replaceState(merged);
    setStatus({ state: "ok", at: new Date(), message: j.message || "Saved to GitHub.", commit: j.commit || null });
  } catch (e) { setStatus({ state: "error", message: e.message }); schedule(60000); }
}

export const syncActions = {
  async connect(pw) {
    localStorage.setItem(KEY, JSON.stringify({ secret: pw.trim() }));
    lastSynced = null;
    await pull();
    if (status.state === "error") { localStorage.removeItem(KEY); setStatus({ connected: false }); }
  },
  disconnect() { localStorage.removeItem(KEY); clearTimeout(timer); lastSynced = null; setStatus({ connected: false, state: "off", message: "", commit: null }); },
  async syncNow() { clearTimeout(timer); await pull(); await push(); },
};

export default function GitHubSync() {
  const data = useData();
  useEffect(() => { dataRef = data; }, [data]);
  useEffect(() => {
    if (secret()) pull();
    const unsub = subscribe(() => { if (secret() && lastSynced !== null && snapshot(getState()) !== lastSynced) schedule(); });
    const onVis = () => {
      if (!secret()) return;
      if (document.visibilityState === "hidden") { if (lastSynced !== null && snapshot(getState()) !== lastSynced) push(); }
      else pull();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => { unsub(); document.removeEventListener("visibilitychange", onVis); };
  }, []);
  return null;
}
