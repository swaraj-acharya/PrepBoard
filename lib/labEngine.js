// The Problem Solving Lab's logic. Pure functions over your saved lab data (state.lab), so they're easy to test.
import { CHALLENGES, CATEGORIES, DIMENSIONS, MODELS, MISTAKES, DAY_ROTATION, MODES, TEMPLATES, PROJECTS } from "./lab.js";
import { INTERVALS } from "./store.js";

export const BY_ID = new Map(CHALLENGES.map(c => [c.id, c]));
export const CAT = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));
export const MODEL_BY_ID = Object.fromEntries(MODELS.map(m => [m.id, m]));
export const EMPTY_LAB = { sessions: {}, journal: {}, models: {}, projects: {}, settings: { daily: 120, mode: "engineer" } };
export const normLab = lab => ({ ...EMPTY_LAB, ...(lab || {}), settings: { ...EMPTY_LAB.settings, ...(lab?.settings || {}) } });

export const templateOf = c => TEMPLATES[c.template || CAT[c.category].template];
// Thinking time before hints and AI help unlock: about a quarter of the challenge, between 3 and 10 minutes.
export const thinkMinutes = c => c.thinkMinutes ?? Math.min(10, Math.max(3, Math.round(c.minutes / 4)));

// A session: { startedAt, steps: {key: text}, stageNotes: [], hints, firstHypAt, submittedAt, keyHits: [i], match,
//              review: {question: "yes"|"partly"|"no"}, mistakes: [id], principle, explain, extra: {key: text}, doneAt, u }
export const status = s => (!s?.startedAt ? "new" : s.doneAt ? "done" : s.submittedAt ? "submitted" : "started");

const SCORE = { yes: 1, partly: 0.5, no: 0 };
const avg = xs => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
export const processScore = s => avg(Object.values(s?.review || {}).filter(v => v in SCORE).map(v => SCORE[v]));
export const coverage = (s, c) => (c?.reveal?.keyPoints?.length ? (s?.keyHits?.length || 0) / c.reveal.keyPoints.length : null);
export const lines = t => String(t || "").split("\n").map(x => x.trim()).filter(Boolean);
export const hypothesisCount = s => lines(s?.steps?.hypotheses || s?.steps?.causes || s?.steps?.counter || s?.steps?.options).length;
export const minutesToHypothesis = s => (s?.firstHypAt && s?.startedAt ? Math.max(0, Math.round((s.firstHypAt - s.startedAt) / 60000)) : null);

function done(lab) {
  return Object.entries(lab.sessions).filter(([id, s]) => s?.doneAt && BY_ID.has(id)).map(([id, s]) => ({ c: BY_ID.get(id), s }));
}

// Roadmap stage: stage n+1 opens after 2 completed challenges at stage n.
export function currentStage(lab) {
  lab = normLab(lab);
  const d = done(lab);
  let stage = 1;
  while (stage < 8 && d.filter(x => x.c.stage === stage).length >= 2) stage++;
  return stage;
}

// ---------------------------------------------------------------- skill map
export const LEVELS = ["Not started", "Exposure", "Practised", "Applied", "Strong"];
const APPLIED = new Set(["incident", "case", "unknown", "research"]);
const PROJECT_DIMS = {
  "log-analyzer": ["performance", "tooling"], "raw-http": ["networking"], shell: ["os"], "rate-limiter": ["systems", "architecture"],
  "job-queue": ["systems", "databases"], "kv-wal": ["databases"], "cache-layer": ["performance", "systems"], interpreter: ["algorithms", "quality"],
  glomers: ["systems", "testing"], raft: ["systems", "testing"], bustub: ["databases", "performance"], "nand2tetris-upper": ["os", "systems"],
};

