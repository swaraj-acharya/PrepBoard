"use client";
import { useState } from "react";

const CHATS = [
  ["ChatGPT", q => `https://chatgpt.com/?q=${encodeURIComponent(q)}`],
  ["Claude", q => `https://claude.ai/new?q=${encodeURIComponent(q)}`],
  ["Gemini", () => "https://gemini.google.com/app"],
];

async function copy(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    const t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select();
    const ok = document.execCommand("copy"); t.remove(); return ok;
  }
}

export default function PromptBox({ prompt, rows = 6 }) {
  const [msg, setMsg] = useState("");
  const [show, setShow] = useState(false);
  const tooLong = prompt.length > 6000;

  async function onCopy() {
    setMsg((await copy(prompt)) ? "Prompt copied. Paste it into any AI chat." : "Couldn't copy. Select the prompt below and copy it yourself.");
    if (!show) setShow(true);
  }
  async function onOpen(name, make) {
    await copy(prompt);
    const prefill = name !== "Gemini" && !tooLong;
    window.open(prefill ? make(prompt) : make(""), "_blank", "noopener");
    setMsg(prefill ? `Opened ${name}. The prompt is also copied, in case it isn't filled in.` : `Opened ${name}. Paste the prompt (Ctrl+V or long-press) and send it.`);
  }

  return (
    <div className="promptbox">
      <div className="pb-actions">
        <button className="btn primary" onClick={onCopy}>Copy prompt</button>
        <span className="pb-open">
          <span className="muted small">Open in</span>
          {CHATS.map(([name, make]) => <button key={name} className="btn" onClick={() => onOpen(name, make)} aria-label={`Open in ${name}`}>{name}</button>)}
        </span>
        <button className="btn ghost" onClick={() => setShow(s => !s)} aria-expanded={show}>{show ? "Hide prompt" : "See prompt"}</button>
      </div>
      {msg && <p className="small pb-msg" role="status">{msg}</p>}
      {show && <textarea className="pb-text" readOnly rows={rows} value={prompt} onFocus={e => e.target.select()} />}
    </div>
  );
}
