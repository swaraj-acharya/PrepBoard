// Re-checks every external link in the Problem Solving Lab (resources, case-study sources, reading links)
// and in the system design roadmap (its study resources and each phase's resources).
// Resources move and die; run this now and then:  npm run check-links
import { CHALLENGES, RESOURCES } from "../lib/lab.js";
import { SD_RESOURCES, SD_PHASES } from "../lib/systemDesignPath.js";

const links = new Map();
for (const r of RESOURCES) links.set(r.url, r.name);
for (const c of CHALLENGES) {
  if (c.reveal.source) links.set(c.reveal.source.url, c.reveal.source.name);
  for (const r of c.resourceLinks || []) links.set(r.url, r.name);
}
for (const r of [...SD_RESOURCES, ...SD_PHASES.flatMap(p => p.resources)]) if (!links.has(r.url)) links.set(r.url, r.name);
let bad = 0;
for (const [url, name] of links) {
  let status = "error";
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow", headers: { "user-agent": "PrepBoard link check" }, signal: AbortSignal.timeout(15000) });
    status = res.status;
  } catch (e) { status = e.name === "TimeoutError" ? "timeout" : e.message; }
  const ok = typeof status === "number" && status < 400;
  if (!ok) bad++;
  console.log(`${ok ? "ok  " : "FAIL"} ${status}  ${name}  ${url}`);
}
console.log(`\n${links.size} links, ${bad} failing. Some sites block scripts (403); open those by hand before removing anything.`);
process.exitCode = bad ? 1 : 0;