// Levels are earned by evidence, never by one exercise:
// Exposure = 1 done · Practised = 3 done · Applied = practised + real application (incident, case study, project or
// real-world journal entry) · Strong = 6 done, 2 applied, average self-review ≥ 75% and key-point coverage ≥ 70%.
// Algorithms comes from your DSA and CP solves.
export function skillMap(lab, { dsaSolved = 0, cpSolved = 0 } = {}) {
  lab = normLab(lab);
  const d = done(lab);
  const journal = Object.values(lab.journal).filter(j => j && !j.deleted);
  const projects = Object.entries(lab.projects).filter(([, p]) => p?.status === "done").map(([id]) => id);
  return DIMENSIONS.map(dim => {
    const mine = d.filter(x => x.c.skills.includes(dim.id));
    const applied = mine.filter(x => APPLIED.has(x.c.category)).length
      + journal.filter(j => (j.tags || []).includes(dim.id)).length
      + projects.filter(p => (PROJECT_DIMS[p] || []).includes(dim.id)).length;
    const avgProcess = avg(mine.map(x => processScore(x.s)).filter(v => v != null));
    const avgCoverage = avg(mine.map(x => coverage(x.s, x.c)).filter(v => v != null));
    let level = 0;
    if (dim.id === "algorithms") {
      const n = dsaSolved + cpSolved;
      level = n >= 300 && cpSolved >= 30 ? 4 : n >= 150 ? 3 : n >= 50 ? 2 : n >= 1 ? 1 : 0;
    } else {
      if (mine.length || applied) level = 1;
      if (mine.length >= 3) level = 2;
      if (level === 2 && applied >= 1) level = 3;
      if (mine.length >= 6 && applied >= 2 && avgProcess >= 0.75 && avgCoverage >= 0.7) level = 4;
    }
    return { ...dim, done: mine.length, applied, avgProcess, avgCoverage, level, label: LEVELS[level] };
  });
}
export const breadthDepth = map => ({ breadth: map.filter(x => x.level >= 2).length, depth: map.filter(x => x.level >= 3).length, total: map.length });

