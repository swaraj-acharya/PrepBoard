"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useStore, actions, INTERVALS } from "@/lib/store";
import { useItem } from "@/lib/data";
import { hintPrompt, checkPrompt, topicPrompt, answerPrompt, checkAnswerPrompt } from "@/lib/prompts";
import { csStudyLinks } from "@/lib/cs";
import { isLive, TYPE_LABEL } from "@/lib/atcoder";
import { HOW_LABEL } from "@/lib/profile";
import TopicCard from "./TopicCard";
import PromptBox from "./PromptBox";

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

const LANGS = ["C++", "Java", "Python", "JavaScript"];
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

function Drawer({ id, onClose }) {
  const item = useItem(id);
  const { problems: prog, settings } = useStore();
  const me = prog[id] || {};
  const [tab, setTab] = useState(me.status ? "check" : "topic");
  const [confirm3, setConfirm3] = useState(false);
  const [work, setWork] = useState(me.work || "");
  const panelRef = useRef(null);

  useEffect(() => {
    const k = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    panelRef.current?.focus();
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  if (!item) return null;
  const used = me.hints || 0;
  const lang = settings.lang;
  const workLabel = item.kind === "hld" ? "Your design notes" : `Your ${lang} code`;
  const workHint = item.kind === "hld"
    ? "Requirements, estimates, APIs, database, components, trade-offs. Rough notes are fine."
    : "Paste the code you submitted.";

  const isCS = item.kind === "cs";
  const live = item.platform === "AtCoder" && isLive(item.contest);
  const TABS = isCS
    ? [["topic", "Learn the topic"], ["answer", "Answer and resources"], ["check", "Check my answer"], ["notes", "Notes"]]
    : [["topic", "Learn the topic"], ["hints", `Hints${used ? ` (${used}/3 used)` : ""}`], ["check", "Check my solution"], ["notes", "Notes"]];

  return (
    <div className="scrim" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <aside className="drawer" role="dialog" aria-label={item.title} tabIndex={-1} ref={panelRef}>
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
          {me.status ? (me.due ? `Next revision on ${me.due}.` : "Mastered. No more revisions scheduled.") : `Not solved yet. After you solve it, it comes back for revision after ${INTERVALS.join(", ")} days.`}
        </p>

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
            <label className="field">
              <span>Your answer</span>
              <span className="muted small">Write it the way you'd say it in an interview. It's saved with this question.</span>
              <textarea rows={8} className="notes" value={work} onChange={e => setWork(e.target.value)} onBlur={() => actions.work(id, work)} placeholder="Type your answer here" />
            </label>
            <h3>Your feedback prompt</h3>
            <p className="muted small">It asks the AI to score your answer, point out what's missing, and give the model answer.</p>
            <PromptBox prompt={checkAnswerPrompt(item, work)} rows={10} />
          </section>
        )}

        {tab === "check" && !isCS && (
          <section className="tabpanel">
            {!me.status ? (
              <div className="finish">
                <p>Finished this question? Mark it done, paste your {item.kind === "hld" ? "design" : "code"}, and get a prompt that reviews it and shows every approach from brute force to the most optimised.</p>
                <button className="btn primary" onClick={() => actions.solve(id)}>I finished it</button>
              </div>
            ) : (
              <>
                {item.kind !== "hld" && <label className="lang">Language
                  <select value={lang} onChange={e => actions.settings({ lang: e.target.value })}>{LANGS.map(l => <option key={l}>{l}</option>)}</select>
                </label>}
                <label className="field">
                  <span>{workLabel}</span>
                  <span className="muted small">{workHint} It's saved with this question.</span>
                  <textarea rows={item.kind === "hld" ? 8 : 12} className="code" spellCheck={false} value={work}
                    onChange={e => setWork(e.target.value)} onBlur={() => actions.work(id, work)} placeholder={item.kind === "hld" ? "e.g. Requirements: …\nAPIs: POST /shorten …\nDB: …" : "Paste your solution here"} />
                </label>
                <h3>Your review prompt</h3>
                {live ? <LiveNotice item={item} /> : <>
                  <p className="muted small">It asks the AI to check your {item.kind === "hld" ? "design" : "code"}, then list all approaches, from brute force to the best, using the {item.platform} editorial and other platforms.</p>
                  <PromptBox prompt={checkPrompt(item, lang, work)} rows={10} />
                </>}
              </>
            )}
          </section>
        )}

        {tab === "notes" && (
          <section className="tabpanel">
            <textarea rows={8} className="notes" placeholder="Key idea, edge cases, the mistake you made…" defaultValue={me.notes || ""} onBlur={e => actions.note(id, e.target.value)} />
            <p className="muted small">Saved when you click outside the box.</p>
          </section>
        )}
      </aside>
    </div>
  );
}
