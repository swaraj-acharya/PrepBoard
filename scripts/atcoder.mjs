// AtCoder problem list for Prepboard: fetch → normalise → deduplicate → classify → validate → store.
//
// Source: AtCoder Problems (github.com/kenkoooo/AtCoderProblems), an unofficial dataset used by most AtCoder tools.
// Its API guide asks for more than 1 second between requests and for caching, so every file is cached in .cache
// for 7 days and requests are spaced out. Only metadata and links are stored: never problem statements.
//
// Difficulty is AtCoder Problems' *estimate* (an IRT model fitted to contest results), not an official AtCoder number.
// The UI always labels it as an estimate. Problems without an estimate get no difficulty, or a clearly labelled
// guess from the problem letter, the same way Codeforces problems without ratings are handled.
import fs from "node:fs";
import path from "node:path";
import { PRACTICE_TOPICS, BRIDGE } from "./atcoder-bridge.mjs";

export const SOURCE = "kenkoooo.com/atcoder (AtCoder Problems, unofficial)";
const BASE = "https://kenkoooo.com/atcoder/resources";
const AGC_001_START = 1468670400; // AtCoder ratings start here (same constant as AtCoder Problems)

// Practice sets imported even though they are unrated. Short names are shown in lists.
// A set that isn't in contests.json is skipped and logged, so a wrong id can't add broken links.
export const PRACTICE = {
  dp: "EDPC",          // Educational DP Contest
  practice2: "ALPC",   // AtCoder Library Practice Contest
  typical90: "Typical 90",
  tdpc: "TDPC",        // Typical DP Contest
};

// ---------------------------------------------------------------- pure helpers (tested in scripts/test)

// AtCoder Problems' own display formula: estimates below 400 are squashed so they stay positive.
export const clipDifficulty = d => Math.round(d >= 400 ? d : 400 / Math.exp(1 - d / 400));

// Upper end of a contest's rated range: a number, "All", or 0 when unrated. Mirrors AtCoder Problems.
export function ratedUpper(contest) {
  if (!contest || contest.start_epoch_second < AGC_001_START) return 0;
  const rc = contest.rate_change;
  if (!rc || rc === "-") return 0;
  if (rc === "All") return "All";
  const parts = rc.split("~").map(s => s.trim());
  if (parts.length !== 2) return 0;
  const hi = parseInt(parts[1], 10);
  if (hi) return hi;
  return parseInt(parts[0], 10) ? "All" : 0;
}

// Returns a category, or null for contests we don't import (unrated one-offs, university contests, marathons…).
export function classifyContest(contest, problemCount = 100) {
  const id = contest.id;
  if (/^abc\d{3}$/.test(id)) return "ABC";
  if (/^arc\d{3}$/.test(id)) return "ARC";
  if (/^agc\d{3}$/.test(id)) return "AGC";
  if (/^ahc\d{3}$/.test(id)) return "AHC";
  if (PRACTICE[id]) return "Practice";
  const hi = ratedUpper(contest);
  if (hi && problemCount >= 2) return hi === "All" ? "AGC-Like" : hi < 2000 ? "ABC-Like" : "ARC-Like";
  return null;
}

// ARC has run in divisions: "(Div. 1)" / "(Div. 2)" in 2025, then ARC++ / ARC / ARC-- from 2026
// (atcoder.jp/posts/2026ARC_en). Read it from the official title rather than guessing from the number.
export function arcDivision(title = "") {
  if (/Regular Contest\s*\+\+/i.test(title)) return "ARC++";
  if (/Regular Contest\s*(--|−−|––)/i.test(title)) return "ARC--";
  if (/\(Div\.\s*1\)/i.test(title)) return "Div. 1";
  if (/\(Div\.\s*2\)/i.test(title)) return "Div. 2";
  return "";
}

const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

