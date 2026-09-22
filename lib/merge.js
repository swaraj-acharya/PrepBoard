// Merge two copies of your progress (this browser + GitHub, or phone + laptop).
// For each question the newest change wins; for each day the higher activity count wins.
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
  return { ...remote, ...local, problems, activity, log, settings: { ...(remote.settings || {}), ...(local.settings || {}) } };
}
