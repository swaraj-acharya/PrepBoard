// Your contest ratings, read from each site's own public data:
//   AtCoder:    https://atcoder.jp/users/<handle>/history/json   (official; algorithm contests)
//   Codeforces: https://codeforces.com/api/user.rating?handle=… (official API)
// Runs on the server because browsers can't call these directly. Like every page here, it needs you to be
// signed in (see proxy.js), so it can't be used as an open relay. Answers are cached for 30 minutes.
export const dynamic = "force-dynamic";

const AC_RE = /^[A-Za-z0-9_]{3,16}$/;
const CF_RE = /^[A-Za-z0-9_.-]{3,24}$/;

async function get(url, site) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 15000);
  try {
    return await fetch(url, { signal: ctl.signal, headers: { "User-Agent": "prepboard (personal progress tracker)" }, next: { revalidate: 1800 } });
  } catch (e) {
    throw new Error(`${site} ${e.name === "AbortError" ? "didn't answer in time" : "couldn't be reached"}. Try again later.`);
  } finally { clearTimeout(t); }
}

async function atcoder(handle) {
  const r = await get(`https://atcoder.jp/users/${encodeURIComponent(handle)}/history/json`, "AtCoder");
  if (r.status === 404) throw new Error(`AtCoder has no user called "${handle}".`);
  if (!r.ok) throw new Error(`AtCoder answered ${r.status}.`);
  const list = await r.json().catch(() => null);
  if (!Array.isArray(list)) throw new Error("AtCoder sent something unexpected.");
  const rated = list.filter(x => x && x.IsRated);
  const history = rated.map(x => ({
    t: Math.floor(Date.parse(x.EndTime) / 1000) || 0, r: +x.NewRating || 0, perf: +x.Performance || 0, place: +x.Place || 0,
    contest: String(x.ContestScreenName || "").split(".")[0], name: String(x.ContestNameEn || x.ContestName || ""),
  }));
  return {
    handle, rating: history.length ? history.at(-1).r : null, max: history.length ? Math.max(...history.map(h => h.r)) : null,
    contests: history.length, entered: list.length, history, url: `https://atcoder.jp/users/${handle}`, source: "atcoder.jp (official)",
  };
}

async function codeforces(handle) {
  const r = await get(`https://codeforces.com/api/user.rating?handle=${encodeURIComponent(handle)}`, "Codeforces");
  const j = await r.json().catch(() => null);
  if (!j) throw new Error(`Codeforces answered ${r.status}.`);
  if (j.status !== "OK") throw new Error(/not found/i.test(j.comment || "") ? `Codeforces has no user called "${handle}".` : `Codeforces said: ${j.comment || "error"}.`);
  const history = j.result.map(x => ({ t: x.ratingUpdateTimeSeconds || 0, r: +x.newRating || 0, place: +x.rank || 0, contest: String(x.contestId || ""), name: String(x.contestName || "") }));
  return {
    handle, rating: history.length ? history.at(-1).r : null, max: history.length ? Math.max(...history.map(h => h.r)) : null,
    contests: history.length, history, url: `https://codeforces.com/profile/${handle}`, source: "codeforces.com/api (official)",
  };
}

export async function GET(req) {
  const q = new URL(req.url).searchParams;
  const out = { at: new Date().toISOString() };
  const jobs = [];
  const ac = (q.get("ac") || "").trim(), cf = (q.get("cf") || "").trim();
  if (ac) jobs.push(AC_RE.test(ac) ? atcoder(ac).then(v => (out.ac = v), e => (out.ac = { handle: ac, error: e.message })) : (out.ac = { handle: ac, error: "That isn't a valid AtCoder username." }));
  if (cf) jobs.push(CF_RE.test(cf) ? codeforces(cf).then(v => (out.cf = v), e => (out.cf = { handle: cf, error: e.message })) : (out.cf = { handle: cf, error: "That isn't a valid Codeforces handle." }));
  await Promise.all(jobs);
  return Response.json(out, { headers: { "Cache-Control": "private, max-age=300" } });
}