// Turn the raw AtCoder Problems files into Prepboard's compact list.
// Returns { data, stats } where data is written to public/data/ac.json.
export function normalize({ contests = [], problems = [], contestProblem = [], models = {}, merged = [] }) {
  const stats = { contestsIn: contests.length, problemsIn: problems.length, contestsKept: 0, kept: 0, invalid: 0, duplicateRows: 0, notImported: 0, sharedAcrossContests: 0, withEstimate: 0, letterGuess: 0, unrated: 0, practiceMissing: [] };

  const perContest = new Map();
  for (const cp of contestProblem) perContest.set(cp.contest_id, (perContest.get(cp.contest_id) || 0) + 1);
  for (const p of problems) if (!contestProblem.length) perContest.set(p.contest_id, (perContest.get(p.contest_id) || 0) + 1);

  const kept = new Map();
  for (const c of contests) {
    if (!c || !ID_RE.test(c.id || "")) continue;
    const type = classifyContest(c, perContest.get(c.id) || 0);
    if (!type) continue;
    kept.set(c.id, { id: c.id, title: String(c.title || c.id), type, div: type === "ARC" ? arcDivision(c.title) : "",
      start: c.start_epoch_second || 0, dur: c.duration_second || 0, rated: ratedUpper(c) });
  }
  stats.practiceMissing = Object.keys(PRACTICE).filter(id => !kept.has(id));

  // Every contest a problem appears in. The same task can be shared by two contests (e.g. old ABC/ARC pairs
  // held at the same time): it is stored once, under its own contest, with the others kept as aliases.
  const appears = new Map();
  for (const cp of contestProblem) {
    if (!appears.has(cp.problem_id)) appears.set(cp.problem_id, new Set());
    appears.get(cp.problem_id).add(cp.contest_id);
  }
  const point = new Map(merged.map(m => [m.id, m.point]));

  const items = [], seen = new Set();
  for (const p of problems) {
    if (!p || !ID_RE.test(p.id || "") || !ID_RE.test(p.contest_id || "") || !p.problem_index || !String(p.name || "").trim()) { stats.invalid++; continue; }
    if (seen.has(p.id)) { stats.duplicateRows++; continue; } // the same task listed twice: keep the first
    seen.add(p.id);
    let home = kept.get(p.contest_id);
    const also = [...(appears.get(p.id) || [])].filter(c => c !== p.contest_id && kept.has(c));
    if (!home && also.length) home = kept.get(also.shift()); // its own contest isn't imported, but a sharing one is
    if (!home) { stats.notImported++; continue; }
    if (also.length) stats.sharedAcrossContests++;
    const m = models[p.id];
    const raw = m && Number.isFinite(m.difficulty) ? Math.round(m.difficulty) : null;
    if (raw !== null) stats.withEstimate++;
    const pt = Number.isFinite(point.get(p.id)) ? point.get(p.id) : 0;
    const tags = PRACTICE_TOPICS[p.id] || PRACTICE_TOPICS[home.id] || null;
    items.push({ id: p.id, contest: home.id, index: String(p.problem_index), name: String(p.name).trim(), raw, exp: !!m?.is_experimental, point: pt, also, tags });
  }

  // Stable order, so re-running the script only changes what really changed.
  const order = [...kept.values()].sort((a, b) => a.start - b.start || a.id.localeCompare(b.id));
  const ci = new Map(order.map((c, i) => [c.id, i]));
  items.sort((a, b) => ci.get(a.contest) - ci.get(b.contest) || a.index.localeCompare(b.index, "en", { numeric: true }) || a.id.localeCompare(b.id));

  const used = new Set(items.map(x => x.contest));
  for (const x of items) for (const c of x.also) used.add(c);
  const contestsOut = order.filter(c => used.has(c.id));
  const ci2 = new Map(contestsOut.map((c, i) => [c.id, i]));
  stats.contestsKept = contestsOut.length;
  stats.kept = items.length;
  for (const x of items) {
    if (x.raw === null) {
      const t = contestsOut[ci2.get(x.contest)].type;
      if (["ABC", "ARC", "AGC", "ABC-Like", "ARC-Like", "AGC-Like"].includes(t)) stats.letterGuess++; else stats.unrated++;
    }
  }

  return {
    data: {
      v: 1, source: SOURCE, built: new Date().toISOString().slice(0, 10), seed: false,
      // [id, title, type, division, start (unix s), duration (s), rated upper bound (number | "All" | 0)]
      contests: contestsOut.map(c => [c.id, c.title, c.type, c.div, c.start, c.dur, c.rated]),
      // [task id, contest index, letter, name, raw estimated difficulty | null, experimental 0/1, points, alias contest indexes, topics | 0]
      items: items.map(x => [x.id, ci2.get(x.contest), x.index, x.name, x.raw, x.exp ? 1 : 0, x.point, x.also.map(c => ci2.get(c)), x.tags || 0]),
    },
    stats,
  };
}

