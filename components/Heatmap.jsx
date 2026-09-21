"use client";
import { today } from "@/lib/store";

export default function Heatmap({ activity, weeks = 18 }) {
  const start = -(weeks * 7 - 1) - new Date().getDay() + 6;
  const days = Array.from({ length: weeks * 7 }, (_, i) => today(start + i));
  const t = today();
  return (
    <div className="heat" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }} role="img"
      aria-label={`Activity for the last ${weeks} weeks`}>
      {days.map(d => {
        const n = activity[d] || 0;
        const lvl = d > t ? "future" : n === 0 ? 0 : n < 2 ? 1 : n < 4 ? 2 : n < 7 ? 3 : 4;
        return <span key={d} className={`hc h${lvl}`} title={`${d}: ${n}`} />;
      })}
    </div>
  );
}
