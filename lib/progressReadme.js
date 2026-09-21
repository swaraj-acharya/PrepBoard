// Builds progress/README.md, the summary you see in your GitHub repo.
import { resolveItem } from "./data";
import { streak, today } from "./store";

export function buildReadme(s, data) {
  const solved = Object.entries(s.problems || {}).filter(([, v]) => v.status);
  const c = { E: 0, M: 0, H: 0, lcAll: 0, cf: 0, cc: 0, hld: 0, lld: 0, cs: 0 };
  for (const [id, v] of solved) {
    const pre = id.split(":")[0];
    if (id.includes(":") && c[pre] !== undefined) c[pre]++;
    else { c.lcAll++; const d = data?.problems?.[id]?.d; if (d) c[d]++; }
  }
  const coding = c.lcAll + c.cf + c.cc;
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
| DSA path | ${pathDone} of ${path.length} |
| System design | ${c.hld + c.lld} |
| CS subjects | ${c.cs} |

Current streak: **${streak(s.activity || {})} days**.

## Last 14 days

| Day | Solved or revised |
|---|---|
${days.map(d => `| ${d} | ${s.activity?.[d] || 0} |`).join("\n")}

## Recently solved

| Date | Question | Platform | Level | Status |
|---|---|---|---|---|
${recent.map(line).join("\n")}
`;
}
