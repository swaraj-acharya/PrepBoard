"use client";
import { useEffect, useSyncExternalStore } from "react";
import { getState, replaceState, subscribe } from "@/lib/store";
import { mergeStates } from "@/lib/merge";
import { useData, resolveItem } from "@/lib/data";
import { buildReadme, buildHistoryMd } from "@/lib/progressReadme";
import { initSolutions, getSolutionIndex, subscribeSolutions, solutionActions } from "@/lib/solutionStore";
import { normalizeSolution, mergeSolution, summarize, solutionPath, validSolutionId, hashText, SOLUTIONS_INDEX } from "@/lib/solutions";
import {
  folderSupported, kvGet, kvSet, kvDelete, openStorage, isGitRepo, readText, readJSONFile, writeText,
  hasConflict, gitStatus, canon, commitCommand, FolderFileError, FOLDER_META_KEY, STORAGE_DIR,
} from "@/lib/localFolder";

// Saves your progress into your own copy of the repo on this computer (its progress/ folder),
// a moment after each change. This site never talks to GitHub: at the end of the day you commit
// and push with Git, and Settings shows a commit message for what changed.
// Opening the site, or coming back to the tab, reads the folder again, so a `git pull` shows up here.
// The files and their format are the same as before: progress.json, README.md, HISTORY.md and solutions/.

const SAVE_DELAY = 800; // ms after your last change
let status = {
  supported: true, linked: false, state: "off", // off | loading | needs-permission | ok | error
  folder: "", path: STORAGE_DIR, created: false, repo: null, git: null,
  savedAt: null, message: "", repaired: false,
  unsaved: 0, toCommit: 0, commitMessage: "", command: "",
};
const listeners = new Set();
const setStatus = patch => {
  if (!Object.keys(patch).some(k => status[k] !== patch[k])) return;
  status = { ...status, ...patch };
  listeners.forEach(f => f());
};
export const useSyncStatus = () => useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb); }, () => status, () => status);
export const getSyncStatus = () => status;

let root = null, dir = null;                    // the folder you picked, and the progress folder in it
const NO_DISK = { state: undefined, problems: {}, full: "", sol: {} };
let disk = NO_DISK;                              // the progress folder as last read or written
let baseline = null;                             // the progress folder at your last commit: { problems, full, sol, head, at }
let dataRef = null, waitingForData = false;
let timer = null, writing = false, again = false, refreshing = null;

const fullHash = s => hashText(canon(s || {}));
const setDisk = (state, sol) => { disk = { state, problems: state?.problems || {}, full: fullHash(state), sol }; };
const sanitizeIndex = raw => Object.fromEntries(Object.entries(raw && typeof raw === "object" ? raw : {})
  .filter(([id, m]) => validSolutionId(id) && typeof m?.h === "string")
  .map(([id, m]) => [id, { h: m.h, u: m.u || 0, n: m.n || 0, r: m.r || 0 }]));
const shown = p => (status.path === "." ? p : `${status.path}/${p}`);
const readMeta = () => { try { return JSON.parse(localStorage.getItem(FOLDER_META_KEY) || "null"); } catch { return null; } };

// ---- what changed (for the "to commit" count and the commit message)
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
function changes(prev, s, sHash, items) {
  const d = diff(prev, s);
  let n = d.solved.length + d.revisit.length + d.revised.length + d.cleared.length + d.other.length;
  if (!n && prev.full !== sHash) n = 1; // only activity, history, Lab or settings changed
  const solIds = Object.keys(items).filter(id => items[id].h !== prev.sol?.[id]?.h);
  return { n: n + solIds.length, solIds };
}

// "saved 2 solutions; 1 AI review", from the attempt and review counts before and after.
function solutionPhrase(ids, before) {
  const { items } = getSolutionIndex();
  let attempts = 0, reviews = 0, removed = 0;
  for (const id of ids) {
    const d = (items[id]?.n || 0) - (before?.[id]?.n || 0);
    if (d > 0) attempts += d; else removed -= d;
    reviews += Math.max(0, (items[id]?.r || 0) - (before?.[id]?.r || 0));
  }
  const parts = [];
  if (attempts) parts.push(`saved ${attempts} solution${attempts === 1 ? "" : "s"}`);
  if (reviews) parts.push(`${reviews} AI review${reviews === 1 ? "" : "s"}`);
  if (removed) parts.push(`removed ${removed} saved attempt${removed === 1 ? "" : "s"}`);
  if (!parts.length && ids.length) parts.push(`updated saved solutions on ${ids.length} question${ids.length === 1 ? "" : "s"}`);
  return parts.join("; ");
}
function commitMessage(prev, next, solIds) {
  const d = diff(prev, next);
  const name = id => resolveItem(id, dataRef)?.name || id;
  const list = ids => ids.slice(0, 3).map(name).join(", ") + (ids.length > 3 ? ` and ${ids.length - 3} more` : "");
  const parts = [];
  if (d.solved.length) parts.push(d.solved.length === 1 ? `Solved ${name(d.solved[0])}` : `Solved ${d.solved.length} questions (${list(d.solved)})`);
  if (d.revisit.length) parts.push(`${d.revisit.length} marked for revision`);
  if (d.revised.length) parts.push(`${d.revised.length} revised`);
  if (d.cleared.length) parts.push(`${d.cleared.length} unmarked`);
  if (!parts.length && d.other.length) parts.push(`Updated notes on ${d.other.length} question${d.other.length === 1 ? "" : "s"}`);
  const sol = solutionPhrase(solIds, prev.sol);
  if (sol) parts.push(parts.length ? sol : sol[0].toUpperCase() + sol.slice(1));
  return parts.length ? parts.join("; ") : "Update DSA progress";
}

