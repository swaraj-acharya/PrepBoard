"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useData } from "@/lib/data";
import { useStore } from "@/lib/store";
import { acBand, cfRank } from "@/lib/atcoder";
import ItemRow from "@/components/ItemRow";

const ABC = ["ABC", "ABC-Like"], ARC = ["ARC", "ARC-Like"], AGC = ["AGC", "AGC-Like"];

// Each stage is defined only by contest type and AtCoder Problems' difficulty estimate, because AtCoder has no topic tags.
const STAGES = [
  { id: "A", name: "Beginner foundation", types: ABC, min: 0, max: 400,
    skills: "Implementation, loops and conditions, arrays and strings, simulation, sorting, simple greedy, prefix sums, maps and basic counting.",
    goal: "Speed and getting it right first time. Aim to finish each one well inside the contest time." },
  { id: "B", name: "Strong beginner", types: ABC, min: 400, max: 800,
    skills: "Binary search, two pointers, sliding window, prefix and suffix tricks, greedy, BFS and DFS, basic DP, modular arithmetic.",
    goal: "Recognise which standard technique a problem needs." },
  { id: "C", name: "Intermediate", types: [...ABC, ...ARC], min: 800, max: 1600,
    skills: "Harder greedy, graph algorithms, DP, combinatorics, number theory, union-find, shortest paths, coordinate compression, constructive ideas.",
    goal: "Combine two techniques and prove why your idea works." },
  { id: "D", name: "Advanced", types: [...ABC, ...ARC, ...AGC], min: 1600, max: 2400,
    skills: "Advanced DP, segment trees with lazy propagation, tree algorithms, bitmask techniques, combinatorics, constructive reasoning.",
    goal: "Find the key observation that turns a hard problem into a known one." },
  { id: "E", name: "Elite", types: [...ARC, ...AGC], min: 2400, max: Infinity,
    skills: "Deep observations, hard combinatorics and DP, advanced graph theory, non-obvious transformations.",
    goal: "Problems where the idea, not the code, is the whole difficulty." },
];
const stageRule = s => `${s.types.filter(t => !t.endsWith("-Like")).join(", ")} problems${s.types.some(t => t.endsWith("-Like")) ? " (and sponsored contests at the same level)" : ""} with an estimated difficulty ${s.max === Infinity ? `of ${s.min} or more` : s.min === 0 ? `below ${s.max}` : `from ${s.min} to ${s.max - 1}`}`;

const CF_BUCKETS = [800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400];
const bucketOf = r => CF_BUCKETS.filter(b => r >= b).at(-1) ?? null;

