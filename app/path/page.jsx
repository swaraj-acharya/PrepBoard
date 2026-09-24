"use client";
import { useEffect, useState } from "react";
import { useData } from "@/lib/data";
import { useStore } from "@/lib/store";
import Rail from "@/components/Rail";
import TopicCard from "@/components/TopicCard";

const LANGS = [
  ["C++", "https://www.learncpp.com/"],
  ["Java", "https://dev.java/learn/"],
  ["Python", "https://docs.python.org/3/tutorial/"],
];

export default function PathPage() {
  const { seq, ready, want } = useData();
  useEffect(() => { want("ac"); }, [want]);
  const { problems: prog, settings } = useStore();
  const [hideDone, setHideDone] = useState(false);
  if (!ready) return <p className="muted">Loading the path…</p>;
  const all = seq.flatMap(g => g.problems);
  const done = all.filter(s => prog[s]?.status).length;
  const perDay = Math.max(1, settings.goal || 3);
  const weeks = Math.ceil((all.length - done) / perDay / 7);

  return (
    <div>
      <header className="page-head">
        <h1>DSA path: from zero to Google</h1>
        <p className="muted">{all.length} LeetCode questions in {seq.length} steps. Start at step 1 even if it looks easy: each step uses the one before it. Every question is free on LeetCode.</p>
        <div className="path-progress">
          <div className="goal-bar big"><span style={{ width: `${(done / all.length) * 100}%` }} /></div>
          <p className="muted small"><strong>{done}</strong> of {all.length} done. At {perDay} a day, about {weeks} more {weeks === 1 ? "week" : "weeks"} to finish.</p>
        </div>
        <label className="toggle"><input type="checkbox" checked={hideDone} onChange={e => setHideDone(e.target.checked)} /> Hide solved</label>
      </header>

      <details className="before-start" open={done === 0}>
        <summary>New to coding? Read this first</summary>
        <ol>
          <li>
            <strong>Pick one language and stick to it.</strong> Learn variables, if-else, loops, functions, arrays and strings, plus your language&apos;s list, map and set. Free guides:{" "}
            {LANGS.map(([n, u], i) => <span key={n}>{i > 0 && ", "}<a href={u} target="_blank" rel="noreferrer">{n}</a></span>)}. C++ or Java are the most common in Indian placements. Python is easiest to start with.
          </li>
          <li><strong>Understand time complexity.</strong> It decides whether your code passes or times out.
            <TopicCard name="Time Complexity" />
          </li>
          <li><strong>How to solve each question.</strong> Open it, read &quot;Learn the topic&quot;, then try for 20–30 minutes. Stuck? Use hint 1, try again, then hint 2. Only use hint 3 (the solution) after that. When you solve it, use &quot;Check my solution&quot; to learn the best approach.</li>
          <li><strong>Revise.</strong> Solved questions come back on the Today page after 1, 3, 7, 21 and 45 days. Doing these revisions is what makes you remember patterns in the interview.</li>
          <li><strong>Watch the milestones.</strong> After step 10 you can clear most online tests, after step 17 most SDE-1 interviews, and the last steps get you ready for Google.</li>
        </ol>
      </details>

      <Rail hideDone={hideDone} groups={seq.map(g => ({ id: g.id, name: g.name, topics: g.topics, why: g.why, milestone: g.milestone, ids: g.problems, bridge: g.bridge }))} />
    </div>
  );
}
