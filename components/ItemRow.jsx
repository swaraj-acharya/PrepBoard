"use client";
import { useStore } from "@/lib/store";
import { useItem } from "@/lib/data";
import { useOpenItem } from "./Drawer";

export function StatusDot({ status }) {
  const label = status === "solved" ? "Solved" : status === "revisit" ? "Needs revisit" : "Not solved";
  return <span className={`dot dot-${status || "todo"}`} title={label} aria-label={label} />;
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
      {extra}
      <span className={`diff diff-${item.level}`}>{item.levelLabel || "—"}</span>
      {item.url ? <a className="plat" href={item.url} target="_blank" rel="noreferrer" title={`Open on ${item.platform}`}>{item.platform}</a> : <span className="plat">{item.platform}</span>}
      {note && <p className="prow-note">{note}</p>}
    </li>
  );
}
