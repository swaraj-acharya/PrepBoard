"use client";
import { useEffect, useMemo, useState } from "react";
import { useData, DIFF } from "@/lib/data";
import { useStore } from "@/lib/store";
import { useSolutionIndex } from "@/lib/solutionStore";
import { resolveTopics } from "@/lib/topics";
import { useOpenItem } from "@/components/Drawer";
import ItemRow from "@/components/ItemRow";
import GoalCard from "@/components/GoalCard";
import { TYPE_LABEL, shortContest } from "@/lib/atcoder";

const PLATFORMS = [["all", "All"], ["lc", "LeetCode"], ["cf", "Codeforces"], ["cc", "CodeChef"], ["ac", "AtCoder"]];
const ORDER = { E: 0, M: 1, H: 2, U: 3 }; // U: no difficulty known
const SOL_FILTERS = [["", "Saved or not"], ["saved", "Solution saved"], ["reviewed", "AI review saved"], ["unreviewed", "Saved, no AI review yet"], ["missing", "Solved, nothing saved"]];
const topicsOf = tags => { const { names } = resolveTopics(tags); return names.length ? names : ["How to Approach a Problem"]; };

export default function Practice() {
  const { problems, cf, cc, ac, want, ready } = useData();
  const { problems: prog } = useStore();
  const open = useOpenItem();
  useEffect(() => { want("cf"); want("cc"); want("ac"); }, [want]);

  const [platform, setPlatform] = useState("all");
  const [q, setQ] = useState("");
  const [diff, setDiff] = useState("");
  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState("");
  const [premium, setPremium] = useState("all");
  const [sort, setSort] = useState("easy");
  const [limit, setLimit] = useState(100);
  const [ctype, setCtype] = useState(""); // AtCoder contest type
  const [sol, setSol] = useState(""); // saved solutions: see SOL_FILTERS
  const { items: sols } = useSolutionIndex();
  // The Today page links here with ?sol=unreviewed. Read once, without useSearchParams, so the page stays static.
  useEffect(() => { const v = new URLSearchParams(window.location.search).get("sol"); if (v && SOL_FILTERS.some(([k]) => k === v)) setSol(v); }, []);

  // One flat, searchable list of every question.
  const index = useMemo(() => {
    const out = [];
    if (problems) for (const [s, p] of Object.entries(problems)) {
      out.push({ id: s, pf: "lc", text: `${p.n || ""} ${p.t || ""} ${s}`.toLowerCase(), level: p.d || "M", rating: 0, num: p.n || 0, premium: !!p.p, topics: topicsOf(p.g || []) });
    }
    if (cf) for (const [id, p] of cf.map) {
      const code = id.slice(3);
      out.push({ id, pf: "cf", text: `${code} ${p.name}`.toLowerCase(), level: p.rating ? (p.rating <= 1200 ? "E" : p.rating <= 1900 ? "M" : "H") : /^[AB]/.test(p.index) ? "E" : /^[CD]/.test(p.index) ? "M" : "H", rating: p.rating, num: +p.contest, topics: topicsOf(p.tags) });
    }
    if (cc) for (const [id, p] of cc.map) out.push({ id, pf: "cc", text: `${p.code} ${p.name}`.toLowerCase(), level: p.level, rating: p.rating, num: 0, topics: topicsOf(p.tags) });
    // AtCoder: search matches "abc350 c", "abc350c", "abc350_c", "edpc", the task name… The " · " separators stop
    // "abc350 c" from also matching the start of another field (e.g. a task named "Cheating" in ABC350).
    if (ac) for (const [id, p] of ac.map) out.push({ id, pf: "ac", text: [`${p.contest.id} ${p.index}`, `${p.contest.id}${p.index}`, p.pid, shortContest(p.contest.id), p.name].join(" · ").toLowerCase(), level: p.level || "U", rating: p.clip ?? 0, num: p.contest.start, ctype: p.contest.type, topics: topicsOf(p.tags) });
    return out;
  }, [problems, cf, cc, ac]);

  const counts = useMemo(() => {
    const c = { all: index.length, lc: 0, cf: 0, cc: 0, ac: 0 };
    for (const x of index) c[x.pf]++;
    return c;
  }, [index]);
  const ctypeCounts = useMemo(() => {
    const c = {};
    for (const x of index) if (x.pf === "ac") c[x.ctype] = (c[x.ctype] || 0) + 1;
    return Object.keys(TYPE_LABEL).filter(k => c[k]).map(k => [k, c[k]]);
  }, [index]);
  const inPlatform = useMemo(() => index.filter(x => platform === "all" || x.pf === platform), [index, platform]);
  const topicCounts = useMemo(() => {
    const c = {};
    for (const x of inPlatform) for (const t of x.topics) c[t] = (c[t] || 0) + 1;
    return Object.entries(c).sort((a, b) => b[1] - a[1]);
  }, [inPlatform]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    const out = inPlatform.filter(x => {
      if (t && !x.text.includes(t)) return false;
      if (diff && x.level !== diff) return false;
      if (topic && !x.topics.includes(topic)) return false;
      if (ctype && x.ctype !== ctype) return false;
      if (premium === "free" && x.premium) return false;
      if (premium === "premium" && !x.premium) return false;
      const st = prog[x.id]?.status;
      if (status === "todo" && st) return false;
      if (status === "done" && !st) return false;
      if (status === "revisit" && st !== "revisit") return false;
      if (sol) {
        const x2 = sols[x.id];
        if (sol === "saved" && !x2?.n) return false;
        if (sol === "reviewed" && !x2?.r) return false;
        if (sol === "unreviewed" && !(x2?.n && !x2.r)) return false;
        if (sol === "missing" && (!st || x2?.n)) return false;
      }
      return true;
    });
    const by = {
      easy: (a, b) => ORDER[a.level] - ORDER[b.level] || a.rating - b.rating || a.num - b.num,
      hard: (a, b) => ORDER[b.level] - ORDER[a.level] || b.rating - a.rating || b.num - a.num,
      newest: (a, b) => b.num - a.num,
      number: (a, b) => a.num - b.num || a.text.localeCompare(b.text),
    }[sort];
    return out.sort(by);
  }, [inPlatform, q, diff, topic, ctype, premium, status, sort, prog, sol, sols]);

  useEffect(() => { setLimit(100); }, [platform, q, diff, topic, ctype, premium, status, sort, sol]);

  function randomPick() {
    const pool = list.filter(x => !prog[x.id]?.status);
    if (pool.length) open(pool[Math.floor(Math.random() * pool.length)].id);
  }

  const loadingMore = (platform === "cf" && !cf) || (platform === "cc" && !cc) || (platform === "ac" && !ac) || (platform === "all" && (!cf || !cc || !ac));

  return (
    <div>
      <header className="page-head">
        <h1>More questions</h1>
        <p className="muted">Every question on LeetCode (including Premium), Codeforces, CodeChef and AtCoder, outside your DSA path. Filter by topic and difficulty, or let it pick one for you.</p>
      </header>
      <GoalCard />

      <div className="filters">
        <div className="seg" role="tablist">
          {PLATFORMS.map(([k, label]) => (
            <button key={k} role="tab" aria-selected={platform === k} className={platform === k ? "on" : ""} onClick={() => { setPlatform(k); setTopic(""); setCtype(""); }}>
              {label} <span className="muted">{counts[k] ? counts[k].toLocaleString("en-IN") : "…"}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="filters">
        <input className="search" placeholder="Search by name or number, e.g. 146, lru, 1A, FLOW001, abc350 c" value={q} onChange={e => setQ(e.target.value)} />
        <select value={diff} onChange={e => setDiff(e.target.value)} aria-label="Difficulty">
          <option value="">Any difficulty</option><option value="E">Easy</option><option value="M">Medium</option><option value="H">Hard</option>
        </select>
        <select value={topic} onChange={e => setTopic(e.target.value)} aria-label="Topic">
          <option value="">Any topic</option>
          {topicCounts.map(([t, c]) => <option key={t} value={t}>{t} ({c})</option>)}
        </select>
        {platform === "ac" && (
          <select value={ctype} onChange={e => setCtype(e.target.value)} aria-label="AtCoder contest type">
            <option value="">Every contest type</option>
            {ctypeCounts.map(([k, c]) => <option key={k} value={k}>{TYPE_LABEL[k]} ({c.toLocaleString("en-IN")})</option>)}
          </select>
        )}
        <select value={status} onChange={e => setStatus(e.target.value)} aria-label="Status">
          <option value="">Solved and unsolved</option><option value="todo">Unsolved only</option><option value="done">Solved only</option><option value="revisit">Needs revisit</option>
        </select>
        <select value={sol} onChange={e => setSol(e.target.value)} aria-label="Saved solutions">
          {SOL_FILTERS.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
        </select>
        {(platform === "all" || platform === "lc") && (
          <select value={premium} onChange={e => setPremium(e.target.value)} aria-label="LeetCode Premium">
            <option value="all">Free and Premium</option><option value="free">Free only</option><option value="premium">Premium only</option>
          </select>
        )}
        <select value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort">
          <option value="easy">Easiest first</option><option value="hard">Hardest first</option><option value="newest">Newest first</option><option value="number">By number</option>
        </select>
        <button className="btn" onClick={randomPick} disabled={!list.length}>Pick a random unsolved one</button>
      </div>

      {!ready ? <p className="muted">Loading questions…</p> : (
        <>
          <p className="muted small">
            {list.length.toLocaleString("en-IN")} questions{loadingMore ? " (still loading Codeforces and CodeChef…)" : ""}.
            {platform === "cf" && cf && !cf.rated && " Codeforces difficulty is estimated from the problem letter (A–B easy, C–D medium, E and later hard). Run npm run data to get official ratings."}
            {platform === "ac" && ac && (ac.seed
              ? " Only the EDPC and ALPC practice sets are bundled. Run npm run data to download the full AtCoder list."
              : " AtCoder publishes no difficulty or topic tags. The ≈ numbers are AtCoder Problems' estimates (a ? marks experimental ones); problems without one are graded by their letter or left unrated. Topics appear only for sets whose topic is certain.")}
          </p>
          {list.length === 0 ? <p className="muted">No questions match these filters. Clear a filter to see more.</p> : (
            <ul className="plist">
              {list.slice(0, limit).map((x, i) => <ItemRow key={x.id} id={x.id} index={i + 1} />)}
            </ul>
          )}
          {list.length > limit && <button className="btn more-btn" onClick={() => setLimit(l => l + 100)}>Show 100 more ({(list.length - limit).toLocaleString("en-IN")} left)</button>}
        </>
      )}
    </div>
  );
}
