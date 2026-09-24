"use client";
// Rating over time from a platform's official history. bands: [[min, name, colour], …] drawn faintly behind the line.
export default function RatingChart({ history, bands = [], label }) {
  if (!history?.length) return null;
  const W = 640, H = 170, L = 40, R = 12, T = 10, B = 22;
  const ts = history.map(h => h.t), rs = history.map(h => h.r);
  const t0 = Math.min(...ts), t1 = Math.max(...ts);
  const lo = Math.max(0, Math.floor((Math.min(...rs) - 100) / 200) * 200), hi = Math.ceil((Math.max(...rs) + 100) / 200) * 200;
  const x = t => (t1 === t0 ? (L + W - R) / 2 : L + ((t - t0) / (t1 - t0)) * (W - L - R));
  const y = r => T + (1 - (r - lo) / (hi - lo)) * (H - T - B);
  const when = t => new Date(t * 1000).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  const last = history.at(-1);
  return (
    <figure className="rchart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${label}: ${history.length} rated contests, from ${history[0].r} to ${last.r}, highest ${Math.max(...rs)}.`}>
        {bands.map(([min, name, color], i) => {
          const next = bands[i + 1]?.[0] ?? Infinity;
          if (next <= lo || min >= hi) return null;
          const top = y(Math.min(next, hi)), bottom = y(Math.max(min, lo));
          return <rect key={name} x={L} y={top} width={W - L - R} height={bottom - top} fill={color} opacity=".13"><title>{name}</title></rect>;
        })}
        {[lo, hi].map(v => <text key={v} x={L - 6} y={y(v) + 4} textAnchor="end" className="rchart-axis">{v}</text>)}
        <text x={L} y={H - 6} className="rchart-axis">{when(t0)}</text>
        <text x={W - R} y={H - 6} textAnchor="end" className="rchart-axis">{when(t1)}</text>
        <polyline fill="none" stroke="var(--ink)" strokeWidth="1.6" points={history.map(h => `${x(h.t)},${y(h.r)}`).join(" ")} />
        {history.map((h, i) => (
          <circle key={i} cx={x(h.t)} cy={y(h.r)} r="3" fill="var(--card)" stroke="var(--ink)" strokeWidth="1.4">
            <title>{`${h.name || h.contest}: ${h.r}${h.perf ? ` (performance ${h.perf})` : ""}, ${new Date(h.t * 1000).toLocaleDateString("en-IN")}`}</title>
          </circle>
        ))}
      </svg>
    </figure>
  );
}
