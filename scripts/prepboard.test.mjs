// Run: npm test. Covers the AtCoder pipeline, the DSA-path links, profile numbers, GitHub sync merging and the solution notebook.
// No network needed: fixtures follow the shapes in AtCoder Problems' own interfaces
// (atcoder-problems-frontend/src/interfaces/{Contest,Problem,ProblemModel}.ts).
import { test } from "node:test";
import assert from "node:assert/strict";
import { clipDifficulty, ratedUpper, classifyContest, arcDivision, normalize, bridgeFor } from "./atcoder.mjs";
import { BRIDGE, PRACTICE_TOPICS } from "./atcoder-bridge.mjs";
import { SEQUENCE } from "./sequence.mjs";
import { independence, computeProfile, firstReached } from "../lib/profile.js";
import { mergeStates } from "../lib/merge.js";
import { acBand, acNextBand, cfRank, isLive, letterLevel, acLevel } from "../lib/atcoder.js";

const T = 1700000000; // any time after AGC 001
const C = (id, title, rate_change, start = T) => ({ id, title, rate_change, start_epoch_second: start, duration_second: 6000 });

test("difficulty clipping matches AtCoder Problems", () => {
  assert.equal(clipDifficulty(1234), 1234);
  assert.equal(clipDifficulty(400), 400);
  assert.equal(clipDifficulty(0), 147);    // 400 / e
  assert.equal(clipDifficulty(-400), 54);  // 400 / e^2
  assert.ok(clipDifficulty(-5000) >= 0, "very low estimates round towards 0, never negative");
});

test("rated range parsing", () => {
  assert.equal(ratedUpper(C("x", "", " ~ 1999")), 1999);
  assert.equal(ratedUpper(C("x", "", "1200 ~ 2799")), 2799);
  assert.equal(ratedUpper(C("x", "", "1200 ~ ")), "All");
  assert.equal(ratedUpper(C("x", "", "All")), "All");
  assert.equal(ratedUpper(C("x", "", "-")), 0);
  assert.equal(ratedUpper(C("x", "", " ~ 1999", 1400000000)), 0, "before ratings existed");
});

test("contest classification", () => {
  assert.equal(classifyContest(C("abc350", "AtCoder Beginner Contest 350", " ~ 1999")), "ABC");
  assert.equal(classifyContest(C("arc195", "AtCoder Regular Contest 195 (Div. 2)", "1200 ~ 2399")), "ARC");
  assert.equal(classifyContest(C("agc070", "AtCoder Grand Contest 070", "1200 ~ ")), "AGC");
  assert.equal(classifyContest(C("ahc050", "AtCoder Heuristic Contest 050", "All")), "AHC");
  assert.equal(classifyContest(C("dp", "Educational DP Contest", "-")), "Practice");
  assert.equal(classifyContest(C("keyence2021", "KEYENCE Programming Contest 2021", " ~ 1999")), "ABC-Like");
  assert.equal(classifyContest(C("xmas", "Some rated contest", "1200 ~ 2799")), "ARC-Like");
  assert.equal(classifyContest(C("wtf", "World Tour Finals mirror", "All")), "AGC-Like");
  assert.equal(classifyContest(C("uni2020", "A university contest", "-")), null, "unrated one-offs are not imported");
  assert.equal(classifyContest(C("tiny", "Rated but one task", " ~ 1999"), 1), null);
});

test("ARC division comes from the official title", () => {
  assert.equal(arcDivision("AtCoder Regular Contest 195 (Div. 2)"), "Div. 2");
  assert.equal(arcDivision("AtCoder Regular Contest 190 (Div. 1)"), "Div. 1");
  assert.equal(arcDivision("AtCoder Regular Contest++ 230"), "ARC++");
  assert.equal(arcDivision("AtCoder Regular Contest -- 231"), "ARC--");
  assert.equal(arcDivision("AtCoder Regular Contest 225"), "");
});

