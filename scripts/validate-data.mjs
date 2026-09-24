// Checks every file in public/data. Run: npm run validate (after npm run data, before committing).
// Errors (exit code 1): unreadable JSON, duplicates, malformed ids, links pointing at questions that don't exist.
// Warnings: missing metadata that the app can live with (shown as "—" or "Unrated").
import fs from "node:fs";
import path from "node:path";

const DIR = process.env.DATA_DIR || "public/data";
const errors = [], warnings = [], info = [];
const err = m => errors.push(m), warn = m => warnings.push(m);
function load(f) {
  try { return JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")); }
  catch (e) { err(`${f}: can't read it as JSON (${e.message})`); return null; }
}
const dupes = list => { const seen = new Set(), d = new Set(); for (const x of list) (seen.has(x) ? d : seen).add(x); return [...d]; };
const sample = (list, n = 5) => list.slice(0, n).join(", ") + (list.length > n ? ` and ${list.length - n} more` : "");

// LeetCode
const problems = load("problems.json") || {};
{
  const slugs = Object.keys(problems);
  const bad = slugs.filter(s => !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s));
  if (bad.length) err(`problems.json: ${bad.length} malformed slugs: ${sample(bad)}`);
  const noTitle = slugs.filter(s => !problems[s].t), noDiff = slugs.filter(s => !["E", "M", "H"].includes(problems[s].d));
  if (noTitle.length) warn(`problems.json: ${noTitle.length} without a title: ${sample(noTitle)}`);
  if (noDiff.length) warn(`problems.json: ${noDiff.length} without a valid difficulty: ${sample(noDiff)}`);
  const nums = slugs.map(s => problems[s].n).filter(Boolean), dn = dupes(nums);
  if (dn.length) warn(`problems.json: ${dn.length} problem numbers used twice: ${sample(dn)}`);
  info.push(`LeetCode: ${slugs.length} problems, ${slugs.filter(s => problems[s].p).length} Premium`);
}

// DSA path and its AtCoder links
const ac = load("ac.json");
const acIds = new Set((ac?.items || []).map(x => `ac:${x[0]}`));
const seq = load("sequence.json") || [];
{
  const all = seq.flatMap(g => g.problems || []);
  const missing = all.filter(s => !problems[s]);
  if (missing.length) err(`sequence.json: ${missing.length} path questions aren't in problems.json: ${sample(missing)}`);
  const d = dupes(all);
  if (d.length) err(`sequence.json: ${d.length} questions appear in two steps: ${sample(d)}`);
  const ids = dupes(seq.map(g => g.id));
  if (ids.length) err(`sequence.json: duplicate step ids: ${ids.join(", ")}`);
  const bridge = seq.flatMap(g => (g.bridge || []).map(b => b.id));
  const lost = bridge.filter(id => !acIds.has(id));
  if (lost.length) err(`sequence.json: ${lost.length} AtCoder links aren't in ac.json: ${sample(lost)}`);
  if (dupes(bridge).length) err(`sequence.json: AtCoder problems linked from two steps: ${sample(dupes(bridge))}`);
  info.push(`DSA path: ${seq.length} steps, ${all.length} questions, ${bridge.length} AtCoder links`);
}

// Codeforces
const cf = load("cf.json");
if (cf) {
  const ids = cf.items.map(x => x[0]);
  if (dupes(ids).length) err(`cf.json: duplicate problems: ${sample(dupes(ids))}`);
  const bad = ids.filter(id => !/^\d+[A-Z]\d*$/.test(id));
  if (bad.length) err(`cf.json: ${bad.length} malformed ids: ${sample(bad)}`);
  const noName = cf.items.filter(x => !x[1]).map(x => x[0]);
  if (noName.length) warn(`cf.json: ${noName.length} without a name: ${sample(noName)}`);
  const odd = cf.items.filter(x => x[2] && (x[2] % 100 || x[2] < 800 || x[2] > 3500)).map(x => `${x[0]} (${x[2]})`);
  if (odd.length) err(`cf.json: ${odd.length} ratings outside Codeforces' 800–3500 scale in steps of 100: ${sample(odd)}`);
  const rated = cf.items.filter(x => x[2]).length;
  if (!cf.rated) warn(`cf.json: built without official ratings (source: ${cf.source}). Difficulty is guessed from the letter. Run npm run data with internet.`);
  const badTag = cf.items.flatMap(x => x[3]).filter(i => !cf.tags[i]);
  if (badTag.length) err(`cf.json: ${badTag.length} tag references point nowhere`);
  info.push(`Codeforces: ${ids.length} problems, ${rated} with an official rating`);
}

