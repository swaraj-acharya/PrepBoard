// Saves your progress to your GitHub repo as a commit. The token stays on Vercel; the browser only knows SYNC_SECRET.
import { mergeStates } from "@/lib/merge";

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
async function readRemote(c, ref) {
  const r = await gh(c, `/repos/${c.repo}/contents/${c.dir}/progress.json?ref=${encodeURIComponent(ref)}`, { headers: { Accept: "application/vnd.github.raw+json" } });
  if (r.status === 404) return null;
  if (!r.ok) await ok(r, "Reading progress.json");
  try { return JSON.parse(await r.text()); } catch { return null; }
}

export async function GET(req) {
  const [c, err] = check(req); if (err) return err;
  try {
    const branch = await branchOf(c);
    return Response.json({ state: await readRemote(c, branch), repo: c.repo, branch });
  } catch (e) { return Response.json({ error: explain(e) }, { status: 502 }); }
}

export async function POST(req) {
  const [c, err] = check(req); if (err) return err;
  let body; try { body = await req.json(); } catch { return Response.json({ error: "Bad request." }, { status: 400 }); }
  if (!body?.state?.problems) return Response.json({ error: "No progress was sent." }, { status: 400 });
  const message = String(body.message || "Update DSA progress").slice(0, 200);
  try {
    const branch = await branchOf(c);
    for (let attempt = 0; attempt < 3; attempt++) {
      const ref = await ok(await gh(c, `/repos/${c.repo}/git/ref/heads/${branch}`), "Reading the branch");
      const head = await ok(await gh(c, `/repos/${c.repo}/git/commits/${ref.object.sha}`), "Reading the last commit");
      const merged = mergeStates(body.state, await readRemote(c, ref.object.sha));
      const files = [{ path: `${c.dir}/progress.json`, mode: "100644", type: "blob", content: JSON.stringify(merged, null, 1) }];
      if (body.history) files.push({ path: `${c.dir}/HISTORY.md`, mode: "100644", type: "blob", content: String(body.history).slice(0, 2000000) });
      if (body.readme) files.push({ path: `${c.dir}/README.md`, mode: "100644", type: "blob", content: String(body.readme).slice(0, 200000) });
      const tree = await ok(await gh(c, `/repos/${c.repo}/git/trees`, { method: "POST", body: JSON.stringify({ base_tree: head.tree.sha, tree: files }) }), "Saving files");
      const commit = await ok(await gh(c, `/repos/${c.repo}/git/commits`, { method: "POST", body: JSON.stringify({ message, tree: tree.sha, parents: [ref.object.sha] }) }), "Creating the commit");
      const upd = await gh(c, `/repos/${c.repo}/git/refs/heads/${branch}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha }) });
      if (upd.ok) return Response.json({ state: merged, commit: commit.html_url, message: `Committed "${message}"` });
      if (upd.status !== 422) await ok(upd, "Updating the branch");
      // 422: the branch moved while we were saving (e.g. your phone synced). Try again on top of it.
    }
    return Response.json({ error: "The branch kept changing. Try again in a moment." }, { status: 409 });
  } catch (e) { return Response.json({ error: explain(e) }, { status: 502 }); }
}
