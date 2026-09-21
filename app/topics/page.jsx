"use client";
import { useState } from "react";
import TopicCard from "@/components/TopicCard";
import { TOPICS, DSA_TOPIC_NAMES, HLD_TOPIC_NAMES, LLD_TOPIC_NAMES, CS_TOPIC_NAMES } from "@/lib/topics";

const SECTIONS = [["Coding topics", DSA_TOPIC_NAMES], ["High-level design concepts", HLD_TOPIC_NAMES], ["Low-level design concepts", LLD_TOPIC_NAMES], ["CS subjects (DBMS, OS, networks, OOPs)", CS_TOPIC_NAMES]];

export default function Topics() {
  const [q, setQ] = useState("");
  const t = q.trim().toLowerCase();
  const match = n => !t || n.toLowerCase().includes(t) || Object.values(TOPICS[n]).some(v => v.toLowerCase().includes(t));
  return (
    <div>
      <header className="page-head">
        <h1>Topics, explained simply</h1>
        <p className="muted">Every topic used by the questions here, explained like you're 12. Good for a quick revision before an interview.</p>
        <input className="search" placeholder="Search topics, e.g. heap, cache, queue" value={q} onChange={e => setQ(e.target.value)} />
      </header>
      {SECTIONS.map(([title, names]) => {
        const list = names.filter(match);
        if (!list.length) return null;
        return (
          <section key={title} className="topic-section">
            <h2>{title} <span className="count">{list.length}</span></h2>
            <div className="topic-grid">{list.map(n => <TopicCard key={n} name={n} open={!!t} />)}</div>
          </section>
        );
      })}
    </div>
  );
}
