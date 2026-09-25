"use client";
import { useEffect, useRef, useState } from "react";
import { useStore, actions, getState } from "@/lib/store";
import { useSolutionIndex, solutionActions } from "@/lib/solutionStore";
import { useSyncStatus, syncActions } from "@/components/GitHubSync";
import { refreshRatings } from "@/lib/profile";

const PROFILES = [["ac", "AtCoder", "Used for your rating and colour"], ["cf", "Codeforces", "Used for your rating and rank"], ["cc", "CodeChef", "Link only"], ["lc", "LeetCode", "Link only"], ["gh", "GitHub", "Link only"]];

export default function Settings() {
  const { settings, problems, ratings = {} } = useStore();
  const handles = settings.handles || {};
  const [draft, setDraft] = useState(handles);
  const saved = JSON.stringify(handles);
  useEffect(() => { setDraft(JSON.parse(saved)); }, [saved]); // saved names arrive after the first render
  const [rmsg, setRmsg] = useState("");
  const [fetching, setFetching] = useState(false);
  async function saveProfiles(e) {
    e.preventDefault();
    const clean = Object.fromEntries(PROFILES.map(([k]) => [k, (draft[k] || "").trim().replace(/^@/, "")]));
    actions.handles(clean);
    if (!clean.ac && !clean.cf && !handles.ac && !handles.cf) { setRmsg("Saved."); return; }
    setFetching(true); setRmsg("Saved. Fetching ratings…");
    try {
      const { next, errors } = await refreshRatings(clean, ratings);
      actions.ratings(next);
      setRmsg(errors.length ? `Saved. ${errors.join(" ")}` : "Saved, and ratings updated.");
    } catch (err) { setRmsg(`Saved. ${err.message}`); }
    setFetching(false);
  }
  const fileRef = useRef(null);
  const [msg, setMsg] = useState("");
  const sync = useSyncStatus();
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const sol = useSolutionIndex();
  const savedCount = Object.values(sol.items).filter(x => x.n).length;

  // A backup is your progress plus, under "solutions", every saved attempt and AI review.
  async function download() {
    try {
      const solutions = await solutionActions.exportAll();
      const blob = new Blob([JSON.stringify({ ...getState(), solutions }, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `prepboard-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      const n = Object.keys(solutions).length;
      setMsg(`Backup downloaded${n ? `, with saved solutions for ${n} question${n === 1 ? "" : "s"}` : ""}.`);
    } catch (err) { setMsg(`The backup couldn't be made: ${err.message}`); }
  }
  // Progress is replaced by the backup's, as before. Saved solutions are merged in, so restoring
  // never deletes an attempt; backups made before saved solutions existed restore as they always did.
  async function upload(e) {
    const f = e.target.files?.[0]; if (!f) return;
    e.target.value = "";
    let text, raw;
    try { text = await f.text(); raw = JSON.parse(text); actions.importJSON(text); }
    catch { setMsg("That file isn't a Prepboard backup. Choose the .json file you downloaded from here."); return; }
    if (!raw.solutions || typeof raw.solutions !== "object") {
      // An older backup: the code you pasted for each question becomes its attempt 1, as on first run.
      const n = await solutionActions.adoptLegacyWork(raw.problems, raw.settings?.lang).catch(() => 0);
      setMsg(`Backup restored.${n ? ` The code saved with ${n} question${n === 1 ? "" : "s"} is now attempt 1 in My solutions.` : ""}`);
      return;
    }
    try {
      const changed = await solutionActions.mergeIn(raw.solutions);
      setMsg(`Backup restored, including saved solutions for ${Object.keys(raw.solutions).length} question${Object.keys(raw.solutions).length === 1 ? "" : "s"}${changed ? ` (${changed} new or updated here)` : ""}.`);
    } catch (err) { setMsg(`Your progress was restored, but the saved solutions weren't: ${err.message}`); }
  }

  return (
    <div className="settings">
      <header className="page-head"><h1>Settings</h1></header>
      <section className="panel">
        <h2>Daily goal</h2>
        <label className="row">Problems or revisions per day
          <input type="number" min={1} max={30} value={settings.goal} onChange={e => actions.settings({ goal: Math.max(1, +e.target.value || 1) })} />
        </label>
        <label className="row">Total questions I want to solve (LeetCode, Codeforces, CodeChef)
          <input type="number" min={50} max={20000} step={50} value={settings.target || 2500} onChange={e => actions.settings({ target: Math.max(50, +e.target.value || 2500) })} />
        </label>
        <label className="row">Language for solution code
          <select value={settings.lang} onChange={e => actions.settings({ lang: e.target.value })}>
            {["C++", "Java", "Python", "JavaScript"].map(l => <option key={l}>{l}</option>)}
          </select>
        </label>
      </section>
      <section className="panel" id="profiles">
        <h2>Public profiles</h2>
        <p className="muted">Your usernames on other sites. Your <a href="/profile">profile</a> links to them and shows your AtCoder and Codeforces ratings, read from those sites. If you save progress to GitHub, they&apos;re saved there too.</p>
        <form onSubmit={saveProfiles}>
          {PROFILES.map(([k, name, note]) => (
            <label className="row" key={k}><span>{name} <span className="muted small">{note}</span></span>
              <input className="handle" value={draft[k] || ""} onChange={e => setDraft(d => ({ ...d, [k]: e.target.value }))} autoComplete="off" spellCheck={false} placeholder="username" />
            </label>
          ))}
          <div className="row-btns"><button className="btn primary" disabled={fetching}>{fetching ? "Saving…" : "Save"}</button></div>
        </form>
        {rmsg && <p className="small" role="status">{rmsg}</p>}
      </section>
      <section className="panel">
        <h2>Save progress to GitHub</h2>
        <p className="muted">Tick questions as usual; nothing is sent to GitHub until you click <strong>Push Progress Now</strong>. Everything you changed since your last push goes up together as one commit in the <code>progress</code> folder of your repo. Commits count on your GitHub contribution graph, and opening the site on another device loads what you pushed.</p>
        {sync.connected ? (
          <>
            {savedCount > 0 && <p className="small privacy-note">Your saved solutions and AI reviews ({savedCount} question{savedCount === 1 ? "" : "s"}) are pushed with your progress, to <code>progress/solutions/</code>. If your repo is public, anyone can read them.</p>}
            <p className={`sync-pending${sync.pending ? " has" : ""}`}>
              {sync.pending ? `${sync.pending} change${sync.pending === 1 ? "" : "s"} waiting to be pushed.` : "No changes waiting to be pushed."}
            </p>
            <p className={`sync-line sync-${sync.state}`} role="status">
              {sync.state === "syncing" ? sync.message : sync.state === "error" ? sync.message : `${sync.message}${sync.at ? ` Last checked ${sync.at.toLocaleTimeString()}.` : ""}`}
              {sync.commit && <> <a href={sync.commit} target="_blank" rel="noreferrer">See the last commit</a>.</>}
            </p>
            <div className="row-btns">
              <button className="btn primary" disabled={busy || sync.state === "syncing"} onClick={async () => { setBusy(true); await syncActions.pushNow(); setBusy(false); }}>{busy ? "Pushing…" : "Push Progress Now"}</button>
              <button className="btn ghost" onClick={() => syncActions.disconnect()}>Stop saving to GitHub on this device</button>
            </div>
          </>
        ) : (
          <>
            <form className="sync-form" onSubmit={async e => { e.preventDefault(); if (!pw.trim()) return; setBusy(true); await syncActions.connect(pw); setBusy(false); setPw(""); }}>
              <label className="row">Sync password (your SYNC_SECRET)
                <input type="password" autoComplete="current-password" value={pw} onChange={e => setPw(e.target.value)} />
              </label>
              <button className="btn primary" disabled={busy || !pw.trim()}>{busy ? "Connecting…" : "Connect"}</button>
            </form>
            {sync.state === "error" && <p className="error" role="alert">{sync.message}</p>}
          </>
        )}
        <details className="setup">
          <summary>How to set it up (once, about 5 minutes)</summary>
          <ol>
            <li><strong>Create a GitHub token.</strong> Open <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">GitHub → Fine-grained tokens → Generate new token</a>. Under Repository access choose <em>Only select repositories</em> and pick your Prepboard repo. Under Permissions set <em>Contents</em> to <em>Read and write</em>. Generate it and copy it.</li>
            <li><strong>Add it to Vercel.</strong> In Vercel open your project → Settings → Environment Variables and add <code>GITHUB_TOKEN</code> (the token), <code>GITHUB_REPO</code> (like <code>yourname/prepboard</code>) and <code>SYNC_SECRET</code> (a long password you make up). Then go to Deployments and click Redeploy.</li>
            <li><strong>Connect here.</strong> Type your <code>SYNC_SECRET</code> above and click Connect. Do this once on each device you use.</li>
            <li><strong>Push when you're done.</strong> After a study session, come back here and click Push Progress Now. Unpushed changes stay safe in this browser until then.</li>
          </ol>
          <p className="muted small">The token only lives in Vercel, never in the browser or the code, and visitors can&apos;t save without your password. Commits that only change <code>progress/</code> don&apos;t trigger a new Vercel deploy (see <code>vercel.json</code>). If your repo is public, <code>progress.json</code> (including notes and pasted code) and <code>progress/solutions/</code> (your saved attempts and AI reviews) are public too. Commits count on your contribution graph when they go to the default branch of a repo that isn&apos;t a fork. For a private repo, also turn on &quot;Private contributions&quot; in your GitHub profile.</p>
        </details>
      </section>
      <section className="panel">
        <h2>Sign-in</h2>
        <p className="muted">This device stays signed in for 7 days after you sign in. To sign out every device at once, change <code>AUTH_PASSWORD</code> in Vercel and redeploy.</p>
        <div className="row-btns">
          <button className="btn" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }).catch(() => {}); window.location.assign("/login"); }}>Sign out on this device</button>
        </div>
      </section>
      <section className="panel">
        <h2>Your data</h2>
        <p className="muted">Progress is always saved in this browser too ({Object.keys(problems).length} problems tracked{savedCount ? `, saved solutions for ${savedCount}` : ""}). Download a backup to move it to another device or browser; it includes your saved solutions and AI reviews.</p>
        {sol.storage === "memory" && <p className="error" role="alert">This browser isn&apos;t letting Prepboard store saved solutions (private mode or storage turned off), so they last only until you close this tab. Download a backup before you leave.</p>}
        <div className="row-btns">
          <button className="btn primary" onClick={download}>Download backup</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>Restore from backup</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={upload} />
          <button className="btn ghost danger" onClick={async () => { if (confirm(`Delete all progress${savedCount ? `, notes and saved solutions (${savedCount} question${savedCount === 1 ? "" : "s"})` : ""} in this browser? This can't be undone.`)) { actions.reset(); await solutionActions.clearAll().catch(() => {}); setMsg("All progress deleted."); } }}>Delete all progress</button>
        </div>
        {msg && <p className="small" role="status">{msg}</p>}
      </section>
    </div>
  );
}
