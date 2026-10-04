// Run: npm test. Checks the pattern-recognition data used by "Learn the topic".
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { SEQUENCE } from "./sequence.mjs";
import { PATTERNS, parseEntry, patternsFor, patternHintsFromTags } from "../lib/patterns.js";
import { PATH_PATTERNS } from "../lib/patternMap.js";

const pathIds = SEQUENCE.flatMap(g => g.problems);

test("every question on the fixed DSA path (scripts/sequence.mjs) has a hand-written pattern", () => {
  assert.deepEqual(pathIds.filter(id => !PATH_PATTERNS[id]), [], "path questions without a pattern");
});

// The last step ("Google's most asked") is rebuilt by `npm run data` from Google's question frequencies, so its
// questions can change. Any that aren't in lib/patternMap.js still work: they get tag-based guesses. This only warns.
test("generated final step: report questions without a hand-written pattern", t => {
  let built;
  try { built = JSON.parse(fs.readFileSync(new URL("../public/data/sequence.json", import.meta.url), "utf8")); } catch { return t.skip("public/data/sequence.json not found"); }
  const missing = built.flatMap(g => g.problems).filter(id => !PATH_PATTERNS[id]);
  if (missing.length) console.warn(`${missing.length} path question(s) have no hand-written pattern yet (tag guesses are used instead): ${missing.join(", ")}`);
});

test("every entry names real patterns and gives a cue", () => {
  for (const [id, entry] of Object.entries(PATH_PATTERNS)) {
    const { keys, cue } = parseEntry(entry);
    assert.ok(keys.length >= 1 && keys.length <= 3, `${id}: 1 to 3 patterns`);
    for (const k of keys) assert.ok(PATTERNS[k], `${id}: unknown pattern "${k}"`);
    assert.ok(cue.length > 10, `${id}: write a cue`);
  }
});

test("every pattern is complete and used by at least one question", () => {
  const used = new Set(Object.values(PATH_PATTERNS).flatMap(e => parseEntry(e).keys));
  for (const [k, p] of Object.entries(PATTERNS)) {
    assert.ok(p.name && p.move && p.cost && p.trap, `${k}: missing text`);
    assert.ok(Array.isArray(p.signals) && p.signals.length >= 1, `${k}: needs signals`);
    assert.ok(used.has(k), `${k}: not used by any path question`);
  }
});

test("path questions use their hand-written entry", () => {
  const r = patternsFor({ kind: "dsa", platform: "LeetCode", id: "two-sum", tags: [] });
  assert.equal(r.source, "curated");
  assert.equal(r.items[0].key, "hash-lookup");
  assert.ok(r.items[0].cue);
});

test("other questions fall back to tag hints and say so", () => {
  const r = patternsFor({ kind: "dsa", platform: "LeetCode", id: "not-on-the-path", tags: ["Array", "Sliding Window", "Hash Table"] });
  assert.equal(r.source, "tags");
  assert.equal(r.items[0].key, "sliding-window-variable");
  assert.ok(r.items.length <= 3);
  assert.equal(patternsFor({ kind: "dsa", platform: "LeetCode", id: "x", tags: ["Array"] }), null, "no strong hint, no card");
  assert.equal(patternsFor({ kind: "cs", id: "x", tags: [] }), null, "only coding questions");
});

test("tag hints use the other tags to pick the right kind of DFS / DP", () => {
  assert.equal(patternHintsFromTags(["Depth-First Search", "Matrix"])[0], "grid-dfs-bfs");
  assert.equal(patternHintsFromTags(["Tree", "Binary Tree", "Breadth-First Search"])[0], "tree-bfs-level");
  assert.equal(patternHintsFromTags(["Dynamic Programming", "Matrix"])[0], "dp-grid");
  assert.equal(patternHintsFromTags(["Dynamic Programming", "Knapsack"])[0], "dp-knapsack");
  assert.equal(patternHintsFromTags(["Breadth-First Search", "Graph"])[0], "bfs-shortest");
});
