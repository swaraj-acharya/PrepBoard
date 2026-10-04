// Run: npm test. Checks the lessons on the Patterns page (/patterns).
import { test } from "node:test";
import assert from "node:assert/strict";
import { PATTERNS } from "../lib/patterns.js";
import { GUIDE, GROUPS, QUICK, LIMITS, groupOf, questionsByPattern, patternPrompt } from "../lib/patternGuide.js";
import { PATH_PATTERNS } from "../lib/patternMap.js";

const keys = Object.keys(PATTERNS);

test("every pattern has a complete lesson", () => {
  assert.deepEqual(keys.filter(k => !GUIDE[k]), [], "patterns without a lesson");
  assert.deepEqual(Object.keys(GUIDE).filter(k => !PATTERNS[k]), [], "lessons for unknown patterns");
  for (const k of keys) {
    const g = GUIDE[k];
    assert.ok(g.story.length > 60, `${k}: story`);
    assert.ok(g.eg?.q && g.eg.a, `${k}: example question and answer`);
    assert.ok(Array.isArray(g.eg.steps) && g.eg.steps.length >= 2, `${k}: at least 2 example steps`);
    assert.ok(g.code && g.code.includes("\n") || g.code?.length > 30, `${k}: code template`);
    assert.ok(!/`/.test(g.code), `${k}: no backticks in code`);
  }
});

test("each pattern is in exactly one group", () => {
  const listed = GROUPS.flatMap(([, ks]) => ks);
  assert.equal(new Set(listed).size, listed.length, "a pattern is listed in two groups");
  assert.deepEqual(keys.filter(k => !listed.includes(k)), [], "patterns without a group");
  assert.deepEqual(listed.filter(k => !PATTERNS[k]), [], "groups with unknown patterns");
  assert.ok(keys.every(k => groupOf(k)));
});

test("quick lookup and limits point at real patterns", () => {
  for (const [clue, k] of QUICK) assert.ok(clue.length > 8 && PATTERNS[k], `quick lookup: ${clue}`);
  assert.ok(LIMITS.length >= 5);
});

test("practice lists: every path question appears under its main pattern", () => {
  const by = questionsByPattern();
  const mains = Object.values(by).reduce((n, v) => n + v.main.length, 0);
  assert.equal(mains, Object.keys(PATH_PATTERNS).length);
  assert.ok(by["hash-lookup"].main.some(u => u.id === "two-sum" && u.cue));
});

test("copy-prompt teaches like a 12-year-old, uses your language, and keeps practice questions unsolved", () => {
  const p = patternPrompt("sliding-window-variable", { lang: "Java", titles: ["Fruit Into Baskets", "Minimum Window Substring"] });
  assert.match(p, /12-year-old/);
  assert.match(p, /Variable size|variable size/);
  assert.match(p, /Java/);
  assert.match(p, /Fruit Into Baskets; Minimum Window Substring/);
  assert.match(p, /do NOT solve these/);
  for (const part of ["THE STORY", "HOW TO SPOT IT", "EXAMPLE 3 (IN DISGUISE)", "THE TEMPLATE", "QUICK QUIZ"]) assert.ok(p.includes(part), part);
  assert.ok(!/Questions I will practise/.test(patternPrompt("trie")), "no practice line when there are no titles");
  assert.equal(patternPrompt("nope"), "");
  for (const k of keys) assert.ok(patternPrompt(k).includes(PATTERNS[k].name), k);
});
