"use client";
import { useEffect, useRef, useState } from "react";
import { useStore, actions, getState } from "@/lib/store";
import { useSolutionIndex, solutionActions } from "@/lib/solutionStore";
import { useSyncStatus, syncActions } from "@/components/LocalSync";
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
        <p className="muted">Your usernames on other sites. Your <a href="/profile">profile</a> links to them and shows your AtCoder and Codeforces ratings, read from those sites. If you link your repo folder, they&apos;re saved there too.</p>
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
      <RepoFolder savedCount={savedCount} />
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

// Saving to your local copy of the repo (components/LocalSync.jsx). Nothing here talks to GitHub.
function RepoFolder({ savedCount }) {
  const sync = useSyncStatus();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const cmdRef = useRef(null);
  useEffect(() => { setCopied(false); }, [sync.command]);
  const run = fn => async () => { setBusy(true); try { await fn(); } finally { setBusy(false); } };
  async function copy() {
    try { await navigator.clipboard.writeText(sync.command); setCopied(true); }
    catch { if (cmdRef.current) window.getSelection()?.selectAllChildren(cmdRef.current); } // select it to copy by hand
  }
  const time = sync.savedAt ? sync.savedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : null;
  const where = sync.path === "." ? "this folder" : "your repo folder";

  return (
    <section className="panel" id="repo">
      <h2>Save progress to your repo folder</h2>
      <p className="muted">Link the folder where you cloned this repo. Every tick, note and saved solution is written to its <code>progress</code> folder a moment after you make it. This site doesn&apos;t connect to GitHub: when you&apos;re done for the day, commit and push with Git.</p>
      {!sync.supported ? (
        <p className="error" role="alert">This browser can&apos;t save into a folder on your computer. Open Prepboard in Chrome or Edge on a laptop or desktop. Your progress is still kept in this browser.</p>
      ) : !sync.linked ? (
        <>
          <div className="row-btns"><button className="btn primary" onClick={run(syncActions.link)} disabled={busy}>{busy ? "Opening…" : "Choose repo folder"}</button></div>
          <p className="muted small">Pick the folder that has <code>package.json</code> and <code>progress</code> in it. If it has no <code>progress</code> folder, one is created.</p>
          {sync.state === "error" && <p className="error" role="alert">{sync.message}</p>}
        </>
      ) : (
        <>
          <p className="folder-line">{sync.state === "needs-permission" ? "Linked to" : "Saving to"} <code>{sync.folder}</code>{sync.created ? ". It had no progress folder, so one was created" : ""}.</p>
          {sync.repo === false && <p className="small privacy-note">This folder isn&apos;t a Git repository (it has no <code>.git</code> folder), so there&apos;s nothing to push from it. Choose the folder you cloned from GitHub instead.</p>}
          {sync.state === "needs-permission" ? (
            <>
              <p className="sync-line sync-needs-permission" role="alert">{sync.message} Chrome and Edge ask again after they restart; choose <strong>Allow on every visit</strong> so they stop asking.</p>
              <div className="row-btns folder-allow"><button className="btn primary" onClick={run(syncActions.reconnect)} disabled={busy}>Allow access</button></div>
            </>
          ) : (
            <p className={`sync-line sync-${sync.state === "loading" || (sync.state === "ok" && sync.unsaved) ? "syncing" : sync.state}`} role="status">
              {sync.state === "loading" || sync.state === "error" ? sync.message
                : sync.unsaved ? "Saving…"
                : `All changes are saved in the folder${time ? ` (last saved ${time})` : ""}.`}
            </p>
          )}
          {sync.repaired && <p className="small privacy-note">A <code>git pull</code> had left a merge conflict in the progress files. Both sides were merged and saved; commit the result to finish the merge.</p>}
          {savedCount > 0 && <p className="small privacy-note">Your saved solutions and AI reviews ({savedCount} question{savedCount === 1 ? "" : "s"}) are saved to <code>progress/solutions/</code> too. If your repo is public, anyone can read them once you push.</p>}
          {sync.state !== "needs-permission" && (sync.toCommit > 0 ? (
            <div className="commit-box">
              <h3>When you&apos;re done for the day</h3>
              <p>{sync.toCommit} change{sync.toCommit === 1 ? "" : "s"} since your last commit. In a terminal in {where}, run:</p>
              <pre ref={cmdRef}><code>{sync.command}</code></pre>
              <div className="row-btns">
                <button className="btn" onClick={copy}>{copied ? "Copied" : "Copy command"}</button>
                {!sync.git && <button className="btn ghost" onClick={() => syncActions.markCommitted()}>I&apos;ve committed these</button>}
              </div>
            </div>
          ) : sync.git?.pushed === false ? (
            <p className="commit-box">Your last commit isn&apos;t on GitHub yet. Run <code>git push</code> in {where}.</p>
          ) : sync.git?.head ? (
            <p className="muted small">Nothing new to commit{sync.git.pushed ? ", and GitHub has your latest commit" : ""}.</p>
          ) : null)}
          <div className="row-btns">
            {sync.state === "error" && <button className="btn primary" onClick={run(syncActions.saveNow)} disabled={busy}>Save now</button>}
            <button className="btn" onClick={run(syncActions.link)} disabled={busy}>Choose a different folder</button>
            <button className="btn ghost" onClick={() => syncActions.unlink()}>Unlink folder</button>
          </div>
        </>
      )}
      <details className="setup">
        <summary>How it works</summary>
        <ol>
          <li><strong>Have the repo on this computer.</strong> If it isn&apos;t yet, run <code>git clone</code> with your repo&apos;s address.</li>
          <li><strong>Choose the folder once.</strong> Click Choose repo folder, pick the cloned folder and allow editing. This browser remembers the link.</li>
          <li><strong>Study as usual.</strong> Each change is written to <code>progress/</code> a moment later: <code>progress.json</code>, <code>README.md</code>, <code>HISTORY.md</code> and <code>solutions/</code>, in the same format as before.</li>
          <li><strong>Commit and push.</strong> At the end of the day, copy the command above and run it. Prepboard notices the new commit and starts counting again from there.</li>
        </ol>
        <p className="muted small">Only Chrome and Edge on a computer can write to a folder. On other browsers and phones, progress stays in that browser; use Download backup to move it. Using two computers? Run <code>git pull</code> before you start: Prepboard reads the pulled files and merges them in. Unlinking never deletes anything in the folder. Commits that only change <code>progress/</code> don&apos;t trigger a new Vercel deploy (see <code>vercel.json</code>). If your repo is public, your notes, pasted code, saved solutions and AI reviews are public once you push.</p>
      </details>
    </section>
  );
}
