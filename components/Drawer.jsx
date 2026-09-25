"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useStore, actions, INTERVALS, today } from "@/lib/store";
import { useItem } from "@/lib/data";
import { hintPrompt, checkPrompt, topicPrompt, answerPrompt, checkAnswerPrompt } from "@/lib/prompts";
import { csStudyLinks } from "@/lib/cs";
import { isLive, TYPE_LABEL } from "@/lib/atcoder";
import { HOW_LABEL } from "@/lib/profile";
import { useSolution, solutionActions } from "@/lib/solutionStore";
import TopicCard from "./TopicCard";
import PromptBox from "./PromptBox";
import { useSyncStatus } from "./GitHubSync";
import { SaveAttempt, ReviewPaste, SolutionsTab, RecallGate, LANGS, ago, startOfToday, wordsFor } from "./Solutions";

const Ctx = createContext(() => {});
export const useOpenItem = () => useContext(Ctx);

export function DrawerProvider({ children }) {
  const [id, setId] = useState(null);
  return (
    <Ctx.Provider value={setId}>
      {children}
      {id && <Drawer key={id} id={id} onClose={() => setId(null)} />}
    </Ctx.Provider>
  );
}

const HINT_TITLES = ["Hint 1: a small nudge", "Hint 2: the key idea", "Hint 3: the full solution"];
const HINT_NOTES = [
  "Points you in the right direction. No algorithm, no code.",
  "Names the pattern and the key observation. Still no solution.",
  "Asks the AI for the complete solution with code. Use it only after a real try.",
];
const KIND_LABEL = { dsa: "Coding question", hld: "High-level design", lld: "Low-level design", cs: "CS fundamentals" };
const HELP_OPTIONS = ["hint", "editorial", "code"];

// Shown instead of every AI prompt while the problem's AtCoder contest is running.
function LiveNotice({ item }) {
  return (
    <div className="live-notice" role="note">
      <p><strong>This contest is running right now, so the AI prompts are switched off.</strong> AtCoder bans generative AI during live ABC, ARC and AGC contests, including asking for hints or explanations. Only translating the statement is allowed, with AtCoder&apos;s exact wording.</p>
      <p className="small">They come back after the contest ends: practising past problems with AI is allowed. <a href="https://info.atcoder.jp/entry/llm-rules-en" target="_blank" rel="noreferrer">AtCoder&apos;s rules</a>{item.contest && <> · <a href={`https://atcoder.jp/contests/${item.contest.id}`} target="_blank" rel="noreferrer">Contest page</a></>}</p>
    </div>
  );
}

// One line under the revision date: what's saved for this question.
function solutionLine(summary, solved) {
  if (!summary?.n) return solved ? "No solution saved yet." : "";
  const review = summary.lr ? "AI review saved." : summary.r ? "The latest attempt has no AI review yet." : "No AI review saved yet.";
  return `${summary.n} attempt${summary.n === 1 ? "" : "s"} saved, the latest ${ago(summary.last)}. ${review}`;
}

