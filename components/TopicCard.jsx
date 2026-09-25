"use client";
import { TOPICS } from "@/lib/topics";
import { conceptLinks } from "@/lib/systemDesignPath";

export default function TopicCard({ name, open = false }) {
  const t = TOPICS[name];
  if (!t) return null;
  const links = conceptLinks(name); // only high-level design concepts have these
  return (
    <details className="topic" open={open}>
      <summary>{name}</summary>
      <div className="topic-body">
        <p className="topic-story">{t.story}</p>
        <p><strong>What it really is.</strong> {t.idea}</p>
        <p><strong>Spot it when:</strong> {t.spot}</p>
        {links && (
          <p className="topic-links small">
            <strong>Builds on:</strong> {links.needs.length ? links.needs.join(", ") : "nothing, start here"}.
            {links.leadsTo.length > 0 && <> <strong>Leads to:</strong> {links.leadsTo.join(", ")}.</>}
            {links.phase && <> <strong>Roadmap:</strong> phase {links.phase.n}, {links.phase.name}.</>}
          </p>
        )}
      </div>
    </details>
  );
}
