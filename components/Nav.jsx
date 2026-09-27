"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore, streak } from "@/lib/store";
import { useSyncStatus, syncActions } from "@/components/LocalSync";

const LINKS = [["/", "Today"], ["/path", "DSA path"], ["/practice", "More questions"], ["/cp", "CP training"], ["/lab", "Lab"], ["/companies", "Companies"], ["/system-design", "System design"], ["/cs", "CS subjects"], ["/topics", "Topics"], ["/profile", "Profile"], ["/history", "History"], ["/settings", "Settings"]];

export default function Nav() {
  const path = usePathname();
  const { activity } = useStore();
  const s = streak(activity);
  const sync = useSyncStatus();
  return (
    <nav className="nav">
      <Link href="/" className="brand">Prepboard</Link>
      <div className="nav-links">
        {LINKS.map(([href, label]) => {
          const on = href === "/" ? path === "/" : path.startsWith(href);
          return <Link key={href} href={href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>{label}</Link>;
        })}
      </div>
      <FolderBadge sync={sync} />
      <span className="streak" title="Days in a row with at least one solve or revision">{s} day{s === 1 ? "" : "s"} streak</span>
    </nav>
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
