"use client";
import { useEffect, useMemo, useState } from "react";
import { PATTERNS } from "@/lib/patterns";
import { GROUPS, GUIDE, QUICK, LIMITS, questionsByPattern } from "@/lib/patternGuide";
import PatternLesson from "@/components/PatternLesson";

export default function PatternsPage() {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("All");
  const [hash, setHash] = useState("");
  const uses = useMemo(() => questionsByPattern(), []);

  useEffect(() => {
    const read = () => setHash(decodeURIComponent(window.location.hash.slice(1)));
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  const needle = q.trim().toLowerCase();
  const matches = key => {
    if (!needle) return true;
    const p = PATTERNS[key], g = GUIDE[key];
    return [p.name, p.move, g.story, ...p.signals, key].join(" ").toLowerCase().includes(needle);
  };
  const groups = GROUPS
    .filter(([name]) => group === "All" || group === name)
    .map(([name, keys]) => [name, keys.filter(matches)])
    .filter(([, keys]) => keys.length);
  const shown = groups.reduce((n, [, keys]) => n + keys.length, 0);
  const jump = () => { setQ(""); setGroup("All"); };

  return (
    <div className="patterns">
      <header className="page-head">
        <h1>Patterns</h1>
        <p>In a test you rarely have time to invent a solution. You read the question, name the pattern, and fill in the details. Each lesson below explains one pattern in everyday words, shows a worked example and a template, and has a prompt that makes an AI teach it to you like you're 12.</p>
      </header>

      <details className="topic" id="how-to-pick">
        <summary>How to pick a pattern in 60 seconds</summary>
        <div className="topic-body">
          <ol>
            <li><strong>Read the limits first.</strong> They tell you how fast your solution must be (table below).</li>
            <li><strong>Ask what is wanted.</strong> A count, a minimum or maximum, "all" of something, or yes/no? "All" means backtracking. "Minimum number of steps" means BFS. "Number of ways" means DP.</li>
            <li><strong>Look at the shape of the input.</strong> Sorted array, string, tree, grid, graph, intervals or a stream each point to a few patterns.</li>
            <li><strong>Write the slow way.</strong> Then ask: "what work am I repeating?" The pattern is the trick that stops the repeating.</li>
          </ol>
          <ul className="pat-limits">{LIMITS.map(([n, t]) => <li key={n}><strong>{n}:</strong> {t}</li>)}</ul>
        </div>
      </details>

      <details className="topic" id="lookup">
        <summary>Quick lookup: if the question says this, think of that</summary>
        <div className="topic-body">
          <ul className="pat-lookup">
            {QUICK.map(([clue, key]) => <li key={key + clue}>{clue} <a href={`#${key}`} onClick={jump}>→ {PATTERNS[key].name}</a></li>)}
          </ul>
        </div>
      </details>

      <div className="filters">
        <input className="search" type="search" placeholder="Search patterns (try: window, tree, shortest, prefix)" value={q} onChange={e => setQ(e.target.value)} aria-label="Search patterns" />
        <div className="chips" role="group" aria-label="Filter by group">
          {["All", ...GROUPS.map(([n]) => n)].map(n => (
            <button key={n} className={`chip${group === n ? " chip-on" : ""}`} aria-pressed={group === n} onClick={() => setGroup(n)}>{n}</button>
          ))}
        </div>
        <p className="muted small">{shown} of {Object.keys(PATTERNS).length} patterns</p>
      </div>

      {groups.length === 0 && <p className="muted">No pattern matches "{q}".</p>}
      {groups.map(([name, keys]) => (
        <section key={name} className="topic-section pat-group">
          <h2>{name} <span className="count">{keys.length}</span></h2>
          {keys.map(key => <PatternLesson key={key} k={key} uses={uses[key]} hash={hash} />)}
        </section>
      ))}
    </div>
  );
}
