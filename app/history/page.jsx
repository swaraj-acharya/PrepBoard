"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore, today } from "@/lib/store";
import { useData, resolveItem } from "@/lib/data";
import { buildHistory, longDate, isFirst, ACTION_LABEL, ACTION_SHORT } from "@/lib/history";
import ItemRow from "@/components/ItemRow";

const FILTERS = [["all", "Everything"], ["first", "Solved"], ["rev", "Revised"]];
const PAGE = 14;

function relDay(day) {
  if (day === today()) return "Today";
  if (day === today(-1)) return "Yesterday";
  return null;
}

export default function HistoryPage() {
  const state = useStore();
  const data = useData();
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [shown, setShown] = useState(PAGE);

  const all = useMemo(() => buildHistory(state), [state]);
  const days = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.map(d => ({
      ...d,
      entries: d.entries.filter(e => {
        if (filter === "first" && !isFirst(e.a)) return false;
        if (filter === "rev" && isFirst(e.a)) return false;
        if (!needle) return true;
        const it = resolveItem(e.id, data);
        return `${it?.title || e.id} ${it?.platform || ""} ${(it?.topicNames || []).join(" ")}`.toLowerCase().includes(needle);
      }),
    })).filter(d => d.entries.length);
  }, [all, filter, q, data]);

  const totalFirst = all.reduce((n, d) => n + d.firsts, 0);
  const totalRev = all.reduce((n, d) => n + d.revisions, 0);

  if (!data?.ready) return <p className="muted">Loading your history…</p>;

  return (
    <div className="history">
      <header className="page-head">
        <h1>History</h1>
        {all.length === 0
          ? <p className="muted">Nothing here yet. Every question you solve or revise is saved under the day you did it. Start with the next question on the <Link href="/">Today</Link> page.</p>
          : <p className="muted">{totalFirst} solved and {totalRev} revised over {all.length} active day{all.length === 1 ? "" : "s"}. Open any question to see your code and notes again.</p>}
      </header>

      {all.length > 0 && (
        <div className="filters">
          <div className="seg" role="group" aria-label="Show">
            {FILTERS.map(([k, label]) => (
              <button key={k} className={filter === k ? "on" : ""} aria-pressed={filter === k} onClick={() => setFilter(k)}>{label}</button>
            ))}
          </div>
          <input className="search" type="search" placeholder="Search by question or topic" value={q} onChange={e => setQ(e.target.value)} aria-label="Search history" />
        </div>
      )}

      {all.length > 0 && days.length === 0 && <p className="muted">No days match. Clear the search or choose Everything.</p>}

      <ol className="days">
        {days.slice(0, shown).map(({ day, entries }) => {
          const firsts = entries.filter(e => isFirst(e.a)).length;
          const revs = entries.length - firsts;
          const rel = relDay(day);
          return (
            <li key={day} className="day" id={`d-${day}`}>
              <div className="day-head">
                <h2>{rel ? <>{rel} <span className="day-date">{longDate(day)}</span></> : longDate(day)}</h2>
                <span className="day-count">
                  {[firsts && `${firsts} solved`, revs && `${revs} revised`].filter(Boolean).join(", ")}
                </span>
              </div>
              <ul className="plist">
                {entries.map(e => (
                  <ItemRow key={`${e.id}|${e.a}`} id={e.id} extra={<span className={`act act-${e.a}`} title={ACTION_LABEL[e.a]}><span className="act-long">{ACTION_LABEL[e.a]}</span><span className="act-short">{ACTION_SHORT[e.a]}</span></span>} />
                ))}
              </ul>
            </li>
          );
        })}
      </ol>

      {days.length > shown && (
        <button className="btn more-btn" onClick={() => setShown(n => n + PAGE)}>Show {Math.min(PAGE, days.length - shown)} older days</button>
      )}
    </div>
  );
}
