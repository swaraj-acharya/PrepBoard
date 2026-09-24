"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useStore, actions, today, streak } from "@/lib/store";
import { useData, useItem, getCompany } from "@/lib/data";
import { HLD_GROUPS, LLD_GROUPS } from "@/lib/systemDesign";
import { useOpenItem } from "@/components/Drawer";
import ItemRow from "@/components/ItemRow";
import Heatmap from "@/components/Heatmap";
import GoalCard from "@/components/GoalCard";
import { normLab, pickToday, planSplit, CAT, status } from "@/lib/labEngine";

function Hero({ id, total, number }) {
  const item = useItem(id);
  const open = useOpenItem();
  return (
    <>
      <p className="hero-kicker">Next up: step {item.pattern?.step}, {item.pattern?.name}</p>
      <h1 className="hero-title"><button onClick={() => open(id)}>{item.name}</button></h1>
      <div className="hero-meta">
        <span className={`diff diff-${item.level}`}>{item.levelLabel}</span>
        <span className="muted">Problem {number} of {total}, on {item.platform}</span>
      </div>
      <div className="hero-actions">
        <a className="btn primary" href={item.url} target="_blank" rel="noreferrer">Open on {item.platform}</a>
        <button className="btn" onClick={() => open(id)}>Topic and hints</button>
        <button className="btn" onClick={() => actions.solve(id)}>Solved it</button>
      </div>
    </>
  );
}

