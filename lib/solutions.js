// Your solution notebook: every attempt you saved for a question, the AI review you pasted for it,
// and the improved solution you kept. One record per question, stored apart from progress
// (lib/store.js) because it can grow large. Used by the browser (lib/solutionStore.js),
// GitHub sync (app/api/progress) and the tests, so nothing here touches the browser.
//
// Record shape (one per question id):
// {
//   v: 1, id: "two-sum",
//   attempts: [{
//     id, at, u,               // at: when you saved it; u: last edit of code/lang (ms)
//     lang, code,              // exactly what you pasted; lang is null for design notes and CS answers
//     ctx: "solve" | "revision",
//     from?: "work",           // copied from the old single code box when this feature arrived
//     review?:   { raw, at, u },     // the AI reply, exactly as pasted or edited (raw is the source of truth)
//     improved?: { code, lang, u },  // the better solution you kept from the review
//   }],
//   deleted: { [attemptId]: time },  // so a deleted attempt stays deleted after syncing
//   u,                                // newest change anywhere in the record
// }
// A review or improved solution with empty text is a cleared one; it keeps its clock so the
// clearing syncs too. Anything derived from a review (summaries, verdicts) must be computed from raw.

export const SOLUTION_VERSION = 1;
export const LIMITS = { code: 100_000, review: 300_000 };

// Question ids: LeetCode slugs, cf:1A, cc:FLOW001, ac:abc350_c, hld:/lld:slug, cs:subject:slug.
export const validSolutionId = id => typeof id === "string" && id.length > 0 && id.length <= 200 && /^[A-Za-z0-9_.:-]+$/.test(id);
const validAttemptId = id => typeof id === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(id);
// Design notes (hld) and CS answers aren't code, so they have no language.
export const usesLang = id => !(id.startsWith("hld:") || id.startsWith("cs:"));

// cyrb53: a fast 53-bit string hash. Same result in the browser and on the server.
export function hashText(str) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

export function newAttemptId() {
  const rand = typeof crypto !== "undefined" && crypto.getRandomValues
    ? Array.from(crypto.getRandomValues(new Uint8Array(4)), b => b.toString(36).padStart(2, "0")).join("")
    : Math.random().toString(36).slice(2, 10);
  return `${Date.now().toString(36)}-${rand}`;
}

// Two pastes are the same solution if they differ only in line endings or trailing spaces.
const canonCode = s => String(s || "").replace(/\r\n?/g, "\n").split("\n").map(l => l.replace(/\s+$/, "")).join("\n").trim();
export const sameCode = (a, b) => canonCode(a) === canonCode(b);

// The code you had pasted before this feature existed becomes attempt 1. The id comes from the
// code itself, so two devices migrating the same code produce the same attempt, not two.
export const legacyAttempt = (code, at, lang) => ({ id: `w${hashText(canonCode(code))}`, at, u: at, lang, code, ctx: "solve", from: "work" });

const num = v => (Number.isFinite(v) && v > 0 ? Math.floor(v) : 0);
const lang = v => (typeof v === "string" && v && v.length <= 40 ? v : null);

function normReview(r) {
  if (!r || typeof r !== "object" || typeof r.raw !== "string") return null;
  return { raw: r.raw, at: num(r.at), u: num(r.u) };
}
function normImproved(r) {
  if (!r || typeof r !== "object" || typeof r.code !== "string") return null;
  return { code: r.code, lang: lang(r.lang), u: num(r.u) };
}
function build(core, review, improved) {
  const out = { id: core.id, at: core.at, u: core.u, lang: core.lang, code: core.code, ctx: core.ctx };
  if (core.from) out.from = core.from;
  if (review) out.review = review;
  if (improved) out.improved = improved;
  return out;
}
function normAttempt(a) {
  if (!a || typeof a !== "object" || !validAttemptId(a.id) || typeof a.code !== "string") return null;
  const at = num(a.at);
  const core = { id: a.id, at, u: num(a.u) || at, lang: lang(a.lang), code: a.code, ctx: a.ctx === "revision" ? "revision" : "solve", from: a.from === "work" ? "work" : undefined };
  return build(core, normReview(a.review), normImproved(a.improved));
}

// Newest wins. On a tie the choice depends only on the content, so merging in either order
// gives the same result on every device (otherwise two devices would keep "fixing" each other).
function pick(x, y) {
  if (!x) return y || null;
  if (!y) return x;
  if (x.u !== y.u) return x.u > y.u ? x : y;
  return JSON.stringify(x) >= JSON.stringify(y) ? x : y;
}
const coreOf = a => ({ id: a.id, at: a.at, u: a.u, lang: a.lang, code: a.code, ctx: a.ctx, from: a.from });
function mergeAttempt(a, b) {
  const core = pick(coreOf(a), coreOf(b));
  return build(core, pick(a.review, b.review), pick(a.improved, b.improved));
}

const byTime = (a, b) => a.at - b.at || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
function recordTime(attempts, deleted) {
  let u = 0;
  for (const a of attempts) u = Math.max(u, a.u, a.at, a.review?.u || 0, a.improved?.u || 0);
  for (const t of Object.values(deleted)) u = Math.max(u, t);
  return u;
}

