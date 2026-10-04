"use client";
import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore, streak } from "@/lib/store";
import { useSyncStatus, syncActions } from "@/components/LocalSync";
import { NAV_TOP, NAV_MENUS, isActive } from "@/lib/nav";

export default function Nav() {
  const path = usePathname();
  const { activity } = useStore();
  const s = streak(activity);
  const sync = useSyncStatus();
  return (
    <nav className="nav" aria-label="Main">
      <Link href="/" className="brand">Prepboard</Link>
      <div className="nav-links">
        {NAV_TOP.map(([href, label]) => {
          const on = isActive(path, href);
          return <Link key={href} href={href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>{label}</Link>;
        })}
        {NAV_MENUS.map(m => <NavMenu key={m.label} label={m.label} items={m.items} path={path} />)}
      </div>
      <FolderBadge sync={sync} />
      <span className="streak" title="Days in a row with at least one solve or revision">{s} day{s === 1 ? "" : "s"} streak</span>
    </nav>
  );
}

// A dropdown that opens on click (works on touch too). It closes when you pick a page, click elsewhere,
// press Escape, or tab out of it. It remembers the page it was opened on, so changing page closes it.
function NavMenu({ label, items, path }) {
  const [openOn, setOpenOn] = useState(null);
  const open = openOn === path;
  const box = useRef(null);
  const id = useId();
  const on = items.some(([href]) => isActive(path, href));

  useEffect(() => {
    if (!open) return;
    const away = e => { if (!box.current?.contains(e.target)) setOpenOn(null); };
    const key = e => { if (e.key === "Escape") { setOpenOn(null); box.current?.querySelector("button")?.focus(); } };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("pointerdown", away); document.removeEventListener("keydown", key); };
  }, [open]);

  return (
    <div className="nav-menu" ref={box} onBlur={e => { if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget)) setOpenOn(null); }}>
      <button type="button" className={`nav-trigger${on ? " on" : ""}`} aria-expanded={open} aria-controls={id} onClick={() => setOpenOn(open ? null : path)}>
        {label}<span className="caret" aria-hidden="true" />
      </button>
      {open && (
        <ul className="nav-drop" id={id}>
          {items.map(([href, text, hint]) => {
            const here = isActive(path, href);
            return (
              <li key={href}>
                <Link href={href} className={here ? "on" : ""} aria-current={here ? "page" : undefined} onClick={() => setOpenOn(null)}>
                  <span>{text}</span><small>{hint}</small>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// One short line about your repo folder, only when there's something to do.
function FolderBadge({ sync }) {
  if (!sync.linked) return null;
  if (sync.state === "needs-permission") {
    return <button type="button" className="unpushed" onClick={() => syncActions.reconnect()} title={`Let Prepboard keep saving to ${sync.folder}`}>Allow folder access</button>;
  }
  if (sync.state === "error") return <Link href="/settings#repo" className="unpushed" title={sync.message}>Not saved to folder</Link>;
  if (sync.toCommit > 0) {
    return <Link href="/settings#repo" className="unpushed" title="Saved in your repo folder, not committed yet. Open Settings for the commit command.">{sync.toCommit} to commit</Link>;
  }
  if (sync.git?.pushed === false) return <Link href="/settings#repo" className="unpushed" title="Your last commit isn't on GitHub yet">Not pushed</Link>;
  return null;
}
