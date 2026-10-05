"use client";
import { useEffect, useRef, useState } from "react";

// A number that eases up to its value instead of jumping. Shows the final value straight away
// when the visitor prefers reduced motion.
export default function CountUp({ value, duration = 900, locale = "en-IN" }) {
  const target = Number(value) || 0;
  const [shown, setShown] = useState(0);
  const current = useRef(0);

  useEffect(() => {
    const still = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (still || current.current === target) { current.current = target; setShown(target); return; }
    const from = current.current, t0 = performance.now();
    let raf;
    const tick = now => {
      const p = Math.min(1, (now - t0) / duration);
      current.current = from + (target - from) * (1 - Math.pow(1 - p, 3)); // ease-out cubic
      setShown(Math.round(current.current));
      if (p < 1) raf = requestAnimationFrame(tick); else current.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return <>{shown.toLocaleString(locale)}</>;
}
