// Builds everything in public/data from public sources. Run: npm run data   (needs git and internet)
//
// LeetCode (all, incl. premium) ... github.com/doocs/leetcode (solution/result.json)
// Company questions ............... github.com/snehasishroy/leetcode-companywise-interview-questions (+ an older snapshot for "last 1 year")
//                                   github.com/liquidslr/leetcode-company-wise-problems (extra companies + topic tags)
// Codeforces ...................... codeforces.com/api (official, with ratings), falls back to github.com/Ronin5205/Codeforces-Problemset-Statements
// CodeChef ........................ github.com/captn3m0/codechef + codechef.com/api/list/problems (newer problems, ratings)
// AtCoder ......................... kenkoooo.com/atcoder (AtCoder Problems, unofficial): see scripts/atcoder.mjs
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { SEQUENCE } from "./sequence.mjs";
import { buildAtCoder, bridgeFor } from "./atcoder.mjs";

const CACHE = ".cache";
const OUT = "public/data";
const OFFLINE = process.argv.includes("--offline"); // skip the live Codeforces / CodeChef APIs
const log = (...a) => console.log("•", ...a);
fs.mkdirSync(CACHE, { recursive: true });

const git = (cmd, cwd) => execSync(`git ${cmd}`, { cwd, stdio: ["ignore", "pipe", "inherit"] }).toString().trim();
function syncRepo(name, url, { history = false } = {}) {
  const dir = path.join(CACHE, name);
  if (fs.existsSync(path.join(dir, ".git"))) {
    try { git("pull --ff-only -q", dir); } catch { log(`Couldn't update ${name}; using the copy already downloaded.`); }
  } else {
    log(`Downloading ${url}`);
    git(`clone -q ${history ? "--filter=blob:none" : "--depth 1"} ${url} ${dir}`);
  }
  return dir;
}
async function fetchWithTimeout(url, ms) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try { return await fetch(url, { signal: ctl.signal, headers: { "User-Agent": "prepboard-data-script" } }); }
  finally { clearTimeout(t); }
}
async function cachedDownload(url, file, maxAgeDays = 7) {
  const f = path.join(CACHE, file);
  if (fs.existsSync(f) && (Date.now() - fs.statSync(f).mtimeMs) / 864e5 < maxAgeDays) return f;
  log(`Downloading ${url}`);
  const r = await fetchWithTimeout(url, 180000);
  if (!r.ok) throw new Error(`${url} → ${r.status}`);
  fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
  return f;
}

function parseCSV(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows = []; let row = [], cur = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cur); if (row.some(Boolean)) rows.push(row); row = []; cur = ""; }
    else cur += c;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  const [head = [], ...body] = rows;
  return body.map(r => Object.fromEntries(head.map((h, i) => [h.trim(), (r[i] ?? "").trim()])));
}
const readCSV = f => (fs.existsSync(f) ? parseCSV(fs.readFileSync(f, "utf8")) : []);
const slugOf = url => url.replace(/\/+$/, "").split("/").pop();
const slugify = s => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const D1 = d => ({ E: "E", M: "M", H: "H" })[(d || "").trim().toUpperCase()[0]];
const pretty = s => s.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");