// Makes any input (a file from GitHub, a backup, old data) safe to use: unknown fields dropped,
// types checked, duplicates merged, a fixed key order so the hash is stable. Null if unusable.
export function normalizeSolution(rec, id = rec?.id) {
  if (!rec || typeof rec !== "object" || !validSolutionId(id)) return null;
  const deleted = {};
  if (rec.deleted && typeof rec.deleted === "object") {
    for (const k of Object.keys(rec.deleted).sort()) if (validAttemptId(k)) deleted[k] = num(rec.deleted[k]) || 1;
  }
  const byId = new Map();
  for (const a of Array.isArray(rec.attempts) ? rec.attempts : []) {
    const n = normAttempt(a);
    if (!n || deleted[n.id]) continue;
    const cur = byId.get(n.id);
    byId.set(n.id, cur ? mergeAttempt(cur, n) : n);
  }
  const attempts = [...byId.values()].sort(byTime);
  return { v: SOLUTION_VERSION, id, attempts, deleted, u: recordTime(attempts, deleted) };
}

export const emptySolution = id => ({ v: SOLUTION_VERSION, id, attempts: [], deleted: {}, u: 0 });

// Merges two copies of one question's record (this browser + GitHub, or phone + laptop).
// Every attempt from both is kept; for the same attempt, its code, review and improved solution
// each take the newest version. Deleting an attempt wins over editing it.
export function mergeSolution(a, b) {
  const id = a?.id || b?.id;
  const x = normalizeSolution(a, id), y = normalizeSolution(b, id);
  if (!x || !y) return x || y;
  const deleted = { ...y.deleted };
  for (const [k, t] of Object.entries(x.deleted)) deleted[k] = Math.max(deleted[k] || 0, t);
  const byId = new Map(y.attempts.map(t => [t.id, t]));
  for (const t of x.attempts) byId.set(t.id, byId.has(t.id) ? mergeAttempt(byId.get(t.id), t) : t);
  return normalizeSolution({ id, attempts: [...byId.values()], deleted }, id);
}

export const solutionHash = rec => hashText(JSON.stringify(normalizeSolution(rec)));

const hasReview = a => !!a.review?.raw?.trim();
// The small per-question summary lists, filters and sync use, so they never load full records.
export function summarize(rec) {
  const n = normalizeSolution(rec);
  if (!n) return null;
  const last = n.attempts[n.attempts.length - 1];
  return {
    h: hashText(JSON.stringify(n)), u: n.u,
    n: n.attempts.length,                                  // attempts saved
    r: n.attempts.filter(hasReview).length,                // attempts with an AI review
    rv: n.attempts.filter(a => a.ctx === "revision").length, // revision attempts
    last: last?.at || 0,                                   // when the latest attempt was saved
    lr: last ? (hasReview(last) ? 1 : 0) : 0,              // does the latest attempt have a review?
  };
}

// Where a record lives in the GitHub repo, under the progress folder:
// two-sum -> solutions/leetcode/two-sum.json, cf:1A -> solutions/codeforces/1A.json,
// cs:dbms:what-is-acid -> solutions/cs/dbms/what-is-acid.json. Every character outside
// A-Z a-z 0-9 _ - is written as ~hex, so no two ids share a path and no path can escape the folder.
const FOLDER = { cf: "codeforces", cc: "codechef", ac: "atcoder", hld: "hld", lld: "lld", cs: "cs" };
const seg = s => (s ? s.replace(/[^A-Za-z0-9_-]/g, c => `~${c.charCodeAt(0).toString(16).padStart(2, "0")}`) : "~");
export const SOLUTIONS_DIR = "solutions";
export const SOLUTIONS_INDEX = `${SOLUTIONS_DIR}/index.json`;
export function solutionPath(id) {
  const parts = id.split(":");
  const [head, rest] = parts.length > 1 ? [FOLDER[parts[0]] || `~${seg(parts[0])}`, parts.slice(1)] : ["leetcode", parts];
  return `${SOLUTIONS_DIR}/${[head, ...rest.map(seg)].join("/")}.json`;
}

// Which lines of a appear in b and vice versa (longest common subsequence), for comparing
// two attempts side by side. Returns null for very long code, where it isn't worth the time.
export function diffLines(a, b) {
  const x = canonCode(a).split("\n"), y = canonCode(b).split("\n");
  if (x.length * y.length > 250_000) return null;
  const m = x.length, n = y.length;
  const dp = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));
  for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) {
    dp[i][j] = x[i].trim() === y[j].trim() ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  }
  const inA = new Array(m).fill(false), inB = new Array(n).fill(false);
  for (let i = 0, j = 0; i < m && j < n;) {
    if (x[i].trim() === y[j].trim()) { inA[i] = inB[j] = true; i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return { a: x.map((line, i) => ({ line, same: inA[i] })), b: y.map((line, i) => ({ line, same: inB[i] })) };
}