const fixture = {
  contests: [
    C("abc042", "AtCoder Beginner Contest 042", " ~ 1199", 1469275200),
    C("arc058", "AtCoder Regular Contest 058", "All", 1469275200),
    C("abc350", "AtCoder Beginner Contest 350", " ~ 1999"),
    C("dp", "Educational DP Contest", "-", 1546776000),
    C("practice2", "AtCoder Library Practice Contest", "-", 1599476400),
    C("uni2020", "A university contest", "-"),
  ],
  problems: [
    { id: "abc350_c", contest_id: "abc350", problem_index: "C", name: "Sort" },
    { id: "abc350_a", contest_id: "abc350", problem_index: "A", name: "Past ABCs" },
    { id: "abc350_c", contest_id: "abc350", problem_index: "C", name: "Sort" }, // duplicate row
    { id: "arc058_a", contest_id: "arc058", problem_index: "C", name: "Iroha's Obsession" }, // shared with abc042
    { id: "dp_a", contest_id: "dp", problem_index: "A", name: "Frog 1" },
    { id: "practice2_a", contest_id: "practice2", problem_index: "A", name: "Disjoint Set Union" },
    { id: "uni2020_a", contest_id: "uni2020", problem_index: "A", name: "Not imported" },
    { id: "bad id!", contest_id: "abc350", problem_index: "Z", name: "Malformed" },
    { id: "abc350_z", contest_id: "abc350", problem_index: "Z", name: "  " },
  ],
  contestProblem: [
    { contest_id: "abc350", problem_id: "abc350_a" }, { contest_id: "abc350", problem_id: "abc350_c" },
    { contest_id: "arc058", problem_id: "arc058_a" }, { contest_id: "abc042", problem_id: "arc058_a" },
    { contest_id: "arc058", problem_id: "arc058_b" }, { contest_id: "abc042", problem_id: "abc042_a" },
    { contest_id: "dp", problem_id: "dp_a" }, { contest_id: "practice2", problem_id: "practice2_a" },
  ],
  models: { abc350_a: { difficulty: -1200, is_experimental: false }, abc350_c: { difficulty: 612.4, is_experimental: true } },
  merged: [{ id: "abc350_a", point: 100 }, { id: "abc350_c", point: 300 }],
};

test("normalise: dedupe, drop malformed, keep aliases and topics", () => {
  const { data, stats } = normalize(fixture);
  const ids = data.items.map(x => x[0]);
  assert.equal(new Set(ids).size, ids.length, "no duplicate problems");
  assert.deepEqual(ids.filter(i => i === "abc350_c").length, 1);
  assert.ok(!ids.includes("uni2020_a"), "unrated one-off contests are left out");
  assert.ok(!ids.includes("bad id!") && !ids.includes("abc350_z"), "malformed rows are dropped");
  assert.equal(stats.invalid, 2);
  assert.equal(stats.duplicateRows, 1);

  const byId = Object.fromEntries(data.items.map(x => [x[0], x]));
  const contestOf = x => data.contests[x[1]][0];
  assert.equal(contestOf(byId.arc058_a), "arc058");
  assert.deepEqual(byId.arc058_a[7].map(i => data.contests[i][0]), ["abc042"], "shared problem stored once, with its alias");
  assert.equal(stats.sharedAcrossContests, 1);

  assert.equal(byId.abc350_a[4], -1200, "raw estimate kept, clipped only for display");
  assert.equal(byId.abc350_c[4], 612);
  assert.equal(byId.abc350_c[5], 1, "experimental flag kept");
  assert.equal(byId.abc350_c[6], 300, "official points kept");
  assert.equal(byId.arc058_a[4], null, "no estimate means no number, never an invented one");

  assert.deepEqual(byId.dp_a[8], ["Dynamic Programming"]);
  assert.deepEqual(byId.practice2_a[8], ["Union-Find"]);
  assert.equal(byId.abc350_a[8], 0, "ABC problems get no topics: AtCoder publishes none");

  // stable order: contests by start time, letters in order
  assert.deepEqual(ids.slice(-2), ["abc350_a", "abc350_c"]);
  assert.equal(JSON.stringify(normalize(fixture).data.items), JSON.stringify(data.items), "re-running gives the same output");
});

test("bridge ids are checked against the real list", () => {
  const { data } = normalize(fixture);
  const { bridge, missing } = bridgeFor("dp-1d", data);
  assert.deepEqual(bridge.map(b => b.id), ["ac:dp_a"]);
  assert.deepEqual(missing, ["dp_b", "dp_c"]);
  assert.equal(bridgeFor("dp-1d", null).bridge.length, BRIDGE["dp-1d"].length, "without a list nothing can be checked, so nothing is dropped");
});

test("every bridge step and topic exists in the repo", async () => {
  const steps = new Set(SEQUENCE.map(g => g.id));
  for (const step of Object.keys(BRIDGE)) assert.ok(steps.has(step), `unknown step ${step}`);
  const { TOPICS } = await import("../lib/topics.js");
  for (const [k, names] of Object.entries(PRACTICE_TOPICS)) for (const n of names) assert.ok(TOPICS[n], `${k}: no explanation called "${n}"`);
  for (const [step, list] of Object.entries(BRIDGE)) {
    const seen = new Set();
    for (const [id, why] of list) {
      assert.match(id, /^(dp|practice2)_[a-z]$/, `${step}: ${id} is not from a topic-certain set`);
      assert.ok(!seen.has(id), `${step}: ${id} listed twice`); seen.add(id);
      assert.ok(why.length > 20, `${step}: ${id} needs a reason`);
    }
  }
});