function refreshCounts() {
  const s = getState(), { items } = getSolutionIndex(), sHash = fullHash(s);
  const unsaved = dir && disk.state !== undefined ? changes(disk, s, sHash, items).n : 0;
  const c = baseline ? changes(baseline, s, sHash, items) : { n: 0, solIds: [] };
  const message = c.n ? commitMessage(baseline, s, c.solIds) : "";
  setStatus({ unsaved, toCommit: c.n, commitMessage: message, command: message ? commitCommand(message, status.path) : "" });
}
let countsTimer = null;
const countsSoon = () => { clearTimeout(countsTimer); countsTimer = setTimeout(refreshCounts, 150); };

async function setBaseline(state, sol, head) {
  baseline = {
    problems: state?.problems || {}, full: fullHash(state), head: head || null, at: Date.now(),
    sol: Object.fromEntries(Object.entries(sol || {}).map(([id, m]) => [id, { h: m.h, n: m.n || 0, r: m.r || 0 }])),
  };
  await kvSet("baseline", baseline).catch(() => {});
}

// A new commit (yours, or one a `git pull` brought in) means what's in the folder now is committed.
async function checkGit() {
  const git = root ? await gitStatus(root).catch(() => null) : null;
  if (git?.head && baseline && git.head !== baseline.head) {
    if (baseline.head) await setBaseline(disk.state, disk.sol, git.head);
    else { baseline = { ...baseline, head: git.head }; await kvSet("baseline", baseline).catch(() => {}); }
  }
  setStatus({ git });
}

// ---- reading and writing the folder
async function readDisk() {
  const conflicts = { progress: false, index: false, pages: false };
  const p = await readJSONFile(dir, "progress.json", (a, b) => mergeStates(a, b), shown("progress.json"));
  if (p.value !== null && (typeof p.value !== "object" || Array.isArray(p.value))) {
    throw new FolderFileError(`${shown("progress.json")} doesn't look like Prepboard progress, so nothing was saved over it.`);
  }
  conflicts.progress = p.conflict;
  let sol = {}, trusted = false;
  try {
    const idx = await readJSONFile(dir, SOLUTIONS_INDEX, (a, b) => ({ v: 1, items: { ...(b?.items || {}), ...(a?.items || {}) } }));
    trusted = !idx.conflict && !!(idx.value?.items && typeof idx.value.items === "object");
    sol = sanitizeIndex(idx.value?.items);
    conflicts.index = idx.conflict;
  } catch (e) {
    if (!(e instanceof FolderFileError)) throw e;
    conflicts.index = true; // a damaged index is rebuilt at the next save; each solution file is checked instead
  }
  for (const f of ["README.md", "HISTORY.md"]) if (hasConflict(await readText(dir, f))) conflicts.pages = true;
  return { state: p.value, sol, trusted, conflicts };
}
const anyConflict = c => c.progress || c.index || c.pages;

async function readSolution(id) {
  const r = await readJSONFile(dir, solutionPath(id), (a, b) => mergeSolution(a, b), shown(solutionPath(id)));
  return { rec: normalizeSolution(r.value, id), conflict: r.conflict };
}

// Keeps the browser's copy, but only if it really changed, so nothing saves again for no reason.
function apply(next) {
  if (canon(next) !== canon(getState())) replaceState(next);
}

const refresh = () => (refreshing ||= doRefresh().finally(() => { refreshing = null; }));
async function doRefresh() {
  if (!dir || writing) return;
  try {
    const d = await readDisk();
    setDisk(d.state, d.sol);
    await checkGit();
    if (!baseline) await setBaseline(d.state, d.sol, status.git?.head);
    // What a `git pull` brought in joins what's in this browser; for each question the newest change wins.
    if (d.state) apply(mergeStates(getState(), d.state));
    await pullSolutions(d.sol);
    setStatus({ state: "ok", message: "" });
    refreshCounts();
    if (status.unsaved || anyConflict(d.conflicts) || !d.state) schedule(0);
  } catch (e) { fail(e); }
}

