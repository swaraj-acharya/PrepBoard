"use client";
// Keeps your solution notebook (lib/solutions.js) in this browser.
//
// Why not localStorage like the rest of your progress: AI reviews are long, and localStorage
// holds about 5 MB for the whole site. A few hundred reviews would fill it, and then your
// normal progress would stop saving too. IndexedDB is the browser's own store for larger data,
// with no extra library. If it's unavailable, this falls back to localStorage, then to memory.
//
// Only a small summary per question is loaded when the site opens. Full records (code and
// reviews) are read when you open a question, push to GitHub, or download a backup.
import { useEffect, useSyncExternalStore } from "react";
import { normalizeSolution, mergeSolution, summarize, emptySolution, sameCode, newAttemptId, legacyAttempt, usesLang, validSolutionId, LIMITS } from "./solutions";
import { getState } from "./store";

const DB_NAME = "prepboard", DB_VERSION = 1, RECORDS = "solutions", INDEX = "solutionIndex";
const LS_KEY = "prepboard:solutions:v1";
const MIGRATED_KEY = "prepboard:solutions:migrated";

export class SolutionError extends Error {}

function idbBackend() {
  let dbp = null;
  const open = () => (dbp ||= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(RECORDS)) db.createObjectStore(RECORDS);
      if (!db.objectStoreNames.contains(INDEX)) db.createObjectStore(INDEX);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error("The solution store is open in an older tab. Close other Prepboard tabs and reload."));
  }));
  // Runs fn inside one transaction; resolves with fn's return value once the transaction commits.
  const tx = async (stores, mode, fn) => {
    const db = await open();
    return new Promise((resolve, reject) => {
      const t = db.transaction(stores, mode);
      const out = fn(t);
      t.oncomplete = () => resolve(out);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error || new Error("Saving was cancelled."));
    });
  };
  const readAll = store => tx([store], "readonly", t => {
    const out = {};
    const req = t.objectStore(store).openCursor();
    req.onsuccess = () => { const c = req.result; if (c) { out[c.key] = c.value; c.continue(); } };
    return out;
  });
  return {
    kind: "indexeddb",
    open,
    index: () => readAll(INDEX),
    all: () => readAll(RECORDS),
    get: id => tx([RECORDS], "readonly", t => { const box = {}; const r = t.objectStore(RECORDS).get(id); r.onsuccess = () => { box.v = r.result; }; return box; }).then(b => b.v || null),
    put: list => tx([RECORDS, INDEX], "readwrite", t => {
      const recs = t.objectStore(RECORDS), idx = t.objectStore(INDEX);
      for (const { id, rec, sum } of list) { recs.put(rec, id); idx.put(sum, id); }
    }),
    clear: () => tx([RECORDS, INDEX], "readwrite", t => { t.objectStore(RECORDS).clear(); t.objectStore(INDEX).clear(); }),
  };
}

function localBackend() {
  const read = () => {
    try { const j = JSON.parse(localStorage.getItem(LS_KEY) || "{}"); return j && typeof j === "object" && !Array.isArray(j) ? j : {}; }
    catch { return {}; }
  };
  return {
    kind: "localstorage",
    index: async () => Object.fromEntries(Object.entries(read()).map(([id, r]) => [id, summarize(normalizeSolution(r, id))]).filter(([, s]) => s)),
    all: async () => read(),
    get: async id => read()[id] || null,
    put: async list => { const all = read(); for (const { id, rec } of list) all[id] = rec; localStorage.setItem(LS_KEY, JSON.stringify(all)); },
    clear: async () => localStorage.removeItem(LS_KEY),
  };
}

function memoryBackend() {
  const all = {};
  return {
    kind: "memory",
    index: async () => ({}), all: async () => ({ ...all }), get: async id => all[id] || null,
    put: async list => { for (const { id, rec } of list) all[id] = rec; },
    clear: async () => { for (const k of Object.keys(all)) delete all[k]; },
  };
}