// ---------------------------------------------------------------- recurring mistakes
export function mistakePatterns(lab, now = Date.now(), days = 30) {
  lab = normLab(lab);
  const since = now - days * 864e5, count = {};
  const add = list => { for (const m of list || []) count[m] = (count[m] || 0) + 1; };
  for (const s of Object.values(lab.sessions)) if (s?.doneAt >= since) add(s.mistakes);
  for (const j of Object.values(lab.journal)) if (j && !j.deleted && j.at >= since) add(j.mistakes);
  return MISTAKES.filter(m => count[m.id]).map(m => ({ ...m, count: count[m.id], study: MODEL_BY_ID[m.model] }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

// ---------------------------------------------------------------- daily training
export function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
export const modeOf = settings => (settings?.mode === "custom" && settings.custom ? { name: "Custom", ...settings.custom } : MODES[settings?.mode] || MODES.engineer);
export function planSplit(settings) {
  const m = modeOf(settings), t = settings?.daily || 120;
  return { mode: m.name, dsa: Math.round((t * m.dsa) / 100), cp: Math.round((t * m.cp) / 100), eng: Math.max(15, Math.round((t * m.eng) / 100)) };
}
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Categories whose average self-review is under 60% (at least 2 done), weakest first.
function weakCategories(lab) {
  const by = {};
  for (const { c, s } of done(lab)) { const p = processScore(s); if (p != null) (by[c.category] ||= []).push(p); }
  return Object.entries(by).filter(([, v]) => v.length >= 2 && avg(v) < 0.6).sort((a, b) => avg(a[1]) - avg(b[1])).map(([k, v]) => ({ id: k, score: avg(v) }));
}

// Today's primary challenge. Deterministic for a given day, and explains why it was chosen.
export function pickToday(lab, date) {
  lab = normLab(lab);
  const stage = currentStage(lab), budget = planSplit(lab.settings).eng;
  const open = CHALLENGES.find(c => ["started", "submitted"].includes(status(lab.sessions[c.id])));
  if (open) return { challenge: open, reason: "You started this one. Finishing beats starting something new.", stage, budget };

  let pool = CHALLENGES.filter(c => status(lab.sessions[c.id]) === "new" && c.stage <= stage + 1);
  let above = false;
  if (!pool.length) { pool = CHALLENGES.filter(c => status(lab.sessions[c.id]) === "new"); above = true; }
  if (!pool.length) return { challenge: null, reason: "You've completed every challenge. Pick a project from the Library for your deep work.", stage, budget };
  const fits = pool.filter(c => c.minutes <= budget);
  if (fits.length) pool = fits;
  const rank = list => [...list].sort((a, b) => a.stage - b.stage || hashStr(date + a.id) - hashStr(date + b.id));
  const recent = new Set(done(lab).filter(x => x.s.doneAt > Date.parse(date) - 3 * 864e5).map(x => x.c.category));

  for (const w of weakCategories(lab)) {
    const hit = pool.filter(c => c.category === w.id);
    if (hit.length && !recent.has(w.id)) return { challenge: rank(hit)[0], reason: `Your self-review average in ${CAT[w.id].name} is ${Math.round(w.score * 100)}%, your weakest area, so today repairs it.`, stage, budget };
  }
  const day = new Date(`${date}T12:00:00`).getDay();
  if (hashStr(`${date}:unfamiliar`) % 4 === 0) {
    const u = pool.filter(c => ["unfamiliar", "highly", "ambiguous"].includes(c.reasoning));
    if (u.length) return { challenge: rank(u)[0], reason: "Unfamiliar-problem day: something you probably haven't seen. The goal is the process, not knowing the answer.", stage, budget, unfamiliar: true };
  }
  const cats = DAY_ROTATION[day] || [];
  const rot = pool.filter(c => cats.includes(c.category) && !recent.has(c.category));
  const pick = rank(rot.length ? rot : pool.filter(c => !recent.has(c.category)).length ? pool.filter(c => !recent.has(c.category)) : pool)[0];
  const why = rot.length ? `${DAY_NAMES[day]}'s focus: ${cats.map(k => CAT[k].name).join(", ")}.` : "Rotating to a category you haven't practised in the last few days.";
  return { challenge: pick, reason: above ? `${why} It's above your current roadmap stage: take your time.` : why, stage, budget };
}

// A short second exercise for days with time left: 15 minutes or less, different category.
export function pickQuick(lab, date, exclude) {
  lab = normLab(lab);
  const pool = CHALLENGES.filter(c => status(lab.sessions[c.id]) === "new" && c.minutes <= 15 && c.id !== exclude?.id && c.category !== exclude?.category);
  return pool.sort((a, b) => a.stage - b.stage || hashStr(date + b.id) - hashStr(date + a.id))[0] || null;
}

// Mental models on a spaced schedule; if none are due, introduce the next new one.
export function modelsDue(lab, date) {
  lab = normLab(lab);
  const due = MODELS.filter(m => lab.models[m.id]?.due && lab.models[m.id].due <= date);
  if (due.length) return due;
  const fresh = MODELS.find(m => !lab.models[m.id]);
  return fresh ? [fresh] : [];
}
export function nextModelState(prev, remembered, addDays) {
  const stage = remembered ? (prev?.stage || 0) + 1 : 0;
  return { stage, due: remembered ? (stage <= INTERVALS.length ? addDays(INTERVALS[stage - 1]) : null) : addDays(1), u: Date.now() };
}

// ---------------------------------------------------------------- weekly / monthly review
export function periodReview(lab, now = Date.now(), days = 7) {
  lab = normLab(lab);
  const all = done(lab);
  const within = (a, b) => all.filter(x => x.s.doneAt > a && x.s.doneAt <= b);
  const cur = within(now - days * 864e5, now), prev = within(now - 2 * days * 864e5, now - days * 864e5);
  const score = xs => avg(xs.map(x => processScore(x.s)).filter(v => v != null));
  const dims = {};
  for (const x of cur) { const p = processScore(x.s); if (p != null) for (const d of x.c.skills) (dims[d] ||= []).push(p); }
  const ranked = Object.entries(dims).map(([id, v]) => ({ id, name: DIMENSIONS.find(d => d.id === id).name, score: avg(v), n: v.length })).sort((a, b) => b.score - a.score);
  const mistakes = mistakePatterns(lab, now, days);
  const count = cats => cur.filter(x => cats.includes(x.c.category)).length;
  const weakest = ranked.length > 1 ? ranked.at(-1) : null;
  const priority = !cur.length ? "Complete at least three challenges, each from a different category."
    : mistakes[0] ? `Your most frequent mistake was “${mistakes[0].name}” (${mistakes[0].count}×). Study ${mistakes[0].study.name}, then do its exercise.`
    : weakest && weakest.score < 0.7 ? `Your weakest area was ${weakest.name} (${Math.round(weakest.score * 100)}% self-review). Pick challenges that train it.`
    : "Widen: pick a category you haven't touched yet.";
  return {
    days, done: cur.length, prevDone: prev.length, process: score(cur), prevProcess: score(prev),
    coverage: avg(cur.map(x => coverage(x.s, x.c)).filter(v => v != null)),
    debugged: count(["debug", "data"]), systems: count(["incident", "case", "design", "tradeoff", "api", "howworks"]),
    failed: cur.filter(x => x.s.match === "no").length, deep: cur.filter(x => x.c.minutes >= 30).length,
    hypotheses: avg(cur.map(x => hypothesisCount(x.s))), strongest: ranked[0] || null, weakest, mistakes: mistakes.slice(0, 3), priority,
  };
}

// ---------------------------------------------------------------- journal and principle notebook
export const JOURNAL_FIELDS = [
  ["problem", "Problem"], ["understanding", "Initial understanding"], ["unknowns", "Unknowns"], ["hypotheses", "Hypotheses"],
  ["experiments", "Experiments"], ["failed", "What failed"], ["rootcause", "Root cause"], ["solution", "Solution"],
  ["tradeoffs", "Trade-offs"], ["lessons", "Lessons learned"],
];
const FROM_STEPS = {
  understanding: ["know", "observed", "real", "goal", "purpose", "summary", "question", "input", "assumptions", "threat", "baseline", "constraints"],
  unknowns: ["unknown", "missing", "unknowns"], hypotheses: ["hypotheses", "causes", "counter", "options"],
  experiments: ["experiment", "investigation", "evidence", "sources"], rootcause: ["rootcause"],
  solution: ["fix", "decision", "mitigation", "conclusion", "verdict", "slice", "change"], tradeoffs: ["pros", "cost", "tradeoffs"],
};
export function journalEntries(lab) {
  lab = normLab(lab);
  const out = done(lab).map(({ c, s }) => {
    const fields = { problem: c.brief.split("\n\n")[0] };
    for (const [f, keys] of Object.entries(FROM_STEPS)) { const k = keys.find(k => s.steps?.[k]?.trim()); if (k) fields[f] = s.steps[k]; }
    if (s.match === "no" || s.match === "partly") fields.failed = `My root cause ${s.match === "no" ? "didn't match" : "partly matched"} the reveal.`;
    fields.lessons = [s.principle, s.explain].filter(Boolean).join("\n\n");
    return { id: `c:${c.id}`, kind: "challenge", challengeId: c.id, at: s.doneAt, title: c.title, tags: c.skills, mistakes: s.mistakes || [], fields };
  });
  for (const [id, j] of Object.entries(lab.journal)) if (j && !j.deleted) out.push({ ...j, id, kind: "entry" });
  return out.sort((a, b) => (b.at || 0) - (a.at || 0));
}
export function principles(lab) {
  return journalEntries(lab).filter(e => e.kind === "challenge" ? lab.sessions[e.challengeId]?.principle : e.fields?.lessons)
    .map(e => ({ text: e.kind === "challenge" ? lab.sessions[e.challengeId].principle : e.fields.lessons, from: e.title, at: e.at }));
}
export function toMarkdown(e) {
  const date = e.at ? new Date(e.at).toISOString().slice(0, 10) : "";
  const tags = (e.tags || []).map(t => DIMENSIONS.find(d => d.id === t)?.name || t).join(", ");
  const body = JOURNAL_FIELDS.filter(([k]) => e.fields?.[k]?.trim()).map(([k, label]) => `## ${label}\n\n${e.fields[k].trim()}`).join("\n\n");
  const mistakes = (e.mistakes || []).map(m => MISTAKES.find(x => x.id === m)?.name).filter(Boolean);
  return `# ${e.title}\n\n_${[date, tags].filter(Boolean).join(" · ")}_\n\n${body}${mistakes.length ? `\n\n## Reasoning mistakes I made\n\n${mistakes.map(m => `- ${m}`).join("\n")}` : ""}\n`;
}

// ---------------------------------------------------------------- AI prompts (copy into any chat; nothing is sent from the app)
export const AI_MODES = [
  ["socratic", "Socratic", "Asks you questions. Never gives the answer."],
  ["hint", "Hint", "One small hint."],
  ["review", "Review my reasoning", "Scores your process and points at gaps, without solving."],
  ["solution", "Solution", "The full solution, compared with your attempt. Unlocks after you submit."],
  ["expert", "Expert comparison", "Several valid approaches and their trade-offs. Unlocks after you submit."],
];
export function labPrompt(c, s, mode) {
  const tpl = templateOf(c);
  const stagesSeen = (c.stages || []).slice(0, (s?.stageNotes?.length || 0) + 1);
  const ctx = [
    `Exercise: ${c.title}`, c.brief,
    c.constraints?.length ? `Constraints:\n${c.constraints.map(x => `- ${x}`).join("\n")}` : "",
    ...(c.artifacts || []).map(a => `${a.label}:\n\`\`\`${a.lang}\n${a.text}\n\`\`\``),
    stagesSeen.length ? `What I've been told so far:\n${stagesSeen.map(x => `${x.at}: ${x.info}`).join("\n")}` : "",
  ].filter(Boolean).join("\n\n");
  const mine = tpl.map(([k, label]) => (s?.steps?.[k]?.trim() ? `${label}:\n${s.steps[k].trim()}` : "")).filter(Boolean).join("\n\n") || "(I haven't written anything yet.)";
  const intro = "I'm practising engineering problem-solving with this exercise. It's training, not a live situation.";
  const ask = {
    socratic: "Act as a Socratic mentor. Do NOT tell me the answer, the root cause or a solution, even if I ask. Based on what I've written, ask me at most 3 questions that would help me find my next step myself. If my reasoning has a gap, ask about it rather than naming it.",
    hint: "Give me exactly ONE hint, at most two sentences. Do not name the root cause or the fix.",
    review: "Review my reasoning, not just my conclusion. For each step I wrote: what's strong, what's missing, what's wrong. Then rate understanding, hypotheses, investigation, trade-offs and communication from 1 to 5, with one sentence each. Do NOT give me the full solution; tell me what to rethink.",
    solution: "I've finished my attempt. Explain the full solution: the root cause or best answer, how an experienced engineer would investigate or decide, the fix, and how to prevent it. Then compare it with my attempt point by point: what I got, what I missed, and what I got wrong.",
    expert: "Compare two or three valid approaches an experienced engineer might take, with their trade-offs (simplicity, performance, reliability, cost, effort) and when each fits. Then say which parts of my attempt match which approach.",
  }[mode];
  return `${intro}\n\n${ctx}\n\nMy work so far:\n\n${mine}\n\n${ask}`;
}

export { PROJECTS };
