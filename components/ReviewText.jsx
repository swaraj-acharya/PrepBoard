"use client";
import { useMemo, useState } from "react";
import { parseReview, inlineParts } from "@/lib/review";
import { copyText } from "./PromptBox";

// A block of code: scrolls sideways instead of wrapping, with a copy button.
export function CodeView({ code, lang, label, lines }) {
  const [msg, setMsg] = useState("");
  async function onCopy() {
    setMsg((await copyText(code)) ? "Copied" : "Select the code to copy it");
    setTimeout(() => setMsg(""), 2000);
  }
  return (
    <div className="codeview">
      <div className="codeview-bar">
        <span>{label || lang || "Text"}</span>
        <span className="codeview-actions">
          {msg && <span className="small" role="status">{msg}</span>}
          <button type="button" className="mini" onClick={onCopy} aria-label={`Copy ${label || "code"}`}>Copy</button>
        </span>
      </div>
      {lines
        ? <pre className="codeview-lines"><code>{lines.map((l, i) => <span key={i} className={l.same ? "" : "cv-changed"}><span className="cv-mark" aria-hidden="true">{l.same ? " " : "+"}</span>{l.line || " "}{"\n"}</span>)}</code></pre>
        : <pre><code>{code}</code></pre>}
    </div>
  );
}

function Inline({ text }) {
  return inlineParts(text).map((p, i) => p.t === "code" ? <code key={i}>{p.v}</code> : p.t === "b" ? <strong key={i}>{p.v}</strong> : <span key={i}>{p.v}</span>);
}

// An AI review, readable: headings, lists, tables and code blocks from Markdown; plain text keeps
// its line breaks. Everything is rendered as text by React, never as HTML.
export default function ReviewText({ raw }) {
  const blocks = useMemo(() => parseReview(raw), [raw]);
  return (
    <div className="review-text">
      {blocks.map((b, i) => {
        if (b.type === "h") return b.level <= 2 ? <h4 key={i}><Inline text={b.text} /></h4> : <h5 key={i}><Inline text={b.text} /></h5>;
        if (b.type === "code") return <CodeView key={i} code={b.text} lang={b.lang} />;
        if (b.type === "hr") return <hr key={i} />;
        if (b.type === "quote") return <blockquote key={i}><Inline text={b.text} /></blockquote>;
        if (b.type === "table") return (
          <div key={i} className="table-wrap">
            <table className="ptable review-table">
              <thead><tr>{b.rows[0].map((c, j) => <th key={j}><Inline text={c} /></th>)}</tr></thead>
              <tbody>{b.rows.slice(1).map((r, j) => <tr key={j}>{r.map((c, k) => <td key={k}><Inline text={c} /></td>)}</tr>)}</tbody>
            </table>
          </div>
        );
        if (b.type === "list") {
          const Tag = b.ordered ? "ol" : "ul";
          return <Tag key={i}>{b.items.map((it, j) => <li key={j} style={it.depth ? { marginLeft: `${it.depth * 1.2}rem` } : undefined}><Inline text={it.text} /></li>)}</Tag>;
        }
        return <p key={i}><Inline text={b.text} /></p>;
      })}
    </div>
  );
}