// ---------------------------------------------------------------- profile, ratings, sync
test("independence is never generous", () => {
  assert.equal(independence({ status: "solved" }), "independent");
  assert.equal(independence({ status: "solved", hints: 1 }), "hint");
  assert.equal(independence({ status: "solved", hints: 3 }), "code", "opening the full-solution prompt counts as reference code");
  assert.equal(independence({ status: "revisit" }), "help");
  assert.equal(independence({ status: "revisit", how: "editorial" }), "editorial");
  assert.equal(independence({ status: "solved", how: "hint", hints: 0 }), "hint");
});

test("profile numbers", () => {
  const items = {
    "two-sum": { level: "E", topicNames: ["Array", "Hash Table"] },
    "lru-cache": { level: "M", topicNames: ["Design", "Hash Table"] },
    "trapping-rain-water": { level: "H", topicNames: ["Two Pointers"] },
    "combine-two-tables": { level: "E", category: "D", topicNames: [] },
    "ac:dp_a": { level: null, topicNames: ["Dynamic Programming"], bridge: { step: 22 } },
    "cf:1A": { level: "H", topicNames: ["Math"] },
  };
  const state = {
    problems: {
      "two-sum": { status: "solved", stage: 5, due: null },
      "lru-cache": { status: "revisit", stage: 0, due: "2026-09-25", how: "editorial" },
      "trapping-rain-water": { status: "solved", stage: 1, due: "2026-10-01" },
      "combine-two-tables": { status: "solved" },
      "ac:dp_a": { status: "solved", hints: 2 },
      "cf:1A": { status: "solved", hints: 3 },
      "hld:x": { status: "solved" },
      "fizz-buzz": { u: 1 }, // unsolved but tracked
    },
    log: { "2026-09-20": [{ id: "two-sum", a: "remembered" }, { id: "x", a: "forgot" }, { id: "y", a: "remembered" }, { id: "y", a: "solved" }] },
    activity: { "2026-09-18": 1, "2026-09-19": 2, "2026-09-20": 1, "2026-09-22": 3 },
  };
  const p = computeProfile(state, id => items[id], ["two-sum", "fizz-buzz", "lru-cache"]);
  assert.equal(p.coding, 5, "design and SQL questions are not DSA");
  assert.equal(p.plat.lc.sql, 1);
  assert.deepEqual([p.plat.lc.E, p.plat.lc.M, p.plat.lc.H], [1, 1, 1]);
  assert.equal(p.plat.ac.solved, 1);
  assert.equal(p.plat.cf.H, 1);
  assert.deepEqual(p.how, { independent: 2, hint: 1, editorial: 1, code: 1, help: 0 });
  assert.equal(p.hard, 2);
  assert.equal(p.hardIndependent, 1, "the Codeforces hard solve used the solution prompt");
  assert.equal(p.mastered, 1);
  assert.equal(p.resolved, 2);
  assert.equal(p.bridgeDone, 1);
  assert.equal(p.recall, 2 / 3);
  assert.equal(p.longest, 3);
  assert.equal(p.activeDays, 4);
  assert.deepEqual([p.pathDone, p.pathTotal], [2, 3]);
  assert.ok(p.topics.has("Hash Table") && p.topics.get("Hash Table") === 2);
  assert.ok(!p.topics.has("How to Approach a Problem"));
});

test("rating bands and milestones", () => {
  assert.equal(acBand(0).name, "Gray");
  assert.equal(acBand(399).name, "Gray");
  assert.equal(acBand(400).name, "Brown");
  assert.equal(acBand(1599).name, "Cyan");
  assert.equal(acBand(3500).name, "Red");
  assert.equal(acNextBand(1250).min, 1600);
  assert.equal(acNextBand(2900), null);
  assert.equal(cfRank(1899).name, "Expert");
  assert.equal(cfRank(1900).name, "Candidate Master");
  assert.equal(firstReached([{ t: 1, r: 300 }, { t: 2, r: 810 }, { t: 3, r: 790 }], 800), 2);
  assert.equal(firstReached([{ t: 1, r: 300 }], 800), null);
});

test("difficulty levels", () => {
  assert.equal(acLevel(399), "E"); assert.equal(acLevel(800), "M"); assert.equal(acLevel(1600), "H");
  assert.equal(letterLevel("ABC", "B"), "E"); assert.equal(letterLevel("ABC", "D"), "M"); assert.equal(letterLevel("ABC", "G"), "H");
  assert.equal(letterLevel("ARC", "A"), "M"); assert.equal(letterLevel("AGC", "A"), "H");
  assert.equal(letterLevel("Practice", "A"), null, "no guess for unrated practice sets");
});