async function pickBackend() {
  if (typeof indexedDB !== "undefined") {
    try { const b = idbBackend(); await b.open(); return b; } catch {}
  }
  try { localStorage.setItem(`${LS_KEY}:test`, "1"); localStorage.removeItem(`${LS_KEY}:test`); return localBackend(); } catch {}
  return memoryBackend();
}

// ---- state
let backend = null;
let index = {};             // question id -> summary (see summarize in lib/solutions.js)
const cache = new Map();    // question id -> full record, for questions opened this session
const unreadable = new Set(); // question ids whose record couldn't be read this session
let snap = { ready: false, items: index, storage: null };
const EMPTY_SNAP = { ready: false, items: {}, storage: null };
const subs = new Set();
const emit = () => { snap = { ready: !!backend, items: index, storage: backend?.kind || null }; subs.forEach(f => f()); };
const subscribe = cb => { initSolutions(); subs.add(cb); return () => subs.delete(cb); };

let initP = null;
export function initSolutions() {
  if (typeof window === "undefined") return Promise.resolve();
  return (initP ||= (async () => {
    let b = await pickBackend();
    try { index = sanitizeIndex(await b.index()); }
    catch { b = memoryBackend(); index = {}; } // unreadable store: keep working this session, nothing is overwritten
    backend = b;
    emit();
    // Runs before init resolves. Every write waits for init first, so nothing can interleave;
    // it must not use the write queue, or a write queued during start-up would wait on itself.
    await migrateLegacyWork().catch(() => {});
  })());
}
const sanitizeIndex = raw => Object.fromEntries(Object.entries(raw || {}).filter(([id, s]) => validSolutionId(id) && s && typeof s.h === "string"));

// Every write goes through one queue, so two quick clicks can't overwrite each other.
let chain = Promise.resolve();
const queue = fn => { const run = chain.then(fn); chain = run.catch(() => {}); return run; };

async function loadRecord(id) {
  if (cache.has(id)) return cache.get(id);
  if (!index[id]) return null;
  let rec = null;
  try { rec = normalizeSolution(await backend.get(id), id); } catch {}
  if (rec) { cache.set(id, rec); unreadable.delete(id); }
  else unreadable.add(id);
  return rec;
}

function storageMessage(e) {
  const name = e?.name || "";
  if (/quota/i.test(name) || /quota/i.test(e?.message || "")) return "Your browser's storage for this site is full, so this wasn't saved. Download a backup from Settings, then clear space in your browser.";
  return `This couldn't be saved in your browser (${e?.message || "storage error"}). Your text is still in the box; try again.`;
}

// Writes many records at once (sync, backup restore, migration). Only changed ones are written.
async function putRecords(recs) {
  const list = [];
  for (const rec of recs) {
    const sum = summarize(rec);
    if (sum && index[rec.id]?.h !== sum.h) list.push({ id: rec.id, rec, sum });
  }
  if (!list.length) return 0;
  try { await backend.put(list); } catch (e) { throw new SolutionError(storageMessage(e)); }
  const next = { ...index };
  for (const { id, rec, sum } of list) { next[id] = sum; cache.set(id, rec); }
  index = next;
  emit();
  return list.length;
}

// Loads the record, applies fn, saves the result. Nothing changes in memory unless the save worked.
function update(id, fn) {
  if (!validSolutionId(id)) return Promise.reject(new SolutionError("This question can't hold a saved solution."));
  return queue(async () => {
    await initSolutions();
    const cur = await loadRecord(id);
    // Never replace saved attempts we failed to read with an empty record.
    if (!cur && index[id]) throw new SolutionError("Your saved solutions for this question couldn't be read, so nothing was changed. Reload the page and try again.");
    const base = cur || emptySolution(id);
    const next = normalizeSolution(fn(base), id);
    if (!next) throw new SolutionError("That change couldn't be applied.");
    await putRecords([next]);
    return next;
  });
}

