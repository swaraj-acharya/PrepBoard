// Run: npm test. Streak recovery: miss one day, do 2 the next day, and the streak carries on.
import { test } from "node:test";
import assert from "node:assert/strict";
import { streakStatus, longestStreak, isRecovered, shiftDay, streakDays } from "../lib/store.js";

const NOW = "2026-10-11";

test("day maths crosses months and years", () => {
  assert.equal(shiftDay("2026-03-01", -1), "2026-02-28");
  assert.equal(shiftDay("2026-12-31", 1), "2027-01-01");
});

test("a normal streak works as before", () => {
  const a = { "2026-10-09": 1, "2026-10-10": 1, "2026-10-11": 1 };
  assert.deepEqual(streakStatus(a, NOW), { n: 3, pending: false, need: 0, recovered: false });
  assert.equal(streakStatus({ "2026-10-09": 1, "2026-10-10": 1 }, NOW).n, 2, "today not done yet keeps yesterday's streak");
});

test("missed yesterday: the streak is at risk until 2 are done today", () => {
  const base = { "2026-10-08": 1, "2026-10-09": 3 };
  assert.deepEqual(streakStatus(base, NOW), { n: 2, pending: true, need: 2, recovered: false });
  assert.deepEqual(streakStatus({ ...base, "2026-10-11": 1 }, NOW), { n: 2, pending: true, need: 1, recovered: false });
  assert.deepEqual(streakStatus({ ...base, "2026-10-11": 2 }, NOW), { n: 4, pending: false, need: 0, recovered: true }, "the made-up day counts");
});

test("the chance to recover lasts one day", () => {
  const a = { "2026-10-08": 1, "2026-10-09": 1, "2026-10-11": 1 };
  assert.equal(isRecovered(a, "2026-10-10"), false);
  assert.equal(streakStatus(a, "2026-10-12").n, 1, "only 1 on the 11th, so the streak restarted");
});

test("two missed days in a row can't be recovered", () => {
  assert.deepEqual(streakStatus({ "2026-10-08": 1, "2026-10-11": 5 }, NOW), { n: 1, pending: false, need: 0, recovered: false });
});

test("2 on a fresh start doesn't invent a streak", () => {
  assert.equal(streakStatus({ "2026-10-11": 2 }, NOW).n, 1);
});

test("recoveries can follow each other", () => {
  assert.deepEqual(streakStatus({ "2026-10-07": 1, "2026-10-09": 2, "2026-10-11": 2 }, NOW), { n: 5, pending: false, need: 0, recovered: true });
});

test("longest streak counts made-up days", () => {
  const a = { "2026-09-01": 1, "2026-09-02": 1, "2026-09-04": 2, "2026-09-05": 1, "2026-09-07": 1, junk: 4 };
  assert.deepEqual(streakDays(a), ["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04", "2026-09-05", "2026-09-07"]);
  assert.equal(longestStreak(a), 5, "the 6th was missed and the 7th had only 1");
});
