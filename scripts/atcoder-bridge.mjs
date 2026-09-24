// Which AtCoder problems belong inside a DSA path step, and what each one teaches.
//
// Rule: a problem is linked here ONLY when its topic is certain from the contest's own design.
// AtCoder publishes no topic tags, and guessing tags from titles would put problems in the wrong step.
// Everything else goes to More questions → AtCoder, where it is filtered by contest and estimated difficulty.
//
// Sources for the topics:
//   dp_*        Educational DP Contest (atcoder.jp/contests/dp). Every task is a dynamic-programming task by design.
//   practice2_* AtCoder Library Practice Contest (atcoder.jp/contests/practice2). Each task tests one AtCoder
//               Library component; the mapping is in github.com/atcoder/ac-library, test/example/problems.toml.
//
// build-data.mjs checks every id below against the downloaded AtCoder list and warns if one is missing.

// Topic names must exist in lib/topics.js (Fenwick trees are explained under "Segment Tree", as elsewhere in the repo).
export const PRACTICE_TOPICS = {
  dp: ["Dynamic Programming"],
  practice2_a: ["Union-Find"],
  practice2_b: ["Segment Tree"],
  practice2_c: ["Math", "Number Theory"],
  practice2_d: ["Flow Network"],
  practice2_e: ["Flow Network"],
  practice2_f: ["Math", "Divide and Conquer"],
  practice2_g: ["Strongly Connected Component", "Topological Sort"],
  practice2_h: ["Strongly Connected Component"],
  practice2_i: ["String Matching"],
  practice2_j: ["Segment Tree"],
  practice2_k: ["Segment Tree"],
  practice2_l: ["Segment Tree"],
};

// Step id (scripts/sequence.mjs) → [task id, why it belongs in this step].
// Deliberately left out: EDPC tasks that need CP-only tricks (convex hull trick, matrix power, DP + segment tree,
// expected value) and the flow / convolution / 2-SAT library tasks. They stay in More questions → AtCoder.
export const BRIDGE = {
  "dp-1d": [
    ["dp_a", "Frog 1. Cheapest way to reach stone i from i-1 or i-2: the same shape as Min Cost Climbing Stairs, with contest-style input."],
    ["dp_b", "Frog 2. Frog 1 with up to K jumps back. Teaches you to read the constraints: O(N·K) is fine here."],
    ["dp_c", "Vacation. dp[day][activity]: add a small second dimension when the choice today depends on yesterday."],
  ],
  "dp-2d": [
    ["dp_d", "Knapsack 1. The textbook 0/1 knapsack, indexed by weight."],
    ["dp_e", "Knapsack 2. Same problem, but the weight limit is huge: flip the state to index by value instead."],
    ["dp_f", "LCS. Longest common subsequence, and you must print the string itself, not just its length."],
    ["dp_h", "Grid 1. Count paths in a grid with walls, modulo 10^9+7."],
  ],
  "dp-advanced": [
    ["dp_g", "Longest Path. DP on a directed acyclic graph: memoised DFS or topological order."],
    ["dp_i", "Coins. Probability DP: dp[i][heads]."],
    ["dp_k", "Stones. Game DP: a position is winning if some move leads to a losing one."],
    ["dp_l", "Deque. Interval DP for a two-player game."],
    ["dp_n", "Slimes. Interval DP: merge cost over every split point, like Burst Balloons."],
    ["dp_o", "Matching. Bitmask DP over subsets."],
    ["dp_p", "Independent Set. DP on a tree: colour each node, combine children."],
    ["dp_s", "Digit Sum. Digit DP: count numbers up to K digit by digit, with a 'tight' flag."],
  ],
  "graphs-advanced": [
    ["practice2_a", "Disjoint Set Union. Write union-find with path compression and union by size, then check it here."],
    ["practice2_g", "SCC. Strongly connected components, printed in topological order."],
  ],
  "advanced": [
    ["practice2_b", "Fenwick Tree. Point update and range sum in O(log n): the simplest range-query structure."],
    ["practice2_j", "Segment Tree. Point update, range max, and binary search on the tree."],
  ],
};