const findAttempt = (rec, attemptId) => {
  const a = rec.attempts.find(x => x.id === attemptId);
  if (!a) throw new SolutionError("That attempt no longer exists. It may have been deleted on another device.");
  return a;
};
const replaceAttempt = (rec, next) => ({ ...rec, attempts: rec.attempts.map(a => (a.id === next.id ? next : a)) });
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };
function checkCode(code, what = "your solution") {
  const text = String(code ?? "");
  if (!text.trim()) throw new SolutionError(`Paste ${what} before saving.`);
  if (text.length > LIMITS.code) throw new SolutionError(`That's ${text.length.toLocaleString("en-IN")} characters; the limit is ${LIMITS.code.toLocaleString("en-IN")}. Paste only the solution.`);
  return text;
}

export const solutionActions = {
  // Saves pasted code as a new attempt. Returns { status, attempt }:
  // "created"; "duplicate" (the same code was already saved today, so nothing new is made);
  // "same-as-earlier" (identical to an attempt from an earlier day; pass force to save it anyway).
  async saveAttempt(id, { code, lang, ctx = "solve", force = false }) {
    const text = checkCode(code);
    let out;
    await update(id, rec => {
      const match = [...rec.attempts].reverse().find(a => sameCode(a.code, text));
      if (match && match.at >= startOfToday()) { out = { status: "duplicate", attempt: match }; return rec; }
      if (match && !force) { out = { status: "same-as-earlier", attempt: match }; return rec; }
      const now = Date.now();
      const attempt = { id: newAttemptId(), at: now, u: now, lang: usesLang(id) ? lang || null : null, code: text, ctx: ctx === "revision" ? "revision" : "solve" };
      out = { status: "created", attempt };
      return { ...rec, attempts: [...rec.attempts, attempt] };
    });
    return out;
  },
  // Fixing a typo in a saved attempt keeps its date; the attempt shows as edited.
  editAttempt: (id, attemptId, { code, lang }) => {
    const text = checkCode(code, "the code");
    return update(id, rec => {
      const a = findAttempt(rec, attemptId);
      if (sameCode(a.code, text) && (lang === undefined || lang === a.lang)) return rec;
      return replaceAttempt(rec, { ...a, code: text, lang: lang === undefined ? a.lang : lang, u: Math.max(Date.now(), a.u + 1) });
    });
  },
  deleteAttempt: (id, attemptId) => update(id, rec => ({
    ...rec, attempts: rec.attempts.filter(a => a.id !== attemptId), deleted: { ...rec.deleted, [attemptId]: Date.now() },
  })),
  // The AI's reply, stored exactly as you pasted or edited it. Replacing a review needs the caller to confirm first.
  saveReview(id, attemptId, raw) {
    const text = String(raw ?? "");
    if (!text.trim()) return Promise.reject(new SolutionError("Paste the AI's review before saving."));
    if (text.length > LIMITS.review) return Promise.reject(new SolutionError(`That review is ${text.length.toLocaleString("en-IN")} characters; the limit is ${LIMITS.review.toLocaleString("en-IN")}.`));
    return update(id, rec => {
      const a = findAttempt(rec, attemptId);
      if (a.review?.raw === text) return rec;
      const now = Date.now();
      return replaceAttempt(rec, { ...a, review: { raw: text, at: a.review?.raw ? a.review.at : now, u: Math.max(now, (a.review?.u || 0) + 1) } });
    });
  },
  clearReview: (id, attemptId) => update(id, rec => {
    const a = findAttempt(rec, attemptId);
    return a.review?.raw ? replaceAttempt(rec, { ...a, review: { raw: "", at: a.review.at, u: Math.max(Date.now(), a.review.u + 1) } }) : rec;
  }),
  // The better solution you keep from the review, separate from your own code. Empty clears it.
  saveImproved(id, attemptId, { code, lang }) {
    const text = String(code ?? "");
    if (text.length > LIMITS.code) return Promise.reject(new SolutionError(`That's longer than ${LIMITS.code.toLocaleString("en-IN")} characters.`));
    return update(id, rec => {
      const a = findAttempt(rec, attemptId);
      if ((a.improved?.code || "") === text && (a.improved?.lang ?? null) === (lang ?? null)) return rec;
      if (!text.trim() && !a.improved) return rec;
      return replaceAttempt(rec, { ...a, improved: { code: text, lang: usesLang(id) ? lang || null : null, u: Math.max(Date.now(), (a.improved?.u || 0) + 1) } });
    });
  },
  // Merges records from GitHub or a backup into this browser. Returns how many changed here.
  mergeIn(records) {
    return queue(async () => {
      await initSolutions();
      const merged = [];
      for (const [key, raw] of Object.entries(records || {})) {
        const incoming = normalizeSolution(raw, raw?.id || key);
        if (!incoming) continue;
        const local = await loadRecord(incoming.id);
        merged.push(local ? mergeSolution(local, incoming) : incoming);
      }
      return putRecords(merged);
    });
  },
  // Full records, for GitHub pushes and backups.
  async getMany(ids) {
    await initSolutions();
    return queue(async () => {
      const out = {};
      for (const id of ids) { const r = await loadRecord(id); if (r) out[id] = r; }
      return out;
    });
  },
  async exportAll() {
    await initSolutions();
    return queue(async () => {
      const raw = await backend.all();
      const out = {};
      for (const id of Object.keys(raw).sort()) { const r = normalizeSolution(raw[id], id); if (r) out[id] = r; }
      return out;
    });
  },
  clearAll() {
    return queue(async () => {
      await initSolutions();
      await backend.clear();
      cache.clear(); unreadable.clear(); index = {}; emit();
    });
  },
};

