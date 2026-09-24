"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore, actions } from "@/lib/store";
import { REASONING, STAGES, SELF_REVIEW, MISTAKES, EXTRAS, DIMENSIONS, ANTIPATTERNS } from "@/lib/lab";
import {
  BY_ID, CAT, MODEL_BY_ID, normLab, templateOf, thinkMinutes, status, labPrompt, AI_MODES, processScore, coverage,
  hypothesisCount, minutesToHypothesis, journalEntries, toMarkdown, lines,
} from "@/lib/labEngine";

const pct = v => (v == null ? "—" : `${Math.round(v * 100)}%`);
const DIM = Object.fromEntries(DIMENSIONS.map(d => [d.id, d.name]));

function Field({ label, help, value, onSave, rows = 3 }) {
  return (
    <label className="field">
      <span>{label}</span>
      {help && <span className="muted small">{help}</span>}
      <textarea className="notes" rows={rows} defaultValue={value || ""} onBlur={e => { if (e.target.value !== (value || "")) onSave(e.target.value); }} />
    </label>
  );
}

function Choice({ value, onChange, name }) {
  return (
    <span className="seg seg-small" role="radiogroup" aria-label={name}>
      {[["yes", "Yes"], ["partly", "Partly"], ["no", "No"]].map(([k, l]) => (
        <button key={k} role="radio" aria-checked={value === k} className={value === k ? "on" : ""} onClick={() => onChange(k)}>{l}</button>
      ))}
    </span>
  );
}