// Saved solutions that differ in the folder are read and merged in (every attempt from both sides is kept).
async function pullSolutions(onDisk) {
  await initSolutions();
  const { items } = getSolutionIndex();
  const need = Object.keys(onDisk).filter(id => items[id]?.h !== onDisk[id].h);
  for (let i = 0; i < need.length; i += 40) {
    const recs = {};
    for (const id of need.slice(i, i + 40)) {
      const { rec } = await readSolution(id);
      if (rec) recs[id] = rec;
    }
    await solutionActions.mergeIn(recs);
  }
}

const schedule = (ms = SAVE_DELAY) => { clearTimeout(timer); timer = setTimeout(save, ms); };

async function save() {
  clearTimeout(timer); timer = null;
  if (refreshing) await refreshing;
  if (!dir) return;
  if (writing) { again = true; return; }
  // README.md needs question names, which arrive a moment after the page opens.
  if (!dataRef?.ready) { waitingForData = true; return; }
  writing = true;
  try {
    // Read the folder first, so anything a `git pull` changed since the last look is merged, not overwritten.
    const d = await readDisk();
    if (d.state) apply(mergeStates(getState(), d.state));
    await initSolutions();
    const { items } = getSolutionIndex();
    const index = { ...d.sol }, back = {};
    let wroteSolutions = 0;
    const ids = Object.keys(items).filter(id => !d.trusted || items[id].h !== d.sol[id]?.h);
    if (ids.length) {
      const recs = await solutionActions.getMany(ids);
      for (const id of ids) {
        let rec = recs[id];
        if (!rec) continue;
        const onDisk = d.sol[id] || !d.trusted ? await readSolution(id) : { rec: null, conflict: false };
        if (onDisk.rec) {
          const merged = mergeSolution(rec, onDisk.rec);
          if (summarize(merged).h !== summarize(rec).h) back[id] = merged; // the folder had attempts this browser didn't
          rec = merged;
        }
        const sum = summarize(rec);
        if (!onDisk.rec || onDisk.conflict || summarize(onDisk.rec).h !== sum.h) {
          await writeText(dir, solutionPath(id), JSON.stringify(rec, null, 1));
          wroteSolutions++;
        }
        index[id] = { h: sum.h, u: sum.u, n: sum.n, r: sum.r };
      }
      if (Object.keys(back).length) await solutionActions.mergeIn(back);
    }
    const indexChanged = canon(index) !== canon(d.sol) || d.conflicts.index || (!d.trusted && Object.keys(index).length > 0);
    if (indexChanged) await writeText(dir, SOLUTIONS_INDEX, JSON.stringify({ v: 1, items: Object.fromEntries(Object.entries(index).sort()) }, null, 1));

    const next = getState();
    const progressChanged = !d.state || d.conflicts.progress || canon(next) !== canon(d.state);
    if (progressChanged) await writeText(dir, "progress.json", JSON.stringify(next, null, 1));
    if (progressChanged || indexChanged || d.conflicts.pages) {
      await writeText(dir, "README.md", buildReadme(next, dataRef, notebookCounts(index)));
      await writeText(dir, "HISTORY.md", buildHistoryMd(next, dataRef));
    }
    setDisk(progressChanged ? next : d.state, index);
    const wrote = progressChanged || indexChanged || wroteSolutions > 0 || d.conflicts.pages;
    setStatus({
      state: "ok", message: "",
      ...(wrote ? { savedAt: new Date() } : {}),
      ...(anyConflict(d.conflicts) ? { repaired: true } : {}),
    });
    refreshCounts();
  } catch (e) { fail(e); }
  finally {
    writing = false;
    if (again) { again = false; schedule(0); }
  }
}

function fail(e) {
  const name = e?.name || "";
  const where = status.folder || "your repo folder";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return setStatus({ state: "needs-permission", message: `The browser needs your OK to keep saving to ${where}.` });
  }
  const message = e instanceof FolderFileError ? e.message
    : name === "NotFoundError" ? `${where} can't be found. It may have been moved, renamed or deleted. Choose the folder again.`
    : name === "NoModificationAllowedError" ? `A file in ${where} is open in another program, so it wasn't saved. Close it there, then click Save now.`
    : name === "QuotaExceededError" ? `Your disk is full, so ${where} couldn't be saved. Free some space, then click Save now.`
    : `Saving to ${where} failed (${e?.message || name || "unknown error"}). Your progress is still in this browser; click Save now to try again.`;
  setStatus({ state: "error", message });
}

