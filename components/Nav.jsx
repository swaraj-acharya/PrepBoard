"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore, streak } from "@/lib/store";

const LINKS = [["/", "Today"], ["/path", "DSA path"], ["/practice", "More questions"], ["/companies", "Companies"], ["/system-design", "System design"], ["/cs", "CS subjects"], ["/topics", "Topics"], ["/settings", "Settings"]];

export default function Nav() {
  const path = usePathname();
  const { activity } = useStore();
  const s = streak(activity);
  return (
    <nav className="nav">
      <Link href="/" className="brand">Prepboard</Link>
      <div className="nav-links">
        {LINKS.map(([href, label]) => {
          const on = href === "/" ? path === "/" : path.startsWith(href);
          return <Link key={href} href={href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>{label}</Link>;
        })}
      </div>
      <span className="streak" title="Days in a row with at least one solve or revision">{s} day{s === 1 ? "" : "s"} streak</span>
    </nav>
  );
}