export default function Workspace() {
  const { id } = useParams();
  const c = BY_ID.get(id);
  const state = useStore();
  const lab = normLab(state.lab);
  const s = lab.sessions[id] || {};
  const [now, setNow] = useState(() => Date.now());
  const [mode, setMode] = useState("socratic");
  const [copied, setCopied] = useState("");
  const st = status(s);
  const unlockAt = (s.startedAt || 0) + (c ? thinkMinutes(c) : 0) * 60000;
  const thinking = st === "started" && now < unlockAt;
  useEffect(() => {
    if (!thinking) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [thinking]);

  if (!c) return <div className="card"><p>No such challenge. <Link href="/lab#challenges">See all challenges</Link></p></div>;

  const tpl = templateOf(c);
  const update = fn => actions.lab(l => {
    const L = normLab(l);
    return { ...L, sessions: { ...L.sessions, [id]: { ...fn(L.sessions[id] || {}), u: Date.now() } } };
  });
  const setStep = (k, v) => update(x => ({ ...x, steps: { ...(x.steps || {}), [k]: v }, ...(["hypotheses", "causes", "counter", "options"].includes(k) && v.trim() && !x.firstHypAt ? { firstHypAt: Date.now() } : {}) }));
  const stagesShown = (c.stages || []).slice(0, (s.stageNotes?.length || 0) + 1);
  const stagesDone = !c.stages || (s.stageNotes?.length || 0) >= c.stages.length;
  const written = tpl.filter(([k]) => s.steps?.[k]?.trim()).length;
  const canSubmit = written >= 2 && stagesDone;
  const reviewed = SELF_REVIEW.every(([k]) => s.review?.[k]);
  const left = Math.max(0, Math.ceil((unlockAt - now) / 1000));
  const aiLocked = m => (["solution", "expert"].includes(m) ? !s.submittedAt : thinking);
  const entry = st === "done" ? journalEntries(lab).find(e => e.challengeId === id) : null;
  const S = STAGES[c.stage - 1];

  async function copy(text, key) { await navigator.clipboard.writeText(text).catch(() => {}); setCopied(key); setTimeout(() => setCopied(""), 1500); }
  function finish() {
    const first = !s.doneAt;
    update(x => ({ ...x, doneAt: x.doneAt || Date.now(), principle: x.principle ?? c.reveal.principle }));
    if (first) actions.labActivity();
  }

  return (
    <div className="lab lab-work">
      <p className="small"><Link href="/lab">← Problem Solving Lab</Link></p>
      <header className="page-head">
        <p className="kicker">{CAT[c.category].name} · Stage {c.stage}: {S.name} · {REASONING[c.reasoning]} · ~{c.minutes} min</p>
        <h1>{c.title}</h1>
        <p className="small muted">Trains: {c.skills.map(d => DIM[d]).join(", ")}</p>
      </header>

      <section className="card">
        {c.brief.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
        {c.constraints?.length > 0 && <><h3>Constraints</h3><ul>{c.constraints.map((x, i) => <li key={i}>{x}</li>)}</ul></>}
        {(c.artifacts || []).map((a, i) => (
          <figure key={i} className="artifact"><figcaption className="muted small">{a.label}</figcaption><pre><code>{a.text}</code></pre></figure>
        ))}
        {c.resourceLinks?.length > 0 && <p className="small">Allowed reading: {c.resourceLinks.map((r, i) => <span key={r.url}>{i > 0 && " · "}<a href={r.url} target="_blank" rel="noreferrer">{r.name}</a></span>)}</p>}
      </section>

      {st === "new" ? (
        <section className="card">
          <h2>Before you start</h2>
          <p className="small">Thinking time: hints and AI help unlock after <strong>{thinkMinutes(c)} minutes</strong>. Staying with an unfamiliar problem is the skill being trained.</p>
          {c.noSearch
            ? <p className="small">No-search exercise: until you submit, use only your own reasoning, and pen and paper. No search engines, AI or solutions.</p>
            : <p className="small">Until the thinking time is over, use only documentation, your terminal, a debugger, tests and source code. No search engines, AI, editorials or Stack Overflow.</p>}
          <button className="btn primary" onClick={() => update(x => ({ ...x, startedAt: Date.now() }))}>Start</button>
        </section>
      ) : (
        <>
          {thinking && <p className="lab-timer" role="status">Thinking time: {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")} left before hints and AI help unlock.</p>}

          {c.stages && (
            <section className="card">
              <h2>What you know so far</h2>
              <ol className="stage-log">
                {stagesShown.map((x, i) => (
                  <li key={i}>
                    <strong>{x.at}</strong> {x.info}
                    {i < (s.stageNotes?.length || 0) ? (
                      <p className="small muted">You: {s.stageNotes[i]}</p>
                    ) : (
                      <StageNote ask={x.ask} last={i === c.stages.length - 1} onSave={v => update(y => ({ ...y, stageNotes: [...(y.stageNotes || []), v] }))} />
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="card">
            <h2>Your reasoning</h2>
            <p className="muted small">Write before you look anything up. One idea per line where it asks for a list. Saved as you leave each box.</p>
            {tpl.map(([k, label, help]) => <Field key={k} label={label} help={help} value={s.steps?.[k]} onSave={v => setStep(k, v)} rows={k === "hypotheses" ? 4 : 3} />)}
          </section>

          <section className="card">
            <h2>Hints</h2>
            {thinking ? <p className="muted small">Locked for {Math.ceil(left / 60)} more minute{left > 60 ? "s" : ""}. Keep going: write your hypotheses first.</p> : (
              <>
                <ol className="hints">{c.hints.slice(0, s.hints || 0).map((h, i) => <li key={i}>{h}</li>)}</ol>
                {(s.hints || 0) < c.hints.length && !s.submittedAt && <button className="btn ghost" onClick={() => update(x => ({ ...x, hints: (x.hints || 0) + 1 }))}>Show hint {(s.hints || 0) + 1} of {c.hints.length}</button>}
              </>
            )}
          </section>

          <section className="card">
            <h2>AI help</h2>
            <p className="muted small">Copy the prompt into any AI chat. It includes only what you&apos;ve seen and written. Socratic is the default: it asks questions instead of answering.</p>
            <div className="seg lab-ai">
              {AI_MODES.map(([k, label, desc]) => <button key={k} className={mode === k ? "on" : ""} title={desc} onClick={() => setMode(k)}>{label}</button>)}
            </div>
            <p className="small">{AI_MODES.find(m => m[0] === mode)[2]}</p>
            {aiLocked(mode) ? <p className="muted small">{["solution", "expert"].includes(mode) ? "Unlocks after you submit your attempt." : "Unlocks when the thinking time is over."}</p> : (
              <>
                <textarea className="notes prompt" rows={6} readOnly value={labPrompt(c, s, mode)} />
                <button className="btn" onClick={() => copy(labPrompt(c, s, mode), "ai")}>{copied === "ai" ? "Copied" : "Copy prompt"}</button>
              </>
            )}
          </section>

          {!s.submittedAt && (
            <section className="card">
              <button className="btn primary" disabled={!canSubmit} onClick={() => update(x => ({ ...x, submittedAt: Date.now(), hints: x.hints || 0 }))}>Submit my attempt and reveal</button>
              {!canSubmit && <p className="muted small">{stagesDone ? "Write at least two steps first." : "Work through every update above first."}</p>}
            </section>
          )}

          {s.submittedAt && (
            <>
              <section className="card reveal">
                <h2>Compare with an experienced engineer</h2>
                <p className="muted small">Tick each point your attempt covered. Be strict: partly counts as no.</p>
                <ul className="keypoints">
                  {c.reveal.keyPoints.map((p, i) => (
                    <li key={i}><label><input type="checkbox" checked={(s.keyHits || []).includes(i)} onChange={e => update(x => ({ ...x, keyHits: e.target.checked ? [...new Set([...(x.keyHits || []), i])] : (x.keyHits || []).filter(j => j !== i) }))} /> {p}</label></li>
                  ))}
                </ul>
                <p><strong>{c.category === "case" ? "" : "In short: "}</strong>{c.reveal.answer}</p>
                {c.reveal.source && <p className="small">Source: <a href={c.reveal.source.url} target="_blank" rel="noreferrer">{c.reveal.source.name}</a></p>}
                <p className="small">Did your answer match? <Choice name="Did your answer match?" value={s.match} onChange={v => update(x => ({ ...x, match: v }))} /></p>
              </section>

              <section className="card">
                <h2>Reflect</h2>
                <Field label="Principle for your notebook" help="Rewrite it in your own words, or write the one you actually learned." value={s.principle ?? c.reveal.principle} onSave={v => update(x => ({ ...x, principle: v }))} rows={2} />
                <Field label="Explain it like a senior engineer (30 seconds)" help="What happened? Why? What evidence proves it? What did you change? Why does the fix work? What could still go wrong?" value={s.explain} onSave={v => update(x => ({ ...x, explain: v }))} rows={4} />
                {c.followUps.map((q, i) => <Field key={i} label={i === 0 ? "Follow-up: what changes?" : "Another follow-up"} help={q} value={s.steps?.[`follow${i}`]} onSave={v => setStep(`follow${i}`, v)} rows={3} />)}
                {c.extra && (
                  <details className="topic">
                    <summary>Write the {EXTRAS[c.extra].name.toLowerCase()} (optional, good portfolio material)</summary>
                    {c.extra === "postmortem" && <p className="muted small">Blameless: ask what let the failure happen, not who caused it.</p>}
                    {EXTRAS[c.extra].steps.map(([k, label, help]) => <Field key={k} label={label} help={help} value={s.extra?.[k]} onSave={v => update(x => ({ ...x, extra: { ...(x.extra || {}), [k]: v } }))} rows={2} />)}
                  </details>
                )}
              </section>

              <section className="card">
                <h2>Reasoning-quality review</h2>
                <ul className="self-review">{SELF_REVIEW.map(([k, q]) => <li key={k}><span>{q}</span><Choice name={q} value={s.review?.[k]} onChange={v => update(x => ({ ...x, review: { ...(x.review || {}), [k]: v } }))} /></li>)}</ul>
                <p className="small">Reasoning mistakes I made:</p>
                <p>{MISTAKES.map(m => <button key={m.id} className={`chip ${(s.mistakes || []).includes(m.id) ? "chip-on" : ""}`} onClick={() => update(x => ({ ...x, mistakes: (x.mistakes || []).includes(m.id) ? x.mistakes.filter(y => y !== m.id) : [...(x.mistakes || []), m.id] }))}>{m.name}</button>)}</p>
                {((c.models || []).length > 0 || (c.antipatterns || []).length > 0) && (
                  <p className="small muted">Related in the library: {[...(c.models || []).map(m => MODEL_BY_ID[m].name), ...(c.antipatterns || []).map(a => ANTIPATTERNS.find(x => x.id === a).name)].join(", ")}. <Link href="/lab#library">Open the library</Link></p>
                )}
                {st !== "done" && <button className="btn primary" disabled={!reviewed} onClick={finish}>Finish</button>}
                {!reviewed && <p className="muted small">Answer every review question to finish.</p>}
              </section>
            </>
          )}

          {st === "done" && (
            <section className="card">
              <h2>Your process</h2>
              <ul className="signal-list">
                <li><span>Self-review (process) score</span><strong>{pct(processScore(s))}</strong></li>
                <li><span>Key points covered</span><strong>{pct(coverage(s, c))}</strong></li>
                <li><span>Hypotheses written</span><strong>{hypothesisCount(s)}</strong></li>
                <li><span>Minutes to first hypothesis</span><strong>{minutesToHypothesis(s) ?? "—"}</strong></li>
                <li><span>Hints used</span><strong>{s.hints || 0} of {c.hints.length}</strong></li>
                <li><span>Answer matched</span><strong>{s.match || "—"}</strong></li>
              </ul>
              <p className="muted small">A right answer reached by guessing isn&apos;t the goal. The process score is what grows your skill map.</p>
              {entry && <button className="btn" onClick={() => copy(toMarkdown(entry), "md")}>{copied === "md" ? "Copied" : "Copy write-up as Markdown"}</button>}{" "}
              <Link className="btn ghost" href="/lab">Back to today</Link>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function StageNote({ ask, last, onSave }) {
  const [v, setV] = useState("");
  return (
    <div className="stage-note">
      <label className="field"><span>{ask}</span><textarea className="notes" rows={2} value={v} onChange={e => setV(e.target.value)} /></label>
      <button className="btn" disabled={lines(v).length === 0} onClick={() => onSave(v.trim())}>{last ? "Record my decision" : "Record and get the next update"}</button>
    </div>
  );
}