// ---- linking the folder
async function attach(handle, { fresh = false } = {}) {
  clearTimeout(timer); timer = null;
  while (writing) await new Promise(r => setTimeout(r, 50));
  setStatus({ linked: true, state: "loading", message: `Opening ${handle.name}…` });
  try {
    const s = await openStorage(handle); // uses the progress folder that's there, or creates it
    root = handle; dir = s.dir; disk = NO_DISK;
    const path = s.inRoot ? STORAGE_DIR : ".";
    if (fresh) {
      await kvSet("root", handle);
      baseline = null; await kvDelete("baseline");
    }
    try { localStorage.setItem(FOLDER_META_KEY, JSON.stringify({ label: s.label, path })); } catch {}
    setStatus({ folder: s.label, path, created: fresh && s.created, repo: s.inRoot ? await isGitRepo(handle) : null, repaired: false });
    await refresh();
  } catch (e) {
    fail(e);
    if (!root) setStatus({ linked: false }); // a first link that failed; an earlier link stays as it was
  }
}

async function restore() {
  if (!folderSupported()) { setStatus({ supported: false }); return; }
  const handle = await kvGet("root");
  if (!handle) { try { localStorage.removeItem(FOLDER_META_KEY); } catch {} return; }
  root = handle;
  baseline = await kvGet("baseline");
  const meta = readMeta();
  setStatus({ linked: true, folder: meta?.label || handle.name, path: meta?.path || STORAGE_DIR });
  let permission = "prompt";
  try { permission = await handle.queryPermission({ mode: "readwrite" }); } catch {}
  if (permission === "granted") await attach(handle);
  else setStatus({ state: "needs-permission", message: `The browser needs your OK to keep saving to ${status.folder}.` });
}

export const syncActions = {
  // Opens the folder picker. Pick your repo (the folder with package.json and progress/ in it).
  async link() {
    if (!folderSupported()) return;
    let handle;
    try { handle = await window.showDirectoryPicker({ id: "prepboard-repo", mode: "readwrite" }); }
    catch (e) {
      if (e?.name !== "AbortError") setStatus({ state: "error", message: `That folder couldn't be opened (${e?.message || e}).` });
      return;
    }
    await attach(handle, { fresh: true });
  },
  // After the browser restarts it asks once more before letting the site write to the folder.
  async reconnect() {
    if (!root) return syncActions.link();
    try {
      const permission = await root.requestPermission({ mode: "readwrite" });
      if (permission === "granted") await attach(root);
      else setStatus({ state: "needs-permission", message: `The browser needs your OK to keep saving to ${status.folder}.` });
    } catch (e) { fail(e); }
  },
  async saveNow() {
    if (!dir) return;
    await save();
    await checkGit();
    refreshCounts();
  },
  // Only needed when the folder isn't a Git repo the site can read; otherwise commits are noticed by themselves.
  async markCommitted() {
    await initSolutions();
    await setBaseline(getState(), getSolutionIndex().items, status.git?.head);
    refreshCounts();
  },
  async unlink() {
    clearTimeout(timer); timer = null;
    root = null; dir = null; disk = NO_DISK; baseline = null;
    await kvDelete("root"); await kvDelete("baseline");
    try { localStorage.removeItem(FOLDER_META_KEY); } catch {}
    setStatus({ linked: false, state: "off", folder: "", path: STORAGE_DIR, created: false, repo: null, git: null, savedAt: null, message: "", repaired: false, unsaved: 0, toCommit: 0, commitMessage: "", command: "" });
  },
};

// Totals for progress/README.md.
export function notebookCounts(items) {
  const all = Object.values(items || {});
  return { questions: all.filter(x => x.n).length, reviewed: all.filter(x => x.r).length, attempts: all.reduce((n, x) => n + (x.n || 0), 0) };
}

export function setSyncData(data) {
  dataRef = data;
  if (data?.ready && waitingForData) { waitingForData = false; schedule(0); }
  if (data?.ready) countsSoon();
}

// Starts everything once the page opens; returns the clean-up for React.
let restoreP = null, lastLook = 0;
export function startLocalSync() {
  restoreP ||= restore();
  const onChange = () => { if (dir) schedule(); countsSoon(); };
  const look = () => {
    if (!dir || Date.now() - lastLook < 1500) return;
    lastLook = Date.now();
    refresh();
  };
  const onVisibility = () => {
    if (document.visibilityState === "hidden") { if (timer) save(); } // leaving the tab: save what's waiting
    else look();
  };
  const onPageHide = () => { if (timer) save(); };
  const unsub = subscribe(onChange), unsubSol = subscribeSolutions(onChange);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("focus", look);
  window.addEventListener("pagehide", onPageHide);
  return () => {
    unsub(); unsubSol();
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("focus", look);
    window.removeEventListener("pagehide", onPageHide);
  };
}

export default function LocalSync() {
  const data = useData();
  useEffect(() => { setSyncData(data); }, [data]);
  useEffect(() => startLocalSync(), []);
  return null;
}
