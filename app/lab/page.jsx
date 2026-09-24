"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useStore, actions, today } from "@/lib/store";
import { CHALLENGES, CATEGORIES, REASONING, STAGES, MODELS, ANTIPATTERNS, RESOURCES, PROJECTS, MISTAKES, DIMENSIONS, MODES } from "@/lib/lab";
import {
  normLab, pickToday, pickQuick, modelsDue, nextModelState, skillMap, breadthDepth, mistakePatterns, periodReview,
  journalEntries, principles, toMarkdown, planSplit, status, currentStage, CAT, BY_ID, JOURNAL_FIELDS, MODEL_BY_ID,
} from "@/lib/labEngine";

const TABS = [["today", "Today"], ["challenges", "Challenges"], ["progress", "Progress"], ["library", "Library"], ["journal", "Journal"]];
const pct = v => (v == null ? "—" : `${Math.round(v * 100)}%`);
const STATUS_LABEL = { new: "Not started", started: "In progress", submitted: "Revealed, not finished", done: "Done" };
const saveLab = fn => actions.lab(l => fn(normLab(l)));

function Row({ c, lab, extra }) {
  const st = status(lab.sessions[c.id]);
  return (
    <li className={`prow lab-row ${st === "done" ? "is-solved" : ""}`}>
      <span className={`dot ${st === "done" ? "dot-solved" : st !== "new" ? "dot-revisit" : ""}`} title={STATUS_LABEL[st]} aria-label={STATUS_LABEL[st]} />
      <Link className="ptitle" href={`/lab/${c.id}`}>{c.title}</Link>
      {extra}
      <span className="lab-meta">{CAT[c.category].name} · {REASONING[c.reasoning]} · {c.minutes} min</span>
    </li>
  );
}

function Today({ lab, state }) {
  const date = today();
  const plan = planSplit(lab.settings);
  const pick = useMemo(() => pickToday(lab, date), [lab, date]);
  const quick = pick.challenge && plan.eng - pick.challenge.minutes >= 15 ? pickQuick(lab, date, pick.challenge) : null;
  // One concept a day: spaced review works because it is spaced.
  const reviewedToday = MODELS.find(m => lab.models[m.id]?.day === date);
  const model = reviewedToday ? null : modelsDue(lab, date)[0];
  const stage = currentStage(lab);
  const S = STAGES[stage - 1];
  const doneAtStage = CHALLENGES.filter(c => c.stage === stage && status(lab.sessions[c.id]) === "done").length;
  const weekend = [0, 6].includes(new Date().getDay());
  const project = PROJECTS.filter(p => p.stage <= Math.max(3, stage + 1) && lab.projects[p.id]?.status !== "done")[0];
  const lastPrinciple = principles(lab)[0];
  const reviewModel = ok => saveLab(l => ({ ...l, models: { ...l.models, [model.id]: { ...nextModelState(l.models[model.id], ok, n => today(n)), day: date } } }));

  return (
    <>
      <section className="card">
        <div className="lab-plan-head">
          <h2>Today&apos;s training</h2>
          <span className="muted small">
            <label>Study time a day{" "}
              <select value={lab.settings.daily} onChange={e => saveLab(l => ({ ...l, settings: { ...l.settings, daily: +e.target.value } }))}>
                {[60, 120, 180, 240].map(m => <option key={m} value={m}>{m / 60} h{m === 240 ? "+" : ""}</option>)}
              </select>
            </label>{" "}
            <label>Mode{" "}
              <select value={lab.settings.mode} onChange={e => saveLab(l => ({ ...l, settings: { ...l.settings, mode: e.target.value } }))}>
                {Object.entries(MODES).map(([k, m]) => <option key={k} value={k}>{m.name} ({m.dsa}/{m.cp}/{m.eng})</option>)}
              </select>
            </label>
          </span>
        </div>
        <p className="muted small">Split: <Link href="/">DSA</Link> ~{plan.dsa} min · <Link href="/cp">CP</Link> ~{plan.cp} min · Engineering ~{plan.eng} min. Engineering never drops to zero: DSA alone doesn&apos;t make a strong engineer.</p>
        <ol className="lab-plan">
          {pick.challenge ? (
            <li>
              <span className="lab-step">Problem of the day · {pick.challenge.minutes} min</span>
              <Link href={`/lab/${pick.challenge.id}`} className="lab-plan-title">{pick.challenge.title}</Link>
              <span className="muted small">{CAT[pick.challenge.category].name} · {REASONING[pick.challenge.reasoning]}. {pick.reason}</span>
            </li>
          ) : <li><span className="lab-step">Problem of the day</span>{pick.reason}</li>}
          {model && (
            <li>
              <span className="lab-step">Concept · 5 min</span>
              <span className="lab-plan-title">{model.name}</span>
              <details className="lab-model">
                <summary>Explain it in your own words first, then open</summary>
                <p>{model.meaning}</p>
                <p className="small"><strong>Example.</strong> {model.example}</p>
              </details>
              <p className="small"><strong>Transfer:</strong> {model.transfer}</p>
              <span className="rev-btns">
                <button className="mini good" onClick={() => reviewModel(true)}>I could explain it</button>
                <button className="mini bad" onClick={() => reviewModel(false)}>Fuzzy</button>
              </span>
            </li>
          )}
          {reviewedToday && (
            <li>
              <span className="lab-step">Concept · done</span>
              <span>{reviewedToday.name} reviewed. The next one comes tomorrow; it sticks better that way.</span>
            </li>
          )}
          {quick && (
            <li>
              <span className="lab-step">Quick exercise · {quick.minutes} min</span>
              <Link href={`/lab/${quick.id}`} className="lab-plan-title">{quick.title}</Link>
              <span className="muted small">{CAT[quick.category].name}</span>
            </li>
          )}
          {weekend && project && (
            <li>
              <span className="lab-step">Deep work · 60–120 min</span>
              <span className="lab-plan-title">{project.name}</span>
              <span className="muted small">{project.principle} <a href="#library" onClick={() => window.dispatchEvent(new HashChangeEvent("hashchange"))}>See projects</a></span>
            </li>
          )}
          <li>
            <span className="lab-step">Reflection · 5 min</span>
            <span>After the challenge, write the 30-second explanation and the principle it taught you.</span>
            {lastPrinciple && <span className="muted small">Your latest principle: “{lastPrinciple.text}”</span>}
          </li>
        </ol>
      </section>
      <section className="card">
        <h2>Roadmap: stage {stage} of 8, {S.name}</h2>
        <p className="small">{S.skills}</p>
        {stage < 8 && <p className="muted small">Complete {Math.max(0, 2 - doneAtStage)} more stage-{stage} challenge{2 - doneAtStage === 1 ? "" : "s"} to open stage {stage + 1}. Everything stays open in Challenges; the daily pick just stays near your level.</p>}
        <ol className="lab-stages">{STAGES.map(s => <li key={s.n} className={s.n < stage ? "past" : s.n === stage ? "now" : ""} title={s.skills}>{s.n}. {s.name}</li>)}</ol>
      </section>
    </>
  );
}

