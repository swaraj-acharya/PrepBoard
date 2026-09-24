// Numbers for the DSA profile, worked out from your saved progress. Pure functions: pages pass in a resolver
// (id → item), so this file doesn't depend on React and can be tested on its own.
import { INTERVALS, streak, longestStreak } from "./store.js";
import { DSA_TOPIC_NAMES } from "./topics.js";

export const HOW_LABEL = {
  independent: "On your own", hint: "After a hint", editorial: "After the editorial",
  code: "After reference code", help: "With help (not specified)",
};

// How independently a question was solved. Never generous: using hint 3 (the full-solution prompt) counts as
// reference code, and "Solved with help" without details counts as help, not as your own solve.
export function independence(v) {
  if (v?.how === "hint" || v?.how === "editorial" || v?.how === "code") return v.how;
  if ((v?.hints || 0) >= 3) return "code";
  if (v?.status === "revisit") return "help";
  if ((v?.hints || 0) >= 1) return "hint";
  return "independent";
}

const DSA_TOPICS = DSA_TOPIC_NAMES.filter(t => t !== "How to Approach a Problem");
const DSA_SET = new Set(DSA_TOPICS);
const PLATFORMS = ["lc", "cf", "cc", "ac"];

export function computeProfile(state, resolve, pathIds = []) {
  const P = state?.problems || {};
  const plat = { lc: { solved: 0, E: 0, M: 0, H: 0, sql: 0 }, cf: { solved: 0, H: 0 }, cc: { solved: 0, H: 0 }, ac: { solved: 0, H: 0 } };
  const how = { independent: 0, hint: 0, editorial: 0, code: 0, help: 0 };
  const topics = new Map();
  let coding = 0, hard = 0, hardIndependent = 0, resolved = 0, mastered = 0, bridgeDone = 0;

  for (const [id, v] of Object.entries(P)) {
    if (!v?.status || /^(hld|lld|cs):/.test(id)) continue;
    const pre = id.includes(":") ? id.slice(0, id.indexOf(":")) : "lc";
    if (!PLATFORMS.includes(pre)) continue;
    const it = resolve(id);
    if (pre === "lc" && it?.category) { plat.lc.sql++; continue; } // SQL, shell, pandas…: not DSA
    coding++; plat[pre].solved++;
    const lvl = it?.level;
    if (pre === "lc" && lvl && plat.lc[lvl] !== undefined) plat.lc[lvl]++;
    const h = independence(v); how[h]++;
    if (lvl === "H") { hard++; if (pre !== "lc") plat[pre].H++; if (h === "independent") hardIndependent++; }
    if ((v.stage || 0) >= 1) resolved++;
    if (!v.due && (v.stage || 0) >= INTERVALS.length) mastered++;
    for (const t of it?.topicNames || []) if (DSA_SET.has(t)) topics.set(t, (topics.get(t) || 0) + 1);
    if (it?.bridge) bridgeDone++;
  }

  let remembered = 0, forgot = 0;
  for (const list of Object.values(state?.log || {})) for (const e of list || []) {
    if (e?.a === "remembered") remembered++; else if (e?.a === "forgot") forgot++;
  }
  const activity = state?.activity || {};
  return {
    coding, plat, how, hard, hardIndependent, resolved, mastered, bridgeDone,
    topics, topicTotal: DSA_TOPICS.length,
    recall: remembered + forgot ? remembered / (remembered + forgot) : null, remembered, forgot,
    streak: streak(activity), longest: longestStreak(activity), activeDays: Object.values(activity).filter(n => n > 0).length,
    pathDone: pathIds.filter(id => P[id]?.status).length, pathTotal: pathIds.length,
  };
}

// When a rating first reached `min`, from the official history. null if never.
export const firstReached = (history, min) => (history || []).find(h => h.r >= min)?.t || null;

// Ask /api/ratings for fresh numbers. A failed platform keeps its last good snapshot (marked with the error);
// a removed username leaves a dated blank, so GitHub sync doesn't bring the old one back.
export async function refreshRatings(handles = {}, prev = {}) {
  const q = new URLSearchParams();
  if (handles.ac) q.set("ac", handles.ac);
  if (handles.cf) q.set("cf", handles.cf);
  const next = { ...prev }, errors = [];
  for (const k of ["ac", "cf"]) if (!handles[k] && prev[k]?.handle) next[k] = { handle: "", fetched: Date.now() };
  if (![...q.keys()].length) return { next, errors };
  const r = await fetch(`/api/ratings?${q}`);
  if (!r.ok) throw new Error(r.status === 401 ? "Sign in again to refresh ratings." : `Couldn't refresh ratings (${r.status}).`);
  const j = await r.json();
  for (const k of ["ac", "cf"]) {
    const v = j[k];
    if (!v) continue;
    if (v.error) { errors.push(v.error); next[k] = prev[k]?.handle === v.handle ? { ...prev[k], error: v.error } : { handle: v.handle, error: v.error, fetched: 0 }; }
    else next[k] = { ...v, fetched: Date.now() };
  }
  return { next, errors };
}
