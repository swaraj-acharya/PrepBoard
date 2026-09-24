// AtCoder and Codeforces helpers used by the pages. No React here, so everything is easy to test.

// AtCoder's rating colours change every 400 points (same rule as AtCoder Problems' getRatingColor).
export const AC_BANDS = [
  [0, "Gray", "#808080"], [400, "Brown", "#804000"], [800, "Green", "#008000"], [1200, "Cyan", "#00c0c0"],
  [1600, "Blue", "#0000ff"], [2000, "Yellow", "#c0c000"], [2400, "Orange", "#ff8000"], [2800, "Red", "#ff0000"],
];
export const acBand = r => { let b = AC_BANDS[0]; for (const x of AC_BANDS) if (r >= x[0]) b = x; return { min: b[0], name: b[1], color: b[2] }; };
export const acNextBand = r => { const n = AC_BANDS.find(x => x[0] > r); return n ? { min: n[0], name: n[1], color: n[2] } : null; };

// Codeforces rank titles by rating.
export const CF_RANKS = [
  [0, "Newbie"], [1200, "Pupil"], [1400, "Specialist"], [1600, "Expert"], [1900, "Candidate Master"], [2100, "Master"],
  [2300, "International Master"], [2400, "Grandmaster"], [2600, "International Grandmaster"], [3000, "Legendary Grandmaster"],
];
export const cfRank = r => { let b = CF_RANKS[0]; for (const x of CF_RANKS) if (r >= x[0]) b = x; return { min: b[0], name: b[1] }; };
export const cfNextRank = r => { const n = CF_RANKS.find(x => x[0] > r); return n ? { min: n[0], name: n[1] } : null; };

// AtCoder Problems' display formula for its difficulty estimates.
export const clipDifficulty = d => Math.round(d >= 400 ? d : 400 / Math.exp(1 - d / 400));

// Easy / Medium / Hard for the shared difficulty filter, lined up with AtCoder's colour bands:
// Gray and Brown = Easy, Green and Cyan = Medium, Blue and above = Hard.
export const acLevel = clip => (clip < 800 ? "E" : clip < 1600 ? "M" : "H");

// Five-step ladder used by the AtCoder learning path.
export const LADDER = [["Beginner", 0], ["Easy", 400], ["Intermediate", 800], ["Advanced", 1600], ["Expert", 2400]];
export const ladderOf = clip => { let l = LADDER[0][0]; for (const [n, min] of LADDER) if (clip >= min) l = n; return l; };

// No estimate: guess from the problem letter, like Codeforces problems without ratings. Labelled "by letter".
const RATED_TYPES = new Set(["ABC", "ARC", "AGC", "ABC-Like", "ARC-Like", "AGC-Like"]);
export function letterLevel(type, index) {
  if (!RATED_TYPES.has(type)) return null;
  const L = String(index || "").toUpperCase()[0] || "";
  if (type === "ABC" || type === "ABC-Like") return L <= "B" ? "E" : L <= "D" ? "M" : "H";
  if (type === "ARC" || type === "ARC-Like") return L === "A" ? "M" : "H";
  return "H";
}

export const PRACTICE_SHORT = { dp: "EDPC", practice2: "ALPC", typical90: "Typical 90", tdpc: "TDPC" };
export const shortContest = id => PRACTICE_SHORT[id] || String(id).toUpperCase();

export const TYPE_LABEL = {
  ABC: "Beginner Contest (ABC)", ARC: "Regular Contest (ARC)", AGC: "Grand Contest (AGC)",
  "ABC-Like": "Sponsored, ABC level", "ARC-Like": "Sponsored, ARC level", "AGC-Like": "Sponsored, AGC level",
  AHC: "Heuristic Contest (AHC)", Practice: "Practice sets (EDPC, ALPC…)",
};

// Is this contest running right now? AtCoder bans generative AI during live ABC/ARC/AGC
// (info.atcoder.jp/entry/llm-rules-en), so the AI prompts switch off for its problems until it ends.
// A small margin covers clock differences.
export function isLive(contest, now = Date.now()) {
  if (!contest?.start || !contest?.dur) return false;
  if (!["ABC", "ARC", "AGC", "ABC-Like", "ARC-Like", "AGC-Like"].includes(contest.type)) return false;
  const start = contest.start * 1000 - 5 * 60e3, end = (contest.start + contest.dur) * 1000 + 5 * 60e3;
  return now >= start && now <= end;
}

// Codeforces rank colours, for the rating chart.
export const CF_BANDS = [
  [0, "Newbie", "#808080"], [1200, "Pupil", "#008000"], [1400, "Specialist", "#03a89e"], [1600, "Expert", "#0000ff"],
  [1900, "Candidate Master", "#aa00aa"], [2100, "Master", "#ff8c00"], [2300, "International Master", "#ff8c00"],
  [2400, "Grandmaster", "#ff0000"], [2600, "International Grandmaster", "#ff0000"], [3000, "Legendary Grandmaster", "#aa0000"],
];