test("AI prompts switch off only while an ABC/ARC/AGC is live", () => {
  const c = { type: "ABC", start: 1_800_000_000, dur: 6000 };
  assert.equal(isLive(c, (c.start + 60) * 1000), true);
  assert.equal(isLive(c, (c.start + c.dur + 3600) * 1000), false, "past problems are practice: AtCoder's AI rules don't apply");
  assert.equal(isLive({ ...c, type: "AHC" }, (c.start + 60) * 1000), false, "AHC has its own rules");
  assert.equal(isLive({ type: "Practice", start: 0, dur: 0 }), false);
});

test("sync merge keeps ratings and usernames across devices", () => {
  const remote = { problems: { a: { status: "solved", u: 5 } }, activity: {}, log: {}, ratings: { ac: { rating: 900, fetched: 100 } }, settings: { goal: 5, handles: { ac: "me", cf: "me_cf" } } };
  const fresh = { problems: {}, activity: {}, log: {}, ratings: {}, settings: { goal: 3, handles: {} } };
  const m = mergeStates(fresh, remote);
  assert.equal(m.ratings.ac.rating, 900);
  assert.deepEqual(m.settings.handles, { ac: "me", cf: "me_cf" });
  const newer = { ...fresh, ratings: { ac: { rating: 1000, fetched: 200 } }, settings: { handles: { ac: "renamed", cf: "" } } };
  const m2 = mergeStates(newer, remote);
  assert.equal(m2.ratings.ac.rating, 1000);
  assert.deepEqual(m2.settings.handles, { ac: "renamed", cf: "me_cf" });
  assert.ok(mergeStates({ problems: {}, activity: {}, log: {}, settings: {} }, remote).ratings.ac, "old progress files still merge");
});

// ---------------------------------------------------------------- Problem Solving Lab
import * as LAB from "../lib/lab.js";
import { pickToday, skillMap, currentStage, mistakePatterns, periodReview, journalEntries, toMarkdown, labPrompt, processScore, planSplit, modelsDue, nextModelState, status, templateOf, thinkMinutes, principles } from "../lib/labEngine.js";

