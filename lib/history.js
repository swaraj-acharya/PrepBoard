// Turns your saved progress into a day-by-day history, newest day first.
// Questions solved before the history log existed are added from their solvedOn date.

const FIRST = ["solved", "tricky"];
export const ACTION_LABEL = { solved: "Solved", tricky: "Solved with help", remembered: "Revised, remembered", forgot: "Revised, forgot" };
export const ACTION_SHORT = { solved: "Solved", tricky: "With help", remembered: "Remembered", forgot: "Forgot" };
export const isFirst = a => FIRST.includes(a);

export function buildHistory(state) {
  const problems = state?.problems || {};
  const log = state?.log || {};
  const days = {};
  const seenFirst = new Set();

  for (const [day, list] of Object.entries(log)) {
    // Keep the latest entry per question and group (first solve / revision) for the day.
    const latest = new Map();
    for (const e of list || []) {
      if (!e?.id || !e.a) continue;
      const k = `${e.id}|${isFirst(e.a) ? "first" : "rev"}`;
      const cur = latest.get(k);
      if (!cur || (e.t || 0) >= (cur.t || 0)) latest.set(k, e);
    }
    for (const e of latest.values()) {
      if (isFirst(e.a)) {
        // A first solve only counts while the question is still marked done from that day.
        const p = problems[e.id];
        if (!p?.status || (p.solvedOn && p.solvedOn !== day)) continue;
        seenFirst.add(e.id);
      }
      (days[day] ||= []).push(e);
    }
  }

  for (const [id, p] of Object.entries(problems)) {
    if (!p?.status || !p.solvedOn || seenFirst.has(id)) continue;
    (days[p.solvedOn] ||= []).push({ id, a: p.status === "revisit" ? "tricky" : "solved", t: p.u || 0 });
  }

  return Object.entries(days)
    .filter(([, list]) => list.length)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([day, list]) => ({
      day,
      entries: list.sort((a, b) => (a.t || 0) - (b.t || 0)),
      firsts: list.filter(e => isFirst(e.a)).length,
      revisions: list.filter(e => !isFirst(e.a)).length,
    }));
}

// "2026-09-22" -> "Tuesday, 22 September 2026"
export function longDate(day) {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
