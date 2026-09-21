"use client";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useJSON, useData, useCompany } from "@/lib/data";
import { useStore, actions } from "@/lib/store";
import ItemRow from "@/components/ItemRow";

const WINDOWS = [["d30", "Last 30 days"], ["m3", "3 months"], ["m6", "6 months"], ["y1", "Last 1 year"], ["all", "All time"]];

export default function Company() {
  const { slug } = useParams();
  const { data, error } = useCompany(slug);
  const { problems } = useData();
  const { problems: prog, settings } = useStore();
  const [win, setWin] = useState(null);
  const [diff, setDiff] = useState("");
  const [status, setStatus] = useState("");
  const [topic, setTopic] = useState("");
  const [limit, setLimit] = useState(100);
  const { data: meta } = useJSON("/data/meta.json");
  const { data: index } = useJSON("/data/companies.json");
  const isAll = slug === "_all";
  const name = index?.find(c => c.s === slug)?.n || String(slug).split("-").map(w => w[0]?.toUpperCase() + w.slice(1)).join(" ");

  const w = win || (data ? WINDOWS.find(([k]) => data[k]?.length)?.[0] : "all");
  const rows = data?.[w] || [];
  const topics = useMemo(() => {
    const c = {};
    if (problems) for (const [s] of rows) for (const t of problems[s]?.g || []) c[t] = (c[t] || 0) + 1;
    return Object.entries(c).sort((a, b) => b[1] - a[1]);
  }, [rows, problems]);
  const filtered = rows.filter(([s]) => {
    const p = problems?.[s];
    if (diff && p?.d !== diff) return false;
    if (topic && !p?.g?.includes(topic)) return false;
    const st = prog[s]?.status;
    if (status === "todo" && st) return false;
    if (status === "done" && !st) return false;
    return true;
  });
  const solvedHere = rows.filter(([s]) => prog[s]?.status).length;
  const star = settings.targets.includes(slug);

  if (error) return <p className="error">No data for “{slug}”. <Link href="/companies">Back to companies</Link></p>;
  if (!data || !problems) return <p className="muted">Loading {name}…</p>;

  return (
    <div>
      <header className="page-head">
        <Link href="/companies" className="muted small">All companies</Link>
        <h1>{name}</h1>
        <p className="muted">{isAll ? "Every question asked at any company, ranked by how many companies asked it. " : ""}You've solved {solvedHere} of {rows.length} in this list, sorted by how often it's asked. Questions are on LeetCode. Company tags and frequency come from the <a href="https://github.com/snehasishroy/leetcode-companywise-interview-questions" target="_blank" rel="noreferrer">leetcode-companywise-interview-questions</a> repo on GitHub.</p>
        {!isAll && <button className={`btn ${star ? "on-solved" : ""}`} onClick={() => actions.toggleTarget(slug)}>{star ? "★ Target company" : "☆ Add to targets"}</button>}
      </header>

      <div className="filters">
        <div className="seg" role="tablist">
          {WINDOWS.map(([k, label]) => (
            <button key={k} role="tab" aria-selected={w === k} className={w === k ? "on" : ""} disabled={!data[k]?.length}
              onClick={() => { setWin(k); setLimit(100); }}>{label} <span className="muted">{data[k]?.length || 0}</span></button>
          ))}
        </div>
        <select value={diff} onChange={e => setDiff(e.target.value)} aria-label="Difficulty">
          <option value="">Any difficulty</option><option value="E">Easy</option><option value="M">Medium</option><option value="H">Hard</option>
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} aria-label="Status">
          <option value="">Solved and unsolved</option><option value="todo">Unsolved only</option><option value="done">Solved only</option>
        </select>
        <select value={topic} onChange={e => setTopic(e.target.value)} aria-label="Topic">
          <option value="">Any topic</option>
          {topics.map(([t, c]) => <option key={t} value={t}>{t} ({c})</option>)}
        </select>
      </div>

      {w === "y1" && meta?.yearSnapshot && <p className="muted small">LeetCode only publishes 30-day, 3-month and 6-month lists, so &quot;Last 1 year&quot; combines the 6-month lists from the {meta.yearSnapshot} and {meta.companySnapshot} snapshots. Together they cover about the last 12 months.</p>}
      {filtered.length === 0 ? <p className="muted">No questions match these filters. Clear a filter to see more.</p> : (
        <ul className="plist">
          {filtered.slice(0, limit).map(([s, f, n], i) => (
            <ItemRow key={s} id={s} index={i + 1}
              extra={<>{n != null && <span className="asked-by">{n} {n === 1 ? "company" : "companies"}</span>}<span className="freq" title={`Frequency ${f}%`}><span style={{ width: `${f}%` }} /></span></>} />
          ))}
        </ul>
      )}
      {filtered.length > limit && <button className="btn more-btn" onClick={() => setLimit(l => l + 100)}>Show 100 more ({filtered.length - limit} left)</button>}
    </div>
  );
}