function Drawer({ id, onClose }) {
  const item = useItem(id);
  const { problems: prog, settings } = useStore();
  const me = prog[id] || {};
  const [tab, setTab] = useState(me.status ? "check" : "topic");
  const [confirm3, setConfirm3] = useState(false);
  const [work, setWork] = useState(me.work || "");
  const panelRef = useRef(null);
  const { record, loading: solLoading, failed: solFailed, summary } = useSolution(id);
  const sync = useSyncStatus();
  const [revealed, setRevealed] = useState(false); // "Show my old work anyway"
  const [revising, setRevising] = useState(false); // started today's revision attempt
  const [gateMsg, setGateMsg] = useState("");
  const [gateBusy, setGateBusy] = useState(false);
  const [compare, setCompare] = useState(null);    // { a, b } attempt keys shown side by side

  // The code box saves when you click away. It also saves if you close the panel (Escape, ✕) while
  // typing, and the browser warns before you leave the page with unsaved typing.
  const workRef = useRef(work), dirtyRef = useRef(false);
  const [dirty, setDirty] = useState(false);
  const editWork = v => { workRef.current = v; setWork(v); dirtyRef.current = true; if (!dirty) setDirty(true); };
  const flushWork = () => { if (dirtyRef.current) { actions.work(id, workRef.current); dirtyRef.current = false; setDirty(false); } };
  useEffect(() => () => { if (dirtyRef.current) actions.work(id, workRef.current); }, [id]);
  useEffect(() => {
    if (!dirty) return;
    const warn = e => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    const k = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    panelRef.current?.focus();
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  if (!item) return null;
  const used = me.hints || 0;
  const lang = settings.lang;
  const words = wordsFor(item);

  // Active recall: while a revision is due, your old code, attempts, review and notes stay hidden
  // until you save today's attempt (or choose to look anyway).
  const revisionDue = !!me.status && !!me.due && me.due <= today();
  const revisedToday = !!record?.attempts.some(a => a.ctx === "revision" && a.at >= startOfToday());
  const hideOld = revisionDue && ((summary?.n || 0) > 0 || !!(me.work || "").trim()) && !revisedToday && !revealed;
  const gateEditor = hideOld && !revising;
  async function startRevision() {
    setGateBusy(true); setGateMsg("");
    try {
      // Whatever is in the code box is kept as an attempt before the box is cleared.
      if (workRef.current.trim()) {
        const r = await solutionActions.saveAttempt(id, { code: workRef.current, lang, ctx: "solve" });
        if (r.status === "created") setGateMsg(`Your previous ${words.thing} was kept as attempt ${(record?.attempts.length || 0) + 1}.`);
      }
      workRef.current = ""; setWork(""); dirtyRef.current = false; setDirty(false);
      if (me.work) actions.work(id, "");
      setRevising(true); setTab("check");
    } catch (e) { setGateMsg(e.message); }
    setGateBusy(false);
  }
  const gate = <RecallGate count={summary?.n || 0} reviews={summary?.r || 0} hasNotes={!!me.notes?.trim()} onStart={startRevision} onReveal={() => setRevealed(true)} busy={gateBusy} msg={gateMsg} />;
  const showCompare = (a, b) => { setCompare({ a, b }); setTab("mine"); };
  const solProps = { id, item, record, work, lang, revisionDue, onBeforeSave: flushWork };

  const isCS = item.kind === "cs";
  const live = item.platform === "AtCoder" && isLive(item.contest);
  const mineLabel = `My solutions${summary?.n ? ` (${summary.n})` : ""}`;
  const TABS = isCS
    ? [["topic", "Learn the topic"], ["answer", "Answer and resources"], ["check", "Check my answer"], ["mine", mineLabel], ["notes", "Notes"]]
    : [["topic", "Learn the topic"], ["hints", `Hints${used ? ` (${used}/3 used)` : ""}`], ["check", "Check my solution"], ["mine", mineLabel], ["notes", "Notes"]];
  const workLabel = item.kind === "hld" ? "Your design notes" : `Your ${lang} code`;
  const workHint = item.kind === "hld"
    ? "Requirements, estimates, APIs, database, components, trade-offs. Rough notes are fine."
    : "Paste the code you submitted.";
  const revisingNote = hideOld && revising && <p className="recall-note small" role="status">{gateMsg && <>{gateMsg} </>}Revision attempt: write it from memory. Your earlier attempts unlock after you save this one.</p>;

  return (
    <div className="scrim" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <aside className={`drawer${compare && tab === "mine" ? " wide" : ""}`} role="dialog" aria-label={item.title} tabIndex={-1} ref={panelRef}>
        <header className="drawer-head">
          <div>
            <p className="kind">{isCS ? item.subjectName : KIND_LABEL[item.kind]}{item.pattern ? `, ${item.pattern.name} (path #${item.pattern.number})` : ""}{item.bridge ? `, AtCoder practice for step ${item.bridge.step}: ${item.bridge.name}` : ""}</p>
            <h2>{item.title}</h2>
            <p className="source">
              <span className={`diff diff-${item.level}`}>{item.levelLabel}</span>
              {item.url
                ? <span>Platform: <a href={item.url} target="_blank" rel="noreferrer">{item.platform}</a>{item.premium && <span className="badge-premium">Premium</span>}</span>
                : item.platform === "AtCoder" ? <span className="muted">Loading AtCoder details…</span>
                : <span>Source: a common interview question, from the Prepboard question bank</span>}
              {item.from && <span>Listed in: <a href={item.from.url} target="_blank" rel="noreferrer">{item.from.name}</a></span>}
            </p>
            {item.premium && item.freeStatement && (
              <p className="source-more small">No Premium? <a href={item.freeStatement} target="_blank" rel="noreferrer">Read the full statement free on GitHub (doocs/leetcode)</a>. Solutions are further down that page, so stop after the examples.</p>
            )}
            {item.platform === "AtCoder" && item.contest && (
              <p className="source-more muted small">
                From <a href={`https://atcoder.jp/contests/${item.contest.id}`} target="_blank" rel="noreferrer">{item.contest.title}</a>{TYPE_LABEL[item.contest.type] ? ` (${TYPE_LABEL[item.contest.type]}${item.contest.div ? `, ${item.contest.div}` : ""})` : ""}.
                {item.estimate != null ? ` The ≈${item.estimate} difficulty is AtCoder Problems' estimate, not an official AtCoder number${item.experimental ? "; the ? means the estimate is experimental" : ""}.` : item.byLetter ? " No difficulty estimate exists, so the level is a guess from the problem letter." : ""}
                {item.bridge?.why && <><br />Why it's in the path: {item.bridge.why}</>}
              </p>
            )}
            {item.more?.length > 0 && (
              <p className="source-more muted small">Also covered at: {item.more.map((m, i) => <span key={m.url}>{i > 0 && ", "}<a href={m.url} target="_blank" rel="noreferrer">{m.platform}{m.url.includes("system-design-primer") ? " (System Design Primer)" : ""}</a></span>)}</p>
            )}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className="drawer-actions">
          {item.url && <a className="btn primary" href={item.url} target="_blank" rel="noreferrer">Open on {item.platform}</a>}
          <button className={`btn ${me.status === "solved" ? "on-solved" : ""}`} onClick={() => { actions.solve(id); setTab("check"); }}>{isCS ? "I can answer this" : "Solved it"}</button>
          <button className={`btn ${me.status === "revisit" ? "on-revisit" : ""}`} onClick={() => { actions.tricky(id); setTab("check"); }}>{isCS ? "Needs more revision" : "Solved with help"}</button>
          {me.status && <button className="btn ghost" onClick={() => actions.clear(id)}>Mark unsolved</button>}
        </div>
        {me.status === "revisit" && !isCS && item.kind === "dsa" && (
          <label className="how">What helped?
            <select value={me.how || ""} onChange={e => actions.how(id, e.target.value)}>
              <option value="">Not specified</option>
              {HELP_OPTIONS.map(h => <option key={h} value={h}>{HOW_LABEL[h]}</option>)}
            </select>
            <span className="muted small">Your profile never counts these as solved on your own.</span>
          </label>
        )}
        <p className="muted small">
          {me.status ? (me.due ? (revisionDue ? `Revision due${me.due < today() ? ` since ${me.due}` : " today"}.` : `Next revision on ${me.due}.`) : "Mastered. No more revisions scheduled.") : `Not solved yet. After you solve it, it comes back for revision after ${INTERVALS.join(", ")} days.`}
          {solutionLine(summary, !!me.status) && <><br />{solutionLine(summary, !!me.status)}</>}
        </p>
        {revisionDue && (revisedToday || revealed) && (
          <div className="rev-grade" role="group" aria-label="How did this revision go?">
            <span>How did this revision go?</span>
            <button type="button" className="mini good" onClick={() => actions.remembered(id)}>I remembered it</button>
            <button type="button" className="mini bad" onClick={() => actions.forgot(id)}>I forgot it</button>
          </div>
        )}

        <div className="tabs" role="tablist">
          {TABS.map(([k, label]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{label}</button>)}
        </div>

        {tab === "topic" && (
          <section className="tabpanel">
            {item.topicNames.length > 0
              ? <>
                  <p className="muted small">Read these before you start. The first one is the main idea for this question.</p>
                  {item.topicNames.map((n, i) => <TopicCard key={n} name={n} open={i === 0} />)}
                </>
              : <p className="muted">This question has no topic tags in the data. Use the prompt below to get the topics explained.</p>}
            <h3>Want it explained another way?</h3>
            {live ? <LiveNotice item={item} /> : <>
              <p className="muted small">This prompt asks an AI to explain the topics simply, without solving the question.</p>
              <PromptBox prompt={topicPrompt(item, [...item.topicNames, ...item.unknownTags])} />
            </>}
          </section>
        )}

        {tab === "hints" && live && <section className="tabpanel"><LiveNotice item={item} /></section>}
        {tab === "hints" && !live && (
          <section className="tabpanel">
            <p className="muted small">Each hint is a prompt you paste into any AI chat. Take them in order, and try again after each one.</p>
            {[1, 2, 3].map(n => {
              const unlocked = n === 1 || used >= n - 1;
              const revealed = used >= n;
              return (
                <div key={n} className={`hint ${revealed ? "revealed" : ""} ${unlocked ? "" : "locked"}`}>
                  <h3>{HINT_TITLES[n - 1]}</h3>
                  <p className="muted small">{HINT_NOTES[n - 1]}</p>
                  {revealed ? <PromptBox prompt={hintPrompt(item, n, lang)} />
                    : !unlocked ? <p className="small">Use hint {n - 1} first and give it one more try.</p>
                    : n === 3 && !confirm3 ? <button className="btn" onClick={() => setConfirm3(true)}>Get the solution prompt</button>
                    : n === 3 ? (
                      <div className="confirm">
                        <p className="small">This one gives away the full answer. Tried everything from hint 2?</p>
                        <button className="btn primary" onClick={() => actions.hint(id, 3)}>Yes, show the solution prompt</button>
                        <button className="btn ghost" onClick={() => setConfirm3(false)}>I'll try again</button>
                      </div>
                    ) : <button className="btn" onClick={() => actions.hint(id, n)}>Get hint {n} prompt</button>}
                </div>
              );
            })}
            {item.kind !== "hld" && <label className="lang">Language for code in hint 3
              <select value={lang} onChange={e => actions.settings({ lang: e.target.value })}>{LANGS.map(l => <option key={l}>{l}</option>)}</select>
            </label>}
          </section>
        )}

        {tab === "answer" && isCS && (
          <section className="tabpanel">
            <h3>Get the answer</h3>
            <p className="muted small">Try answering out loud first. Then paste this prompt into any AI chat for a simple explanation plus the interview-ready answer.</p>
            <PromptBox prompt={answerPrompt(item)} />
            <h3>Study this topic</h3>
            <ul className="links">
              {csStudyLinks(item).map(l => <li key={l.url}><a href={l.url} target="_blank" rel="noreferrer">{l.name}</a></li>)}
            </ul>
            <p className="muted small">More resources for the whole subject are at the top of its CS subjects page.</p>
          </section>
        )}

        {tab === "check" && isCS && (
          <section className="tabpanel">
            {gateEditor ? gate : <>
              {revisingNote}
              <label className="field">
                <span>Your answer</span>
                <span className="muted small">Write it the way you'd say it in an interview. It's saved with this question.</span>
                <textarea rows={8} className="notes" value={work} onChange={e => editWork(e.target.value)} onBlur={flushWork} placeholder="Type your answer here" />
              </label>
              <SaveAttempt {...solProps} onCompare={showCompare} />
              <h3>Your feedback prompt</h3>
              <p className="muted small">It asks the AI to score your answer, point out what's missing, and give the model answer.</p>
              <PromptBox prompt={checkAnswerPrompt(item, work)} rows={10} />
              <ReviewPaste {...solProps} onShow={() => setTab("mine")} />
            </>}
          </section>
        )}

        {tab === "check" && !isCS && (
          <section className="tabpanel">
            {!me.status ? (
              <div className="finish">
                <p>Finished this question? Mark it done, paste your {item.kind === "hld" ? "design" : "code"}, and get a prompt that reviews it and shows every approach from brute force to the most optimised.</p>
                <button className="btn primary" onClick={() => actions.solve(id)}>I finished it</button>
              </div>
            ) : gateEditor ? gate : (
              <>
                {revisingNote}
                {item.kind !== "hld" && <label className="lang">Language
                  <select value={lang} onChange={e => actions.settings({ lang: e.target.value })}>{LANGS.map(l => <option key={l}>{l}</option>)}</select>
                </label>}
                <label className="field">
                  <span>{workLabel}</span>
                  <span className="muted small">{workHint} Save it as an attempt to keep this version, with its AI review, for revision.</span>
                  <textarea rows={item.kind === "hld" ? 8 : 12} className="code" spellCheck={false} value={work}
                    onChange={e => editWork(e.target.value)} onBlur={flushWork} placeholder={item.kind === "hld" ? "e.g. Requirements: …\nAPIs: POST /shorten …\nDB: …" : "Paste your solution here"} />
                </label>
                <SaveAttempt {...solProps} onCompare={showCompare} />
                <h3>Your review prompt</h3>
                {live ? <LiveNotice item={item} /> : <>
                  <p className="muted small">It asks the AI to check your {item.kind === "hld" ? "design" : "code"}, then list all approaches, from brute force to the best, using the {item.platform} editorial and other platforms.</p>
                  <PromptBox prompt={checkPrompt(item, lang, work)} rows={10} />
                  <ReviewPaste {...solProps} onShow={() => setTab("mine")} />
                </>}
              </>
            )}
          </section>
        )}

        {tab === "mine" && (
          <section className="tabpanel">
            {hideOld ? gate : (
              <SolutionsTab id={id} item={item} record={record} loading={solLoading} failed={solFailed} notes={me.notes} onEditNotes={() => setTab("notes")}
                onGoCheck={() => setTab("check")} compare={compare} setCompare={setCompare} synced={sync.connected} />
            )}
          </section>
        )}

        {tab === "notes" && (
          <section className="tabpanel">
            {hideOld && me.notes?.trim() ? gate : <>
              <textarea rows={8} className="notes" aria-label="Your notes" placeholder="Key insight, the pattern, the mistake you made, what to remember…" defaultValue={me.notes || ""} onBlur={e => actions.note(id, e.target.value)} />
              <p className="muted small">Saved when you click outside the box. They show at the top of My solutions too.</p>
            </>}
          </section>
        )}
      </aside>
    </div>
  );
}
