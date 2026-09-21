"use client";
import { TOPICS } from "@/lib/topics";

export default function TopicCard({ name, open = false }) {
  const t = TOPICS[name];
  if (!t) return null;
  return (
    <details className="topic" open={open}>
      <summary>{name}</summary>
      <div className="topic-body">
        <p className="topic-story">{t.story}</p>
        <p><strong>What it really is.</strong> {t.idea}</p>
        <p><strong>Spot it when:</strong> {t.spot}</p>
      </div>
    </details>
  );
}
