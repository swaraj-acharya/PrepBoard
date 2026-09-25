"use client";
// The solution notebook inside a question's panel: save what you submitted as an attempt, paste the
// AI's review next to it, and come back later to read, compare and revise. Data: lib/solutionStore.js.
import { useEffect, useMemo, useState } from "react";
import { solutionActions } from "@/lib/solutionStore";
import { sameCode, diffLines, usesLang } from "@/lib/solutions";
import { lastCodeBlock } from "@/lib/review";
import { useStore } from "@/lib/store";
import { ACTION_LABEL } from "@/lib/history";
import ReviewText, { CodeView } from "./ReviewText";

export const LANGS = ["C++", "Java", "Python", "JavaScript"];
const DAY = { day: "numeric", month: "short", year: "numeric" };
export const fmtDate = t => new Date(t).toLocaleDateString("en-IN", DAY);
const fmtWhen = t => new Date(t).toLocaleString("en-IN", { ...DAY, hour: "numeric", minute: "2-digit" });
export const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };
export function ago(t) {
  const a = new Date(t); a.setHours(0, 0, 0, 0);
  const days = Math.round((startOfToday() - a.getTime()) / 864e5);
  return days <= 0 ? "today" : days === 1 ? "yesterday" : `${days} days ago`;
}
const hasReview = a => !!a?.review?.raw?.trim();
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

// What an attempt holds, in words: code, a design, or a written answer.
export function wordsFor(item) {
  if (item.kind === "hld") return { thing: "design", paste: "your design notes", better: "Improved design" };
  if (item.kind === "cs") return { thing: "answer", paste: "your answer", better: "Model answer" };
  return { thing: "code", paste: "your solution", better: "Improved solution" };
}
export const numbering = record => new Map((record?.attempts || []).map((a, i) => [a.id, i + 1]));
// The saved attempt with exactly this code, newest first. The review prompt reviews the code box,
// so a pasted review belongs to this attempt.
export const matchDraft = (record, work) => (work?.trim() ? [...(record?.attempts || [])].reverse().find(a => sameCode(a.code, work)) || null : null);

function Msg({ msg }) {
  if (!msg) return null;
  return <p className={`small sol-msg ${msg.kind === "error" ? "error" : ""}`} role={msg.kind === "error" ? "alert" : "status"}>{msg.text}{msg.action}</p>;
}

// "Save as attempt 2" under the code box.
export function SaveAttempt({ id, item, record, work, lang, revisionDue, onBeforeSave, onCompare }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [same, setSame] = useState(null); // an earlier attempt with identical code, waiting for "save again"
  const nums = numbering(record);
  const match = matchDraft(record, work);
  const next = (record?.attempts.length || 0) + 1;
  const { thing, paste } = wordsFor(item);
  useEffect(() => { setSame(null); setMsg(null); }, [work]);
  // Writing the same code again from memory during a revision is a real attempt, so it can be saved.
  const again = same || (revisionDue && match && match.at < startOfToday() ? match : null);

  async function save(force = false) {
    setMsg(null);
    if (!work.trim()) { setMsg({ kind: "error", text: `Paste ${paste} before saving.` }); return; }
    setBusy(true);
    try {
      onBeforeSave?.();
      const prev = record?.attempts[record.attempts.length - 1] || null;
      const r = await solutionActions.saveAttempt(id, { code: work, lang, ctx: revisionDue ? "revision" : "solve", force });
      if (r.status === "same-as-earlier") setSame(r.attempt);
      else if (r.status === "duplicate") setMsg({ kind: "ok", text: "Already saved today, so nothing new was added." });
      else if (prev && r.attempt.ctx === "revision") {
        // The saved note below says what happened; after a revision, offer the comparison.
        setMsg({ kind: "ok", text: "", action: <button type="button" className="linkish" onClick={() => onCompare(prev.id, r.attempt.id)}>Compare with your previous attempt</button> });
      }
    } catch (e) { setMsg({ kind: "error", text: e.message }); }
    setBusy(false);
  }

  return (
    <div className="save-attempt">
      {again ? (
        <div className="confirm">
          <p className="small">This is the same {thing} as attempt {nums.get(again.id)}, saved on {fmtDate(again.at)}. Save it again as a new attempt?</p>
          <button type="button" className="btn primary" disabled={busy} onClick={() => save(true)}>{busy ? "Saving…" : `Save as attempt ${next}`}</button>
          {same && <button type="button" className="btn ghost" onClick={() => setSame(null)}>Cancel</button>}
        </div>
      ) : match ? (
        <p className="small saved-note"><span aria-hidden="true">✓ </span>Saved as attempt {nums.get(match.id)} on {fmtDate(match.at)}. Change the {thing} to save a new attempt.</p>
      ) : (
        <button type="button" className="btn primary" disabled={busy} onClick={() => save()}>{busy ? "Saving…" : `Save as attempt ${next}`}</button>
      )}
      <Msg msg={msg} />
    </div>
  );
}