// Before this feature, each question had one code box ("work" in your progress). That code is
// your original attempt, so on the first run it becomes attempt 1 for every question that has
// no saved solutions yet. It runs once per browser; nothing is removed from your progress.
function legacyRecords(problems, lang) {
  const recs = [];
  for (const [id, p] of Object.entries(problems || {})) {
    if (!validSolutionId(id) || index[id] || typeof p?.work !== "string" || !p.work.trim() || p.work.length > LIMITS.code) continue;
    const at = Number.isFinite(p.u) ? p.u : Date.now();
    recs.push(normalizeSolution({ id, attempts: [legacyAttempt(p.work, at, usesLang(id) ? lang || null : null)], deleted: {} }, id));
  }
  return recs;
}
async function migrateLegacyWork() {
  if (localStorage.getItem(MIGRATED_KEY)) return;
  const { problems = {}, settings = {} } = getState();
  await putRecords(legacyRecords(problems, settings.lang));
  localStorage.setItem(MIGRATED_KEY, String(Date.now()));
}
// Restoring a backup made before saved solutions existed: its code boxes are original attempts too.
// Questions that already have saved solutions here are left alone. Returns how many were added.
solutionActions.adoptLegacyWork = (problems, lang) => queue(async () => {
  await initSolutions();
  return putRecords(legacyRecords(problems, lang));
});

// ---- hooks
export const useSolutionIndex = () => useSyncExternalStore(subscribe, () => snap, () => EMPTY_SNAP);
export const getSolutionIndex = () => snap;
export const subscribeSolutions = subscribe;

// One question's full record. { record: null } while loading or when nothing is saved yet.
export function useSolution(id) {
  const s = useSolutionIndex();
  const has = !!s.items[id];
  const cached = useSyncExternalStore(subscribe, () => cache.get(id) || null, () => null);
  useEffect(() => {
    if (!s.ready || !has || cache.has(id)) return;
    queue(() => loadRecord(id)).then(() => emit(), () => {});
  }, [id, s.ready, has]);
  const failed = has && !cached && unreadable.has(id);
  return { record: has ? cached : null, loading: !s.ready || (has && !cached && !failed), failed, summary: s.items[id] || null };
}
