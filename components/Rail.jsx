"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import ItemRow from "./ItemRow";
import TopicCard from "./TopicCard";

// groups: [{ id, name, topics, ids, bridge? }]. bridge = optional AtCoder problems for the step, not counted in its progress.
export default function Rail({ groups, hideDone, numbered = true }) {
  const { problems: prog } = useStore();
  const [openId, setOpenId] = useState(null);
  const [explain, setExplain] = useState({});
  const firstOpen = groups.find(g => g.ids.some(s => !prog[s]?.status))?.id;
  const current = openId ?? firstOpen;
  let n = 0;

  return (
    <ol className="rail">
      {groups.map((g, gi) => {
        const done = g.ids.filter(s => prog[s]?.status).length;
        const pct = done / g.ids.length;
        const start = n; n += g.ids.length;
        const isOpen = current === g.id;
        return (
          <li key={g.id} className={`stop ${pct === 1 ? "complete" : pct > 0 ? "started" : ""}`} style={{ "--pct": pct }}>
            <span className="node" aria-hidden="true" />
            <button className="stop-head" aria-expanded={isOpen} onClick={() => setOpenId(isOpen ? "" : g.id)}>
              <span className="stop-num">{gi + 1}</span>
              <span className="stop-name">{g.name}</span>
              <span className="stop-count">{done}/{g.ids.length}</span>
            </button>
            <div className="stop-bar"><span /></div>
            {isOpen && (
              <div className="stop-body">
                {g.why && <p className="stop-why">{g.why}</p>}
                {g.topics?.length > 0 && (
                  <div className="stop-explain">
                    <button className="linkish" aria-expanded={!!explain[g.id]} onClick={() => setExplain(e => ({ ...e, [g.id]: !e[g.id] }))}>
                      {explain[g.id] ? "Hide the explanation" : `Learn the ${g.topics.length > 1 ? "topics" : "topic"} first, explained simply`}
                    </button>
                    {explain[g.id] && g.topics.map((t, i) => <TopicCard key={t} name={t} open={i === 0} />)}
                  </div>
                )}
                <ul className="plist">
                  {g.ids.map((s, i) => (hideDone && prog[s]?.status) ? null : <ItemRow key={s} id={s} index={numbered ? start + i + 1 : null} />)}
                </ul>
                {g.bridge?.length > 0 && (
                  <div className="bridge">
                    <h3>Take it further on AtCoder <span className="count">{g.bridge.filter(b => prog[b.id]?.status).length}/{g.bridge.length}</span></h3>
                    <p className="muted small">Optional, and not counted in this step. The same ideas with contest-style input and output, from AtCoder sets whose topic is known for certain.</p>
                    <ul className="plist">
                      {g.bridge.map(b => (hideDone && prog[b.id]?.status) ? null : <ItemRow key={b.id} id={b.id} note={b.why} />)}
                    </ul>
                  </div>
                )}
                {g.milestone && <p className="milestone"><strong>Milestone.</strong> {g.milestone}</p>}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
