"use client";
import { useStore } from "@/lib/store";
import { useItem } from "@/lib/data";
import { useSolutionIndex } from "@/lib/solutionStore";
import { useOpenItem } from "./Drawer";

export function StatusDot({ status }) {
  const label = status === "solved" ? "Solved" : status === "revisit" ? "Needs revisit" : "Not solved";
  return <span className={`dot dot-${status || "todo"}`} title={label} aria-label={label} />;
}

// Words, not just colour: "Reviewed" when an AI review is saved, "Saved" when only your code is.
export function SolutionBadge({ id }) {
  const s = useSolutionIndex().items[id];
  if (!s?.n) return null;
  const label = `${s.n} saved attempt${s.n === 1 ? "" : "s"}${s.r ? `, ${s.r} with an AI review` : ", no AI review yet"}`;
  return <span className={`solbadge${s.r ? " has-review" : ""}`} title={label} aria-label={label}>{s.r ? "Reviewed" : "Saved"}</span>;
}

export default function ItemRow({ id, index, extra, note }) {
  const open = useOpenItem();
  const item = useItem(id);
  const { problems } = useStore();
  const st = problems[id]?.status;
  if (!item) return null;
  return (
    <li className={`prow ${st ? "is-" + st : ""}${note ? " has-note" : ""}`}>
      {index != null && <span className="idx">{index}</span>}
      <StatusDot status={st} />
      <button className="ptitle" onClick={() => open(id)}>{item.title}{item.premium && <span className="badge-premium">Premium</span>}</button>
      <SolutionBadge id={id} />
      {extra}
      <span className={`diff diff-${item.level}`}>{item.levelLabel || "—"}</span>
      {item.url ? <a className="plat" href={item.url} target="_blank" rel="noreferrer" title={`Open on ${item.platform}`}>{item.platform}</a> : <span className="plat">{item.platform}</span>}
      {note && <p className="prow-note">{note}</p>}
    </li>
  );
}
