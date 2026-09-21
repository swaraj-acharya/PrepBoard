"use client";
import { useState } from "react";
import { HLD_GROUPS, LLD_GROUPS } from "@/lib/systemDesign";
import Rail from "@/components/Rail";

const TABS = {
  hld: { label: "High-level design", groups: HLD_GROUPS, intro: "Design whole systems: servers, databases, caches, queues. Asked in SDE-2 and above, and more and more in fresher interviews at product companies." },
  lld: { label: "Low-level design", groups: LLD_GROUPS, intro: "Design classes and code for one app, using OOP and design patterns. Common in fresher and SDE-1 interviews (Flipkart, Swiggy, Amazon and others)." },
};

export default function SystemDesign() {
  const [tab, setTab] = useState("hld");
  const [hideDone, setHideDone] = useState(false);
  const t = TABS[tab];
  const count = t.groups.reduce((a, g) => a + g.items.length, 0);
  return (
    <div>
      <header className="page-head">
        <h1>System design</h1>
        <div className="seg" role="tablist">
          {Object.entries(TABS).map(([k, v]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{v.label}</button>)}
        </div>
        <p className="muted">{t.intro} {count} questions. Each one shows the platform it comes from and the concepts it needs.</p>
        <label className="toggle"><input type="checkbox" checked={hideDone} onChange={e => setHideDone(e.target.checked)} /> Hide solved</label>
      </header>
      <Rail key={tab} hideDone={hideDone} numbered={false} groups={t.groups.map(g => ({ id: g.id, name: g.name, topics: g.topics, ids: g.items.map(i => i.id) }))} />
    </div>
  );
}
