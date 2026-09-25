// Saves your progress to your GitHub repo as a commit. The token stays on Vercel; the browser only knows SYNC_SECRET.
// Saved solutions (lib/solutions.js) are one file per question under progress/solutions/, plus
// progress/solutions/index.json, a small list of which questions have one and a hash of each.
import { mergeStates } from "@/lib/merge";
import { normalizeSolution, mergeSolution, summarize, solutionPath, validSolutionId, SOLUTIONS_INDEX } from "@/lib/solutions";

export const dynamic = "force-dynamic";
const API = () => process.env.GITHUB_API || "https://api.github.com";

function config() {
  return {
    token: process.env.GITHUB_TOKEN, repo: process.env.GITHUB_REPO, secret: process.env.SYNC_SECRET,
    branch: process.env.GITHUB_BRANCH || "", dir: (process.env.PROGRESS_DIR || "progress").replace(/^\/+|\/+$/g, ""),
  };
}
function sameSecret(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let x = 0; for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return x === 0;
}
function check(req) {
  const c = config();
  if (!c.token || !c.repo || !c.secret) return [null, Response.json({ error: "GitHub saving isn't set up on this site yet. Add GITHUB_TOKEN, GITHUB_REPO and SYNC_SECRET in Vercel → Settings → Environment Variables, then redeploy." }, { status: 501 })];
  if (!sameSecret(req.headers.get("x-sync-secret") || "", c.secret)) return [null, Response.json({ error: "Wrong sync password." }, { status: 401 })];
  return [c, null];
}
const gh = (c, path, init = {}) => fetch(`${API()}${path}`, {
  ...init, cache: "no-store",
  headers: { Authorization: `Bearer ${c.token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "prepboard", ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers },
});
async function ok(r, what) {
  if (r.ok) return r.json();
  const j = await r.json().catch(() => ({}));
  const e = new Error(`${what}: ${j.message || r.status}`); e.status = r.status; throw e;
}
function explain(e) {
  if (e.status === 401) return "GitHub rejected the token. Check GITHUB_TOKEN in Vercel (it may have expired).";
  if (e.status === 403 || e.status === 404) return `GitHub answered ${e.status}. Check that GITHUB_REPO is "owner/repo-name" and that the token has Contents: Read and write on that repo.`;
  return e.message;
}
const branchOf = async c => c.branch || (await ok(await gh(c, `/repos/${c.repo}`), "Reading the repo")).default_branch;
async function readFile(c, ref, path) {
  const r = await gh(c, `/repos/${c.repo}/contents/${path.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(ref)}`, { headers: { Accept: "application/vnd.github.raw+json" } });
  if (r.status === 404) return null;
  if (!r.ok) await ok(r, `Reading ${path}`);
  try { return JSON.parse(await r.text()); } catch { return null; }
}
const readRemote = (c, ref) => readFile(c, ref, `${c.dir}/progress.json`);
// { [question id]: { h, u, n, r } }. A missing or damaged index counts as empty (trusted: false),
// and then a push checks each question's file itself instead of assuming it isn't there.
async function readIndex(c, ref, withTrust = false) {
  const j = await readFile(c, ref, `${c.dir}/${SOLUTIONS_INDEX}`);
  const valid = !!(j?.items && typeof j.items === "object");
  const items = Object.fromEntries(Object.entries(valid ? j.items : {}).filter(([id, m]) => validSolutionId(id) && typeof m?.h === "string"));
  return withTrust ? { items, trusted: valid } : items;
}
const readSolution = async (c, ref, id) => normalizeSolution(await readFile(c, ref, `${c.dir}/${solutionPath(id)}`), id);
// A few GitHub requests at a time, not dozens at once.
async function pool(list, n, fn) {
  const out = new Array(list.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(n, list.length) }, async () => { while (next < list.length) { const i = next++; out[i] = await fn(list[i]); } }));
  return out;
}
const MAX_FETCH = 40, MAX_PUSH = 60;

// GET: your progress and the solutions index. GET ?solutions=id1,id2: those saved solutions in full.
export async function GET(req) {
  const [c, err] = check(req); if (err) return err;
  try {
    const branch = await branchOf(c);
    const wanted = new URL(req.url).searchParams.get("solutions");
    if (wanted !== null) {
      const ids = [...new Set(wanted.split(",").filter(validSolutionId))].slice(0, MAX_FETCH);
      const recs = await pool(ids, 6, id => readSolution(c, branch, id));
      return Response.json({ records: Object.fromEntries(ids.map((id, i) => [id, recs[i]]).filter(([, r]) => r)) });
    }
    const [state, solutions] = await Promise.all([readRemote(c, branch), readIndex(c, branch)]);
    return Response.json({ state, solutions, repo: c.repo, branch });
  } catch (e) { return Response.json({ error: explain(e) }, { status: 502 }); }
}

export async function POST(req) {
  const [c, err] = check(req); if (err) return err;
  let body; try { body = await req.json(); } catch { return Response.json({ error: "Bad request." }, { status: 400 }); }
  if (!body?.state?.problems) return Response.json({ error: "No progress was sent." }, { status: 400 });
  const message = String(body.message || "Update DSA progress").slice(0, 200);
  // Changed solutions: [{ record, base }]. base is the hash this browser last saw on GitHub, so the
  // server only re-reads a file when another device changed it since.
  const sent = Array.isArray(body.solutions) ? body.solutions : [];
  if (sent.length > MAX_PUSH) return Response.json({ error: `Too many solutions in one push (${sent.length}; the limit is ${MAX_PUSH}).` }, { status: 413 });
  const incoming = sent.map(x => ({ rec: normalizeSolution(x?.record), base: typeof x?.base === "string" ? x.base : null })).filter(x => x.rec);
  try {
    const branch = await branchOf(c);
    for (let attempt = 0; attempt < 3; attempt++) {
      const ref = await ok(await gh(c, `/repos/${c.repo}/git/ref/heads/${branch}`), "Reading the branch");
      const head = await ok(await gh(c, `/repos/${c.repo}/git/commits/${ref.object.sha}`), "Reading the last commit");
      const merged = mergeStates(body.state, await readRemote(c, ref.object.sha));
      const files = [{ path: `${c.dir}/progress.json`, mode: "100644", type: "blob", content: JSON.stringify(merged, null, 1) }];
      if (body.history) files.push({ path: `${c.dir}/HISTORY.md`, mode: "100644", type: "blob", content: String(body.history).slice(0, 2000000) });
      if (body.readme) files.push({ path: `${c.dir}/README.md`, mode: "100644", type: "blob", content: String(body.readme).slice(0, 200000) });
      let index = null, changed = {};
      if (incoming.length) {
        const read = await readIndex(c, ref.object.sha, true);
        index = read.items;
        const results = await pool(incoming, 6, async ({ rec, base }) => {
          const remote = index[rec.id];
          const sentSum = summarize(rec);
          const stale = remote ? remote.h !== base && remote.h !== sentSum.h : !read.trusted;
          const merged = stale ? mergeSolution(rec, await readSolution(c, ref.object.sha, rec.id)) : rec;
          return { merged, sum: summarize(merged), sentHash: sentSum.h };
        });
        for (const { merged, sum, sentHash } of results) {
          if (index[merged.id]?.h !== sum.h) files.push({ path: `${c.dir}/${solutionPath(merged.id)}`, mode: "100644", type: "blob", content: JSON.stringify(merged, null, 1) });
          index[merged.id] = { h: sum.h, u: sum.u, n: sum.n, r: sum.r };
          if (sum.h !== sentHash) changed[merged.id] = merged; // GitHub had attempts this browser didn't
        }
        files.push({ path: `${c.dir}/${SOLUTIONS_INDEX}`, mode: "100644", type: "blob", content: JSON.stringify({ v: 1, items: Object.fromEntries(Object.entries(index).sort()) }, null, 1) });
      }
      const tree = await ok(await gh(c, `/repos/${c.repo}/git/trees`, { method: "POST", body: JSON.stringify({ base_tree: head.tree.sha, tree: files }) }), "Saving files");
      const commit = await ok(await gh(c, `/repos/${c.repo}/git/commits`, { method: "POST", body: JSON.stringify({ message, tree: tree.sha, parents: [ref.object.sha] }) }), "Creating the commit");
      const upd = await gh(c, `/repos/${c.repo}/git/refs/heads/${branch}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha }) });
      if (upd.ok) return Response.json({ state: merged, commit: commit.html_url, message: `Committed "${message}"`, ...(index ? { solutions: index, records: changed } : {}) });
      if (upd.status !== 422) await ok(upd, "Updating the branch");
      // 422: the branch moved while we were saving (e.g. your phone synced). Try again on top of it.
    }
    return Response.json({ error: "The branch kept changing. Try again in a moment." }, { status: 409 });
  } catch (e) { return Response.json({ error: explain(e) }, { status: 502 }); }
}