export default function Today() {
  const { problems, seq, ready } = useData();
  const { problems: prog, activity, settings } = useStore();

  const ordered = useMemo(() => (seq || []).flatMap(g => g.problems), [seq]);
  const upcoming = ordered.filter(s => !prog[s]?.status);
  const due = Object.entries(prog).filter(([, v]) => v.status && v.due && v.due <= today()).sort((a, b) => a[1].due.localeCompare(b[1].due));
  const nextHld = HLD_GROUPS.flatMap(g => g.items).find(i => !prog[i.id]?.status);
  const nextLld = LLD_GROUPS.flatMap(g => g.items).find(i => !prog[i.id]?.status);

  const [companyPicks, setCompanyPicks] = useState([]);
  useEffect(() => {
    if (!settings.targets.length) { setCompanyPicks([]); return; }
    Promise.all(settings.targets.map(t => getCompany(t).catch(() => null))).then(rs => {
      const score = {};
      for (const d of rs.filter(Boolean)) for (const [s, f] of (d.d30.length ? d.d30 : d.m3)) score[s] = (score[s] || 0) + f;
      setCompanyPicks(Object.entries(score).sort((a, b) => b[1] - a[1]).map(([s]) => s));
    });
  }, [settings.targets]);
  const picks = companyPicks.filter(s => !prog[s]?.status).slice(0, 5);

  const doneToday = activity[today()] || 0;
  const byDiff = { E: 0, M: 0, H: 0 };
  let sdDone = 0, otherDone = 0;
  for (const [s, v] of Object.entries(prog)) {
    if (!v.status) continue;
    if (s.startsWith("hld:") || s.startsWith("lld:") || s.startsWith("cs:")) sdDone++;
    else if (s.startsWith("cf:") || s.startsWith("cc:") || s.startsWith("ac:")) otherDone++;
    else if (problems?.[s]) byDiff[problems[s].d]++;
  }
  const pathDone = ordered.length - upcoming.length;

  if (!ready) return <p className="muted">Loading your board…</p>;

  return (
    <div className="today">
      <section className="hero">
        {upcoming[0] ? <Hero id={upcoming[0]} total={ordered.length} number={pathDone + 1} />
          : <h1 className="hero-title">You finished the whole DSA path. Switch to company questions.</h1>}
      </section>

      <div className="today-grid">
        <div className="col">
          <section className="panel">
            <h2>Revisions due <span className="count">{due.length}</span></h2>
            {due.length === 0 ? <p className="muted">Nothing to revise today. Solved questions come back here after 1, 3, 7, 21 and 45 days.</p> : (
              <ul className="plist">
                {due.slice(0, 12).map(([s]) => (
                  <ItemRow key={s} id={s} extra={
                    <span className="rev-btns">
                      <button className="mini good" onClick={() => actions.remembered(s)}>Remembered</button>
                      <button className="mini bad" onClick={() => actions.forgot(s)}>Forgot</button>
                    </span>} />
                ))}
              </ul>
            )}
          </section>

          <section className="panel">
            <h2>After that</h2>
            <ul className="plist">{upcoming.slice(1, 6).map((s, i) => <ItemRow key={s} id={s} index={pathDone + i + 2} />)}</ul>
            <Link href="/path" className="more">See the full DSA path</Link>
          </section>

          <section className="panel">
            <h2>System design, next up</h2>
            <ul className="plist">
              {nextHld && <ItemRow id={nextHld.id} />}
              {nextLld && <ItemRow id={nextLld.id} />}
            </ul>
            <Link href="/system-design" className="more">See all system design questions</Link>
          </section>

          <section className="panel">
            <h2>Asked recently at your target companies</h2>
            {settings.targets.length === 0
              ? <p className="muted">Star target companies on the <Link href="/companies">Companies</Link> page and their most frequent recent questions show up here.</p>
              : picks.length === 0 ? <p className="muted">You've solved every recent question from your targets.</p>
              : <ul className="plist">{picks.map(s => <ItemRow key={s} id={s} />)}</ul>}
          </section>
        </div>

        <aside className="col side">
          <LabPanel />
          <GoalCard />
          <section className="panel">
            <h2>Today</h2>
            <div className="goal">
              <div className="goal-bar"><span style={{ width: `${Math.min(100, (doneToday / settings.goal) * 100)}%` }} /></div>
              <p><strong>{doneToday}</strong> of {settings.goal} done today</p>
            </div>
            <p className="muted small">{streak(activity)} day streak. <Link href="/history">See what you did each day</Link></p>
          </section>
          <section className="panel">
            <h2>Solved on LeetCode</h2>
            <div className="diffsplit">
              <span><b className="diff-E">{byDiff.E}</b> Easy</span>
              <span><b className="diff-M">{byDiff.M}</b> Medium</span>
              <span><b className="diff-H">{byDiff.H}</b> Hard</span>
              <span><b>{sdDone}</b> Design, CS</span>
            </div>
            {otherDone > 0 && <p className="muted small">Plus {otherDone} on Codeforces, CodeChef and AtCoder.</p>}
            <Heatmap activity={activity} />
          </section>
        </aside>
      </div>
    </div>
  );
}

// Engineering training beside DSA: today's lab problem and the day's time split.
function LabPanel() {
  const state = useStore();
  const lab = normLab(state.lab);
  const pick = pickToday(lab, today());
  const plan = planSplit(lab.settings);
  const doneToday = Object.values(lab.sessions).some(s => s?.doneAt && new Date(s.doneAt).toDateString() === new Date().toDateString());
  return (
    <section className="card lab-panel">
      <h2>Engineering today</h2>
      {pick.challenge ? (
        <p><Link href={`/lab/${pick.challenge.id}`}>{pick.challenge.title}</Link><br /><span className="muted small">{CAT[pick.challenge.category].name} · {pick.challenge.minutes} min{status(lab.sessions[pick.challenge.id]) !== "new" ? " · in progress" : ""}</span></p>
      ) : <p className="small">{pick.reason}</p>}
      {doneToday && <p className="small">Done for today. Nice.</p>}
      <p className="muted small">{plan.mode} mode: DSA ~{plan.dsa} min · CP ~{plan.cp} min · Engineering ~{plan.eng} min. <Link href="/lab">Open the Lab</Link></p>
    </section>
  );
}
