"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useJSON } from "@/lib/data";
import { useStore, actions } from "@/lib/store";

export default function Companies() {
  const { data } = useJSON("/data/companies.json");
  const { data: meta } = useJSON("/data/meta.json");
  const { settings } = useStore();
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    if (!data) return [];
    const t = q.trim().toLowerCase();
    return data.filter(c => !t || c.n.toLowerCase().includes(t)).sort((a, b) =>
      (settings.targets.includes(b.s) - settings.targets.includes(a.s)) || b.c - a.c);
  }, [data, q, settings.targets]);

  return (
    <div>
      <header className="page-head">
        <h1>Company questions</h1>
        <p className="muted">{data?.length || "…"} companies. The questions are on LeetCode, and the company lists come from two GitHub repos: <a href="https://github.com/snehasishroy/leetcode-companywise-interview-questions" target="_blank" rel="noreferrer">snehasishroy</a> (companies and frequency) and <a href="https://github.com/liquidslr/leetcode-company-wise-problems" target="_blank" rel="noreferrer">liquidslr</a> (topic tags){meta ? `, refreshed on ${meta.built}` : ""}. Star the companies you're targeting.</p>
        <input className="search" placeholder="Search companies, e.g. Amazon, Flipkart, Zoho" value={q} onChange={e => setQ(e.target.value)} autoFocus />
      </header>
      {!data ? <p className="muted">Loading companies…</p> : list.length === 0 ? <p className="muted">No company matches “{q}”.</p> : (
        <ul className="clist">
          {list.slice(0, 300).map(c => {
            const star = settings.targets.includes(c.s);
            return (
              <li key={c.s} className={star ? "starred" : ""}>
                {c.s === "_all" ? <span className="star" aria-hidden="true">◆</span> : <button className="star" onClick={() => actions.toggleTarget(c.s)} aria-pressed={star} aria-label={star ? `Remove ${c.n} from targets` : `Add ${c.n} to targets`}>{star ? "★" : "☆"}</button>}
                <Link href={`/companies/${c.s}`}>
                  <span className="cname">{c.n}</span>
                  <span className="muted small">{c.c} questions{c.r ? `, ${c.r} in the last 30 days` : ""}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
