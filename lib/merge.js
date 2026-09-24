// Merge two copies of your progress (this browser + GitHub, or phone + laptop).
// For each question the newest change wins; for each day the higher activity count wins.
function mergeLab(a, b) {
  if (!a && !b) return null;
  a ||= {}; b ||= {};
  const out = { ...b, ...a, settings: { ...(b.settings || {}), ...(a.settings || {}) } };
  for (const key of ["sessions", "journal", "models", "projects"]) {
    const m = { ...(b[key] || {}) };
    for (const [id, v] of Object.entries(a[key] || {})) if (v && (!m[id] || (v.u || 0) >= (m[id].u || 0))) m[id] = v;
    out[key] = m;
  }
  return out;
}

export function mergeStates(local, remote) {
  if (!remote || typeof remote !== "object") return local;
  if (!local) return remote;
  const problems = { ...(remote.problems || {}) };
  for (const [k, v] of Object.entries(local.problems || {})) {
    const r = problems[k];
    if (!r || (v?.u || 0) >= (r?.u || 0)) problems[k] = v;
  }
  const activity = { ...(remote.activity || {}) };
  for (const [d, n] of Object.entries(local.activity || {})) activity[d] = Math.max(activity[d] || 0, n || 0);
  // History: keep every entry from both copies (one per question, action and day).
  const log = {};
  for (const src of [remote.log || {}, local.log || {}]) {
    for (const [d, list] of Object.entries(src)) {
      const byKey = new Map((log[d] || []).map(e => [`${e.id}|${e.a}`, e]));
      for (const e of list || []) {
        const k = `${e.id}|${e.a}`, cur = byKey.get(k);
        if (!cur || (e.t || 0) > (cur.t || 0)) byKey.set(k, e);
      }
      log[d] = [...byKey.values()];
    }
  }
  // Ratings: per platform, the most recently fetched snapshot wins (an empty copy on a new device can't wipe it).
  const ratings = { ...(remote.ratings || {}) };
  for (const [k, v] of Object.entries(local.ratings || {})) {
    if (v && (!ratings[k] || (v.fetched || 0) >= (ratings[k]?.fetched || 0))) ratings[k] = v;
  }
  // Profile usernames: a name typed on this device wins, but a blank one doesn't erase the saved name.
  const handles = { ...(remote.settings?.handles || {}) };
  for (const [k, v] of Object.entries(local.settings?.handles || {})) if (v) handles[k] = v;
  // Problem Solving Lab: per challenge, journal entry, model and project, the newest change wins.
  const lab = mergeLab(local.lab, remote.lab);
  return { ...remote, ...local, problems, activity, log, ratings, ...(lab ? { lab } : {}), settings: { ...(remote.settings || {}), ...(local.settings || {}), handles } };
}
