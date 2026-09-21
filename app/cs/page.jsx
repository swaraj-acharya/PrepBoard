"use client";
import { useMemo, useState } from "react";
import { CS_SUBJECTS } from "@/lib/cs";
import { useData } from "@/lib/data";
import Rail from "@/components/Rail";

const ORDER = ["dbms", "sql", "os", "cn", "oops"];

export default function CSSubjects() {
  const [tab, setTab] = useState("dbms");
  const [hideDone, setHideDone] = useState(false);
  const { problems } = useData();
  const subject = CS_SUBJECTS.find(s => s.id === tab);

  const sqlGroups = useMemo(() => {
    if (!problems) return [];
    const by = { E: [], M: [], H: [] };
    for (const [s, p] of Object.entries(problems)) if (p.c === "D" && by[p.d]) by[p.d].push([p.n || 0, s]);
    return [["E", "Easy"], ["M", "Medium"], ["H", "Hard"]].map(([k, name]) => ({
      id: `sql-${k}`, name: `${name} SQL problems`, topics: ["SQL Queries"], ids: by[k].sort((a, b) => a[0] - b[0]).map(x => x[1]),
    }));
  }, [problems]);
  const sqlCount = sqlGroups.reduce((a, g) => a + g.ids.length, 0);

  const tabs = ORDER.map(id => id === "sql" ? ["sql", "SQL practice"] : [id, CS_SUBJECTS.find(s => s.id === id).name]);
  const count = subject ? subject.groups.reduce((a, g) => a + g.items.length, 0) : sqlCount;

  return (
    <div>
      <header className="page-head">
        <h1>CS subjects</h1>
        <div className="seg" role="tablist">
          {tabs.map(([k, label]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{label}</button>)}
        </div>
        <p className="muted">
          {subject ? `${subject.intro} ${count} questions, grouped by topic. Open a question for a simple explanation, study links, and prompts to get or check your answer.`
            : `All ${sqlCount} SQL (Database) problems on LeetCode, easiest first. Premium ones have a free statement on GitHub. New to SQL? Start with SQLBolt, then LeetCode's Top SQL 50.`}
        </p>
        <label className="toggle"><input type="checkbox" checked={hideDone} onChange={e => setHideDone(e.target.checked)} /> Hide done</label>
      </header>

      {subject && (
        <section className="resources">
          <h2>Study resources (free)</h2>
          <ul>
            {subject.resources.map(r => (
              <li key={r.url}><span className="res-kind">{r.kind}</span><a href={r.url} target="_blank" rel="noreferrer">{r.name}</a></li>
            ))}
          </ul>
        </section>
      )}

      <Rail key={tab} hideDone={hideDone} numbered={!subject}
        groups={subject ? subject.groups.map(g => ({ id: g.id, name: g.name, topics: g.topics, ids: g.items.map(i => i.id) })) : sqlGroups} />
    </div>
  );
}
