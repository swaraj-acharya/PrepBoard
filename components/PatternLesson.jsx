"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { PATTERNS } from "@/lib/patterns";
import { GUIDE, groupOf, patternPrompt } from "@/lib/patternGuide";
import { useData } from "@/lib/data";
import { useStore } from "@/lib/store";
import ItemRow from "./ItemRow";
import PromptBox from "./PromptBox";

const SHOW = 8; // path questions listed before "Show all"

// One pattern, fully explained. The body is only built once it's opened, so the page stays light with 70 lessons.
export default function PatternLesson({ k, uses, hash }) {
  const p = PATTERNS[k], g = GUIDE[k];
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { problems } = useStore();

  useEffect(() => {
    if (hash !== k) return;
    setOpen(true);
    const t = setTimeout(() => ref.current?.scrollIntoView({ block: "start", behavior: "smooth" }), 80);
    return () => clearTimeout(t);
  }, [hash, k]);

  const all = useMemo(() => [...(uses?.main || []), ...(uses?.also || [])], [uses]);
  const solved = all.filter(u => problems[u.id]?.status === "solved").length;

  return (
    <details ref={ref} id={k} className="topic pattern" open={open} onToggle={e => setOpen(e.currentTarget.open)}>
      <summary>
        {p.name}
        <span className="pat-meta">
          {uses?.main?.length ? `main idea of ${uses.main.length} path question${uses.main.length === 1 ? "" : "s"}` : ""}
          {all.length ? ` · solved ${solved}/${all.length}` : ""}
        </span>
      </summary>
      {open && <Body k={k} p={p} g={g} uses={uses} />}
    </details>
  );
}

function Body({ k, p, g, uses }) {
  const { problems: data } = useData();
  const { settings } = useStore();
  const [showAll, setShowAll] = useState(false);
  const rows = [...(uses?.main || []), ...(uses?.also || [])];
  const shown = showAll ? rows : rows.slice(0, SHOW);
  const titles = (uses?.main || []).slice(0, 6).map(u => data?.[u.id]?.t).filter(Boolean);
  const prompt = useMemo(() => patternPrompt(k, { lang: settings?.lang || "C++", titles }), [k, settings?.lang, titles.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="topic-body">
      <p className="topic-story"><strong>In everyday words.</strong> {g.story}</p>

      <p><strong>What you do.</strong> {p.move}</p>

      <p><strong>How to spot it in a question:</strong></p>
      <ul>{p.signals.map(s => <li key={s}>{s}</li>)}</ul>

      <p><strong>Worked example.</strong> {g.eg.q}</p>
      <ol>{g.eg.steps.map(s => <li key={s}>{s}</li>)}</ol>
      <p><strong>Answer:</strong> {g.eg.a}</p>

      <p><strong>Template</strong> <span className="muted small">(Python-style, the idea matters, not the language)</span></p>
      <pre className="pat-code"><code>{g.code}</code></pre>

      <p className="small"><strong>Cost:</strong> {p.cost} <strong>Watch out:</strong> {p.trap}</p>

      <div className="pat-learn">
        <p><strong>Want it explained again, slowly?</strong> Copy this prompt into any AI chat. It explains the pattern like you're 12, with examples, and quizzes you at the end. Code comes back in {settings?.lang || "C++"} (change it in Settings).</p>
        <PromptBox prompt={prompt} rows={10} />
      </div>

      {rows.length > 0 && (
        <div className="pat-practice">
          <p><strong>Practise it on your path</strong> <span className="muted small">({uses.main.length} where it is the main idea{uses.also.length ? `, ${uses.also.length} where it helps` : ""})</span></p>
          <ul className="plist">{shown.map(u => <ItemRow key={u.id} id={u.id} note={u.cue} />)}</ul>
          {rows.length > SHOW && <button className="btn ghost" onClick={() => setShowAll(s => !s)}>{showAll ? "Show fewer" : `Show all ${rows.length}`}</button>}
        </div>
      )}
    </div>
  );
}