// ---------------------------------------------------------------- LeetCode (all problems)
const problems = {};
{
  const f = await cachedDownload("https://raw.githubusercontent.com/doocs/leetcode/main/solution/result.json", "doocs-result.json");
  const CAT = { Database: "D", Shell: "S", Concurrency: "C", JavaScript: "J", pandas: "P" };
  for (const q of JSON.parse(fs.readFileSync(f, "utf8"))) {
    const s = q.question_title_slug; if (!s) continue;
    const p = { n: +q.frontend_question_id, t: q.title_en, d: D1(q.difficulty_en) };
    if (Array.isArray(q.tags_en) && q.tags_en.length) p.g = q.tags_en;
    if (q.paid_only === true || q.paid_only === "True") {
      p.p = 1;
      p.s = q.relative_path_en.replace(/^\/solution\//, "").replace(/\/README_EN\.md$/, "");
    }
    if (CAT[q.category]) p.c = CAT[q.category];
    problems[s] = p;
  }
  log(`LeetCode: ${Object.keys(problems).length} problems (${Object.values(problems).filter(p => p.p).length} premium)`);
}

// ---------------------------------------------------------------- Company questions
const companies = new Map(); // slug -> { name, w: { d30, m3, m6, y1, all: Map(problem -> freq) } }
function addRows(company, name, win, rows) {
  const slug = slugify(company);
  if (!slug) return;
  const c = companies.get(slug) || { name: name || pretty(slug), w: { d30: new Map(), m3: new Map(), m6: new Map(), y1: new Map(), all: new Map() } };
  if (name && /[A-Z]/.test(name)) c.name = name;
  for (const r of rows) {
    const url = r.URL || r.Link; if (!url) continue;
    const s = slugOf(url);
    const freq = parseFloat(r["Frequency %"] ?? r.Frequency) || 0;
    const m = c.w[win];
    m.set(s, Math.max(m.get(s) || 0, freq));
    const p = (problems[s] ??= {});
    p.t ??= r.Title; p.d ??= D1(r.Difficulty);
    const acc = r["Acceptance %"] ? parseFloat(r["Acceptance %"]) : r["Acceptance Rate"] ? Math.round(parseFloat(r["Acceptance Rate"]) * 1000) / 10 : NaN;
    if (!isNaN(acc)) p.a = acc;
    if (!p.g?.length && r.Topics) p.g = r.Topics.split(",").map(x => x.trim()).filter(Boolean);
  }
  companies.set(slug, c);
}

const MAIN = syncRepo("main", "https://github.com/snehasishroy/leetcode-companywise-interview-questions.git", { history: true });
const TOPICS = syncRepo("topics", "https://github.com/liquidslr/leetcode-company-wise-problems.git");
const mainDate = git("log -1 --format=%cs", MAIN);

// Older snapshot about 6 months back: its "last 6 months" + today's "last 6 months" ≈ the last 12 months.
let oldSnap = null;
try {
  const head = new Date(git("log -1 --format=%cI", MAIN));
  const pick = git("log --format=%H\\ %cI -- amazon/six-months.csv", MAIN).split("\n").map(l => l.split(" "))
    .find(([, d]) => (head - new Date(d)) / 864e5 >= 150);
  if (pick) {
    const dir = path.resolve(CACHE, "main-old");
    try { git(`worktree remove --force "${dir}"`, MAIN); } catch { fs.rmSync(dir, { recursive: true, force: true }); }
    git("worktree prune", MAIN);
    git(`worktree add -q --detach "${dir}" ${pick[0]}`, MAIN);
    oldSnap = { dir, date: pick[1].slice(0, 10) };
  }
} catch (e) { log("Couldn't load the older snapshot, so 'last 1 year' uses the 6-month lists only."); }

for (const slug of fs.readdirSync(MAIN)) {
  const dir = path.join(MAIN, slug);
  if (slug.startsWith(".") || !fs.statSync(dir).isDirectory()) continue;
  addRows(slug, null, "d30", readCSV(path.join(dir, "thirty-days.csv")));
  addRows(slug, null, "m3", readCSV(path.join(dir, "three-months.csv")));
  addRows(slug, null, "m6", readCSV(path.join(dir, "six-months.csv")));
  addRows(slug, null, "y1", readCSV(path.join(dir, "six-months.csv")));
  addRows(slug, null, "all", readCSV(path.join(dir, "all.csv")));
  if (oldSnap) {
    const od = path.join(oldSnap.dir, slug === "meta" && !fs.existsSync(path.join(oldSnap.dir, "meta")) ? "facebook" : slug);
    addRows(slug, null, "y1", readCSV(path.join(od, "six-months.csv")));
    addRows(slug, null, "all", readCSV(path.join(od, "all.csv")));
  }
}
for (const name of fs.readdirSync(TOPICS)) {
  const dir = path.join(TOPICS, name);
  if (name.startsWith(".") || !fs.statSync(dir).isDirectory()) continue;
  const key = name === "Facebook" ? "Meta" : name;
  addRows(key, key, "d30", readCSV(path.join(dir, "1. Thirty Days.csv")));
  addRows(key, key, "m3", readCSV(path.join(dir, "2. Three Months.csv")));
  addRows(key, key, "m6", readCSV(path.join(dir, "3. Six Months.csv")));
  addRows(key, key, "y1", readCSV(path.join(dir, "3. Six Months.csv")));
  addRows(key, key, "all", readCSV(path.join(dir, "5. All.csv")));
}
fs.rmSync(path.join(OUT, "companies"), { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, "companies"), { recursive: true });
const companyIndex = [];
// Companies are grouped into one file per first letter (a.json … z.json, 0.json for digits) so the whole
// project stays under GitHub's 100-files-per-upload limit. Keep this in sync with companyFile() in lib/data.js.
const bucketOf = slug => (/^[a-z]/.test(slug) ? slug[0] : "0");
const buckets = {};
for (const [slug, c] of [...companies].sort((a, b) => a[0].localeCompare(b[0]))) {
  for (const k of ["d30", "m3", "m6", "y1"]) for (const [s, f] of c.w[k]) if (!c.w.all.has(s)) c.w.all.set(s, f);
  if (!c.w.all.size) continue;
  const out = Object.fromEntries(Object.entries(c.w).map(([k, m]) => [k, [...m].sort((a, b) => b[1] - a[1])]));
  (buckets[bucketOf(slug)] ??= {})[slug] = out;
  companyIndex.push({ s: slug, n: c.name, c: out.all.length, r: out.d30.length, y: out.y1.length });
}
for (const [b, group] of Object.entries(buckets)) fs.writeFileSync(path.join(OUT, "companies", `${b}.json`), JSON.stringify(group));
// "All companies": every question, ranked by how many companies asked it in each window.
{
  const agg = { d30: new Map(), m3: new Map(), m6: new Map(), y1: new Map(), all: new Map() };
  for (const c of companies.values()) for (const k of Object.keys(agg)) for (const s of c.w[k].keys()) agg[k].set(s, (agg[k].get(s) || 0) + 1);
  const out = {};
  for (const [k, m] of Object.entries(agg)) {
    const max = Math.max(1, ...m.values());
    out[k] = [...m].sort((a, b) => b[1] - a[1]).map(([s, n]) => [s, Math.round((n / max) * 1000) / 10, n]);
  }
  fs.writeFileSync(path.join(OUT, "companies", "_all.json"), JSON.stringify(out));
  companyIndex.unshift({ s: "_all", n: "All companies", c: out.all.length, r: out.d30.length, y: out.y1.length });
}
log(`Companies: ${companyIndex.length - 1}`);

// ---------------------------------------------------------------- Codeforces
const CF_TAGS = {
  "greedy": "Greedy", "math": "Math", "implementation": "Simulation", "dp": "Dynamic Programming", "constructive algorithms": "Constructive Algorithms",
  "data structures": "Data Structures", "brute force": "Enumeration", "binary search": "Binary Search", "sortings": "Sorting", "graphs": "Graph Theory",
  "dfs and similar": "Depth-First Search", "trees": "Tree", "number theory": "Number Theory", "combinatorics": "Combinatorics", "strings": "String",
  "bitmasks": "Bitmask", "two pointers": "Two Pointers", "geometry": "Geometry", "dsu": "Union-Find", "divide and conquer": "Divide and Conquer",
  "interactive": "Interactive", "games": "Game Theory", "shortest paths": "Shortest Path", "probabilities": "Probability", "hashing": "Hash Function",
  "flows": "Flow Network", "matrices": "Math", "fft": "Math", "graph matchings": "Bipartite Graph", "string suffix structures": "String Matching",
  "ternary search": "Binary Search", "meet-in-the-middle": "Divide and Conquer", "2-sat": "Strongly Connected Component", "expression parsing": "Stack",
  "chinese remainder theorem": "Number Theory", "schedules": "Greedy", "communication": "Interactive",
};
const mapTags = (list, dict) => [...new Set(list.map(t => dict[t.trim().toLowerCase()]).filter(Boolean))];
let cf = null;
if (!OFFLINE) {
  try {
    const r = await fetchWithTimeout("https://codeforces.com/api/problemset.problems", 60000);
    const j = await r.json();
    if (j.status === "OK") cf = { rated: true, source: "codeforces.com/api", list: j.result.problems.map(p => ({ id: `${p.contestId}${p.index}`, name: p.name, rating: p.rating || 0, tags: p.tags })) };
  } catch { log("Codeforces API not reachable, using the GitHub dataset (no ratings)."); }
}
if (!cf) {
  const dir = syncRepo("codeforces", "https://github.com/Ronin5205/Codeforces-Problemset-Statements.git");
  cf = { rated: false, source: "github.com/Ronin5205/Codeforces-Problemset-Statements", list: readCSV(path.join(dir, "problems.csv")).map(r => ({ id: r.contest_id && r.problem_index ? `${r.contest_id}${r.problem_index}` : r.id, name: r.title, rating: 0, tags: (r.tags || "").split(",") })) };
}
{
  const tagList = [], tagIdx = new Map();
  const ti = t => { if (!tagIdx.has(t)) { tagIdx.set(t, tagList.length); tagList.push(t); } return tagIdx.get(t); };
  const seen = new Set();
  const items = cf.list.filter(p => p.id && p.name && /^\d+[A-Z]/.test(p.id) && !seen.has(p.id) && seen.add(p.id)).map(p => [p.id, p.name, p.rating, mapTags(p.tags, CF_TAGS).map(ti)]);
  fs.writeFileSync(path.join(OUT, "cf.json"), JSON.stringify({ rated: cf.rated, source: cf.source, tags: tagList, items }));
  log(`Codeforces: ${items.length} problems (${cf.rated ? "with official ratings" : "no ratings"})`);
}

// ---------------------------------------------------------------- CodeChef
const CC_TAGS = {
  "dynamic-programming": "Dynamic Programming", "dp": "Dynamic Programming", "digit-dp": "Dynamic Programming", "dp-on-trees": "Dynamic Programming", "memoization": "Memoization",
  "greedy": "Greedy", "math": "Math", "maths": "Math", "mathematics": "Math", "binary-search": "Binary Search", "segment-tree": "Segment Tree", "segment-trees": "Segment Tree",
  "fenwick": "Segment Tree", "fenwick-tree": "Segment Tree", "sqrt-decomposition": "Segment Tree", "ad-hoc": "Ad Hoc", "adhoc": "Ad Hoc", "observation": "Ad Hoc",
  "implementation": "Simulation", "simulation": "Simulation", "sorting": "Sorting", "sort": "Sorting", "strings": "String", "string": "String",
  "graphs": "Graph Theory", "graph": "Graph Theory", "dfs": "Depth-First Search", "bfs": "Breadth-First Search", "trees": "Tree", "tree": "Tree",
  "number-theory": "Number Theory", "gcd": "Number Theory", "primes": "Number Theory", "sieve": "Number Theory", "modular-arithmetic": "Number Theory", "combinatorics": "Combinatorics",
  "bit-manipulation": "Bit Manipulation", "bitwise": "Bit Manipulation", "xor": "Bit Manipulation", "bitmasking": "Bitmask", "bitmask": "Bitmask", "dp-bitmask": "Bitmask",
  "geometry": "Geometry", "dsu": "Union-Find", "union-find": "Union-Find", "disjoint-set": "Union-Find", "hashing": "Hash Function", "hash": "Hash Table", "maps": "Hash Table",
  "prefix-sum": "Prefix Sum", "prefix-sums": "Prefix Sum", "two-pointers": "Two Pointers", "sliding-window": "Sliding Window", "stack": "Stack", "queue": "Queue",
  "heap": "Heap (Priority Queue)", "priority-queue": "Heap (Priority Queue)", "recursion": "Recursion", "backtracking": "Backtracking", "brute-force": "Enumeration",
  "bruteforce": "Enumeration", "game-theory": "Game Theory", "games": "Game Theory", "probability": "Probability", "expected-value": "Probability", "matrix": "Matrix",
  "shortest-path": "Shortest Path", "dijkstra": "Shortest Path", "mst": "Minimum Spanning Tree", "lca": "Lowest Common Ancestor", "trie": "Trie", "kmp": "String Matching",
  "fft": "Math", "constructive": "Constructive Algorithms", "constructive-algorithms": "Constructive Algorithms", "data-structures": "Data Structures", "interactive": "Interactive",
  "sets": "Ordered Set", "arrays": "Array", "array": "Array", "linked-list": "Linked List", "topological-sort": "Topological Sort", "flows": "Flow Network", "max-flow": "Flow Network",
  "matching": "Bipartite Graph", "bipartite": "Bipartite Graph", "scc": "Strongly Connected Component", "bridges": "Biconnected Component", "knapsack": "Knapsack",
};
const CC_LEVEL = { school: "E", easy: "E", medium: "M", hard: "H", challenge: "H" };
const LEVEL_TAG = { cakewalk: "E", simple: "E", easy: "E", "easy-medium": "M", medium: "M", "medium-hard": "H", hard: "H", challenge: "H" };
{
  const dir = syncRepo("codechef", "https://github.com/captn3m0/codechef.git");
  const byCode = new Map();
  for (const cat of fs.existsSync(path.join(dir, "_problems")) ? fs.readdirSync(path.join(dir, "_problems")) : []) {
    for (const f of fs.readdirSync(path.join(dir, "_problems", cat))) {
      let d; try { d = JSON.parse(fs.readFileSync(path.join(dir, "_problems", cat, f), "utf8")); } catch { continue; }
      const code = d.problem_code; const name = d.problem_name || d.title; if (!code || !name) continue;
      const raw = [...String(d.tags || "").matchAll(/>([^<]+)</g)].map(m => m[1].trim().toLowerCase().replace(/\s+/g, "-"));
      const level = CC_LEVEL[d.category_name || cat] || raw.map(t => LEVEL_TAG[t]).find(Boolean) || "M";
      byCode.set(code, { code, name, level, rating: 0, tags: mapTags(raw, CC_TAGS), ed: d.editorial_url || "" });
    }
  }
  let live = 0;
  if (!OFFLINE) {
    try {
      for (let off = 0, total = Infinity; off < total && off < 20000;) {
        const r = await fetchWithTimeout(`https://www.codechef.com/api/list/problems/all?limit=1000&offset=${off}`, 30000);
        const j = await r.json();
        const data = j.data || [];
        total = +j.count || 0;
        if (!data.length) break;
        for (const p of data) {
          const rating = +p.difficulty_rating || 0;
          const level = rating ? (rating < 1400 ? "E" : rating < 2000 ? "M" : "H") : "M";
          const old = byCode.get(p.code);
          byCode.set(p.code, { ...(old || { tags: [], ed: "" }), code: p.code, name: p.name || old?.name, rating, level: rating ? level : old?.level || level });
          live++;
        }
        off += data.length;
      }
    } catch { log("CodeChef API not reachable, using the GitHub list only."); }
  }
  const tagList = [], tagIdx = new Map();
  const ti = t => { if (!tagIdx.has(t)) { tagIdx.set(t, tagList.length); tagList.push(t); } return tagIdx.get(t); };
  const items = [...byCode.values()].sort((a, b) => a.code.localeCompare(b.code))
    .map(p => [p.code, p.name, p.level, p.rating, p.tags.map(ti), p.ed.replace(/^https?:\/\/discuss\.codechef\.com\/problems\//, "")]);
  fs.writeFileSync(path.join(OUT, "cc.json"), JSON.stringify({ live: live > 0, tags: tagList, items }));
  log(`CodeChef: ${items.length} problems${live ? ` (${live} from the live list)` : ""}`);
}

// ---------------------------------------------------------------- AtCoder
const ac = await buildAtCoder({ out: OUT, cache: CACHE, offline: OFFLINE, log });

// ---------------------------------------------------------------- write the rest
for (const g of SEQUENCE) for (const s of g.problems) if (!problems[s]) console.warn("Missing metadata:", s);
// Final step of the path: Google's most asked questions of the last year that the path hasn't covered yet (free ones only).
const inPath = new Set(SEQUENCE.flatMap(g => g.problems));
const google = companies.get("google");
const finalStep = google ? [...google.w.y1].sort((a, b) => b[1] - a[1]).map(([s]) => s)
  .filter(s => problems[s] && !problems[s].p && !problems[s].c && problems[s].d !== "E" && !inPath.has(s)).slice(0, 40) : [];
const sequenceOut = finalStep.length ? [...SEQUENCE, {
  id: "google-final", name: "Final step: Google's most asked (last 1 year)", topics: ["How to Approach a Problem"],
  why: "Real questions Google asked in the last year that the earlier steps didn't cover, most frequent first. Solve them like a mock interview: 45 minutes each, talk out loud, no hints for the first 30 minutes.",
  milestone: "Path complete. Keep your revisions going and do mock interviews: you're ready for Google's coding rounds.",
  problems: finalStep,
}] : SEQUENCE;
fs.writeFileSync(path.join(OUT, "problems.json"), JSON.stringify(problems));
fs.writeFileSync(path.join(OUT, "companies.json"), JSON.stringify(companyIndex));
// AtCoder problems that practise each step's topic. Kept apart from `problems`, so path numbering and progress don't change.
const withBridge = sequenceOut.map(g => {
  const { bridge, missing } = bridgeFor(g.id, ac);
  if (missing.length) console.warn(`AtCoder bridge for "${g.id}": not in the AtCoder list, skipped: ${missing.join(", ")}`);
  return bridge.length ? { ...g, bridge } : g;
});
fs.writeFileSync(path.join(OUT, "sequence.json"), JSON.stringify(withBridge));
fs.writeFileSync(path.join(OUT, "meta.json"), JSON.stringify({
  built: new Date().toISOString().slice(0, 10), companySnapshot: mainDate, yearSnapshot: oldSnap?.date || null,
}));
log("Done.");
