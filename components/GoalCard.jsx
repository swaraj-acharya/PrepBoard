"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";

// Your big target (default 2,500 coding questions) and when you'll reach it at your daily pace.
export default function GoalCard() {
  const { problems: prog, settings } = useStore();
  const solved = Object.entries(prog).filter(([k, v]) => v.status && !/^(hld|lld|cs):/.test(k)).length;
  const target = settings.target || 2500;
  const left = Math.max(0, target - solved);
  const perDay = Math.max(1, settings.goal || 3);
  const date = new Date(); date.setDate(date.getDate() + Math.ceil(left / perDay));
  return (
    <section className="goalcard">
      <div className="goalcard-top">
        <h2>Goal: {target.toLocaleString("en-IN")} questions</h2>
        <span><strong>{solved.toLocaleString("en-IN")}</strong> <span className="muted">solved</span></span>
      </div>
      <div className="goal-bar big"><span style={{ width: `${Math.min(100, (solved / target) * 100)}%` }} /></div>
      <p className="muted small">
        {left
          ? <>At {perDay} a day you&apos;ll reach it by <strong>{date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong>. Counts every LeetCode, Codeforces and CodeChef question you mark solved. <Link href="/settings">Change your pace or target</Link>.</>
          : <>Goal reached. <Link href="/settings">Set a bigger one</Link>.</>}
      </p>
    </section>
  );
}
