"use client";
import { useState } from "react";

export default function Login() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: id.trim(), password }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setError(j.error || "Couldn't sign in. Try again."); setPassword(""); return; }
      const next = new URLSearchParams(window.location.search).get("next") || "/";
      // Full page load, so every page loads fresh with your sign-in.
      window.location.assign(next.startsWith("/") && !next.startsWith("//") ? next : "/");
    } catch { setError("Couldn't reach the site. Check your connection and try again."); }
    finally { setBusy(false); }
  }

  return (
    <div className="auth">
      <form className="auth-card" onSubmit={submit}>
        <img src="/icon.svg" alt="" width={44} height={44} className="auth-logo" />
        <h1>Prepboard</h1>
        <p className="muted">Sign in to see your prep.</p>
        <label className="auth-field">ID
          <input autoComplete="username" autoCapitalize="none" spellCheck={false} value={id} onChange={e => setId(e.target.value)} required autoFocus />
        </label>
        <label className="auth-field">Password
          <input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn primary auth-submit" disabled={busy || !id.trim() || !password}>{busy ? "Signing in…" : "Sign in"}</button>
        <p className="muted small">You&apos;ll stay signed in on this device for 7 days.</p>
      </form>
    </div>
  );
}