function Challenges({ lab }) {
  const [cat, setCat] = useState(""), [rsn, setRsn] = useState(""), [st, setSt] = useState("");
  const list = CHALLENGES.filter(c => (!cat || c.category === cat) && (!rsn || c.reasoning === rsn) && (!st || status(lab.sessions[c.id]) === st))
    .sort((a, b) => a.stage - b.stage || a.title.localeCompare(b.title));
  return (
    <>
      <div className="filters">
        <select value={cat} onChange={e => setCat(e.target.value)} aria-label="Category"><option value="">Every category</option>{CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <select value={rsn} onChange={e => setRsn(e.target.value)} aria-label="Reasoning difficulty"><option value="">Any reasoning difficulty</option>{Object.entries(REASONING).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <select value={st} onChange={e => setSt(e.target.value)} aria-label="Status"><option value="">Any status</option>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
      </div>
      <p className="muted small">{list.length} challenges. Reasoning difficulty is how unfamiliar or ambiguous the problem is, separate from technical difficulty.</p>
      <ul className="plist">{list.map(c => <Row key={c.id} c={c} lab={lab} extra={<span className="count">stage {c.stage}</span>} />)}</ul>
    </>
  );
}

function Progress({ lab, state }) {
  const [days, setDays] = useState(7);
  const solved = Object.entries(state.problems).filter(([k, v]) => v.status && !/^(hld|lld|cs):/.test(k));
  const map = skillMap(lab, { dsaSolved: solved.filter(([k]) => !/^(cf|cc|ac):/.test(k)).length, cpSolved: solved.filter(([k]) => /^(cf|cc|ac):/.test(k)).length });
  const bd = breadthDepth(map);
  const pats = mistakePatterns(lab);
  const r = periodReview(lab, Date.now(), days);
  const trend = (a, b, f = x => x) => (b == null || a == null ? "" : a > b ? ` (up from ${f(b)})` : a < b ? ` (down from ${f(b)})` : " (same)");
  return (
    <>
      <section className="card">
        <h2>Engineering breadth map</h2>
        <p className="muted small">Levels are earned by evidence: 1 challenge is exposure; practised needs 3; applied needs real application (an incident, case study, project or real-world journal entry); strong needs 6, two applied, and high self-review and key-point coverage. A few exercises never mean mastery.</p>
        <div className="skill-grid">
          {map.map(d => (
            <div key={d.id} className="skill" title={`${d.done} done, ${d.applied} applied`}>
              <span>{d.name}</span>
              <span className="skill-bar" aria-hidden="true">{[1, 2, 3, 4].map(n => <i key={n} className={d.level >= n ? "on" : ""} />)}</span>
              <span className="muted small">{d.label}</span>
            </div>
          ))}
        </div>
        <p className="small"><strong>Breadth</strong> {bd.breadth} of {bd.total} areas practised · <strong>Depth</strong> {bd.depth} applied or strong. You need both: many mental models, and a few areas you know deeply from real work.</p>
      </section>
      <section className="card">
        <h2>My recurring failure patterns <span className="muted small">last 30 days</span></h2>
        {pats.length === 0 ? <p className="muted small">Nothing yet. After each challenge, tag the reasoning mistakes you made; patterns appear here.</p> : (
          <ul className="pattern-list">{pats.map(p => <li key={p.id}><strong>{p.name}</strong> ×{p.count}<span className="muted small"> Study: <a href="#library" onClick={() => setTimeout(() => document.getElementById(`m-${p.model}`)?.setAttribute("open", ""), 50)}>{p.study.name}</a>, then do its exercise.</span></li>)}</ul>
        )}
      </section>
      <section className="card">
        <div className="lab-plan-head">
          <h2>{days === 7 ? "Weekly" : "Monthly"} review</h2>
          <div className="seg"><button className={days === 7 ? "on" : ""} onClick={() => setDays(7)}>Week</button><button className={days === 30 ? "on" : ""} onClick={() => setDays(30)}>Month</button></div>
        </div>
        <ul className="signal-list">
          <li><span>Challenges completed</span><strong>{r.done}{trend(r.done, r.prevDone)}</strong></li>
          <li><span>Average self-review (process)</span><strong>{pct(r.process)}{trend(r.process, r.prevProcess, pct)}</strong></li>
          <li><span>Key points covered</span><strong>{pct(r.coverage)}</strong></li>
          <li><span>Hypotheses per challenge</span><strong>{r.hypotheses == null ? "—" : r.hypotheses.toFixed(1)}</strong></li>
          <li><span>Bugs debugged</span><strong>{r.debugged}</strong></li>
          <li><span>Systems investigated or designed</span><strong>{r.systems}</strong></li>
          <li><span>Investigations where my answer didn&apos;t match</span><strong>{r.failed}</strong></li>
          <li><span>Deep work (30+ min challenges)</span><strong>{r.deep}</strong></li>
          <li><span>Strongest area</span><strong>{r.strongest ? `${r.strongest.name} (${pct(r.strongest.score)})` : "—"}</strong></li>
          <li><span>Weakest area</span><strong>{r.weakest ? `${r.weakest.name} (${pct(r.weakest.score)})` : "—"}</strong></li>
          <li><span>Repeated mistakes</span><strong>{r.mistakes.length ? r.mistakes.map(m => `${m.name} ×${m.count}`).join(", ") : "—"}</strong></li>
        </ul>
        <p className="lab-priority"><strong>Next {days === 7 ? "week" : "month"}&apos;s priority.</strong> {r.priority}</p>
        <p className="muted small">Trends compare with the {days} days before. These numbers are for diagnosis, not for showing off: they come from your own self-reviews.</p>
      </section>
    </>
  );
}

function Library({ lab }) {
  const stage = currentStage(lab);
  const [all, setAll] = useState(false);
  const maxLevel = all ? 5 : Math.min(5, Math.ceil(stage / 2) + 1);
  const setProject = (id, patch) => saveLab(l => ({ ...l, projects: { ...l.projects, [id]: { ...(l.projects[id] || {}), ...patch, u: Date.now() } } }));
  return (
    <>
      <section className="card">
        <h2>Mental models</h2>
        <p className="muted small">Reusable ideas that transfer across domains. One comes up for review each day on a spaced schedule; each links to a challenge where you use it.</p>
        {MODELS.map(m => (
          <details key={m.id} id={`m-${m.id}`} className="topic">
            <summary>{m.name}{lab.models[m.id] ? <span className="muted small"> · reviewed</span> : ""}</summary>
            <div className="topic-body">
              <p>{m.meaning}</p>
              <p><strong>Example.</strong> {m.example}</p>
              <p><strong>Practise it:</strong> <Link href={`/lab/${m.exercise}`}>{BY_ID.get(m.exercise).title}</Link></p>
              <p><strong>Where else?</strong> {m.transfer}</p>
            </div>
          </details>
        ))}
      </section>
      <section className="card">
        <h2>Anti-patterns</h2>
        {ANTIPATTERNS.map(a => (
          <details key={a.id} className="topic">
            <summary>{a.name}</summary>
            <dl className="ap">
              <dt>Symptom</dt><dd>{a.symptom}</dd><dt>Cause</dt><dd>{a.cause}</dd><dt>Detect</dt><dd>{a.detect}</dd>
              <dt>Fix</dt><dd>{a.fix}</dd><dt>Prevent</dt><dd>{a.prevent}</dd>
              <dt>Practise</dt><dd><Link href={`/lab/${a.challenge}`}>{BY_ID.get(a.challenge).title}</Link></dd>
            </dl>
          </details>
        ))}
      </section>
      <section className="card">
        <div className="lab-plan-head">
          <h2>Resources</h2>
          <label className="toggle"><input type="checkbox" checked={all} onChange={e => setAll(e.target.checked)} /> Show every level</label>
        </div>
        <p className="muted small">Few and strong, each tied to practice. Showing levels 1–{maxLevel} for roadmap stage {stage}. Passive = read or watch; active = exercises; applied = build, debug or attack a lab.</p>
        {[1, 2, 3, 4, 5].filter(l => l <= maxLevel).map(level => (
          <div key={level}>
            <h3>Level {level}</h3>
            <ul className="res-list">
              {RESOURCES.filter(r => r.level === level).map(r => (
                <li key={r.id}>
                  <a href={r.url} target="_blank" rel="noreferrer">{r.name}</a> <span className="count">{r.kind}</span>
                  <p className="small">{r.learn}</p>
                  <p className="small muted"><strong>Practice:</strong> {r.practice}{r.challenges?.length ? <> Then: {r.challenges.map((id, i) => <span key={id}>{i > 0 && ", "}<Link href={`/lab/${id}`}>{BY_ID.get(id).title}</Link></span>)}.</> : ""}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
      <section className="card">
        <h2>Build to understand</h2>
        <p className="muted small">Projects chosen for the principle they expose, not the count. One a month is plenty; depth beats quantity. Link your repository as evidence.</p>
        <ul className="res-list">
          {PROJECTS.map(p => {
            const me = lab.projects[p.id] || {};
            return (
              <li key={p.id} className={p.stage > stage + 2 ? "later" : ""}>
                <strong>{p.name}</strong> <span className="count">stage {p.stage}</span>
                <p className="small">{p.brief} <em>{p.principle}</em></p>
                <p className="small muted">Evidence to produce: {p.evidence}{p.resource ? <> Guide: <a href={RESOURCES.find(r => r.id === p.resource).url} target="_blank" rel="noreferrer">{RESOURCES.find(r => r.id === p.resource).name}</a></> : ""}</p>
                <span className="proj-controls">
                  <select value={me.status || ""} onChange={e => setProject(p.id, { status: e.target.value })} aria-label={`${p.name} status`}>
                    <option value="">Not started</option><option value="doing">In progress</option><option value="done">Done</option>
                  </select>
                  <input className="search" placeholder="Repository or write-up URL" defaultValue={me.url || ""} onBlur={e => setProject(p.id, { url: e.target.value.trim() })} />
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}

function Journal({ lab }) {
  const entries = journalEntries(lab);
  const notebook = principles(lab);
  const [draft, setDraft] = useState(null);
  const [copied, setCopied] = useState("");
  const blank = () => ({ title: "", tags: [], mistakes: [], fields: {} });
  function save() {
    const id = `j${Date.now()}`;
    saveLab(l => ({ ...l, journal: { ...l.journal, [id]: { ...draft, at: Date.now(), u: Date.now() } } }));
    setDraft(null);
  }
  const toggle = (key, v) => setDraft(d => ({ ...d, [key]: d[key].includes(v) ? d[key].filter(x => x !== v) : [...d[key], v] }));
  async function copy(e) { await navigator.clipboard.writeText(toMarkdown(e)).catch(() => {}); setCopied(e.id); }
  return (
    <>
      <section className="card">
        <h2>Engineering principle notebook</h2>
        {notebook.length === 0 ? <p className="muted small">Each finished challenge ends with a principle in your own words. They collect here.</p> : (
          <ul className="principles">{notebook.map((p, i) => <li key={i}>“{p.text}” <span className="muted small">from {p.from}</span></li>)}</ul>
        )}
      </section>
      <section className="card">
        <div className="lab-plan-head">
          <h2>Problem-solving journal</h2>
          {!draft && <button className="btn" onClick={() => setDraft(blank())}>Add a real-world problem</button>}
        </div>
        <p className="muted small">Finished challenges are added automatically. Add problems from real work, projects or open source too: they count as applied evidence. “Copy as Markdown” gives you a write-up for GitHub or a blog.</p>
        {draft && (
          <div className="journal-form">
            <input className="search" placeholder="Title, e.g. “Flaky test in CI: root cause”" value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} />
            <p className="small">Areas: {DIMENSIONS.map(d => <button key={d.id} className={`chip ${draft.tags.includes(d.id) ? "chip-on" : ""}`} onClick={() => toggle("tags", d.id)}>{d.name}</button>)}</p>
            {JOURNAL_FIELDS.map(([k, label]) => (
              <label key={k} className="field"><span>{label}</span><textarea rows={2} className="notes" value={draft.fields[k] || ""} onChange={e => setDraft(d => ({ ...d, fields: { ...d.fields, [k]: e.target.value } }))} /></label>
            ))}
            <p className="small">Mistakes I made: {MISTAKES.map(m => <button key={m.id} className={`chip ${draft.mistakes.includes(m.id) ? "chip-on" : ""}`} onClick={() => toggle("mistakes", m.id)}>{m.name}</button>)}</p>
            <div className="row-btns"><button className="btn primary" disabled={!draft.title.trim()} onClick={save}>Save entry</button><button className="btn ghost" onClick={() => setDraft(null)}>Cancel</button></div>
          </div>
        )}
        {entries.length === 0 ? <p className="muted small">No entries yet.</p> : (
          <ul className="journal-list">
            {entries.map(e => (
              <li key={e.id}>
                <details>
                  <summary><strong>{e.title}</strong> <span className="muted small">{e.at ? new Date(e.at).toLocaleDateString("en-IN") : ""} · {e.kind === "challenge" ? "challenge" : "real-world"}</span></summary>
                  {JOURNAL_FIELDS.filter(([k]) => e.fields?.[k]?.trim()).map(([k, label]) => <p key={k} className="small"><strong>{label}.</strong> {e.fields[k]}</p>)}
                  <div className="row-btns">
                    <button className="btn" onClick={() => copy(e)}>{copied === e.id ? "Copied" : "Copy as Markdown"}</button>
                    {e.kind === "challenge" && <Link className="btn ghost" href={`/lab/${e.challengeId}`}>Open challenge</Link>}
                    {e.kind === "entry" && <button className="btn ghost danger" onClick={() => saveLab(l => ({ ...l, journal: { ...l.journal, [e.id]: { ...l.journal[e.id], deleted: true, u: Date.now() } } }))}>Delete</button>}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export default function Lab() {
  const state = useStore();
  const lab = normLab(state.lab);
  const [tab, setTab] = useState("today");
  useEffect(() => {
    const read = () => { const h = window.location.hash.slice(1); if (TABS.some(t => t[0] === h)) setTab(h); };
    read(); window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  const go = k => { setTab(k); history.replaceState(null, "", `#${k}`); };
  const doneCount = CHALLENGES.filter(c => status(lab.sessions[c.id]) === "done").length;
  return (
    <div className="lab">
      <header className="page-head">
        <h1>Problem Solving Lab</h1>
        <p className="muted">An engineering reasoning gym, separate from DSA: debugging, investigation, estimation, trade-offs, design, security and communication. Each challenge trains the loop: understand, list what you don&apos;t know, form hypotheses, test them, decide, verify, explain.</p>
        <p className="small muted">{doneCount} of {CHALLENGES.length} challenges done · thinking time before hints · AI helps Socratically by default.</p>
      </header>
      <div className="seg lab-tabs" role="tablist">
        {TABS.map(([k, label]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => go(k)}>{label}</button>)}
      </div>
      {tab === "today" && <Today lab={lab} state={state} />}
      {tab === "challenges" && <Challenges lab={lab} />}
      {tab === "progress" && <Progress lab={lab} state={state} />}
      {tab === "library" && <Library lab={lab} />}
      {tab === "journal" && <Journal lab={lab} />}
    </div>
  );
}
