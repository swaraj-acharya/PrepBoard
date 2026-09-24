"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore, actions } from "@/lib/store";
import { useData, resolveItem } from "@/lib/data";
import { computeProfile, refreshRatings, firstReached, HOW_LABEL } from "@/lib/profile";
import { AC_BANDS, CF_BANDS, acBand, acNextBand, cfRank, cfNextRank } from "@/lib/atcoder";
import { useSyncStatus } from "@/components/GitHubSync";
import RatingChart from "@/components/RatingChart";

const pct = (a, b) => (b ? `${Math.round((a / b) * 100)}%` : "—");
const date = t => new Date(t * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const PROFILE_URL = {
  ac: h => `https://atcoder.jp/users/${h}`, cf: h => `https://codeforces.com/profile/${h}`, cc: h => `https://www.codechef.com/users/${h}`,
  lc: h => `https://leetcode.com/u/${h}/`, gh: h => `https://github.com/${h}`,
};
const PROFILE_NAME = { ac: "AtCoder", cf: "Codeforces", cc: "CodeChef", lc: "LeetCode", gh: "GitHub" };

function Stat({ value, label, sub }) {
  return <div className="stat"><b>{value}</b><span>{label}</span>{sub && <small className="muted">{sub}</small>}</div>;
}
function Signal({ label, value, empty }) {
  return <li><span>{label}</span>{value != null && value !== "" ? <strong>{value}</strong> : <em className="muted">{empty || "Not yet"}</em>}</li>;
}

// Colour or rank milestones with the date each was first reached, from the official rating history.
function Milestones({ bands, rating, history }) {
  const max = history?.length ? Math.max(...history.map(h => h.r)) : null;
  return (
    <ul className="milestones">
      {bands.slice(1).map(([min, name, color]) => {
        const t = max != null && max >= min ? firstReached(history, min) : null;
        return (
          <li key={name} className={t ? "hit" : ""} style={{ "--band": color }}>
            <span className="swatch" aria-hidden="true" />{name} <span className="muted small">{t ? date(t) : min}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default function Profile() {
  const data = useData();
  const state = useStore();
  const { settings, ratings = {} } = state;
  const handles = settings.handles || {};
  const sync = useSyncStatus();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const pathIds = useMemo(() => (data.seq || []).flatMap(g => g.problems), [data.seq]);
  const bridgeTotal = useMemo(() => (data.seq || []).reduce((n, g) => n + (g.bridge?.length || 0), 0), [data.seq]);
  const p = useMemo(() => computeProfile(state, id => resolveItem(id, data), pathIds), [state, data, pathIds]);
  const notes = Object.values(state.problems).filter(v => v.notes?.trim()).length;
  const ac = ratings.ac?.handle ? ratings.ac : null, cf = ratings.cf?.handle ? ratings.cf : null;

  async function refresh() {
    setBusy(true); setMsg("");
    try {
      const { next, errors } = await refreshRatings(handles, ratings);
      actions.ratings(next);
      setMsg(errors.length ? errors.join(" ") : "Ratings updated.");
    } catch (e) { setMsg(e.message); }
    setBusy(false);
  }

  if (!data.ready) return <p className="muted">Loading your profile…</p>;
  const linked = Object.keys(PROFILE_URL).filter(k => handles[k]);

  return (
    <div className="profile">
      <header className="page-head">
        <h1>DSA profile</h1>
        <p className="muted">Evidence of your problem-solving: what you&apos;ve tracked here, plus your official contest records. It shows what you can prove today. No number on this page predicts or guarantees an interview or a job.</p>
        <div className="row-btns">
          <button className="btn" onClick={refresh} disabled={busy || (!handles.ac && !handles.cf)}>{busy ? "Refreshing…" : "Refresh contest ratings"}</button>
          <Link href="/settings#profiles" className="btn ghost">Edit usernames</Link>
        </div>
        {!handles.ac && !handles.cf && <p className="muted small">Add your AtCoder and Codeforces usernames in <Link href="/settings#profiles">Settings</Link> to include your ratings.</p>}
        {msg && <p className="small" role="status">{msg}</p>}
      </header>

      <section className="stats" aria-label="Core numbers">
        <Stat value={p.coding} label="Coding problems solved" sub={p.plat.lc.sql ? `plus ${p.plat.lc.sql} SQL and other non-DSA` : null} />
        <Stat value={p.how.independent} label="Solved on your own" sub={`${pct(p.how.independent, p.coding)} of solves`} />
        <Stat value={p.hard} label="Hard problems" sub={`${p.hardIndependent} on your own`} />
        <Stat value={p.resolved} label="Re-solved in revision" sub={`${p.mastered} mastered`} />
        <Stat value={`${p.topics.size}/${p.topicTotal}`} label="DSA topics practised" />
        <Stat value={p.recall == null ? "—" : pct(p.remembered, p.remembered + p.forgot)} label="Revision recall" sub={p.recall == null ? "no revisions yet" : `${p.remembered} of ${p.remembered + p.forgot} remembered`} />
        <Stat value={p.streak} label="Day streak" sub={`longest ${p.longest}`} />
        <Stat value={p.activeDays} label="Active days" />
      </section>

      {p.coding > 0 && (
        <section className="panel card">
          <h2>How you solved them</h2>
          <div className="howbar" role="img" aria-label={Object.entries(p.how).map(([k, n]) => `${HOW_LABEL[k]}: ${n}`).join(", ")}>
            {Object.entries(p.how).map(([k, n]) => n > 0 && <span key={k} className={`how-${k}`} style={{ flexGrow: n }} title={`${HOW_LABEL[k]}: ${n}`} />)}
          </div>
          <ul className="howlegend">
            {Object.entries(p.how).map(([k, n]) => <li key={k}><span className={`key how-${k}`} />{HOW_LABEL[k]} <strong>{n}</strong></li>)}
          </ul>
          <p className="muted small">Only solves with no hint, editorial or reference code count as your own. Opening hint 3 (the full solution) counts as reference code. Mark what helped in a question&apos;s panel after &quot;Solved with help&quot;.</p>
        </section>
      )}

      <section className="panel card">
        <h2>Platforms</h2>
        <div className="table-wrap">
          <table className="ptable">
            <thead><tr><th>Platform</th><th>Solved here</th><th>Hard</th><th>Rating</th><th>Highest</th><th>Rated contests</th></tr></thead>
            <tbody>
              <tr><td>LeetCode</td><td>{p.plat.lc.solved} <span className="muted small">({p.plat.lc.E} E, {p.plat.lc.M} M, {p.plat.lc.H} H)</span></td><td>{p.plat.lc.H}</td><td colSpan={3} className="muted small">LeetCode has no public rating API, so contest ratings aren&apos;t shown.</td></tr>
              <tr><td>Codeforces</td><td>{p.plat.cf.solved}</td><td>{p.plat.cf.H}</td>
                {cf?.rating != null ? <><td>{cf.rating} <span className="muted small">{cfRank(cf.rating).name}</span></td><td>{cf.max}</td><td>{cf.contests}</td></> : <td colSpan={3} className="muted small">{cf?.error || (handles.cf ? "Not fetched yet" : "No username")}</td>}</tr>
              <tr><td>AtCoder</td><td>{p.plat.ac.solved}</td><td>{p.plat.ac.H}</td>
                {ac?.rating != null ? <><td>{ac.rating} <span className="muted small">{acBand(ac.rating).name}</span></td><td>{ac.max}</td><td>{ac.contests}</td></> : <td colSpan={3} className="muted small">{ac?.error || (handles.ac ? (ac && ac.contests === 0 ? "No rated contests yet" : "Not fetched yet") : "No username")}</td>}</tr>
              <tr><td>CodeChef</td><td>{p.plat.cc.solved}</td><td>{p.plat.cc.H}</td><td colSpan={3} className="muted small">Not fetched: CodeChef has no official public rating API.</td></tr>
            </tbody>
          </table>
        </div>
        <p className="muted small">&quot;Solved here&quot; counts what you&apos;ve ticked in Prepboard. &quot;Hard&quot; is each platform&apos;s own scale (AtCoder uses difficulty estimates). Ratings come straight from AtCoder and Codeforces{ac?.fetched || cf?.fetched ? `, last fetched ${new Date(Math.max(ac?.fetched || 0, cf?.fetched || 0)).toLocaleString("en-IN")}` : ""}.</p>
      </section>

      {(ac?.history?.length > 0 || cf?.history?.length > 0) && (
        <section className="panel card">
          <h2>Rating history</h2>
          {ac?.history?.length > 0 && <>
            <h3>AtCoder <span className="muted small">{acNextBand(ac.rating) ? `${acNextBand(ac.rating).min - ac.rating} points to ${acNextBand(ac.rating).name}` : "Top colour reached"}</span></h3>
            <RatingChart history={ac.history} bands={AC_BANDS} label="AtCoder rating" />
            <Milestones bands={AC_BANDS} rating={ac.rating} history={ac.history} />
          </>}
          {cf?.history?.length > 0 && <>
            <h3>Codeforces <span className="muted small">{cfNextRank(cf.rating) ? `${cfNextRank(cf.rating).min - cf.rating} points to ${cfNextRank(cf.rating).name}` : "Top rank reached"}</span></h3>
            <RatingChart history={cf.history} bands={CF_BANDS} label="Codeforces rating" />
            <Milestones bands={CF_BANDS} rating={cf.rating} history={cf.history} />
          </>}
          <p className="muted small">A date means you reached that level in a rated contest. Colours and ranks are public achievements, not hiring guarantees.</p>
        </section>
      )}

      <section className="panel card">
        <h2>Your signal stack</h2>
        <p className="muted small">Three kinds of evidence, kept separate on purpose. One blended score would hide what&apos;s strong and what&apos;s missing.</p>
        <div className="signals">
          <div>
            <h3>Interview skill</h3>
            <ul className="signal-list">
              <Signal label="LeetCode Medium and Hard" value={p.plat.lc.M + p.plat.lc.H || null} />
              <Signal label="DSA path" value={`${p.pathDone} of ${p.pathTotal}`} />
              <Signal label="Topics practised" value={`${p.topics.size} of ${p.topicTotal}`} />
              <Signal label="Revision recall" value={p.recall == null ? null : pct(p.remembered, p.remembered + p.forgot)} empty="No revisions yet" />
            </ul>
          </div>
          <div>
            <h3>Contest skill</h3>
            <ul className="signal-list">
              <Signal label="AtCoder" value={ac?.rating != null ? `${ac.rating} ${acBand(ac.rating).name} · ${ac.contests} contests` : null} empty={handles.ac ? "No rated contest yet" : "No username"} />
              <Signal label="Codeforces" value={cf?.rating != null ? `${cf.rating} ${cfRank(cf.rating).name} · ${cf.contests} contests` : null} empty={handles.cf ? "No rated contest yet" : "No username"} />
              <Signal label="Contest-platform problems" value={p.plat.cf.solved + p.plat.ac.solved + p.plat.cc.solved || null} />
              <Signal label="AtCoder practice from the path" value={bridgeTotal ? `${p.bridgeDone} of ${bridgeTotal}` : null} />
            </ul>
          </div>
          <div>
            <h3>Public proof</h3>
            <ul className="signal-list">
              <Signal label="Progress committed to GitHub" value={sync.connected ? "Connected" : null} empty="Not set up" />
              <Signal label="Public profiles linked" value={linked.length ? `${linked.length}` : null} />
              <Signal label="Questions with your own notes" value={notes || null} />
              <Signal label="Active days" value={p.activeDays || null} />
            </ul>
            {linked.length > 0 && (
              <p className="small">{linked.map((k, i) => <span key={k}>{i > 0 && " · "}<a href={PROFILE_URL[k](handles[k])} target="_blank" rel="noreferrer">{PROFILE_NAME[k]}</a></span>)}</p>
            )}
          </div>
        </div>
      </section>

      <section className="panel card">
        <h2>What this page can&apos;t show</h2>
        <p className="small">How you explain your thinking out loud, how you handle a new problem under an interviewer&apos;s eye, and system design. Practise those with mock interviews and the <Link href="/system-design">System design</Link> section. Not in college, so no ICPC? Everything above can be earned by anyone: open contests, a public practice record and your own write-ups. It isn&apos;t the same as an ICPC result, and it doesn&apos;t need to be: it&apos;s evidence you can point to.</p>
      </section>
    </div>
  );
}
