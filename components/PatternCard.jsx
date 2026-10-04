"use client";
import Link from "next/link";
import { patternsFor } from "@/lib/patterns";

// "Pattern recognition" block for the Learn the topic tab.
// It stays closed until the question is marked solved, because naming the pattern is the skill being practised and the
// pattern name gives the approach away. Open it any time; just try to name it yourself first.
export default function PatternCard({ item, solved = false, onLeave }) {
  const found = patternsFor(item);
  if (!found) return null;
  const guess = found.source === "tags";
  return (
    <details className="topic" open={solved}>
      <summary>Pattern recognition{solved ? "" : " (name it yourself first, then open)"}</summary>
      <div className="topic-body">
        {guess && (
          <p className="muted small">No hand-written entry for this question. These are guesses from its topic tags, so check them against the statement before you trust them.</p>
        )}
        {found.items.map((p, i) => (
          <div key={p.key} style={i ? { marginTop: "1rem" } : undefined}>
            <p><strong>{i === 0 ? (guess ? "Likely pattern: " : "Main pattern: ") : "Also: "}{p.name}</strong></p>
            {p.cue && <p><strong>Why it fits this question.</strong> {p.cue}</p>}
            <p><strong>Spot it when:</strong></p>
            <ul>{p.signals.map(s => <li key={s}>{s}</li>)}</ul>
            <p><strong>The move.</strong> {p.move}</p>
            <p className="small"><strong>Cost:</strong> {p.cost} <strong>Watch out:</strong> {p.trap}</p>
            <p className="small"><Link href={`/patterns#${p.key}`} onClick={onLeave}>Full lesson, example and AI prompt for this pattern →</Link></p>
          </div>
        ))}
      </div>
    </details>
  );
}
