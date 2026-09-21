"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { SD_BY_ID, isSD } from "./systemDesign";
import { CS_BY_ID, isCS } from "./cs";
import { resolveTopics } from "./topics";
import { useStore } from "./store";

const cache = new Map();
export function getJSON(path) {
  if (!cache.has(path)) cache.set(path, fetch(path).then(r => { if (!r.ok) throw new Error(path); return r.json(); }));
  return cache.get(path);
}
export function useJSON(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!path) return;
    let live = true;
    setData(null); setError(null);
    getJSON(path).then(d => live && setData(d), e => live && setError(e));
    return () => { live = false; };
  }, [path]);
  return { data, error };
}

// Company data is grouped by first letter (a.json, b.json, …, 0.json for digits). Keep in sync with scripts/build-data.mjs.
export const companyFile = slug => (slug === "_all" ? "_all" : /^[a-z]/.test(slug) ? slug[0] : "0");
export const getCompany = slug => getJSON(`/data/companies/${companyFile(slug)}.json`)
  .then(j => (slug === "_all" ? j : j[slug] || Promise.reject(new Error(`No data for ${slug}`))));
export function useCompany(slug) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!slug) return;
    let live = true;
    setData(null); setError(null);
    getCompany(slug).then(d => live && setData(d), e => live && setError(e));
    return () => { live = false; };
  }, [slug]);
  return { data, error };
}

export const lcUrl = slug => `https://leetcode.com/problems/${slug}/`;
export const DIFF = { E: "Easy", M: "Medium", H: "Hard" };
const cfLevel = (rating, index) => rating ? (rating <= 1200 ? "E" : rating <= 1900 ? "M" : "H") : /^[AB]/.test(index) ? "E" : /^[CD]/.test(index) ? "M" : "H";

// Turn the compact cf.json / cc.json files into lookup maps once.
function buildCF(j) {
  const map = new Map();
  for (const [id, name, rating, tags] of j.items) {
    const m = /^(\d+)(.+)$/.exec(id); if (!m) continue;
    map.set(`cf:${id}`, { contest: m[1], index: m[2], name, rating, tags: tags.map(i => j.tags[i]) });
  }
  return { rated: j.rated, map };
}
function buildCC(j) {
  const map = new Map();
  for (const [code, name, level, rating, tags, ed] of j.items) map.set(`cc:${code}`, { code, name, level, rating, tags: tags.map(i => j.tags[i]), ed });
  return { map };
}

const Ctx = createContext(null);
export function DataProvider({ children }) {
  const { data: problems } = useJSON("/data/problems.json");
  const { data: seq } = useJSON("/data/sequence.json");
  const { problems: prog } = useStore();
  const [extra, setExtra] = useState({ cf: null, cc: null });
  const [wanted, setWanted] = useState({ cf: false, cc: false });

  // Load Codeforces / CodeChef only when a page needs them, or when you've tracked one of their problems.
  const needCF = wanted.cf || Object.keys(prog).some(k => k.startsWith("cf:"));
  const needCC = wanted.cc || Object.keys(prog).some(k => k.startsWith("cc:"));
  useEffect(() => { if (needCF && !extra.cf) getJSON("/data/cf.json").then(j => setExtra(e => ({ ...e, cf: buildCF(j) }))).catch(() => {}); }, [needCF, extra.cf]);
  useEffect(() => { if (needCC && !extra.cc) getJSON("/data/cc.json").then(j => setExtra(e => ({ ...e, cc: buildCC(j) }))).catch(() => {}); }, [needCC, extra.cc]);

  const value = useMemo(() => {
    const patternOf = new Map();
    let n = 0;
    (seq || []).forEach((g, gi) => { for (const s of g.problems) patternOf.set(s, { ...g, step: gi + 1, number: ++n }); });
    return {
      problems, seq, patternOf, cf: extra.cf, cc: extra.cc, ready: !!(problems && seq),
      want: kind => setWanted(w => (w[kind] ? w : { ...w, [kind]: true })),
    };
  }, [problems, seq, extra]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useData = () => useContext(Ctx);

function withTopics(item, tags, extraTopics = []) {
  const { names, unknown } = resolveTopics([...extraTopics, ...tags]);
  return { ...item, tags, topicNames: names.length ? names : ["How to Approach a Problem"], unknownTags: unknown };
}

// One shape for every question, whatever the platform.
export function resolveItem(id, data) {
  if (isSD(id)) {
    const q = SD_BY_ID[id];
    if (!q) return null;
    return {
      id, kind: q.kind, title: q.title, name: q.title, level: q.level, levelLabel: DIFF[q.level],
      platform: q.ref.platform, url: q.ref.url, from: q.from, more: q.more,
      concepts: q.concepts, tags: [], topicNames: q.concepts, unknownTags: [],
    };
  }
  if (isCS(id)) {
    const q = CS_BY_ID[id];
    if (!q) return null;
    return { ...q, name: q.title, levelLabel: DIFF[q.level], platform: "Prepboard question bank", url: null, topicNames: q.concepts, unknownTags: [], tags: [], more: [] };
  }
  if (id.startsWith("cf:")) {
    const p = data?.cf?.map.get(id);
    const code = id.slice(3);
    const m = /^(\d+)(.+)$/.exec(code) || [];
    const base = {
      id, kind: "dsa", platform: "Codeforces", code,
      url: `https://codeforces.com/problemset/problem/${m[1]}/${m[2]}`, editorial: `https://codeforces.com/contest/${m[1]}`,
      title: p ? `${code}. ${p.name}` : code, name: p?.name || code, rating: p?.rating || 0,
      level: cfLevel(p?.rating, m[2] || ""), more: [],
    };
    base.levelLabel = base.rating ? `${DIFF[base.level]} (${base.rating})` : DIFF[base.level];
    return withTopics(base, p?.tags || []);
  }
  if (id.startsWith("cc:")) {
    const p = data?.cc?.map.get(id);
    const code = id.slice(3);
    const base = {
      id, kind: "dsa", platform: "CodeChef", code,
      url: `https://www.codechef.com/problems/${code}`,
      editorial: p?.ed ? (p.ed.startsWith("http") ? p.ed : `https://discuss.codechef.com/problems/${p.ed}`) : `https://discuss.codechef.com/search?q=${code}`,
      title: p ? p.name : code, name: p?.name || code, rating: p?.rating || 0, level: p?.level || "M", more: [],
    };
    base.levelLabel = base.rating ? `${DIFF[base.level]} (${base.rating})` : DIFF[base.level];
    return withTopics(base, p?.tags || []);
  }
  const p = data?.problems?.[id] || {};
  const pattern = data?.patternOf?.get(id);
  const item = {
    id, kind: "dsa", title: p.n ? `${p.n}. ${p.t || id}` : (p.t || id), name: p.t || id, level: p.d, levelLabel: DIFF[p.d],
    platform: "LeetCode", url: lcUrl(id), editorial: `${lcUrl(id)}solutions/`, more: [], pattern, premium: !!p.p, number: p.n, category: p.c,
    freeStatement: p.s ? `https://github.com/doocs/leetcode/blob/main/solution/${p.s}/README_EN.md` : null,
  };
  return withTopics(item, p.g || [], pattern?.topics || []);
}
export function useItem(id) {
  const data = useData();
  return useMemo(() => resolveItem(id, data), [id, data]);
}
