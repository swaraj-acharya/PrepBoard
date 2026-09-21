"use client";
import { useRef, useState } from "react";
import { useStore, actions } from "@/lib/store";
import { useSyncStatus, syncActions } from "@/components/GitHubSync";

export default function Settings() {
  const { settings, problems } = useStore();
  const fileRef = useRef(null);
  const [msg, setMsg] = useState("");
  const sync = useSyncStatus();
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  function download() {
    const blob = new Blob([actions.exportJSON()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `prepboard-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setMsg("Backup downloaded.");
  }
  async function upload(e) {
    const f = e.target.files?.[0]; if (!f) return;
    try { actions.importJSON(await f.text()); setMsg("Backup restored."); }
    catch { setMsg("That file isn't a Prepboard backup. Choose the .json file you downloaded from here."); }
    e.target.value = "";
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
      <section className="panel">
        <h2>Save progress to GitHub</h2>
        <p className="muted">When this is on, the site commits your progress to your GitHub repo (in the <code>progress</code> folder) about 10 seconds after each tick. The commits count on your GitHub contribution graph, and your phone and laptop stay in sync.</p>
        {sync.connected ? (
          <>
            <p className={`sync-line sync-${sync.state}`} role="status">
              {sync.state === "syncing" ? sync.message : sync.state === "error" ? sync.message : `${sync.message}${sync.at ? ` Last checked ${sync.at.toLocaleTimeString()}.` : ""}`}
              {sync.commit && <> <a href={sync.commit} target="_blank" rel="noreferrer">See the last commit</a>.</>}
            </p>
            <div className="row-btns">
              <button className="btn primary" disabled={busy} onClick={async () => { setBusy(true); await syncActions.syncNow(); setBusy(false); }}>Sync now</button>
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
          </ol>
          <p className="muted small">The token only lives in Vercel, never in the browser or the code, and visitors can&apos;t save without your password. Commits that only change <code>progress/</code> don&apos;t trigger a new Vercel deploy (see <code>vercel.json</code>). If your repo is public, <code>progress.json</code> (including notes and pasted code) is public too. Commits count on your contribution graph when they go to the default branch of a repo that isn&apos;t a fork. For a private repo, also turn on &quot;Private contributions&quot; in your GitHub profile.</p>
        </details>
      </section>
      <section className="panel">
        <h2>Your data</h2>
        <p className="muted">Progress is always saved in this browser too ({Object.keys(problems).length} problems tracked). Download a backup to move it to another device or browser.</p>
        <div className="row-btns">
          <button className="btn primary" onClick={download}>Download backup</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>Restore from backup</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={upload} />
          <button className="btn ghost danger" onClick={() => { if (confirm("Delete all progress in this browser? This can't be undone.")) { actions.reset(); setMsg("All progress deleted."); } }}>Delete all progress</button>
        </div>
        {msg && <p className="small" role="status">{msg}</p>}
      </section>
    </div>
  );
}