export default function CP() {
  const { ac, cf, seq, want, ready } = useData();
  const { problems: prog, ratings = {} } = useStore();
  useEffect(() => { want("ac"); want("cf"); }, [want]);
  const [open, setOpen] = useState(null);
  const [more, setMore] = useState({});

  const acRating = ratings.ac?.handle ? ratings.ac.rating : null;
  const cfRating = ratings.cf?.handle ? ratings.cf.rating : null;

  const stages = useMemo(() => {
    if (!ac || ac.seed) return null;
    return STAGES.map(s => {
      const list = [];
      for (const [id, p] of ac.map) if (p.clip != null && s.types.includes(p.contest.type) && p.clip >= s.min && p.clip < s.max) list.push({ id, clip: p.clip, start: p.contest.start, letter: p.index[0] });
      list.sort((a, b) => a.clip - b.clip || b.start - a.start);
      const letters = {};
      for (const x of list) letters[x.letter] = (letters[x.letter] || 0) + 1;
      const mix = Object.entries(letters).sort((a, b) => b[1] - a[1]).slice(0, 3);
      return { ...s, list, mix };
    });
  }, [ac]);

  // Suggested stage: the one containing your AtCoder rating; without a rating, the first with fewer than 20 solved.
  const solvedIn = s => s.list.filter(x => prog[x.id]?.status).length;
  const suggested = !stages ? null : acRating != null ? STAGES.find(s => acRating >= s.min && acRating < s.max)?.id : stages.find(s => solvedIn(s) < 20)?.id;
  const current = open ?? suggested;

  const cfLadder = useMemo(() => {
    if (!cf?.rated) return null;
    const by = Object.fromEntries(CF_BUCKETS.map(b => [b, []]));
    for (const [id, p] of cf.map) { const b = p.rating ? bucketOf(p.rating) : null; if (b != null) by[b].push({ id, rating: p.rating, contest: +p.contest }); }
    for (const b of CF_BUCKETS) by[b].sort((x, y) => y.contest - x.contest);
    return by;
  }, [cf]);
  const cfTarget = cfRating != null ? bucketOf(Math.min(Math.max(cfRating + 200, 800), 2400)) : cfLadder ? CF_BUCKETS.find(b => cfLadder[b].filter(x => prog[x.id]?.status).length < 20) : null;

  const bridges = (seq || []).filter(g => g.bridge?.length);

  if (!ready) return <p className="muted">Loading…</p>;

  return (
    <div className="cp">
      <header className="page-head">
        <h1>Competitive programming</h1>
        <p className="muted">Interview prep teaches patterns. Contests add what interviews can&apos;t fully test: speed, proof, and problems you&apos;ve never seen. Climb AtCoder by estimated difficulty and Codeforces by rating, a level at a time.</p>
        {(acRating != null || cfRating != null) ? (
          <p className="small">
            {acRating != null && <>AtCoder <strong>{acRating}</strong> ({acBand(acRating).name}). </>}
            {cfRating != null && <>Codeforces <strong>{cfRating}</strong> ({cfRank(cfRating).name}). </>}
            <Link href="/profile">See your profile</Link>
          </p>
        ) : <p className="small muted">Add your usernames in <Link href="/settings#profiles">Settings</Link> and the page suggests where to start.</p>}
      </header>

      <section className="card">
        <h2>AtCoder ladder</h2>
        {!ac ? <p className="muted">Loading AtCoder problems…</p> : ac.seed ? (
          <p className="muted">Only the EDPC and ALPC practice sets are bundled, and the ladder needs the full AtCoder list with difficulty estimates. Run <code>npm run data</code> (with internet), then commit and push.</p>
        ) : (
          <>
            <p className="muted small">AtCoder publishes no topic tags, so each stage is a difficulty band, not a topic list. The difficulties are estimates from AtCoder Problems. {acRating != null ? "The open stage matches your AtCoder rating." : "The open stage is the first one where you've solved fewer than 20."}</p>
            <ol className="stages">
              {stages.map(s => {
                const solved = solvedIn(s), isOpen = current === s.id;
                const next = s.list.filter(x => !prog[x.id]?.status).slice(0, 5 + (more[s.id] || 0));
                return (
                  <li key={s.id} className={`stage${s.id === suggested ? " suggested" : ""}`}>
                    <button className="stage-head" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? "" : s.id)}>
                      <span className="stage-id">{s.id}</span>
                      <span className="stage-name">{s.name}{s.id === suggested && <span className="count">suggested</span>}</span>
                      <span className="stage-count">{solved.toLocaleString("en-IN")} / {s.list.length.toLocaleString("en-IN")}</span>
                    </button>
                    {isOpen && (
                      <div className="stage-body">
                        <p><strong>Typical skills:</strong> {s.skills}</p>
                        <p><strong>Goal:</strong> {s.goal}</p>
                        <p className="muted small">Which problems: {stageRule(s)}.{s.mix.length > 0 && <> Most are problem {s.mix.map(([l, n]) => `${l} (${n.toLocaleString("en-IN")})`).join(", ")}.</>}</p>
                        {next.length === 0 ? <p className="muted">You&apos;ve solved every problem in this stage.</p> : (
                          <>
                            <h3>Next unsolved, easiest first</h3>
                            <ul className="plist">{next.map(x => <ItemRow key={x.id} id={x.id} />)}</ul>
                            {s.list.length - solved > next.length && <button className="btn more-btn" onClick={() => setMore(m => ({ ...m, [s.id]: (m[s.id] || 0) + 10 }))}>Show 10 more</button>}
                          </>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
            <p className="muted small">Browse or search every AtCoder problem in <Link href="/practice">More questions</Link>.</p>
          </>
        )}
      </section>

      <section className="card">
        <h2>Codeforces rating ladder</h2>
        {!cf ? <p className="muted">Loading Codeforces problems…</p> : !cfLadder ? (
          <p className="muted">Your Codeforces list has no official ratings (the data was last built offline), so a rating ladder isn&apos;t possible yet. Run <code>npm run data</code> with internet to download them from codeforces.com/api.</p>
        ) : (
          <>
            <p className="muted small">Training milestones, not targets you must hit. {cfRating != null ? "Prepboard highlights the band about 200 above your rating: a stretch, but reachable." : "The highlighted band is the first where you've solved fewer than 20."} Newest problems first inside each band.</p>
            <ul className="ladder">
              {CF_BUCKETS.map(b => {
                const list = cfLadder[b], solved = list.filter(x => prog[x.id]?.status).length;
                const next = list.filter(x => !prog[x.id]?.status).slice(0, 5);
                return (
                  <li key={b} className={b === cfTarget ? "suggested" : ""}>
                    <details open={b === cfTarget}>
                      <summary>
                        <span className="band">{b === 2400 ? "2400+" : `${b}–${b + 199}`}</span>
                        <span className="muted small">{solved.toLocaleString("en-IN")} of {list.length.toLocaleString("en-IN")} solved</span>
                      </summary>
                      {next.length ? <ul className="plist">{next.map(x => <ItemRow key={x.id} id={x.id} />)}</ul> : <p className="muted small">All solved.</p>}
                    </details>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>

      {bridges.length > 0 && (
        <section className="card">
          <h2>From the DSA path to contests</h2>
          <p className="muted small">These path steps link AtCoder problems on the same topic: the same idea, with contest-style input and output. Do them after the step&apos;s LeetCode problems, then move on to the ladders above.</p>
          <ul className="bridge-list">
            {bridges.map(g => {
              const done = g.bridge.filter(b => prog[b.id]?.status).length;
              return <li key={g.id}><Link href="/path">{g.name}</Link> <span className="muted small">{done} of {g.bridge.length} AtCoder problems</span></li>;
            })}
          </ul>
        </section>
      )}

      <section className="card facts">
        <h2>How AtCoder&apos;s contests work</h2>
        <dl>
          <dt>ABC (Beginner Contest)</dt><dd>The regular entry point. Recent ABCs are rated for everyone below 2000.</dd>
          <dt>ARC (Regular Contest), 2026 format</dt>
          <dd>Three kinds. ARC++: rated 1600–2999, 150 minutes. ARC: rated 1200–2799, 120 minutes. ARC--: rated 800–2399, 120 minutes. <a href="https://atcoder.jp/posts/2026ARC_en" target="_blank" rel="noreferrer">AtCoder&apos;s announcement</a></dd>
          <dt>AGC (Grand Contest)</dt><dd>The top tier, above ARC.</dd>
          <dt>AHC (Heuristic Contest)</dt><dd>Optimisation problems with no exact answer: you aim for the best score. A different skill from algorithm contests, with its own rating.</dd>
          <dt>AI during contests</dt>
          <dd>AtCoder bans generative AI during live ABC, ARC and AGC, apart from translating the statement in a set way. Practising past problems with AI is allowed, so Prepboard switches its AI prompts off only while a problem&apos;s contest is running. <a href="https://info.atcoder.jp/entry/llm-rules-en" target="_blank" rel="noreferrer">AtCoder&apos;s rules</a></dd>
        </dl>
      </section>
    </div>
  );
}
