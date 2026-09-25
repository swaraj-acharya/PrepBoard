"use client";
import { useState } from "react";
import { HLD_GROUPS, LLD_GROUPS, TBE_QA } from "@/lib/systemDesign";
import { SD_PHASES, SD_INTERVIEW, SD_RESOURCES, SD_FRAMEWORKS, SD_TRADEOFFS, phaseLinks, roadmapNext, sdReadiness } from "@/lib/systemDesignPath";
import { useStore } from "@/lib/store";
import Rail from "@/components/Rail";
import ItemRow from "@/components/ItemRow";

const TABS = {
  path: { label: "Roadmap", intro: "Ten phases, from how one request travels to a full design interview. Each phase says why it matters, explains the ideas simply, and gives practice from the questions in the other tabs, so your progress is shared. The order follows The Boring Education's System Design Engineer Roadmap." },
  interview: { label: "Interview prep", intro: "For the weeks before interviews: how to structure your answer, the 30 questions interviewers repeat most (The Boring Education's list, mapped to questions here), the trade-offs to have ready, and where you stand." },
  hld: { label: "High-level design", groups: HLD_GROUPS, intro: "Design whole systems: servers, databases, caches, queues. Asked in SDE-2 and above, and more and more in fresher interviews at product companies." },
  lld: { label: "Low-level design", groups: LLD_GROUPS, intro: "Design classes and code for one app, using OOP and design patterns. Common in fresher and SDE-1 interviews (Flipkart, Swiggy, Amazon and others)." },
};
const WEEKS = SD_PHASES.reduce((a, p) => a + p.weeks, 0);
const ext = { target: "_blank", rel: "noreferrer" };
const listOf = xs => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

