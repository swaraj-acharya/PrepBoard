"use client";
import { useSyncExternalStore } from "react";

const KEY = "prepboard:v1";
export const INTERVALS = [1, 3, 7, 21, 45]; // days between revisions
const EMPTY = { problems: {}, activity: {}, log: {}, settings: { lang: "C++", goal: 3, target: 2500, targets: [] } };

let state = EMPTY;
let loaded = false;
const subs = new Set();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (raw) state = { ...EMPTY, ...raw, settings: { ...EMPTY.settings, ...raw.settings } };
  } catch {}
}
function save(next) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  subs.forEach(f => f());
}

export function useStore() {
  return useSyncExternalStore(
    cb => { load(); subs.add(cb); return () => subs.delete(cb); },
    () => { load(); return state; },
    () => EMPTY
  );
}

export const today = (offset = 0) => {
  const d = new Date(); d.setDate(d.getDate() + offset);
  return d.toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
};
const bump = act => ({ ...act, [today()]: (act[today()] || 0) + 1 });

// History: what you did each day, as { "YYYY-MM-DD": [{ id, a, t }] }.
// a is "solved" or "tricky" (first solve) or "remembered" or "forgot" (a revision).
// One first-solve entry and one revision entry per question per day; the latest one wins.
const FIRST = ["solved", "tricky"], REV = ["remembered", "forgot"];
const addLog = (log = {}, id, a, day = today()) => {
  const group = FIRST.includes(a) ? FIRST : REV;
  const list = (log[day] || []).filter(e => !(e.id === id && group.includes(e.a)));
  return { ...log, [day]: [...list, { id, a, t: Date.now() }] };
};
const dropLog = (log = {}, id, day) => {
  if (!day || !log[day]) return log;
  const list = log[day].filter(e => !(e.id === id && FIRST.includes(e.a)));
  const next = { ...log };
  if (list.length) next[day] = list; else delete next[day];
  return next;
};

const setP = (slug, fn, log = false, entry = null) => {
  const cur = state.problems[slug] || {};
  const next = fn(cur);
  const problems = { ...state.problems };
  if (next) problems[slug] = { ...next, u: Date.now() }; else delete problems[slug];
  let history = state.log || {};
  if (entry === "unsolve") history = dropLog(history, slug, cur.solvedOn);
  else if (entry) history = addLog(history, slug, entry);
  save({ ...state, problems, activity: log ? bump(state.activity) : state.activity, log: history });
};
// A first solve is logged when the question had no status yet, or was first solved today (switching Solved / Solved with help).
const firstSolve = slug => { const p = state.problems[slug]; return !p?.status || p.solvedOn === today(); };

export const actions = {
  solve: slug => setP(slug, p => ({ ...p, status: "solved", stage: 0, due: today(INTERVALS[0]), solvedOn: p.solvedOn || today() }), !state.problems[slug]?.status, firstSolve(slug) ? "solved" : null),
  tricky: slug => setP(slug, p => ({ ...p, status: "revisit", stage: 0, due: today(1), solvedOn: p.solvedOn || today() }), !state.problems[slug]?.status, firstSolve(slug) ? "tricky" : null),
  remembered: slug => setP(slug, p => {
    const stage = (p.stage || 0) + 1;
    return { ...p, status: "solved", stage, due: stage < INTERVALS.length ? today(INTERVALS[stage]) : null };
  }, true, "remembered"),
  forgot: slug => setP(slug, p => ({ ...p, status: "revisit", stage: 0, due: today(1) }), true, "forgot"),
  clear: slug => setP(slug, p => {
    const { status, stage, due, solvedOn, ...keep } = p;
    return keep; // keeps a timestamp so "unsolved" also syncs to GitHub
  }, false, "unsolve"),
  note: (slug, notes) => setP(slug, p => ({ ...p, notes })),
  hint: (slug, n) => setP(slug, p => ({ ...p, hints: Math.max(p.hints || 0, n) })),
  work: (slug, work) => setP(slug, p => ({ ...p, work })),
  settings: patch => save({ ...state, settings: { ...state.settings, ...patch } }),
  toggleTarget: slug => {
    const t = state.settings.targets;
    actions.settings({ targets: t.includes(slug) ? t.filter(x => x !== slug) : [...t, slug] });
  },
  exportJSON: () => JSON.stringify(state, null, 2),
  importJSON: text => { const raw = JSON.parse(text); save({ ...EMPTY, ...raw, settings: { ...EMPTY.settings, ...raw.settings } }); },
  reset: () => save(EMPTY),
};

// Used by GitHub sync.
export const getState = () => { load(); return state; };
export const replaceState = next => save(next);
export const subscribe = cb => { load(); subs.add(cb); return () => subs.delete(cb); };

export function streak(activity) {
  let n = 0, i = activity[today()] ? 0 : -1;
  while (activity[today(i)]) { n++; i--; }
  return n;
}
