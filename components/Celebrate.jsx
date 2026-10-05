"use client";
import { useEffect, useRef, useState } from "react";
import { subscribe, getState, today, streak } from "@/lib/store";

// A small reward when you log something: a toast, a few confetti pieces, and a bigger moment
// when you reach your daily goal or start a streak. It listens to the history log, and only reacts
// to entries written in the last couple of seconds, so loading saved data or syncing from your repo
// folder never triggers it.

const SOLVED = [
  "Nice one. Another down.",
  "That's how it's done.",
  "Momentum is building.",
  "One step closer to the offer.",
  "Clean. Keep going.",
  "Consistency beats intensity.",
];
const TRICKY = [
  "Solved with help still counts. Revision will make it yours.",
  "You got there. It comes back for revision soon.",
];
const REMEMBERED = ["Locked into memory.", "That one's sticking now.", "Revision done. This is the secret sauce."];
const FORGOT = ["Forgetting is part of it. It comes back tomorrow."];
const COLORS = ["#5b7cff", "#4cc08b", "#f5b942", "#ff7a90", "#a595ff"];
const FRESH_MS = 2500, TOAST_MS = 3400;

const pick = list => list[Math.floor(Math.random() * list.length)];
const rand = (a, b) => a + Math.random() * (b - a);

function confetti(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    dx: `${rand(-170, 170).toFixed(0)}px`,
    dy: `${rand(-230, -90).toFixed(0)}px`,
    r: `${rand(-540, 540).toFixed(0)}deg`,
    s: `${rand(6, 11).toFixed(1)}px`,
    d: `${rand(0, 90).toFixed(0)}ms`,
    c: COLORS[i % COLORS.length],
  }));
}

export default function Celebrate() {
  const [toast, setToast] = useState(null);
  const [bits, setBits] = useState([]);
  const seen = useRef(0);
  const timers = useRef([]);

  useEffect(() => {
    const latest = () => {
      const list = getState().log?.[today()] || [];
      return list.length ? list[list.length - 1] : null;
    };
    seen.current = latest()?.t || 0;

    const react = () => {
      const entry = latest();
      if (!entry || entry.t <= seen.current) return;
      seen.current = entry.t;
      if (Date.now() - entry.t > FRESH_MS) return;

      const s = getState();
      const goal = Math.max(1, s.settings?.goal || 3);
      const done = s.activity?.[today()] || 0;
      const run = streak(s.activity || {});
      const id = entry.t;

      let next;
      if (entry.a === "forgot") next = { id, msg: pick(FORGOT), sub: "", big: false, bits: 0 };
      else if (done === goal) next = { id, msg: "Daily goal hit", sub: `${done} of ${goal} done today. Everything extra is a bonus.`, big: true, bits: 70 };
      else if (done === 1 && run > 1) next = { id, msg: `${run} day streak`, sub: "Keep the chain going.", big: true, bits: 50 };
      else {
        const msg = entry.a === "tricky" ? pick(TRICKY) : entry.a === "remembered" ? pick(REMEMBERED) : pick(SOLVED);
        next = { id, msg, sub: done < goal ? `${done} of ${goal} today` : `${done} today, past your goal`, big: false, bits: entry.a === "remembered" ? 18 : 28 };
      }

      timers.current.forEach(clearTimeout);
      setToast(next);
      setBits(confetti(next.bits));
      timers.current = [
        setTimeout(() => setBits([]), 1600),
        setTimeout(() => setToast(null), TOAST_MS + 400),
      ];
    };

    const off = subscribe(react);
    return () => { off(); timers.current.forEach(clearTimeout); };
  }, []);

  return (
    <div className="celebrate" role="status" aria-live="polite">
      {bits.length > 0 && (
        <div className="confetti" key={`c${toast?.id}`} aria-hidden="true">
          {bits.map(b => <i key={b.id} style={{ "--dx": b.dx, "--dy": b.dy, "--r": b.r, "--s": b.s, "--d": b.d, "--c": b.c }} />)}
        </div>
      )}
      {toast && (
        <div className={`toast${toast.big ? " big" : ""}`} key={toast.id}>
          <span className="toast-ico" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          </span>
          <span className="toast-text">
            <strong>{toast.msg}</strong>
            {toast.sub && <small>{toast.sub}</small>}
          </span>
          <span className="toast-timer" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