// CodeChef
const cc = load("cc.json");
if (cc) {
  const codes = cc.items.map(x => x[0]);
  if (dupes(codes).length) err(`cc.json: duplicate problems: ${sample(dupes(codes))}`);
  const bad = codes.filter(c => !/^[A-Za-z0-9_]+$/.test(c));
  if (bad.length) err(`cc.json: ${bad.length} malformed codes: ${sample(bad)}`);
  const lvl = cc.items.filter(x => !["E", "M", "H"].includes(x[2])).map(x => x[0]);
  if (lvl.length) err(`cc.json: ${lvl.length} with an invalid level: ${sample(lvl)}`);
  if (!cc.live) warn("cc.json: built without CodeChef's live list, so newer problems and ratings are missing. Run npm run data with internet.");
  info.push(`CodeChef: ${codes.length} problems, ${cc.items.filter(x => x[3]).length} with a rating`);
}

// AtCoder
if (ac) {
  const ids = ac.items.map(x => x[0]);
  if (dupes(ids).length) err(`ac.json: duplicate problems: ${sample(dupes(ids))}`);
  const bad = ac.items.filter(x => !/^[A-Za-z0-9_-]+$/.test(x[0]) || !ac.contests[x[1]] || !x[2] || !String(x[3] || "").trim()).map(x => x[0]);
  if (bad.length) err(`ac.json: ${bad.length} malformed rows: ${sample(bad)}`);
  const cids = ac.contests.map(c => c[0]);
  if (dupes(cids).length) err(`ac.json: duplicate contests: ${sample(dupes(cids))}`);
  const types = new Set(["ABC", "ARC", "AGC", "ABC-Like", "ARC-Like", "AGC-Like", "AHC", "Practice"]);
  const badType = ac.contests.filter(c => !types.has(c[2])).map(c => c[0]);
  if (badType.length) err(`ac.json: contests with an unknown type: ${sample(badType)}`);
  const badDiff = ac.items.filter(x => x[4] !== null && !Number.isFinite(x[4])).map(x => x[0]);
  if (badDiff.length) err(`ac.json: ${badDiff.length} invalid difficulty values: ${sample(badDiff)}`);
  const badAlias = ac.items.filter(x => (x[7] || []).some(i => !ac.contests[i])).map(x => x[0]);
  if (badAlias.length) err(`ac.json: ${badAlias.length} rows point at contests that don't exist: ${sample(badAlias)}`);
  if (ac.seed) warn("ac.json: only the bundled EDPC + ALPC seed. Run npm run data with internet for the full AtCoder list.");
  info.push(`AtCoder: ${ids.length} problems in ${cids.length} contests, ${ac.items.filter(x => x[4] !== null).length} with a difficulty estimate`);
}

// Companies
const index = load("companies.json") || [];
{
  const files = new Set(fs.readdirSync(path.join(DIR, "companies")));
  const fileOf = s => (s === "_all" ? "_all" : /^[a-z]/.test(s) ? s[0] : "0") + ".json";
  const noFile = index.filter(c => !files.has(fileOf(c.s))).map(c => c.s);
  if (noFile.length) err(`companies.json: ${noFile.length} companies have no data file: ${sample(noFile)}`);
  if (dupes(index.map(c => c.s)).length) err(`companies.json: duplicate companies: ${sample(dupes(index.map(c => c.s)))}`);
  let dangling = new Set(), checked = 0;
  for (const f of files) {
    const j = load(`companies/${f}`); if (!j) continue;
    const groups = f === "_all.json" ? [j] : Object.values(j);
    for (const g of groups) for (const list of Object.values(g)) for (const [s] of list) { checked++; if (!problems[s]) dangling.add(s); }
  }
  if (dangling.size) warn(`companies: ${dangling.size} questions have no metadata in problems.json: ${sample([...dangling])}`);
  info.push(`Companies: ${index.length - 1} companies, ${checked.toLocaleString("en")} company-question entries checked`);
}

for (const m of info) console.log("•", m);
for (const m of warnings) console.log("⚠", m);
for (const m of errors) console.log("✗", m);
console.log(errors.length ? `\n${errors.length} error(s), ${warnings.length} warning(s).` : `\nNo errors. ${warnings.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