function Resources({ title, items }) {
  return (
    <section className="resources sd-resources">
      <h2>{title}</h2>
      <ul>
        {items.map(r => (
          <li key={r.id}>
            <span className="res-kind">{r.kind}</span>
            <div>
              <a href={r.url} {...ext}>{r.name}</a> <span className="muted small">{r.source}, {r.level.toLowerCase()}</span>
              <p className="small muted">{r.purpose} Use it {r.when}.</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Shown under a phase's questions: what interviewers ask about it, where to learn it, and what comes next.
function PhaseMore({ phase }) {
  const { asked, builds, unlocks } = phaseLinks(phase.id);
  return (
    <div className="phase-more">
      {asked.length > 0 && (
        <p className="small"><strong>Asked in interviews as:</strong> {asked.map(x => `${x.short} (Q${x.n})`).join(", ")}. Model answers: <a href={TBE_QA.url} {...ext}>{TBE_QA.name}</a>.</p>
      )}
      <h3>Resources for this phase</h3>
      <ul className="links">
        {phase.resources.map(r => (
          <li key={r.url + r.name}>
            <span className="res-kind">{r.kind}</span>
            <span><a href={r.url} {...ext}>{r.name}</a>{r.note && <span className="muted small"> {r.note}</span>}</span>
          </li>
        ))}
      </ul>
      <p className="muted small">
        {builds.length ? `Builds on ${listOf(builds.map(b => `phase ${b.n}`))}.` : "No phase before it: start here."}
        {unlocks.length > 0 && ` Opens up ${listOf(unlocks.map(u => `phase ${u.n}`))}.`}
      </p>
    </div>
  );
}

function Roadmap({ hideDone }) {
  const { problems: prog } = useStore();
  const all = SD_PHASES.flatMap(p => p.practice);
  const done = all.filter(id => prog[id]?.status).length;
  const next = roadmapNext(prog);
  return (
    <>
      <div className="sd-next">
        <div className="path-progress">
          <div className="goal-bar big"><span style={{ width: `${(done / all.length) * 100}%` }} /></div>
          <p className="muted small"><strong>{done}</strong> of {all.length} roadmap questions done.{next ? ` Next up: phase ${next.phase.n}, ${next.phase.name}.` : " Roadmap finished: switch to Interview prep for timed mocks."}</p>
        </div>
        {next && <ul className="plist"><ItemRow id={next.id} /></ul>}
      </div>

      <details className="before-start" open={done === 0}>
        <summary>How to use this roadmap</summary>
        <ol>
          <li><strong>Go in order.</strong> Each phase says which phases it builds on. At about an hour a day, phases 1–3 take around 7 weeks and the whole roadmap about {Math.round(WEEKS / 4.3)} months, in line with the 6–12 months The Boring Education suggests.</li>
          <li><strong>Learn, then practise.</strong> Open a phase, read its topics explained simply, then work through its questions. Concept questions have prompts to get and check your answer; design questions have three hints and a review prompt.</li>
          <li><strong>Draw before you write.</strong> Sketch every design by hand, boxes and arrows, and explain it out loud as if an interviewer were listening.</li>
          <li><strong>Revise.</strong> Everything you finish comes back on the Today page after 1, 3, 7, 21 and 45 days.</li>
          <li><strong>Move to Interview prep</strong> after phase 8, or a few weeks before your interviews.</li>
        </ol>
      </details>

      <Resources title="Study resources (free)" items={SD_RESOURCES} />

      <Rail key="path" hideDone={hideDone} numbered={false} groups={SD_PHASES.map(p => ({
        id: p.id, name: p.name, topics: p.topics, ids: p.practice, milestone: p.milestone,
        why: <>{p.why} <span className="muted">{p.stage} level, about {p.weeks} weeks.</span></>,
        extra: <PhaseMore phase={p} />,
      }))} />
    </>
  );
}

function Interview({ hideDone }) {
  const { problems: prog } = useStore();
  const [hot, setHot] = useState(false);
  const groups = SD_INTERVIEW.map(c => {
    const qs = c.questions.filter(x => !hot || x.hot);
    const ns = c.questions.map(x => x.n);
    return {
      id: c.id, name: c.name, topics: c.topics,
      ids: [...new Set(qs.flatMap(x => x.ids))],
      why: <>{c.why} <span className="muted">Questions {Math.min(...ns)}–{Math.max(...ns)} of the Top 30; each question links its model answer.</span></>,
    };
  }).filter(g => g.ids.length);
  return (
    <>
      <div className="sd-frameworks">
        {SD_FRAMEWORKS.map(f => (
          <section className="card" key={f.id}>
            <h2>{f.name} <span className="count">{f.length}</span></h2>
            <ol className="sd-steps">
              {f.steps.map(s => <li key={s.name}><strong>{s.name}</strong> <span className="muted small">{s.time}</span><p className="small">{s.say}</p></li>)}
            </ol>
            <p className="muted small">{f.note}</p>
          </section>
        ))}
      </div>

      <div className="sd-section-head">
        <h2>The questions interviewers repeat</h2>
        <label className="toggle"><input type="checkbox" checked={hot} onChange={e => setHot(e.target.checked)} /> Most asked only</label>
      </div>
      <p className="muted small sd-lead">Grouped the way <a href={TBE_QA.url} {...ext}>The Boring Education&apos;s Top 30</a> builds them up. Concept questions come with prompts to get and check your answer; design questions with hints and a review prompt.</p>
      <Rail key={`interview-${hot}`} hideDone={hideDone} numbered={false} groups={groups} />

      <section className="card sd-after">
        <h2>Trade-offs to have ready</h2>
        <p className="muted small">Interviewers care more about why you chose something than what you chose. Say both sides out loud.</p>
        <div className="table-wrap">
          <table className="ptable sd-tradeoffs">
            <thead><tr><th>Choice</th><th>Pick the first when</th><th>Pick the second when</th></tr></thead>
            <tbody>{SD_TRADEOFFS.map(t => <tr key={t.choice}><td>{t.choice}</td><td>{t.first}</td><td>{t.second}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2>Where you stand</h2>
        <div className="sd-bars">
          {sdReadiness(prog).map(r => (
            <div key={r.label}>
              <p><strong>{r.label}</strong> <span className="muted">{r.done} of {r.total}</span></p>
              <div className="goal-bar"><span style={{ width: `${r.total ? (r.done / r.total) * 100 : 0}%` }} /></div>
              <p className="muted small">{r.hint}</p>
            </div>
          ))}
        </div>
        <p className="muted small">Three separate kinds of evidence, not one score. Before real interviews, also do timed mocks: pick a design you haven&apos;t seen from the High-level design tab, give yourself 45 minutes, follow the steps above, then paste your notes into Check my solution for a review.</p>
      </section>

      <Resources title="Resources for the final weeks" items={SD_RESOURCES.filter(r => r.interview)} />
    </>
  );
}

export default function SystemDesign() {
  const [tab, setTab] = useState("path");
  const [hideDone, setHideDone] = useState(false);
  const t = TABS[tab];
  const count = t.groups ? t.groups.reduce((a, g) => a + g.items.length, 0) : 0;
  return (
    <div>
      <header className="page-head">
        <h1>System design</h1>
        <div className="seg" role="tablist">
          {Object.entries(TABS).map(([k, v]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{v.label}</button>)}
        </div>
        <p className="muted">{t.groups ? `${t.intro} ${count} questions. Each one shows the platform it comes from and the concepts it needs.` : t.intro}</p>
        <label className="toggle"><input type="checkbox" checked={hideDone} onChange={e => setHideDone(e.target.checked)} /> Hide solved</label>
      </header>
      {tab === "path" && <div className="sd-mode"><Roadmap hideDone={hideDone} /></div>}
      {tab === "interview" && <div className="sd-mode"><Interview hideDone={hideDone} /></div>}
      {t.groups && <Rail key={tab} hideDone={hideDone} numbered={false} groups={t.groups.map(g => ({ id: g.id, name: g.name, topics: g.topics, ids: g.items.map(i => i.id) }))} />}
    </div>
  );
}