// Paste the AI's reply after using the review prompt.
export function ReviewPaste({ id, item, record, work, lang, revisionDue, onBeforeSave, onShow }) {
  // The pasted text survives closing the panel or reloading the page until you save it.
  const key = `prepboard:review-draft:${id}`;
  const [text, setText] = useState(() => { try { return sessionStorage.getItem(key) || ""; } catch { return ""; } });
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  useEffect(() => { try { if (text) sessionStorage.setItem(key, text); else sessionStorage.removeItem(key); } catch {} }, [key, text]);
  useEffect(() => {
    if (!text.trim()) return;
    const warn = e => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [text]);
  const nums = numbering(record);
  const match = matchDraft(record, work);
  const { thing, paste } = wordsFor(item);

  async function save(replace = false) {
    setMsg(null);
    if (!text.trim()) { setMsg({ kind: "error", text: "Paste the AI's review before saving." }); return; }
    if (!work.trim()) { setMsg({ kind: "error", text: `Paste ${paste} in the box above first. The review is saved with the ${thing} it reviews.` }); return; }
    if (match && hasReview(match) && match.review.raw !== text && !replace) { setConfirm(true); return; }
    setBusy(true); setConfirm(false);
    try {
      let target = match, n = match ? nums.get(match.id) : null;
      if (!target) {
        onBeforeSave?.();
        const r = await solutionActions.saveAttempt(id, { code: work, lang, ctx: revisionDue ? "revision" : "solve", force: true });
        target = r.attempt; n = (record?.attempts.length || 0) + 1;
      }
      await solutionActions.saveReview(id, target.id, text);
      setText("");
      setMsg({ kind: "ok", text: `AI review saved with attempt ${n}${match ? "" : ` (your ${thing} was saved as attempt ${n} too)`}.`, action: <> <button type="button" className="linkish" onClick={onShow}>Read it in My solutions</button></> });
    } catch (e) { setMsg({ kind: "error", text: e.message }); }
    setBusy(false);
  }

  return (
    <div className="review-paste">
      <h3>Save the AI&apos;s review</h3>
      <p className="muted small">When the AI replies, copy its whole answer (the copy button under the reply keeps the formatting) and paste it here. It&apos;s kept exactly as you paste it, with {match ? `attempt ${nums.get(match.id)}` : `the ${thing} above`}.</p>
      {match && hasReview(match) && !text && (
        <p className="small">Attempt {nums.get(match.id)} already has a review, saved on {fmtDate(match.review.at || match.review.u)}. <button type="button" className="linkish" onClick={onShow}>Read it</button></p>
      )}
      <label className="field">
        <span>The AI&apos;s reply</span>
        <textarea rows={8} className="code" value={text} onChange={e => { setText(e.target.value); setConfirm(false); }} placeholder="Paste the AI's full reply here" />
      </label>
      {confirm ? (
        <div className="confirm">
          <p className="small">Attempt {nums.get(match.id)} already has a review from {fmtDate(match.review.at || match.review.u)}. Replace it with this one?</p>
          <button type="button" className="btn primary" disabled={busy} onClick={() => save(true)}>Replace review</button>
          <button type="button" className="btn ghost" onClick={() => setConfirm(false)}>Keep the old one</button>
        </div>
      ) : <button type="button" className="btn primary" disabled={busy} onClick={() => save()}>{busy ? "Saving…" : "Save review"}</button>}
      <Msg msg={msg} />
    </div>
  );
}

// Shown instead of your old work while a revision is due, so you try from memory first.
export function RecallGate({ count, reviews = 0, hasNotes = false, onStart, onReveal, busy, msg }) {
  const hidden = [count ? `your ${plural(count, "saved attempt")}` : "your old code"];
  if (reviews) hidden.push(reviews === 1 && count === 1 ? "its AI review" : plural(reviews, "AI review"));
  if (hasNotes) hidden.push("your notes");
  const what = hidden.length > 1 ? `${hidden.slice(0, -1).join(", ")} and ${hidden[hidden.length - 1]}` : hidden[0];
  return (
    <div className="recall" role="note">
      <h3>Revision due: solve it from memory first</h3>
      <p className="small">Try it again from a blank page before looking at last time. {what[0].toUpperCase() + what.slice(1)} {hidden.length > 1 || count > 1 ? "stay" : "stays"} hidden until you save today&apos;s attempt.</p>
      <div className="row-btns">
        <button type="button" className="btn primary" onClick={onStart} disabled={busy}>Start revision attempt</button>
        <button type="button" className="btn ghost" onClick={onReveal}>Show my old work anyway</button>
      </div>
      {msg && <p className="small" role="status">{msg}</p>}
    </div>
  );
}

// Two attempts (or an attempt and an improved solution) side by side.
export function Compare({ record, value, onChange, onClose }) {
  const nums = numbering(record);
  const options = [];
  for (const a of record.attempts) {
    const n = nums.get(a.id);
    options.push({ key: a.id, label: `Attempt ${n}, ${fmtDate(a.at)}`, code: a.code, lang: a.lang });
    if (a.improved?.code?.trim()) options.push({ key: `${a.id}:improved`, label: `Improved, from attempt ${n}`, code: a.improved.code, lang: a.improved.lang });
  }
  const A = options.find(o => o.key === value.a) || options[Math.max(0, options.length - 2)];
  const B = options.find(o => o.key === value.b) || options[options.length - 1];
  const d = useMemo(() => diffLines(A.code, B.code), [A.code, B.code]);
  return (
    <section className="compare" aria-label="Compare attempts">
      <div className="compare-head">
        <h3>Compare</h3>
        <button type="button" className="btn ghost" onClick={onClose}>Close comparison</button>
      </div>
      <div className="compare-grid">
        {[["a", "Left", A, d?.a], ["b", "Right", B, d?.b]].map(([side, name, o, lines]) => (
          <div key={side} className="compare-col">
            <label className="lang">{name}
              <select value={o.key} onChange={e => onChange({ a: A.key, b: B.key, [side]: e.target.value })}>
                {options.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
              </select>
            </label>
            <CodeView code={o.code} lang={o.lang} label={o.lang || o.label} lines={lines} />
          </div>
        ))}
      </div>
      {d && <p className="muted small">Lines marked + aren&apos;t in the other side (indentation ignored).</p>}
    </section>
  );
}

function LangSelect({ value, onChange }) {
  return (
    <label className="lang">Language
      <select value={value || LANGS[0]} onChange={e => onChange(e.target.value)}>{LANGS.map(l => <option key={l}>{l}</option>)}</select>
    </label>
  );
}

function AttemptCard({ id, item, attempt, n, latest }) {
  const words = wordsFor(item);
  const langs = usesLang(id);
  const [edit, setEdit] = useState(null); // "code" | "review" | "improved"
  const [draft, setDraft] = useState("");
  const [draftLang, setDraftLang] = useState(attempt.lang);
  const [confirm, setConfirm] = useState(null); // "delete" | "review"
  const [raw, setRaw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const reviewed = hasReview(attempt);
  const improved = attempt.improved?.code?.trim() ? attempt.improved : null;
  const suggestion = edit === "improved" && reviewed ? lastCodeBlock(attempt.review.raw) : null;

  const open = (what, text, l) => { setEdit(what); setDraft(text); setDraftLang(l ?? attempt.lang); setMsg(null); setConfirm(null); };
  async function run(fn, ok) {
    setBusy(true); setMsg(null);
    try { await fn(); setEdit(null); setConfirm(null); if (ok) setMsg({ kind: "ok", text: ok }); }
    catch (e) { setMsg({ kind: "error", text: e.message }); }
    setBusy(false);
  }
  const editor = (label, rows, onSave, extra) => (
    <div className="attempt-edit">
      <label className="field"><span>{label}</span>
        <textarea rows={rows} className="code" spellCheck={false} value={draft} onChange={e => setDraft(e.target.value)} />
      </label>
      {extra}
      <div className="row-btns">
        <button type="button" className="btn primary" disabled={busy} onClick={onSave}>{busy ? "Saving…" : "Save changes"}</button>
        <button type="button" className="btn ghost" onClick={() => setEdit(null)}>Cancel</button>
      </div>
    </div>
  );

  return (
    <li className="attempt">
      <details open={latest}>
        <summary>
          <span className="attempt-title">Attempt {n}</span>
          {attempt.ctx === "revision" && <span className="tag">Revision</span>}
          {attempt.from === "work" && <span className="tag" title="Copied from the code box you used before saved attempts existed">From before</span>}
          {reviewed && <span className="tag tag-review">AI review</span>}
          <span className="muted small attempt-when">{fmtWhen(attempt.at)}{attempt.lang ? `, ${attempt.lang}` : ""}</span>
        </summary>

        <div className="attempt-body">
          {edit === "code" ? editor(`Your ${words.thing}`, 12, () => run(() => solutionActions.editAttempt(id, attempt.id, { code: draft, lang: langs ? draftLang : null }), "Changes saved."), (
            <>
              {langs && <LangSelect value={draftLang} onChange={setDraftLang} />}
              {reviewed && <p className="muted small">The AI review below was written for this {words.thing} as you first saved it. To keep both versions, save the new one from Check my solution instead.</p>}
            </>
          )) : (
            <>
              <CodeView code={attempt.code} lang={attempt.lang} label={`Your ${words.thing}${attempt.lang ? `, ${attempt.lang}` : ""}`} />
              {attempt.u > attempt.at + 1000 && <p className="muted small">Edited on {fmtDate(attempt.u)}.</p>}
            </>
          )}

          <div className="attempt-part">
            <h4>AI review</h4>
            {edit === "review" ? editor("The AI's reply, exactly as pasted", 10, () => run(() => solutionActions.saveReview(id, attempt.id, draft), "Review saved."))
              : reviewed ? (
                <>
                  <p className="muted small">Saved on {fmtDate(attempt.review.at || attempt.review.u)}{attempt.review.u > (attempt.review.at || 0) + 1000 ? `, changed on ${fmtDate(attempt.review.u)}` : ""}.</p>
                  {raw ? <pre className="raw-review">{attempt.review.raw}</pre> : <ReviewText raw={attempt.review.raw} />}
                  {confirm === "review" ? (
                    <div className="confirm">
                      <p className="small">Remove this review? This can&apos;t be undone.</p>
                      <button type="button" className="btn danger" disabled={busy} onClick={() => run(() => solutionActions.clearReview(id, attempt.id), "Review removed.")}>Remove review</button>
                      <button type="button" className="btn ghost" onClick={() => setConfirm(null)}>Keep it</button>
                    </div>
                  ) : (
                    <div className="row-btns small-btns">
                      <button type="button" className="btn ghost" onClick={() => setRaw(r => !r)} aria-pressed={raw}>{raw ? "Show it formatted" : "Show exactly what I pasted"}</button>
                      <button type="button" className="btn ghost" onClick={() => open("review", attempt.review.raw)}>Edit review</button>
                      <button type="button" className="btn ghost danger" onClick={() => setConfirm("review")}>Remove review</button>
                    </div>
                  )}
                </>
              ) : (
                <p className="muted small">No review saved for this attempt. <button type="button" className="linkish" onClick={() => open("review", "")}>Paste one</button></p>
              )}
          </div>

          <div className="attempt-part">
            <h4>{words.better}</h4>
            {edit === "improved" ? editor(words.better, 10, () => run(() => solutionActions.saveImproved(id, attempt.id, { code: draft, lang: langs ? draftLang : null }), `${words.better} saved.`), (
              <>
                {langs && <LangSelect value={draftLang} onChange={setDraftLang} />}
                {suggestion && <button type="button" className="btn" onClick={() => { setDraft(suggestion.text); }}>Use the last code block from the review</button>}
              </>
            )) : improved ? (
              <>
                <CodeView code={improved.code} lang={improved.lang} label={`${words.better}${improved.lang ? `, ${improved.lang}` : ""}`} />
                <div className="row-btns small-btns">
                  <button type="button" className="btn ghost" onClick={() => open("improved", improved.code, improved.lang)}>Edit</button>
                  <button type="button" className="btn ghost danger" disabled={busy} onClick={() => run(() => solutionActions.saveImproved(id, attempt.id, { code: "", lang: null }), "Removed.")}>Remove</button>
                </div>
              </>
            ) : (
              <p className="muted small">Keep the better {words.thing} from the review here, apart from your own. <button type="button" className="linkish" onClick={() => open("improved", "", attempt.lang)}>Add it</button></p>
            )}
          </div>

          {confirm === "delete" ? (
            <div className="confirm">
              <p className="small">Delete attempt {n}{reviewed ? " and its AI review" : ""}? This can&apos;t be undone, and it&apos;s deleted on your other devices after you push.</p>
              <button type="button" className="btn danger" disabled={busy} onClick={() => run(() => solutionActions.deleteAttempt(id, attempt.id))}>Delete attempt {n}</button>
              <button type="button" className="btn ghost" onClick={() => setConfirm(null)}>Keep it</button>
            </div>
          ) : edit !== "code" && (
            <div className="row-btns small-btns attempt-actions">
              <button type="button" className="btn ghost" onClick={() => open("code", attempt.code)}>Edit {words.thing}</button>
              <button type="button" className="btn ghost danger" onClick={() => setConfirm("delete")}>Delete attempt</button>
            </div>
          )}
          <Msg msg={msg} />
        </div>
      </details>
    </li>
  );
}

// Every attempt you saved and every time you solved or revised this question, oldest first.
function Timeline({ id, record, nums }) {
  const { log } = useStore();
  const events = useMemo(() => {
    const out = [];
    for (const [day, list] of Object.entries(log || {})) {
      for (const e of list || []) if (e?.id === id) out.push({ t: e.t || Date.parse(day), text: ACTION_LABEL[e.a] || e.a });
    }
    for (const a of record.attempts) out.push({ t: a.at, text: `Saved attempt ${nums.get(a.id)}${a.ctx === "revision" ? " (revision)" : ""}${hasReview(a) ? ", with an AI review" : ""}` });
    return out.sort((x, y) => x.t - y.t);
  }, [log, id, record, nums]);
  return (
    <section className="sol-timeline">
      <h3>Revision history</h3>
      <ol className="timeline">{events.map((e, i) => <li key={i}><time dateTime={new Date(e.t).toISOString()}>{fmtDate(e.t)}</time> {e.text}</li>)}</ol>
    </section>
  );
}

// The "My solutions" tab: everything saved for this question.
export function SolutionsTab({ id, item, record, loading, failed, notes, onEditNotes, onGoCheck, compare, setCompare, synced }) {
  const nums = useMemo(() => numbering(record), [record]);
  if (loading) return <p className="muted">Loading your saved solutions…</p>;
  if (failed) return <p className="error" role="alert">Your saved solutions for this question couldn&apos;t be read from this browser&apos;s storage. Reload the page to try again; nothing has been changed or deleted.</p>;
  const attempts = record?.attempts || [];
  const words = wordsFor(item);
  if (!attempts.length) return (
    <div className="sol-empty">
      <p>Nothing saved for this question yet.</p>
      <p className="muted small">Paste your {words.thing} in Check my solution and save it as an attempt. The AI review you paste back is kept with it, so you can come back to both when you revise.</p>
      <button type="button" className="btn" onClick={onGoCheck}>Go to Check my solution</button>
    </div>
  );
  const reviewed = attempts.filter(hasReview).length;
  const first = attempts[0], last = attempts[attempts.length - 1];
  return (
    <>
      <p className="sol-summary">
        {plural(attempts.length, "attempt")}{attempts.length > 1 ? `, from ${fmtDate(first.at)} to ${fmtDate(last.at)}` : `, saved ${fmtDate(first.at)}`}. {reviewed ? `${reviewed} with an AI review.` : "No AI review saved yet."}
      </p>
      {notes?.trim() && (
        <div className="sol-notes">
          <h3>Your notes</h3>
          <p>{notes}</p>
          <button type="button" className="linkish" onClick={onEditNotes}>Edit notes</button>
        </div>
      )}
      {attempts.length > 1 && (compare
        ? <Compare record={record} value={compare} onChange={setCompare} onClose={() => setCompare(null)} />
        : <button type="button" className="btn compare-open" onClick={() => setCompare({ a: attempts[attempts.length - 2].id, b: last.id })}>Compare attempts side by side</button>)}
      <ol className="attempts">
        {[...attempts].reverse().map(a => <AttemptCard key={a.id} id={id} item={item} attempt={a} n={nums.get(a.id)} latest={a.id === last.id} />)}
      </ol>
      <Timeline id={id} record={record} nums={nums} />
      {synced && <p className="muted small privacy-note">GitHub saving is on: when you push, these attempts and reviews go to <code>progress/solutions/</code> in your repo. If the repo is public, anyone can read them.</p>}
    </>
  );
}