// The DSA path's AtCoder links, checked against the real list. Unknown ids are dropped with a warning.
export function bridgeFor(stepId, acData) {
  const known = acData ? new Set(acData.items.map(x => x[0])) : null;
  const out = [], missing = [];
  for (const [id, why] of BRIDGE[stepId] || []) {
    if (known && !known.has(id)) { missing.push(id); continue; }
    out.push({ id: `ac:${id}`, why });
  }
  return { bridge: out, missing };
}

// ---------------------------------------------------------------- network (only used by npm run data)

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function politeJSON(url, file, { cache, maxAgeDays = 7, optional = false, log }) {
  const f = path.join(cache, file);
  if (fs.existsSync(f) && (Date.now() - fs.statSync(f).mtimeMs) / 864e5 < maxAgeDays) return JSON.parse(fs.readFileSync(f, "utf8"));
  await sleep(1200); // AtCoder Problems asks for more than 1 second between requests
  log(`Downloading ${url}`);
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 180000);
    const r = await fetch(url, { signal: ctl.signal, headers: { "User-Agent": "prepboard-data-script (github.com/swaraj-acharya/PrepBoard)", "Accept-Encoding": "gzip" } }).finally(() => clearTimeout(t));
    if (!r.ok) throw new Error(`${url} → ${r.status}`);
    const text = await r.text();
    const json = JSON.parse(text);
    fs.writeFileSync(f, text);
    return json;
  } catch (e) {
    if (fs.existsSync(f)) { log(`Couldn't refresh ${file}, using the older download.`); return JSON.parse(fs.readFileSync(f, "utf8")); }
    if (optional) { log(`Skipping ${file}: ${e.message}`); return null; }
    throw e;
  }
}

export async function buildAtCoder({ out, cache, offline = false, log = console.log }) {
  const target = path.join(out, "ac.json");
  const existing = fs.existsSync(target) ? JSON.parse(fs.readFileSync(target, "utf8")) : null;
  const cached = f => fs.existsSync(path.join(cache, f));
  if (offline && !cached("ac-problems.json")) {
    log(`AtCoder: offline and nothing downloaded yet, keeping ${existing ? "the current ac.json" : "no AtCoder list"}.`);
    return existing;
  }
  try {
    const opts = { cache, log, maxAgeDays: offline ? Infinity : 7 };
    const contests = await politeJSON(`${BASE}/contests.json`, "ac-contests.json", opts);
    const problems = await politeJSON(`${BASE}/problems.json`, "ac-problems.json", opts);
    const contestProblem = await politeJSON(`${BASE}/contest-problem.json`, "ac-contest-problem.json", { ...opts, optional: true }) || [];
    const models = await politeJSON(`${BASE}/problem-models.json`, "ac-problem-models.json", { ...opts, optional: true }) || {};
    const merged = await politeJSON(`${BASE}/merged-problems.json`, "ac-merged-problems.json", { ...opts, optional: true }) || [];
    const { data, stats } = normalize({ contests, problems, contestProblem, models, merged });
    if (!data.items.length) throw new Error("the downloaded list was empty");
    fs.writeFileSync(target, JSON.stringify(data));
    log(`AtCoder: ${stats.kept} problems from ${stats.contestsKept} contests (${stats.withEstimate} with a difficulty estimate, ${stats.letterGuess} estimated from the letter, ${stats.unrated} without one).`);
    log(`AtCoder: ${stats.sharedAcrossContests} problems shared by more than one contest stored once; ${stats.duplicateRows} repeated rows merged; ${stats.notImported} from unrated or non-algorithm contests left out; ${stats.invalid} malformed rows dropped.`);
    if (stats.practiceMissing.length) log(`AtCoder: practice sets not found, skipped: ${stats.practiceMissing.join(", ")}`);
    return data;
  } catch (e) {
    log(`AtCoder: couldn't build the list (${e.message}). Keeping ${existing ? "the current ac.json" : "no AtCoder list"}.`);
    return existing;
  }
}
