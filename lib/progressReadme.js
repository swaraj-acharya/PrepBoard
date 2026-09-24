// Builds progress/README.md, the summary you see in your GitHub repo.
import { resolveItem } from "./data";
import { streak, today } from "./store";
import { buildHistory, longDate, ACTION_LABEL } from "./history";
import { independence } from "./profile";
import { acBand, cfRank } from "./atcoder";

import { CHALLENGES, PROJECTS } from "./lab.js";

// Problem Solving Lab evidence: finished investigations, principles in my own words, and projects with links.
function labSection(s) {
  const lab = s.lab || {};
  const done = CHALLENGES.map(c => [c, lab.sessions?.[c.id]]).filter(([, x]) => x?.doneAt).sort((a, b) => b[1].doneAt - a[1].doneAt);
  const projects = PROJECTS.filter(p => lab.projects?.[p.id]?.status === "done");
  if (!done.length && !projects.length) return "";
  const out = [`## Problem Solving Lab\n\n${done.length} engineering challenges completed (debugging, incidents, estimation, trade-offs, security, code review and more).`];
  if (done.length) out.push(`### Recent investigations and principles\n\n${done.slice(0, 10).map(([c, x]) => `- **${c.title}**${x.principle ? `: ${x.principle}` : ""}`).join("\n")}`);
  if (projects.length) out.push(`### Build-to-understand projects\n\n${projects.map(p => `- ${lab.projects[p.id].url ? `[${p.name}](${lab.projects[p.id].url})` : p.name}: ${p.principle}`).join("\n")}`);
  return out.join("\n\n") + "\n\n";
}

export function buildReadme(s, data) {
  const solved = Object.entries(s.problems || {}).filter(([, v]) => v.status);
  const c = { E: 0, M: 0, H: 0, lcAll: 0, cf: 0, cc: 0, ac: 0, hld: 0, lld: 0, cs: 0 };
  const own = { independent: 0, other: 0 };
  for (const [id, v] of solved) {
    const pre = id.split(":")[0];
    if (id.includes(":") && c[pre] !== undefined) c[pre]++;
    else { c.lcAll++; const d = data?.problems?.[id]?.d; if (d) c[d]++; }
    if (!/^(hld|lld|cs):/.test(id)) own[independence(v) === "independent" ? "independent" : "other"]++;
  }
  const coding = c.lcAll + c.cf + c.cc + c.ac;
  const target = s.settings?.target || 2500;
  const path = (data?.seq || []).flatMap(g => g.problems);
  const pathDone = path.filter(id => s.problems?.[id]?.status).length;
  const recent = solved.sort((a, b) => (b[1].solvedOn || "").localeCompare(a[1].solvedOn || "") || (b[1].u || 0) - (a[1].u || 0)).slice(0, 30);
  const days = Array.from({ length: 14 }, (_, i) => today(-i));
  const line = ([id, v]) => {
    const it = resolveItem(id, data) || { title: id };
    const link = it.url ? `[${it.title}](${it.url})` : it.title;
    return `| ${v.solvedOn || ""} | ${link} | ${it.platform || ""} | ${it.levelLabel || ""} | ${v.status === "revisit" ? "needs revision" : "solved"} |`;
  };
  return `# My placement prep progress

Tracked with Prepboard. Updated ${today()}.

| | Solved |
|---|---|
| **Coding questions** | **${coding}** of ${target.toLocaleString("en-IN")} goal |
| LeetCode | ${c.lcAll} (Easy ${c.E}, Medium ${c.M}, Hard ${c.H}) |
| Codeforces | ${c.cf} |
| CodeChef | ${c.cc} |
| AtCoder | ${c.ac} |
| DSA path | ${pathDone} of ${path.length} |
| System design | ${c.hld + c.lld} |
| CS subjects | ${c.cs} |

Solved on my own (no hint, editorial or reference code): **${own.independent}** of ${own.independent + own.other}.

Current streak: **${streak(s.activity || {})} days**.
${ratingLines(s)}

${labSection(s)}## Last 14 days

| Day | Solved or revised |
|---|---|
${days.map(d => `| ${d} | ${s.activity?.[d] || 0} |`).join("\n")}

## History

What I did on each of the last 7 active days. The full day-by-day list is in [HISTORY.md](HISTORY.md).

${historyMd(s, data, 7) || "Nothing yet."}

## Recently solved

| Date | Question | Platform | Level | Status |
|---|---|---|---|---|
${recent.map(line).join("\n")}
`;
}

// Contest ratings, as last fetched from AtCoder and Codeforces themselves.
function ratingLines(s) {
  const r = s.ratings || {}, out = [];
  if (r.ac?.rating != null) out.push(`- AtCoder: [${r.ac.handle}](${r.ac.url}) rated **${r.ac.rating}** (${acBand(r.ac.rating).name}), highest ${r.ac.max}, ${r.ac.contests} rated contests`);
  if (r.cf?.rating != null) out.push(`- Codeforces: [${r.cf.handle}](${r.cf.url}) rated **${r.cf.rating}** (${cfRank(r.cf.rating).name}), highest ${r.cf.max}, ${r.cf.contests} rated contests`);
  return out.length ? `\n## Contest ratings\n\n${out.join("\n")}\n` : "";
}

function historyMd(s, data, limit = Infinity) {
  return buildHistory(s).slice(0, limit).map(({ day, entries, firsts, revisions }) => {
    const head = `### ${longDate(day)}\n\n${firsts} solved, ${revisions} revised.\n\n| Question | Platform | Level | What I did |\n|---|---|---|---|`;
    const rows = entries.map(e => {
      const it = resolveItem(e.id, data) || { title: e.id };
      const link = it.url ? `[${it.title}](${it.url})` : it.title;
      return `| ${link} | ${it.platform || ""} | ${it.levelLabel || ""} | ${ACTION_LABEL[e.a] || e.a} |`;
    });
    return [head, ...rows].join("\n");
  }).join("\n\n");
}

// Builds progress/HISTORY.md: every day you solved or revised something, newest first.
export function buildHistoryMd(s, data) {
  const days = buildHistory(s);
  return `# My prep history

Every day I solved or revised something, newest first. Tracked with Prepboard. Updated ${today()}.

${days.length} active day${days.length === 1 ? "" : "s"} so far.

${historyMd(s, data) || "Nothing yet."}
`;
}