test("lab content is complete and consistent", () => {
  const ids = LAB.CHALLENGES.map(c => c.id);
  assert.equal(new Set(ids).size, ids.length, "unique ids");
  const cats = new Set(LAB.CATEGORIES.map(c => c.id)), dims = new Set(LAB.DIMENSIONS.map(d => d.id));
  const models = new Set(LAB.MODELS.map(m => m.id)), aps = new Set(LAB.ANTIPATTERNS.map(a => a.id));
  for (const c of LAB.CHALLENGES) {
    assert.ok(cats.has(c.category), `${c.id}: category`);
    assert.ok(templateOf(c)?.length >= 4, `${c.id}: template`);
    assert.ok(c.stage >= 1 && c.stage <= 8 && LAB.REASONING[c.reasoning], `${c.id}: stage/reasoning`);
    assert.ok(c.skills.length && c.skills.every(d => dims.has(d)), `${c.id}: skills`);
    assert.ok(c.hints.length === 3, `${c.id}: three hints`);
    assert.ok(c.reveal.keyPoints.length >= 4 && c.reveal.principle && c.reveal.answer, `${c.id}: reveal`);
    assert.ok((c.followUps || []).length >= 1, `${c.id}: a constraint-change or follow-up question`);
    for (const m of c.models || []) assert.ok(models.has(m), `${c.id}: model ${m}`);
    for (const a of c.antipatterns || []) assert.ok(aps.has(a), `${c.id}: anti-pattern ${a}`);
    for (const st of c.stages || []) assert.ok(st.at && st.info && st.ask, `${c.id}: stage fields`);
    if (c.category === "case") assert.match(c.reveal.source?.url || "", /^https:\/\//, `${c.id}: case studies cite their postmortem`);
    if (c.extra) assert.ok(LAB.EXTRAS[c.extra], `${c.id}: extra`);
  }
  for (const x of [...LAB.MODELS.map(m => m.exercise), ...LAB.ANTIPATTERNS.map(a => a.challenge), ...LAB.RESOURCES.flatMap(r => r.challenges || [])]) assert.ok(ids.includes(x), `dangling challenge ${x}`);
  for (const m of LAB.MISTAKES) assert.ok(models.has(m.model), `mistake ${m.id}`);
  for (const r of LAB.RESOURCES) assert.match(r.url, /^https:\/\//, r.id);
  for (const p of LAB.PROJECTS) assert.ok(!p.resource || LAB.RESOURCES.some(r => r.id === p.resource), p.id);
  for (const cat of cats) assert.ok(LAB.CHALLENGES.some(c => c.category === cat), `category ${cat} has a challenge`);
  assert.deepEqual(Object.values(LAB.MODES).map(m => m.dsa + m.cp + m.eng), [100, 100, 100]);
});

const T0 = Date.parse("2026-09-21T12:00:00Z");
const doneSession = (daysAgo, review, extra = {}) => ({ startedAt: T0 - daysAgo * 864e5 - 3e6, submittedAt: T0 - daysAgo * 864e5 - 1e6, doneAt: T0 - daysAgo * 864e5, review, u: 1, ...extra });
const allYes = Object.fromEntries(LAB.SELF_REVIEW.map(([k]) => [k, "yes"]));
const allNo = Object.fromEntries(LAB.SELF_REVIEW.map(([k]) => [k, "no"]));

test("lab: stage progression and daily pick", () => {
  assert.equal(currentStage({}), 1);
  const first = pickToday({}, "2026-09-21");
  assert.ok(first.challenge && first.challenge.stage <= 2, "a beginner gets stage 1–2 work");
  assert.equal(pickToday({}, "2026-09-21").challenge.id, first.challenge.id, "same pick all day");
  assert.ok(first.reason.length > 10, "the pick explains itself");
  const started = { sessions: { "incident-memory-leak": { startedAt: 1, u: 1 } } };
  assert.equal(pickToday(started, "2026-09-21").challenge.id, "incident-memory-leak", "finish what you started");
  const two = { sessions: { "estimate-chat-storage": doneSession(1, allYes), "estimate-peak-rps": doneSession(1, allYes) } };
  assert.equal(currentStage(two), 2);
  const short = pickToday({ settings: { daily: 60, mode: "interview" } }, "2026-09-23");
  assert.ok(short.challenge.minutes <= planSplit({ daily: 60, mode: "interview" }).eng, "fits the time budget");
  const weak = { sessions: { "data-left-join": doneSession(9, allNo), "data-timezone": doneSession(8, allNo), "estimate-chat-storage": doneSession(8, allYes), "estimate-peak-rps": doneSession(8, allYes) } };
  const p = pickToday(weak, "2026-09-21");
  assert.equal(p.challenge.category, "data", "weakest category gets repaired");
  assert.match(p.reason, /weakest/);
});

test("lab: skill levels need evidence", () => {
  const one = skillMap({ sessions: { "debug-async-foreach": doneSession(1, allYes) } });
  assert.equal(one.find(d => d.id === "debugging").label, "Exposure", "one exercise is exposure, not mastery");
  const ids = ["debug-async-foreach", "debug-react-stale", "debug-cpp-overflow"];
  const three = skillMap({ sessions: Object.fromEntries(ids.map(id => [id, doneSession(1, allYes)])) });
  assert.equal(three.find(d => d.id === "debugging").label, "Practised");
  const applied = skillMap({ sessions: Object.fromEntries([...ids, "incident-memory-leak"].map(id => [id, doneSession(1, allYes)])) });
  assert.equal(applied.find(d => d.id === "debugging").label, "Applied");
  assert.equal(skillMap({}, { dsaSolved: 60 }).find(d => d.id === "algorithms").label, "Practised");
});

test("lab: mistakes, reviews, journal, prompts", () => {
  const lab = { sessions: {
    "data-left-join": doneSession(2, allYes, { mistakes: ["missed-edge-case"], principle: "Check row counts.", match: "no", steps: { observed: "rows missing", hypotheses: "a\nb\nc", rootcause: "WHERE on right table" } }),
    "debug-react-stale": doneSession(3, allNo, { mistakes: ["missed-edge-case", "wrong-assumption"] }),
    "estimate-chat-storage": doneSession(10, allYes),
  } };
  const pats = mistakePatterns(lab, T0);
  assert.equal(pats[0].id, "missed-edge-case"); assert.equal(pats[0].count, 2); assert.ok(pats[0].study?.name);
  const w = periodReview(lab, T0, 7);
  assert.equal(w.done, 2); assert.equal(w.prevDone, 1); assert.equal(w.failed, 1); assert.equal(w.debugged, 2);
  assert.match(w.priority, /Missed an edge case/);
  assert.equal(processScore(lab.sessions["debug-react-stale"]), 0);
  const j = journalEntries(lab);
  assert.equal(j[0].challengeId, "data-left-join", "newest first");
  assert.equal(j[0].fields.rootcause, "WHERE on right table");
  const md = toMarkdown(j[0]);
  assert.match(md, /^# Customers vanished/); assert.match(md, /## Root cause/); assert.match(md, /Missed an edge case/);
  assert.equal(principles(lab)[0].text, "Check row counts.");
  const c = LAB.CHALLENGES.find(x => x.id === "incident-slow-after-deploy");
  const pr = labPrompt(c, { steps: { hypotheses: "db" }, stageNotes: [] }, "socratic");
  assert.match(pr, /Do NOT tell me the answer/); assert.match(pr, /T\+0/); assert.doesNotMatch(pr, /T\+10/, "only stages already unlocked are shared");
  assert.match(labPrompt(c, {}, "solution"), /compare it with my attempt/);
});

test("lab: spaced review of mental models, and time budgets", () => {
  assert.equal(modelsDue({}, "2026-09-21").length, 1, "introduces one new model");
  const add = n => `+${n}`;
  assert.deepEqual([nextModelState(null, true, add).due, nextModelState({ stage: 1 }, true, add).due, nextModelState({ stage: 4 }, true, add).due], ["+1", "+3", "+45"]);
  assert.equal(nextModelState({ stage: 5 }, true, add).due, null, "mastered after the last interval");
  assert.equal(nextModelState({ stage: 3 }, false, add).stage, 0);
  assert.deepEqual(planSplit({ daily: 120, mode: "engineer" }), { mode: "Engineer", dsa: 48, cp: 24, eng: 48 });
  assert.ok(thinkMinutes({ minutes: 35 }) >= 3 && thinkMinutes({ minutes: 35 }) <= 10);
  assert.equal(status({ startedAt: 1, submittedAt: 2 }), "submitted");
});

test("lab: sync merge keeps work from both devices", () => {
  const remote = { problems: {}, lab: { sessions: { a: { u: 5, doneAt: 5 }, b: { u: 9 } }, journal: { j1: { u: 1, title: "x" } }, settings: { daily: 90 } } };
  const local = { problems: {}, lab: { sessions: { a: { u: 7, doneAt: 7 }, b: { u: 3 } }, journal: {}, settings: {} } };
  const m = mergeStates(local, remote);
  assert.equal(m.lab.sessions.a.u, 7); assert.equal(m.lab.sessions.b.u, 9);
  assert.equal(m.lab.journal.j1.title, "x", "a fresh device doesn't wipe the journal");
  assert.equal(m.lab.settings.daily, 90);
  assert.ok(!("lab" in mergeStates({ problems: {} }, { problems: {} })), "no lab data, no lab key");
});

// ---- solution notebook (lib/solutions.js, lib/review.js)
import { normalizeSolution, mergeSolution, summarize, solutionHash, solutionPath, validSolutionId, legacyAttempt, sameCode, diffLines, emptySolution, SOLUTIONS_INDEX } from "../lib/solutions.js";
import { parseReview, lastCodeBlock, inlineParts } from "../lib/review.js";
import { checkPrompt, checkAnswerPrompt } from "../lib/prompts.js";
import { actions as storeActions, getState } from "../lib/store.js";

const att = (id, at, extra = {}) => ({ id, at, u: at, lang: "C++", code: `code ${id}`, ctx: "solve", ...extra });
const rec = (attempts, deleted = {}) => normalizeSolution({ id: "two-sum", attempts, deleted });

test("solution records: bad input is cleaned, never trusted", () => {
  assert.equal(normalizeSolution(null, "two-sum"), null);
  assert.equal(normalizeSolution({ attempts: [] }, "../../etc/passwd"), null, "ids with slashes are refused");
  assert.equal(normalizeSolution("text", "two-sum"), null);
  const r = normalizeSolution({ id: "two-sum", attempts: [att("a", 5, { junk: 1, review: { raw: 42 } }), { id: "bad id!", code: "x" }, { id: "b" }, "nope", null], deleted: { "bad id!": 3 }, extra: true });
  assert.deepEqual(r.attempts.map(a => a.id), ["a"], "attempts without code or with unsafe ids are dropped");
  assert.equal(r.attempts[0].junk, undefined);
  assert.equal(r.attempts[0].review, undefined, "a review that isn't text is dropped");
  assert.deepEqual(r.deleted, {});
  assert.equal(r.extra, undefined);
  assert.equal(r.v, 1);
  assert.deepEqual(normalizeSolution(r), r, "normalising twice changes nothing");
  // The pasted review is stored exactly, whitespace, Markdown and all.
  const raw = "## Verdict\r\n\n  Correct.  \n\n```cpp\nint x;\n```\n\t";
  assert.equal(rec([att("a", 5, { review: { raw, at: 6, u: 6 } })]).attempts[0].review.raw, raw);
});

test("solution records: merging keeps every attempt and is order-independent", () => {
  const phone = rec([att("a", 10), att("b", 20, { review: { raw: "old review", at: 21, u: 21 } })]);
  const laptop = rec([att("a", 10, { code: "fixed typo", u: 30 }), att("b", 20, { review: { raw: "new review", at: 21, u: 40 } }), att("c", 50)]);
  const m1 = mergeSolution(phone, laptop), m2 = mergeSolution(laptop, phone);
  assert.deepEqual(m1, m2, "commutative");
  assert.deepEqual(mergeSolution(m1, m1), m1, "idempotent");
  assert.deepEqual(mergeSolution(mergeSolution(m1, phone), laptop), m1, "associative in practice");
  assert.deepEqual(m1.attempts.map(a => a.id), ["a", "b", "c"]);
  assert.equal(m1.attempts[0].code, "fixed typo", "newest edit wins");
  assert.equal(m1.attempts[1].review.raw, "new review");
  // Same clock, different content: both devices still end up with the same answer.
  const x = rec([att("a", 10, { code: "left" })]), y = rec([att("a", 10, { code: "right" })]);
  assert.deepEqual(mergeSolution(x, y), mergeSolution(y, x));
  assert.equal(solutionHash(mergeSolution(x, y)), solutionHash(mergeSolution(y, x)));
});

test("solution records: code, review and improved solution each keep their own clock", () => {
  const a = rec([att("a", 10, { code: "edited on phone", u: 50, review: { raw: "r1", at: 11, u: 11 } })]);
  const b = rec([att("a", 10, { review: { raw: "r2 from laptop", at: 11, u: 60 }, improved: { code: "best", lang: "C++", u: 70 } })]);
  const m = mergeSolution(a, b).attempts[0];
  assert.equal(m.code, "edited on phone");
  assert.equal(m.review.raw, "r2 from laptop");
  assert.equal(m.improved.code, "best");
  // Clearing a review is a change too: an empty review with a newer clock wins over the old text.
  const cleared = rec([att("a", 10, { review: { raw: "", at: 11, u: 99 } })]);
  assert.equal(mergeSolution(b, cleared).attempts[0].review.raw, "");
});

test("solution records: a deleted attempt stays deleted after syncing", () => {
  const before = rec([att("a", 10), att("b", 20)]);
  const deletedHere = rec([att("a", 10)], { b: 100 });
  const editedThere = rec([att("a", 10), att("b", 20, { code: "edited later", u: 200 })]);
  for (const m of [mergeSolution(before, deletedHere), mergeSolution(deletedHere, editedThere), mergeSolution(editedThere, deletedHere)]) {
    assert.deepEqual(m.attempts.map(a => a.id), ["a"]);
    assert.equal(m.deleted.b, 100);
  }
});

test("solution records: summaries for lists, filters and sync", () => {
  assert.equal(summarize(null), null);
  const empty = summarize(emptySolution("two-sum"));
  assert.equal(empty.n, 0);
  const s = summarize(rec([att("a", 10, { review: { raw: "ok", at: 11, u: 11 } }), att("b", 20, { ctx: "revision" }), att("c", 30, { review: { raw: "  \n", at: 31, u: 31 } })]));
  assert.equal(s.n, 3);
  assert.equal(s.r, 1, "a blank review doesn't count");
  assert.equal(s.rv, 1);
  assert.equal(s.last, 30);
  assert.equal(s.lr, 0);
  assert.equal(s.u, 31);
  assert.equal(typeof s.h, "string");
  assert.notEqual(s.h, summarize(rec([att("a", 10)])).h);
});

test("solution records: GitHub paths are unique and stay inside the folder", () => {
  assert.equal(solutionPath("two-sum"), "solutions/leetcode/two-sum.json");
  assert.equal(solutionPath("cf:1A"), "solutions/codeforces/1A.json");
  assert.equal(solutionPath("cc:FLOW001"), "solutions/codechef/FLOW001.json");
  assert.equal(solutionPath("ac:abc350_c"), "solutions/atcoder/abc350_c.json");
  assert.equal(solutionPath("hld:url-shortener"), "solutions/hld/url-shortener.json");
  assert.equal(solutionPath("lld:parking-lot"), "solutions/lld/parking-lot.json");
  assert.equal(solutionPath("cs:dbms:what-is-acid"), "solutions/cs/dbms/what-is-acid.json");
  assert.equal(SOLUTIONS_INDEX, "solutions/index.json");
  const ids = ["two-sum", "cf:1A", "cf:1a", "a.b", "a~2eb", "x:y", "x:y:z", "cs:a:b", "cs:a.b", "..", "a..b", "index", "cf:..", "zz:1"];
  const paths = ids.map(solutionPath);
  assert.equal(new Set(paths).size, ids.length, "no two ids share a file");
  for (const p of paths) {
    assert.ok(p.startsWith("solutions/") && p.endsWith(".json"));
    assert.ok(!p.split("/").some(part => part === ".." || part === "." || part === ""), `${p} stays inside solutions/`);
  }
  assert.notEqual(solutionPath("index"), SOLUTIONS_INDEX);
  assert.equal(validSolutionId("two-sum"), true);
  assert.equal(validSolutionId("cs:os:what-is-a-process"), true);
  for (const bad of ["", "a/b", "a b", "a\\b", "x".repeat(201), 5, null]) assert.equal(validSolutionId(bad), false);
});

test("solution records: old single code box becomes the same attempt 1 on every device", () => {
  const a = legacyAttempt("int main() {}\r\n", 100, "C++"), b = legacyAttempt("int main() {}   \n", 200, "Java");
  assert.equal(a.id, b.id, "the id comes from the code, so two devices don't create two attempts");
  assert.equal(a.from, "work");
  assert.equal(a.code, "int main() {}\r\n", "the code itself is kept exactly");
  assert.notEqual(legacyAttempt("other", 1, null).id, a.id);
  assert.ok(normalizeSolution({ id: "two-sum", attempts: [a] }).attempts.length === 1);
  assert.ok(sameCode("a  \r\nb\n", "a\nb"));
  assert.ok(!sameCode("a\nb", "a\n b"));
});

test("solution records: side-by-side comparison marks changed lines", () => {
  const d = diffLines("for i\n  for j\n    check\nreturn", "map m\nfor i\n  lookup\nreturn");
  assert.deepEqual(d.a.map(l => l.same), [true, false, false, true]);
  assert.deepEqual(d.b.map(l => l.same), [false, true, false, true]);
  assert.deepEqual(diffLines("x", "x").a, [{ line: "x", same: true }]);
  assert.equal(diffLines("a\n".repeat(600), "b\n".repeat(600)), null, "very long code isn't diffed");
});

test("AI reviews: displayed from Markdown or plain text without losing anything", () => {
  const raw = "## 1. VERDICT\nCorrect, **O(n)**.\n\n- did `well`\n- missed empty input\n  (and n = 1)\n\n| Approach | Time |\n|---|---|\n| Brute | O(n²) |\n\n> note\n\n---\n```cpp\nint a;\n```\nText after\n```python\nprint(1)";
  const b = parseReview(raw);
  assert.deepEqual(b.map(x => x.type), ["h", "p", "list", "table", "quote", "hr", "code", "p", "code"]);
  assert.equal(b[2].items[1].text, "missed empty input\n(and n = 1)");
  assert.deepEqual(b[3].rows, [["Approach", "Time"], ["Brute", "O(n²)"]]);
  assert.equal(b[8].text, "print(1)", "an unclosed code block runs to the end");
  assert.deepEqual(lastCodeBlock(raw), { type: "code", lang: "python", text: "print(1)" });
  assert.equal(lastCodeBlock("no code here"), null);
  assert.deepEqual(parseReview("plain\ntext\n\nsecond"), [{ type: "p", text: "plain\ntext" }, { type: "p", text: "second" }]);
  assert.deepEqual(parseReview(""), []);
  assert.deepEqual(inlineParts("a `b` **c** <img src=x>"), [{ t: "text", v: "a " }, { t: "code", v: "b" }, { t: "text", v: " " }, { t: "b", v: "c" }, { t: "text", v: " <img src=x>" }]);
});

test("review prompts ask for a reply that's easy to revise from", () => {
  const dsa = { kind: "dsa", title: "Two Sum", platform: "LeetCode", url: "https://leetcode.com/problems/two-sum/", levelLabel: "Easy", tags: ["Array"] };
  const p = checkPrompt(dsa, "C++", "int main() {}");
  for (const part of ["VERDICT", "What I did well", "edge cases", "complexity", "Why my approach works", "ALL APPROACHES", "WHAT I SHOULD REMEMBER", "key insight", "THE BEST SOLUTION", "last code block", "Markdown"]) assert.ok(p.includes(part), part);
  assert.ok(p.includes("int main() {}"), "your code is still in the prompt");
  assert.ok(p.indexOf("1. VERDICT") < p.indexOf("6. THE BEST SOLUTION"));
  const hld = checkPrompt({ ...dsa, kind: "hld", title: "URL shortener", concepts: ["Hashing"] }, "C++", "notes");
  assert.ok(hld.includes("WHAT I SHOULD REMEMBER"));
  const lld = checkPrompt({ ...dsa, kind: "lld", title: "Parking lot", concepts: ["OOP"] }, "Java", "class A {}");
  assert.ok(lld.includes("THE BEST DESIGN") && lld.includes("Java"));
  const cs = checkAnswerPrompt({ kind: "cs", title: "What is ACID?", subjectName: "DBMS", concepts: ["Transactions"] }, "atomicity…");
  assert.ok(cs.includes("remember") && cs.includes("Score my answer"));
});

test("restoring a backup never puts saved solutions into progress", () => {
  storeActions.importJSON(JSON.stringify({ problems: { "two-sum": { status: "solved", work: "x" } }, solutions: { "two-sum": { attempts: [] } } }));
  assert.equal(getState().solutions, undefined);
  assert.equal(getState().problems["two-sum"].work, "x", "old progress, including the code box, restores as before");
  assert.equal(getState().settings.lang, "C++", "missing settings get defaults");
  assert.throws(() => storeActions.importJSON("[1,2]"));
  assert.throws(() => storeActions.importJSON("null"));
  assert.throws(() => storeActions.importJSON("not json"));
  storeActions.reset();
});
