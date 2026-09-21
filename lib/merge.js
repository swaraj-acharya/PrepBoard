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
  return { ...remote, ...local, problems, activity, settings: { ...(remote.settings || {}), ...(local.settings || {}) } };
}
