// Teaching content for the Patterns page (/patterns). lib/patterns.js says WHEN a pattern applies;
// this file says WHAT it is, with a story, a worked example and a code template.
// Code is Python-style pseudo-code so the idea stays readable. The copy-prompt asks the AI for your own language.
import { PATTERNS, parseEntry } from "./patterns.js";
import { PATH_PATTERNS } from "./patternMap.js";

export const GROUPS = [
  ["Numbers and bits", ["simulation", "math-digits", "number-theory", "combinatorics-math", "bit-manipulation", "xor-trick"]],
  ["Arrays and strings", ["hash-lookup", "frequency-count", "prefix-sum", "prefix-hash", "two-pointers-opposite", "two-pointers-same", "sliding-window-fixed", "sliding-window-variable", "kadane", "boyer-moore", "index-marking", "matrix-traversal", "sort-then-scan", "palindrome-expand", "string-matching"]],
  ["Searching", ["binary-search-index", "binary-search-answer"]],
  ["Greedy and intervals", ["greedy", "intervals"]],
  ["Stacks, queues and heaps", ["monotonic-stack", "stack-matching", "monotonic-deque", "heap-topk", "two-heaps", "k-way-merge"]],
  ["Linked lists", ["fast-slow", "linked-list-pointer"]],
  ["Recursion and backtracking", ["recursion-divide", "backtracking-subsets", "meet-in-middle"]],
  ["Trees", ["tree-dfs-recursion", "tree-bfs-level", "tree-construct", "bst-inorder", "lca", "tree-to-graph"]],
  ["Graphs", ["grid-dfs-bfs", "bfs-shortest", "graph-traversal", "graph-coloring", "topo-sort", "union-find", "dijkstra", "bellman-ford-dp", "mst", "euler-path", "bridges-tarjan"]],
  ["Dynamic programming", ["dp-linear", "dp-knapsack", "dp-grid", "dp-string-two", "dp-interval", "dp-lis", "dp-state-machine", "dp-tree", "dp-bitmask", "game-minimax-dp"]],
  ["Advanced structures and design", ["trie", "segment-tree-bit", "ordered-set", "design-ds", "design-time-versioned", "randomized", "merge-sort-count"]],
];
export const groupOf = key => GROUPS.find(([, keys]) => keys.includes(key))?.[0];

// "If the statement says this, think of that." Each row links to a lesson.
export const QUICK = [
  ["Find a pair that adds up to a target (unsorted array)", "hash-lookup"],
  ["Same pair question, but the array is sorted", "two-pointers-opposite"],
  ["Anagram, same letters, count of each character", "frequency-count"],
  ["Many range-sum queries on a fixed array", "prefix-sum"],
  ["Count subarrays with sum k (negative numbers allowed)", "prefix-hash"],
  ["Longest or shortest subarray / substring that satisfies a rule", "sliding-window-variable"],
  ["Something about every window of exactly k elements", "sliding-window-fixed"],
  ["Maximum of every window of size k", "monotonic-deque"],
  ["Sorted or rotated array, or \"O(log n)\" is required", "binary-search-index"],
  ["\"Minimum possible maximum\", smallest speed / capacity that works", "binary-search-answer"],
  ["Next greater or smaller element, days until a warmer day", "monotonic-stack"],
  ["Brackets, nesting, decode a string, undo", "stack-matching"],
  ["k-th largest, top k frequent, k closest", "heap-topk"],
  ["Median of a stream of numbers", "two-heaps"],
  ["Merge k sorted lists / arrays", "k-way-merge"],
  ["Cycle in a list, middle of a list", "fast-slow"],
  ["Reverse, reorder or rotate a linked list", "linked-list-pointer"],
  ["Numbers are 1..n, find missing or duplicate in O(1) space", "index-marking"],
  ["Maximum sum of a contiguous subarray", "kadane"],
  ["An element that appears more than n/2 times", "boyer-moore"],
  ["Everything appears twice except one", "xor-trick"],
  ["Return ALL subsets / permutations / combinations", "backtracking-subsets"],
  ["Islands, connected regions, flood fill on a grid", "grid-dfs-bfs"],
  ["Minimum number of steps / moves, all moves cost the same", "bfs-shortest"],
  ["Prerequisites, dependencies, order of tasks", "topo-sort"],
  ["Are these connected? Merge groups, find the redundant edge", "union-find"],
  ["Cheapest route when edges have different costs", "dijkstra"],
  ["Cheapest route with at most k stops", "bellman-ford-dp"],
  ["Connect everything with the least total cost", "mst"],
  ["Depth, height, or best path in a binary tree", "tree-dfs-recursion"],
  ["Level by level, right-side view of a tree", "tree-bfs-level"],
  ["Binary search tree: k-th smallest, validate, range", "bst-inorder"],
  ["\"Number of ways\", or best cost where each step depends on the last few", "dp-linear"],
  ["Reach an exact sum / fewest coins / split into equal halves", "dp-knapsack"],
  ["Two strings: common subsequence, edit distance, matching", "dp-string-two"],
  ["Longest increasing / nested / chain", "dp-lis"],
  ["Buy and sell stock with limits or cooldown", "dp-state-machine"],
  ["n is at most about 20 and you must remember which items are used", "dp-bitmask"],
  ["Two players take turns and both play perfectly", "game-minimax-dp"],
  ["Words with a common prefix, autocomplete", "trie"],
  ["Range query AND updates on the same array", "segment-tree-bit"],
  ["\"Design a class\" with every operation in O(1)", "design-ds"],
  ["Count ways modulo 1,000,000,007 with a huge n", "combinatorics-math"],
];

// Constraints tell you the speed you are allowed. Read them BEFORE you read the story.
export const LIMITS = [
  ["n ≤ 10 to 20", "Exponential is fine: backtracking, bitmask DP, trying every subset."],
  ["n ≤ 40", "Meet in the middle (2^20 + 2^20)."],
  ["n ≤ 500", "O(n³) is fine: interval DP, Floyd-Warshall."],
  ["n ≤ 5,000", "O(n²) is fine: two-string DP, grid DP, pairs."],
  ["n ≤ 100,000", "You need about O(n log n): sorting, heaps, binary search, sliding window, stack."],
  ["n ≤ 1,000,000", "Aim for O(n), or O(n log n) with a small constant."],
  ["n up to 10⁹ or 10¹⁸", "No loop over n. Think maths, formula, fast power, or binary search on the answer."],
];

export const GUIDE = {
  // ===================== Numbers and bits =====================
  "simulation": {
    story: "It's like following a recipe exactly. The problem tells you every step, so your only job is to do the steps in the right order without skipping or repeating one.",
    eg: { q: "FizzBuzz for n = 5: print Fizz for multiples of 3, Buzz for multiples of 5, FizzBuzz for both, otherwise the number.", steps: ["i = 1 → not divisible by 3 or 5 → print 1", "i = 2 → print 2", "i = 3 → divisible by 3 → Fizz", "i = 4 → print 4", "i = 5 → divisible by 5 → Buzz"], a: "1, 2, Fizz, 4, Buzz. Check the \"both\" case (15) FIRST, otherwise it prints Fizz and stops." },
    code: `out = []
for i in range(1, n + 1):
    if i % 15 == 0: out.append("FizzBuzz")   # the both-case goes first
    elif i % 3 == 0: out.append("Fizz")
    elif i % 5 == 0: out.append("Buzz")
    else: out.append(str(i))`,
  },
  "math-digits": {
    story: "A number is a row of digit-coins. n % 10 picks up the last coin, and n / 10 throws it away. Keep doing that and you meet every digit once.",
    eg: { q: "Reverse the digits of 1203.", steps: ["rev = 0, n = 1203. Last digit 3 → rev = 3, n = 120", "Last digit 0 → rev = 30, n = 12", "Last digit 2 → rev = 302, n = 1", "Last digit 1 → rev = 3021, n = 0. Stop."], a: "3021. In real problems check for overflow before rev * 10 + d." },
    code: `rev = 0
while n > 0:
    d = n % 10          # grab the last digit
    rev = rev * 10 + d  # glue it on the other side
    n //= 10            # throw it away`,
  },
  "number-theory": {
    story: "The GCD is the biggest square tile that can cover a floor of any size with no cutting. A prime is a number nobody else can divide. A sieve is a strainer: cross out every multiple of each prime and only primes fall through.",
    eg: { q: "Find gcd(48, 18).", steps: ["48 % 18 = 12 → now find gcd(18, 12)", "18 % 12 = 6 → now find gcd(12, 6)", "12 % 6 = 0 → the remainder is 0, so stop"], a: "6. The last non-zero number is the GCD." },
    code: `def gcd(a, b):
    while b: a, b = b, a % b
    return a

# sieve: all primes up to n
is_p = [True] * (n + 1); is_p[0] = is_p[1] = False
for p in range(2, int(n ** 0.5) + 1):
    if is_p[p]:
        for m in range(p * p, n + 1, p): is_p[m] = False`,
  },
  "combinatorics-math": {
    story: "You have 3 shirts and 2 pairs of trousers: 3 × 2 = 6 outfits. When choices don't affect each other you multiply, instead of listing every outfit one by one.",
    eg: { q: "How many ways to go from the top-left to the bottom-right of a 3×3 grid if you can only move right or down?", steps: ["You must make 2 moves right and 2 moves down = 4 moves in total", "A path is just the choice of WHICH 2 of the 4 moves are \"right\"", "That is C(4, 2) = (4 × 3) / (2 × 1) = 6"], a: "6 paths. For a huge n, use fast power and a modular inverse for the division." },
    code: `MOD = 10**9 + 7
def power(b, e):                  # fast power
    r = 1
    while e:
        if e & 1: r = r * b % MOD
        b = b * b % MOD; e >>= 1
    return r
def inverse(x): return power(x, MOD - 2)   # for dividing under a prime MOD`,
  },
  "bit-manipulation": {
    story: "Think of a row of light switches, each one ON or OFF. Some tricks flip one switch or find the lowest ON switch, all in a single step, because the computer already stores numbers as switches.",
    eg: { q: "Count the set bits in 13 (binary 1101).", steps: ["n = 1101. n & (n−1) = 1101 & 1100 = 1100 → count 1 (lowest ON switch removed)", "n = 1100. n & (n−1) = 1100 & 1011 = 1000 → count 2", "n = 1000. n & (n−1) = 0 → count 3"], a: "3. The same trick tests a power of two: n > 0 and n & (n−1) == 0." },
    code: `count = 0
while n:
    n &= n - 1        # clear the lowest set bit
    count += 1
# useful: n & -n = lowest set bit,  1 << i = mask for bit i,
#         (n >> i) & 1 = is bit i on?`,
  },
  "xor-trick": {
    story: "Imagine a magic washing machine where two identical socks vanish when they meet. Throw in every sock and what's left is the one without a twin.",
    eg: { q: "Every number appears twice except one. Find it in [4, 1, 2, 1, 2].", steps: ["0 ^ 4 = 4", "4 ^ 1 = 5", "5 ^ 2 = 7", "7 ^ 1 = 6 (the first 1 cancels)", "6 ^ 2 = 4 (the first 2 cancels)"], a: "4, using O(1) extra space. It only works because the extra copies come in pairs." },
    code: `x = 0
for v in a:
    x ^= v        # a ^ a = 0 and a ^ 0 = a
return x`,
  },

  // ===================== Arrays and strings =====================
  "hash-lookup": {
    story: "Think of a school register. Say a roll number and the teacher instantly tells you the name, without reading the whole list. The map is your register of everything you've already met.",
    eg: { q: "Two Sum: in [2, 7, 11, 15] find two numbers that add up to 9.", steps: ["x = 2. You need 9 − 2 = 7. Is 7 in the map? The map is empty → no. Store {2: index 0}", "x = 7. You need 9 − 7 = 2. Is 2 in the map? Yes, at index 0!"], a: "Indices [0, 1]. One pass instead of checking every pair." },
    code: `seen = {}
for i, x in enumerate(nums):
    if target - x in seen:
        return [seen[target - x], i]
    seen[x] = i          # store AFTER you check`,
  },
  "frequency-count": {
    story: "Two bags of Scrabble tiles. If both bags contain exactly the same tiles you can rearrange one into the other, so you just count the tiles.",
    eg: { q: "Are \"listen\" and \"silent\" anagrams?", steps: ["Count \"listen\": l1 i1 s1 t1 e1 n1", "Count \"silent\": s1 i1 l1 e1 n1 t1", "Compare the two count tables"], a: "Yes, the counts match. To group many words, use the sorted word (\"eilnst\") or the count table as the map key." },
    code: `from collections import Counter
def is_anagram(a, b): return Counter(a) == Counter(b)

groups = {}
for w in words:
    groups.setdefault("".join(sorted(w)), []).append(w)`,
  },
  "prefix-sum": {
    story: "A car's odometer. How far did you drive between km 20 and km 50? Read the odometer at 50 and subtract the reading at 20. You never need to drive it again.",
    eg: { q: "For [3, 1, 4, 1, 5], what is the sum of indices 1 to 3?", steps: ["Build prefix sums: pre = [0, 3, 4, 8, 9, 14]  (pre[i] = sum of the first i numbers)", "sum(1..3) = pre[4] − pre[1]", "= 9 − 3 = 6   (that is 1 + 4 + 1)"], a: "6, and every later query is O(1)." },
    code: `pre = [0]
for x in nums: pre.append(pre[-1] + x)
def range_sum(l, r):            # inclusive l..r
    return pre[r + 1] - pre[l]`,
  },
  "prefix-hash": {
    story: "The odometer again, but now the question is \"how many trips of exactly 7 km did I make?\". Any earlier odometer reading that is exactly 7 less than now marks the start of a 7 km trip. So remember how often each reading has happened.",
    eg: { q: "How many subarrays of [1, 2, 3] have sum 3?", steps: ["map = {0: 1}, running = 0", "x = 1 → running = 1. Need 1 − 3 = −2 → 0 earlier. map {0:1, 1:1}", "x = 2 → running = 3. Need 3 − 3 = 0 → 1 earlier (subarray [1,2]). map {0:1, 1:1, 3:1}", "x = 3 → running = 6. Need 6 − 3 = 3 → 1 earlier (subarray [3])"], a: "2 subarrays. Works with negative numbers, where a sliding window fails." },
    code: `count = {0: 1}; run = 0; ans = 0
for x in nums:
    run += x
    ans += count.get(run - k, 0)      # earlier prefixes that give sum k
    count[run] = count.get(run, 0) + 1`,
  },
  "two-pointers-opposite": {
    story: "Two kids stand at the two ends of a plank and walk towards each other. At each step you decide which kid should move, based on whether the answer is too big or too small.",
    eg: { q: "In the sorted array [1, 3, 4, 6, 9] find two numbers that add up to 7.", steps: ["l = 0 (1), r = 4 (9): sum 10 is too big → move the right pointer left", "l = 0 (1), r = 3 (6): sum 7 → found!"], a: "(1, 6). Because the array is sorted, a too-big sum can only be fixed by making the right number smaller." },
    code: `l, r = 0, len(a) - 1
while l < r:
    s = a[l] + a[r]
    if s == target: return (l, r)
    if s < target: l += 1      # need a bigger sum
    else: r -= 1               # need a smaller sum`,
  },
  "two-pointers-same": {
    story: "A reader walks along a shelf reading every book. A second helper walks behind, and only puts the books that pass the check onto the next free spot of the same shelf.",
    eg: { q: "Move all zeroes to the end of [0, 1, 0, 3], in place.", steps: ["write = 0. Read 0 → skip", "Read 1 → a[0] = 1, write = 1", "Read 0 → skip", "Read 3 → a[1] = 3, write = 2", "Fill the rest from index 2 with zeroes"], a: "[1, 3, 0, 0] using O(1) extra space." },
    code: `w = 0
for r in range(len(a)):
    if a[r] != 0:          # keep this one
        a[w] = a[r]; w += 1
for i in range(w, len(a)): a[i] = 0`,
  },
  "sliding-window-fixed": {
    story: "You look out of a train window. Every second one tree appears on the right and one leaves on the left. You don't count all the trees again, you just adjust the count.",
    eg: { q: "Largest sum of any 3 neighbours in [2, 1, 5, 1, 3, 2].", steps: ["First window 2 + 1 + 5 = 8", "Slide: + 1 − 2 = 7", "Slide: + 3 − 1 = 9", "Slide: + 2 − 5 = 6"], a: "9 (the window 5, 1, 3). Each slide costs O(1)." },
    code: `cur = sum(a[:k]); best = cur
for i in range(k, len(a)):
    cur += a[i] - a[i - k]      # add the new one, drop the old one
    best = max(best, cur)`,
  },
  "sliding-window-variable": {
    story: "A stretchy rubber band around some beads. Stretch the right side to grab more beads. The moment the rule breaks, pull the left side in until the rule is true again. The band never needs to go backwards.",
    eg: { q: "Longest substring without repeating characters in \"abcabcbb\".", steps: ["Grow right: \"a\", \"ab\", \"abc\" → length 3", "Next letter is a second \"a\" → the rule breaks, so move left past the first \"a\" → window \"bca\"", "Keep going the same way. The window never gets longer than 3."], a: "3. Each pointer only moves forward, so it is O(n). It needs the \"adding never hurts, removing helps\" property: with negative numbers use prefix sums." },
    code: `seen = {}; l = 0; best = 0
for r, ch in enumerate(s):
    if ch in seen and seen[ch] >= l:
        l = seen[ch] + 1          # jump left edge past the duplicate
    seen[ch] = r
    best = max(best, r - l + 1)`,
  },
  "kadane": {
    story: "You walk along a path picking up coins (some steps cost you coins). At every step ask: \"Is my bag better if I keep carrying what I have, or if I drop it and start fresh right here?\"",
    eg: { q: "Maximum subarray sum of [-2, 1, -3, 4, -1, 2, 1, -5, 4].", steps: ["-2 → current -2", "1 → max(1, -2 + 1) = 1 (restart)", "-3 → max(-3, 1 - 3) = -2", "4 → max(4, -2 + 4) = 4 (restart)", "-1 → 3, then 2 → 5, then 1 → 6 (best so far 6)", "-5 → 1, then 4 → 5. Best stays 6"], a: "6, from the subarray [4, -1, 2, 1]." },
    code: `cur = best = a[0]
for x in a[1:]:
    cur = max(x, cur + x)       # extend the run or restart here
    best = max(best, cur)`,
  },
  "boyer-moore": {
    story: "An election where every vote for someone else cancels one of your votes. If one person really has more than half of all votes, they still have votes left at the end.",
    eg: { q: "Find the majority element of [2, 2, 1, 1, 1, 2, 2].", steps: ["2 → candidate 2, count 1", "2 → count 2", "1 → count 1, then 1 → count 0", "1 → count was 0, so candidate becomes 1, count 1", "2 → count 0, then 2 → candidate 2, count 1"], a: "2 (it appears 4 of 7 times). If a majority isn't guaranteed, count the candidate in a second pass." },
    code: `cand, cnt = None, 0
for x in a:
    if cnt == 0: cand = x
    cnt += 1 if x == cand else -1
return cand`,
  },
  "index-marking": {
    story: "There are n chairs numbered 1 to n and n kids with numbers 1 to n. Tell every kid to sit in the chair with their own number. Any chair that holds the wrong kid shows which number is missing.",
    eg: { q: "First missing positive in [3, 4, -1, 1].", steps: ["a[0] = 3 belongs at index 2 → swap → [-1, 4, 3, 1]", "a[1] = 4 belongs at index 3 → swap → [-1, 1, 3, 4]", "a[1] = 1 belongs at index 0 → swap → [1, -1, 3, 4]", "-1 doesn't belong anywhere, 3 and 4 are already home", "Scan: index 1 should hold 2 but holds -1"], a: "2. Time O(n), space O(1)." },
    code: `n = len(a)
for i in range(n):
    while 1 <= a[i] <= n and a[a[i] - 1] != a[i]:
        j = a[i] - 1
        a[i], a[j] = a[j], a[i]       # send it to its own chair
for i in range(n):
    if a[i] != i + 1: return i + 1
return n + 1`,
  },
  "matrix-traversal": {
    story: "A grid is a page of a book with rows and columns. Reading in a spiral or turning the page a quarter turn is only about having a clear rule for where to step next.",
    eg: { q: "Rotate [[1, 2], [3, 4]] by 90° clockwise.", steps: ["Transpose (swap rows and columns): [[1, 3], [2, 4]]", "Reverse each row: [[3, 1], [4, 2]]"], a: "[[3, 1], [4, 2]]. Transpose + reverse rows = rotate clockwise." },
    code: `n = len(m)
for i in range(n):
    for j in range(i + 1, n):
        m[i][j], m[j][i] = m[j][i], m[i][j]    # transpose
for row in m: row.reverse()                    # mirror each row`,
  },
  "sort-then-scan": {
    story: "Line kids up by height. After that, the two kids closest in height are always standing next to each other, so you only ever compare neighbours.",
    eg: { q: "Smallest difference between any two numbers in [9, 1, 6, 4].", steps: ["Sort → [1, 4, 6, 9]", "Gaps between neighbours: 3, 2, 3"], a: "2. Without sorting you would compare every pair (O(n²)). Sorting costs O(n log n) and the scan is O(n)." },
    code: `a.sort()
best = min(a[i + 1] - a[i] for i in range(len(a) - 1))`,
  },
  "palindrome-expand": {
    story: "A palindrome reads the same in a mirror. Put a mirror on a letter (or between two letters) and push outwards while both sides match. Where the match stops, you have the biggest palindrome around that mirror.",
    eg: { q: "Longest palindromic substring of \"babad\".", steps: ["Mirror on index 1 (\"a\"): b = b → \"bab\", then the string ends", "Mirror on index 2 (\"b\"): a = a → \"aba\", then b ≠ d", "No other mirror gives length 3 or more"], a: "\"bab\" (or \"aba\"). 2n − 1 mirrors, each expands at most n steps → O(n²)." },
    code: `def expand(l, r):
    while l >= 0 and r < len(s) and s[l] == s[r]:
        l -= 1; r += 1
    return s[l + 1:r]
best = ""
for i in range(len(s)):
    for cand in (expand(i, i), expand(i, i + 1)):   # odd and even centres
        if len(cand) > len(best): best = cand`,
  },
  "string-matching": {
    story: "You look for a short word inside a long sentence. A beginner restarts at the next letter after every miss. A smart reader remembers how much of the word already matched and jumps ahead.",
    eg: { q: "Is \"cdeab\" a rotation of \"abcde\"?", steps: ["Glue the first string to itself: \"abcdeabcde\"", "Search for \"cdeab\" inside it. It starts at index 2.", "Same length and found → yes"], a: "Yes. Rotations of A are exactly the substrings of A + A that have the same length." },
    code: `def is_rotation(a, b):
    return len(a) == len(b) and b in a + a

# KMP: prefix[i] = length of the longest proper prefix of p[:i+1] that is also its suffix
def prefix_table(p):
    f = [0] * len(p); k = 0
    for i in range(1, len(p)):
        while k and p[i] != p[k]: k = f[k - 1]
        if p[i] == p[k]: k += 1
        f[i] = k
    return f`,
  },

  // ===================== Searching =====================
  "binary-search-index": {
    story: "\"Guess my number from 1 to 100.\" You say 50 and I say \"higher\". Now you can forget 1 to 50 forever. Each guess throws away half of the possibilities.",
    eg: { q: "Find 7 in [1, 3, 5, 7, 9, 11].", steps: ["lo = 0, hi = 5 → mid = 2 (value 5) < 7 → lo = 3", "lo = 3, hi = 5 → mid = 4 (value 9) > 7 → hi = 3", "lo = 3, hi = 3 → mid = 3 (value 7) → found"], a: "Index 3, in 3 looks instead of 4. For a million items it is about 20 looks." },
    code: `lo, hi = 0, len(a) - 1
while lo <= hi:
    mid = lo + (hi - lo) // 2
    if a[mid] == target: return mid
    if a[mid] < target: lo = mid + 1
    else: hi = mid - 1
return -1`,
  },
  "binary-search-answer": {
    story: "You want the slowest reading speed that still finishes your book before the exam. Try a speed. If you finish in time, try slower. If not, go faster. You are searching through speeds, not through a list.",
    eg: { q: "Koko eats from piles [3, 6, 7, 11] and has h = 8 hours. What is the smallest bananas-per-hour speed k?", steps: ["Try k = 6: hours = 1 + 1 + 2 + 2 = 6 ≤ 8 → works, try smaller", "Try k = 3: hours = 1 + 2 + 3 + 4 = 10 > 8 → too slow, go up", "Try k = 5: hours = 1 + 2 + 2 + 3 = 8 → works", "Try k = 4: hours = 1 + 2 + 2 + 3 = 8 → works. k = 3 failed, so stop"], a: "4. The check \"can she finish at speed k?\" is a simple loop, and a faster speed never makes it worse. That is the sign for this pattern." },
    code: `def feasible(k): return sum((p + k - 1) // k for p in piles) <= h
lo, hi = 1, max(piles)
while lo < hi:
    mid = (lo + hi) // 2
    if feasible(mid): hi = mid        # works, try smaller
    else: lo = mid + 1
return lo`,
  },

  // ===================== Greedy and intervals =====================
  "greedy": {
    story: "When you give change you grab the biggest coin that fits, again and again. It's fast because you never look back. It only works if grabbing the best-looking option now can never ruin things later.",
    eg: { q: "Jump Game: can you reach the last index of [2, 3, 1, 1, 4]?", steps: ["farthest = 0", "i = 0: farthest = max(0, 0 + 2) = 2", "i = 1: farthest = max(2, 1 + 3) = 4 → already at the last index"], a: "True. Just track the farthest reachable index. Fail if you ever stand beyond it." },
    code: `far = 0
for i, step in enumerate(nums):
    if i > far: return False       # can't even reach this spot
    far = max(far, i + step)
return True`,
  },
  "intervals": {
    story: "Meetings on a school timetable. Sort them by start time. Each meeting then either overlaps the previous one (glue them together) or it doesn't (start a new block).",
    eg: { q: "Merge [[1, 3], [2, 6], [8, 10]].", steps: ["Already sorted by start", "[2, 6] starts at 2, which is ≤ the end of [1, 3] → overlap → [1, 6]", "[8, 10] starts at 8, which is > 6 → separate block"], a: "[[1, 6], [8, 10]]. Variants: sort by END to keep the most meetings, or sweep +1 / −1 events to find the busiest moment." },
    code: `intervals.sort()
out = [intervals[0]]
for s, e in intervals[1:]:
    if s <= out[-1][1]: out[-1][1] = max(out[-1][1], e)   # overlap
    else: out.append([s, e])`,
  },

  // ===================== Stacks, queues and heaps =====================
  "monotonic-stack": {
    story: "Think of a pile of days that are still waiting for a warmer day. When a warmer day arrives, it answers every colder day on top of the pile at once, and those days leave the pile.",
    eg: { q: "For each number in [3, 1, 2, 5] find the next greater number to its right.", steps: ["Push 3 (index 0)", "1 < 3 → push 1", "2 > 1 → pop 1: its answer is 2. 2 < 3 → push 2", "5 > 2 → pop 2: answer 5. 5 > 3 → pop 3: answer 5. Push 5", "5 stays on the stack → no greater number → −1"], a: "[5, 2, 5, −1]. Each element is pushed once and popped once, so it is O(n)." },
    code: `ans = [-1] * len(a); st = []         # st holds indices; their values decrease
for i, x in enumerate(a):
    while st and a[st[-1]] < x:
        ans[st.pop()] = x            # x is the next greater for these
    st.append(i)`,
  },
  "stack-matching": {
    story: "A stack of plates: you can only touch the top plate. Brackets work the same way: the last bracket you opened must be the first one you close.",
    eg: { q: "Is \"{[()]}\" valid? And \"(]\"?", steps: ["Push {, push [, push (", "See ) → top is ( → match, pop. See ] → top is [ → match, pop. See } → top is { → match, pop", "Stack is empty at the end → valid", "\"(]\": push (, then ] arrives but the top is ( → mismatch → invalid"], a: "\"{[()]}\" is valid, \"(]\" is not." },
    code: `pair = {')': '(', ']': '[', '}': '{'}
st = []
for ch in s:
    if ch in pair:
        if not st or st.pop() != pair[ch]: return False
    else:
        st.append(ch)
return not st            # leftovers mean unclosed brackets`,
  },
  "monotonic-deque": {
    story: "A queue where a strong person pushes weaker people out from the back, because those weaker people will never be \"the best\" while the strong one is still there. The person at the front is always the strongest still in range.",
    eg: { q: "Maximum of each window of size 3 in [1, 3, -1, -3, 5].", steps: ["Window [1, 3, -1]: deque keeps 3, −1 (1 was pushed out by 3) → max 3", "Window [3, -1, -3]: deque keeps 3, −1, −3 → max 3", "Window [-1, -3, 5]: 5 pushes out −1 and −3, and 3 has left the window → max 5"], a: "[3, 3, 5] in O(n). The deque stores indices so you can drop the ones that left the window." },
    code: `from collections import deque
dq = deque(); out = []             # indices; values decrease
for i, x in enumerate(a):
    while dq and a[dq[-1]] <= x: dq.pop()   # weaker ones are useless now
    dq.append(i)
    if dq[0] <= i - k: dq.popleft()          # front left the window
    if i >= k - 1: out.append(a[dq[0]])`,
  },
  "heap-topk": {
    story: "A VIP list that has room for only k people. A new guest gets in only if they're better than the weakest VIP, who then gets kicked out. The heap tells you who the weakest VIP is instantly.",
    eg: { q: "Find the 2nd largest in [5, 1, 9, 3, 7].", steps: ["Keep a min-heap of size 2: add 5 → [5]; add 1 → [1, 5]", "9: heap is full and 9 > smallest (1) → remove 1, add 9 → [5, 9]", "3: 3 < smallest (5) → ignore", "7: 7 > 5 → remove 5, add 7 → [7, 9]"], a: "7, the top of the heap. O(n log k) instead of sorting everything." },
    code: `import heapq
h = []
for x in a:
    heapq.heappush(h, x)
    if len(h) > k: heapq.heappop(h)     # kick out the smallest
return h[0]                             # k-th largest`,
  },
  "two-heaps": {
    story: "Split a class by height into a short half and a tall half. If you always know the tallest of the short kids and the shortest of the tall kids, the middle kid is right between them.",
    eg: { q: "Running median of the stream 5, 2, 8.", steps: ["Add 5 → low {5}, high {} → median 5", "Add 2 → low {2}, high {5} → median (2 + 5) / 2 = 3.5", "Add 8 → low {2, 5}, high {8} → median = top of low = 5"], a: "5, 3.5, 5. The low half is a max-heap and the high half is a min-heap, kept equal in size (or low is one bigger)." },
    code: `import heapq
low, high = [], []            # low: max-heap (store negatives), high: min-heap
def add(x):
    heapq.heappush(low, -x)
    heapq.heappush(high, -heapq.heappop(low))
    if len(high) > len(low):
        heapq.heappush(low, -heapq.heappop(high))
def median():
    return -low[0] if len(low) > len(high) else (-low[0] + high[0]) / 2`,
  },
  "k-way-merge": {
    story: "k checkout lines, and you want to serve people in order of the smallest ticket number. You only ever need to look at the person at the front of each line. Serve the smallest, then bring forward the next person in that line.",
    eg: { q: "Merge [1, 4], [2, 3] and [0, 9].", steps: ["Heap holds the front of each list: 1, 2, 0 → take 0, bring in 9", "Heap: 1, 2, 9 → take 1, bring in 4", "Take 2, bring in 3. Take 3. Take 4. Take 9"], a: "[0, 1, 2, 3, 4, 9]. Each of the N items costs O(log k), so O(N log k)." },
    code: `import heapq
h = [(lst[0], i, 0) for i, lst in enumerate(lists) if lst]
heapq.heapify(h); out = []
while h:
    val, i, j = heapq.heappop(h)
    out.append(val)
    if j + 1 < len(lists[i]):
        heapq.heappush(h, (lists[i][j + 1], i, j + 1))`,
  },

  // ===================== Linked lists =====================
  "fast-slow": {
    story: "Two runners on a track, one twice as fast. On a circular track the fast one eventually laps the slow one and they meet. On a straight road the fast one just reaches the end.",
    eg: { q: "Does 1 → 2 → 3 → 4 → (back to 2) have a cycle?", steps: ["Both start at 1", "After 1 step: slow = 2, fast = 3", "After 2 steps: slow = 3, fast = 2 (3 → 4 → 2)", "After 3 steps: slow = 4, fast = 4 → they meet"], a: "Yes, there's a cycle. The same idea finds the middle: when fast reaches the end, slow is halfway." },
    code: `slow = fast = head
while fast and fast.next:
    slow = slow.next
    fast = fast.next.next
    if slow is fast: return True     # cycle
return False`,
  },
  "linked-list-pointer": {
    story: "A train where each carriage only holds the key to the next one. To reverse the train you turn each key around, but you must grab the key to the next carriage BEFORE you turn it, or the rest of the train is lost.",
    eg: { q: "Reverse 1 → 2 → 3.", steps: ["prev = None, cur = 1. Save next = 2. Point 1 → None. Move: prev = 1, cur = 2", "Save next = 3. Point 2 → 1. Move: prev = 2, cur = 3", "Save next = None. Point 3 → 2. Move: prev = 3, cur = None"], a: "3 → 2 → 1 (the new head is prev). Draw the pointers on paper before you code." },
    code: `prev, cur = None, head
while cur:
    nxt = cur.next       # save the rest first!
    cur.next = prev
    prev, cur = cur, nxt
return prev
# tip: a dummy node before the head removes special cases for the first node`,
  },

  // ===================== Recursion and backtracking =====================
  "recursion-divide": {
    story: "Russian dolls: to open the biggest doll you open it, and the same job is waiting inside the next smaller doll, until you reach the tiny doll that doesn't open. You trust the smaller job to be done and just combine.",
    eg: { q: "Compute x^8 quickly.", steps: ["x^8 = (x^4)^2", "x^4 = (x^2)^2", "x^2 = (x^1)^2", "x^1 = x"], a: "3 squarings instead of 7 multiplications. Halving the problem is why it is O(log n)." },
    code: `def power(x, n):
    if n == 0: return 1                       # base case
    half = power(x, n // 2)
    return half * half if n % 2 == 0 else half * half * x`,
  },
  "backtracking-subsets": {
    story: "Walking a maze and leaving a trail of crumbs. At each fork pick a path. If it leads nowhere, walk back one step, pick up the crumb and try the next path.",
    eg: { q: "All subsets of [1, 2].", steps: ["Path [] → record []", "Choose 1 → path [1] → record [1]", "Choose 2 → path [1, 2] → record [1, 2]; undo 2", "Undo 1; choose 2 → path [2] → record [2]"], a: "[], [1], [1,2], [2]. The three beats are: choose, explore, un-choose." },
    code: `res = []
def go(start, path):
    res.append(path[:])               # record a COPY
    for i in range(start, len(a)):
        path.append(a[i])             # choose
        go(i + 1, path)               # explore
        path.pop()                    # un-choose
go(0, [])`,
  },
  "meet-in-middle": {
    story: "Instead of one person walking 40 steps through a huge maze, two friends walk 20 steps from opposite ends and meet. Two small problems are far cheaper than one giant one.",
    eg: { q: "Is there a subset of [3, 5, 7, 9] that sums to 12?", steps: ["Split into [3, 5] and [7, 9]", "Left subset sums: 0, 3, 5, 8", "Right subset sums: 0, 7, 9, 16", "Look for left + right = 12: 3 + 9 works"], a: "Yes (3 + 9). With n = 40 you build two lists of 2²⁰ sums, instead of one list of 2⁴⁰." },
    code: `def sums(arr):
    out = [0]
    for x in arr: out += [s + x for s in out]
    return out
L = sums(a[:len(a) // 2]); R = set(sums(a[len(a) // 2:]))
return any(target - s in R for s in L)`,
  },

  // ===================== Trees =====================
  "tree-dfs-recursion": {
    story: "A boss asks each manager \"how deep is your team?\". Every manager asks their own two team leads and answers 1 + the bigger answer. No one needs to see the whole company.",
    eg: { q: "Maximum depth of the tree 1 (left 2 (left 4), right 3).", steps: ["Node 4 has no children → depth 1", "Node 2 → 1 + max(1, 0) = 2", "Node 3 → depth 1", "Root 1 → 1 + max(2, 1) = 3"], a: "3. The recipe: answer for null, then combine the left and right answers." },
    code: `def depth(node):
    if not node: return 0                    # answer for an empty tree
    return 1 + max(depth(node.left), depth(node.right))`,
  },
  "tree-bfs-level": {
    story: "Reading a family tree one generation at a time: grandparents first, then their children, then the grandchildren.",
    eg: { q: "Level order of the tree 3 (left 9, right 20 (left 15, right 7)).", steps: ["Queue [3] → level 0 = [3]", "Queue [9, 20] → level 1 = [9, 20]", "Queue [15, 7] → level 2 = [15, 7]"], a: "[[3], [9, 20], [15, 7]]. Read the queue size at the start of each round: that many nodes are one level." },
    code: `from collections import deque
q = deque([root]); out = []
while q:
    level = []
    for _ in range(len(q)):               # exactly one level
        node = q.popleft(); level.append(node.val)
        if node.left: q.append(node.left)
        if node.right: q.append(node.right)
    out.append(level)`,
  },
  "tree-construct": {
    story: "Rebuilding a family tree from two clues. The preorder list tells you who is the boss first. The inorder list tells you who sits on the boss's left and who on the right.",
    eg: { q: "Build the tree from preorder [3, 9, 20] and inorder [9, 3, 20].", steps: ["The first preorder value, 3, is the root", "In inorder, what is left of 3 is [9] and what is right of 3 is [20]", "So 9 is the left child and 20 is the right child"], a: "Root 3 with left child 9 and right child 20. Store inorder positions in a map so each split is O(1)." },
    code: `pos = {v: i for i, v in enumerate(inorder)}
it = iter(preorder)
def build(lo, hi):
    if lo > hi: return None
    root = TreeNode(next(it))
    m = pos[root.val]
    root.left = build(lo, m - 1)
    root.right = build(m + 1, hi)
    return root
return build(0, len(inorder) - 1)`,
  },
  "bst-inorder": {
    story: "In a binary search tree the small numbers live on the left and the big ones on the right. If you read left, middle, right, the numbers come out sorted, as if someone flattened the tree into a line.",
    eg: { q: "Find the 2nd smallest in the BST 5 (left 3 (left 2, right 4), right 6).", steps: ["Inorder visit order: 2, 3, 4, 5, 6", "The 2nd visited value is 3"], a: "3. Many BST questions turn into questions about a sorted list." },
    code: `def inorder(node):
    if node:
        yield from inorder(node.left)
        yield node.val
        yield from inorder(node.right)

# validate: every node must stay inside bounds from ALL its ancestors
def ok(node, lo=float("-inf"), hi=float("inf")):
    return not node or (lo < node.val < hi and ok(node.left, lo, node.val) and ok(node.right, node.val, hi))`,
  },
  "lca": {
    story: "Two cousins ask \"who is our closest shared grandparent?\". Walk up from both until the two paths meet. That meeting person is the lowest common ancestor.",
    eg: { q: "LCA of 6 and 2 in the tree 3 (left 5 (left 6, right 2), right 1).", steps: ["Search under 3. The left side (5) reports something, the right side (1) reports nothing", "At node 5: the left child returns 6 and the right child returns 2 → both sides found a target", "So 5 is where the two paths meet"], a: "5. The rule: if both sides report a find, the current node is the answer." },
    code: `def lca(node, p, q):
    if not node or node is p or node is q: return node
    left = lca(node.left, p, q)
    right = lca(node.right, p, q)
    return node if left and right else (left or right)`,
  },
  "tree-to-graph": {
    story: "A tree only lets you walk downwards. If you also write down each person's parent, you can walk in every direction, like on an ordinary map.",
    eg: { q: "All nodes at distance 1 from node 5 in the tree 3 (left 5 (left 6, right 2), right 1).", steps: ["Record parents: 5 → 3, 6 → 5, 2 → 5, 1 → 3", "From 5 the neighbours are its children 6 and 2, and its parent 3"], a: "[6, 2, 3]. Then a normal BFS with a visited set gives any distance k." },
    code: `parent = {}
def link(node, par):
    if node:
        parent[node] = par
        link(node.left, node); link(node.right, node)
link(root, None)
# BFS from the target over node.left, node.right and parent[node], with a visited set`,
  },

  // ===================== Graphs =====================
  "grid-dfs-bfs": {
    story: "Spill paint on a map of a floor. The paint flows to every connected square, making one puddle. To count puddles, find an unpainted wet square, flood its whole puddle, and count once.",
    eg: { q: "Count the islands (1 = land) in the grid 11000 / 11000 / 00100 / 00011.", steps: ["Scan. First land at (0,0): flood its four connected cells → island 1", "(2,2) is land and alone → island 2", "(3,3) and (3,4) are connected → island 3"], a: "3. Flooding marks cells as visited (or sinks them), so no land is counted twice." },
    code: `def sink(r, c):
    if not (0 <= r < R and 0 <= c < C) or g[r][c] != "1": return
    g[r][c] = "0"                                  # mark visited
    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        sink(r + dr, c + dc)
count = 0
for r in range(R):
    for c in range(C):
        if g[r][c] == "1": count += 1; sink(r, c)`,
  },
  "bfs-shortest": {
    story: "Drop a stone in a pond. Ring 1 touches the nearest spots, then ring 2, then ring 3. The first ring that touches a spot tells you the fewest steps needed to get there.",
    eg: { q: "Fewest steps from A to D in the graph A–B, A–C, B–D, C–D.", steps: ["Queue [A], distance 0", "Take A, add B and C (distance 1)", "Take B, add D (distance 2)", "D is reached for the first time at distance 2"], a: "2 steps. This only works when every step costs the same. Mark a node as visited when you add it to the queue." },
    code: `from collections import deque
q = deque([(start, 0)]); seen = {start}
while q:
    node, d = q.popleft()
    if node == goal: return d
    for nb in graph[node]:
        if nb not in seen:
            seen.add(nb)                 # mark when you ENQUEUE
            q.append((nb, d + 1))`,
  },
  "graph-traversal": {
    story: "Friends of friends. From one kid, visit all their friends, then those friends' friends, and so on. Everyone you reach belongs to the same friend circle. Count how many circles exist.",
    eg: { q: "5 kids with friendships 0–1, 1–2 and 3–4. How many friend circles?", steps: ["Start at 0: reach 1, then 2 → circle 1", "Kid 3 is not visited yet: reach 4 → circle 2"], a: "2 circles. Build an adjacency list, keep a visited set, and start a new search from every unvisited node." },
    code: `seen = set(); groups = 0
def dfs(u):
    seen.add(u)
    for v in graph[u]:
        if v not in seen: dfs(v)
for u in range(n):
    if u not in seen:
        groups += 1; dfs(u)`,
  },
  "graph-coloring": {
    story: "Two football teams. Some kids refuse to be on the same team as certain others. Put one kid on red, then all their enemies must be blue, their enemies' enemies red, and so on. If a kid must be both colours, it's impossible.",
    eg: { q: "Can the triangle 0–1, 1–2, 2–0 be split into two teams so connected kids are on different teams?", steps: ["Colour 0 red", "Its neighbours 1 and 2 must be blue", "But 1 and 2 are also neighbours of each other, and both are blue → clash"], a: "No. Any graph with an odd cycle cannot be two-coloured." },
    code: `from collections import deque
color = {}
for s in range(n):                       # graph may be disconnected
    if s in color: continue
    color[s] = 0; q = deque([s])
    while q:
        u = q.popleft()
        for v in graph[u]:
            if v not in color: color[v] = 1 - color[u]; q.append(v)
            elif color[v] == color[u]: return False
return True`,
  },
  "topo-sort": {
    story: "Getting dressed: socks before shoes, underwear before trousers. Do the things nobody is waiting for first, then tick them off, which unlocks the next things.",
    eg: { q: "3 courses: course 1 needs 0, course 2 needs 1. Can you finish all, and in what order?", steps: ["Count prerequisites (in-degree): 0 → 0, 1 → 1, 2 → 1", "Queue = [0]. Take 0: course 1 now has 0 left → queue it", "Take 1: course 2 now has 0 left → queue it. Take 2"], a: "Order 0, 1, 2, and all 3 were taken, so no cycle. If you take fewer than n courses, there is a cycle." },
    code: `from collections import deque
indeg = [0] * n
for pre, c in edges:
    graph[pre].append(c); indeg[c] += 1
q = deque(i for i in range(n) if indeg[i] == 0); order = []
while q:
    u = q.popleft(); order.append(u)
    for v in graph[u]:
        indeg[v] -= 1
        if indeg[v] == 0: q.append(v)
return len(order) == n`,
  },
  "union-find": {
    story: "Kids form friend groups, and every group has a captain. To check whether two kids are in the same group, ask both for their captain. Same captain means same group. To merge two groups, one captain starts following the other.",
    eg: { q: "Add the edges (0,1), (1,2), (0,2) one by one. Which one is redundant?", steps: ["union(0,1): different captains → merge", "union(1,2): different captains → merge", "union(0,2): both already have the same captain → this edge closes a cycle"], a: "(0,2) is the redundant one. Components = starting count − number of successful unions." },
    code: `parent = list(range(n))
def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]    # shortcut up the chain
        x = parent[x]
    return x
def union(a, b):
    ra, rb = find(a), find(b)
    if ra == rb: return False            # already together
    parent[ra] = rb; return True`,
  },
  "dijkstra": {
    story: "Finding the quickest way to school when each road takes a different time. Always continue from the place you can reach the soonest. Once you've reached a place by its fastest way, no later route can beat it.",
    eg: { q: "Roads A–B 4, A–C 1, C–B 2. Quickest time from A to B?", steps: ["Take A (time 0): B = 4, C = 1", "Take C (time 1, the smallest): B = min(4, 1 + 2) = 3", "Take B (time 3)"], a: "3, going A → C → B. It fails with negative edges, which need Bellman-Ford." },
    code: `import heapq
dist = {src: 0}; h = [(0, src)]
while h:
    d, u = heapq.heappop(h)
    if d > dist.get(u, float("inf")): continue        # old entry
    for v, w in graph[u]:
        nd = d + w
        if nd < dist.get(v, float("inf")):
            dist[v] = nd; heapq.heappush(h, (nd, v))`,
  },
  "bellman-ford-dp": {
    story: "News spreads by messengers who can each travel one road per day. After k days the news has gone through at most k roads. So \"at most k roads\" becomes \"run k rounds\".",
    eg: { q: "Flights A→B 100, B→C 100, A→C 500. Cheapest A→C with at most 1 stop (2 flights)?", steps: ["Start: A = 0", "Round 1 (one flight): B = 100, C = 500", "Round 2 (two flights): C = min(500, 100 + 100) = 200"], a: "200. In each round use a COPY of last round's prices, otherwise a path could sneak in extra flights." },
    code: `dist = [INF] * n; dist[src] = 0
for _ in range(k + 1):               # k stops = k + 1 flights
    nxt = dist[:]                    # only use last round's values
    for u, v, w in edges:
        if dist[u] + w < nxt[v]: nxt[v] = dist[u] + w
    dist = nxt`,
  },
  "mst": {
    story: "Connecting villages with roads as cheaply as possible. Build the cheapest road first, then the next cheapest, but skip any road that joins two villages which are already connected.",
    eg: { q: "Villages A, B, C with roads AB cost 1, BC cost 2, AC cost 3.", steps: ["Sorted: AB 1, BC 2, AC 3", "Take AB, take BC", "AC would join A and C, which are already connected through B → skip"], a: "Total cost 3. Union-Find is how you check \"already connected\" quickly (Kruskal)." },
    code: `edges.sort(key=lambda e: e[2])      # (u, v, cost)
total = 0
for u, v, w in edges:
    if union(u, v):                  # union-find from the Union-Find lesson
        total += w`,
  },
  "euler-path": {
    story: "Drawing a picture without lifting your pencil and without going over any line twice. Walk until you're stuck. The place where you get stuck is the end of your trail. Then stitch the unused loops back in.",
    eg: { q: "Tickets JFK→KUL, JFK→NRT, NRT→JFK. Use all tickets starting at JFK, taking the smaller airport name first.", steps: ["From JFK try KUL first. KUL has no onward ticket → KUL is the LAST stop", "Back at JFK, take NRT, then NRT → JFK. Record JFK, NRT, JFK", "Reverse the recorded list"], a: "JFK → NRT → JFK → KUL. Record a place only after all its tickets are used, then reverse." },
    code: `import heapq
route = []
def visit(u):
    while graph[u]:
        visit(heapq.heappop(graph[u]))   # graph[u] is a min-heap of destinations
    route.append(u)
visit("JFK")
return route[::-1]`,
  },
  "bridges-tarjan": {
    story: "A road network where closing one special bridge cuts the town in two. A road is NOT critical if you can always get around it by some other way.",
    eg: { q: "Triangle 0–1–2 plus a tail 2–3. Which road is a bridge?", steps: ["DFS from 0 numbers the nodes in order of discovery: 0, 1, 2, 3", "Node 3 cannot reach anything discovered earlier than itself", "Nodes 1 and 2 can climb back to node 0 through the triangle"], a: "Only 2–3 is a bridge. Rule: edge (u, v) is a bridge when low[v] > disc[u]." },
    code: `disc = {}; low = {}; bridges = []; t = [0]
def dfs(u, parent):
    disc[u] = low[u] = t[0]; t[0] += 1
    for v in graph[u]:
        if v == parent: continue
        if v not in disc:
            dfs(v, u)
            low[u] = min(low[u], low[v])
            if low[v] > disc[u]: bridges.append((u, v))
        else:
            low[u] = min(low[u], disc[v])`,
  },

  // ===================== Dynamic programming =====================
  "dp-linear": {
    story: "Climbing stairs when you can take 1 or 2 steps. To stand on step 5 your last move came from step 4 or step 3, so the ways to reach step 5 are the ways to reach 4 plus the ways to reach 3. Write the answers down so you never work them out twice.",
    eg: { q: "In how many ways can you climb 5 stairs, taking 1 or 2 steps at a time?", steps: ["ways[1] = 1, ways[2] = 2", "ways[3] = ways[2] + ways[1] = 3", "ways[4] = 3 + 2 = 5", "ways[5] = 5 + 3 = 8"], a: "8. First say in words what dp[i] means. If you can't, the formula will be wrong." },
    code: `a, b = 1, 1
for _ in range(n - 1):
    a, b = b, a + b         # only the last two values matter
return b`,
  },
  "dp-knapsack": {
    story: "A backpack with limited room. For each item you either pack it or leave it. A table remembers, for every possible weight, whether (or in how many ways, or at what cost) you can fill the bag exactly.",
    eg: { q: "Fewest coins from [1, 2, 5] to make 11.", steps: ["dp[0] = 0. dp[1] = 1, dp[2] = 1 (one 2), dp[3] = 2 (2 + 1)", "dp[5] = 1 (one 5), dp[10] = 2 (5 + 5)", "dp[11] = dp[10] + 1 = 3"], a: "3 coins (5 + 5 + 1). Each coin may be reused, so loop sums upward. For 0/1 items (each once), loop sums downward." },
    code: `INF = float("inf")
dp = [0] + [INF] * amount
for s in range(1, amount + 1):
    for c in coins:
        if c <= s: dp[s] = min(dp[s], dp[s - c] + 1)
return dp[amount] if dp[amount] < INF else -1`,
  },
  "dp-grid": {
    story: "Walking across city blocks where you may only go right or down. To arrive at a crossing, you must have come from the crossing above it or the crossing to its left, so add their counts.",
    eg: { q: "Unique paths in a 3×3 grid, moving right or down.", steps: ["First row and first column are all 1 (only one way to get there)", "Cell (1,1) = 1 + 1 = 2. Cell (1,2) = 2 + 1 = 3", "Cell (2,1) = 2 + 1 = 3. Cell (2,2) = 3 + 3 = 6"], a: "6. For minimum cost, use min instead of +. Obstacles make a cell 0." },
    code: `dp = [[1] * C for _ in range(R)]
for r in range(1, R):
    for c in range(1, C):
        dp[r][c] = dp[r - 1][c] + dp[r][c - 1]
return dp[R - 1][C - 1]`,
  },
  "dp-string-two": {
    story: "Comparing two words on a grid. Each box asks: \"How good is the match between the first i letters of one word and the first j letters of the other?\" and builds its answer from the boxes next to it.",
    eg: { q: "Longest common subsequence of \"abcde\" and \"ace\".", steps: ["a = a → match, length 1", "Skip b and d, which don't appear in \"ace\"", "c = c → length 2", "e = e → length 3"], a: "3 (\"ace\"). Rule: if the last letters match, take the diagonal + 1. Otherwise take the better of dropping a letter from either word." },
    code: `n, m = len(a), len(b)
dp = [[0] * (m + 1) for _ in range(n + 1)]     # row/col 0 = empty prefix
for i in range(1, n + 1):
    for j in range(1, m + 1):
        if a[i - 1] == b[j - 1]: dp[i][j] = dp[i - 1][j - 1] + 1
        else: dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
return dp[n][m]`,
  },
  "dp-interval": {
    story: "Popping balloons in a row where each pop earns the product of its two neighbours. The trick is to ask which balloon pops LAST in a stretch. Everything else in that stretch was popped before it, so the left and right parts no longer affect each other.",
    eg: { q: "Burst balloons [3, 1, 5] for the most coins.", steps: ["Pad both ends with 1: [1, 3, 1, 5, 1]", "Try each balloon as the LAST one popped in the whole row", "If 5 is last: 1 × 5 × 1 = 5, plus the best for [3, 1] which is 30 → 35", "If 3 is last: 33. If 1 is last: 9."], a: "35. Fill the table by increasing length of the stretch, with the \"last\" balloon as the split point." },
    code: `nums = [1] + a + [1]
n = len(nums)
dp = [[0] * n for _ in range(n)]
for length in range(2, n):                 # distance between the two boundaries
    for l in range(n - length):
        r = l + length
        for k in range(l + 1, r):          # k = the LAST one popped between l and r
            dp[l][r] = max(dp[l][r], dp[l][k] + nums[l] * nums[k] * nums[r] + dp[k][r])
return dp[0][n - 1]`,
  },
  "dp-lis": {
    story: "Stacking boxes from small to big. Keep a row that says \"the smallest top box you can have for a tower of height 1, 2, 3…\". A new box either makes the tallest tower one higher, or lowers the top of an existing tower.",
    eg: { q: "Longest increasing subsequence of [10, 9, 2, 5, 3, 7, 101, 18].", steps: ["10 → [10]. 9 replaces 10 → [9]. 2 → [2]", "5 → [2, 5]. 3 replaces 5 → [2, 3]", "7 → [2, 3, 7]. 101 → [2, 3, 7, 101]", "18 replaces 101 → [2, 3, 7, 18]"], a: "4. The row's length is the answer, but the row is not itself the subsequence." },
    code: `from bisect import bisect_left
tails = []
for x in a:
    i = bisect_left(tails, x)        # first tail >= x
    if i == len(tails): tails.append(x)
    else: tails[i] = x
return len(tails)`,
  },
  "dp-state-machine": {
    story: "A light switch with a few positions, like \"holding a toy\" and \"not holding a toy\". Each day you may switch or stay, and each position's best money comes from yesterday's allowed positions.",
    eg: { q: "Stock prices [1, 2, 3, 0, 2], unlimited transactions. Best profit?", steps: ["Keep two numbers: free (not holding) and hold (holding)", "Each day: free = max(free, hold + price), hold = max(hold, free − price) using yesterday's values", "Day by day, free goes 0 → 0 → 1 → 2 → 2 → 4"], a: "4 (buy at 1, sell at 3, buy at 0, sell at 2). For a cooldown, a sold state must wait one day before it can buy; for k transactions add a counter." },
    code: `free, hold = 0, float("-inf")
for p in prices:
    free, hold = max(free, hold + p), max(hold, free - p)   # both use old values
return free`,
  },
  "dp-tree": {
    story: "A boss chooses who comes to a party, but a boss and their direct report may not both come. Each manager asks each team: \"what is your best if your boss comes, and what is your best if your boss doesn't?\"",
    eg: { q: "House Robber III: tree 3 (left 2 (right 3), right 3 (right 1)). Rob nodes, but never two linked ones.", steps: ["Each node returns (best if I rob this node, best if I skip it)", "Leaves: node 3 → (3, 0). Node 1 → (1, 0)", "Node 2 → (2 + 0, max(3, 0)) = (2, 3). Right node 3 → (3 + 0, max(1, 0)) = (3, 1)", "Root → rob: 3 + 3 + 1 = 7. Skip: 3 + 3 = 6"], a: "7." },
    code: `def go(node):
    if not node: return (0, 0)                  # (rob, skip)
    lr, ls = go(node.left)
    rr, rs = go(node.right)
    rob = node.val + ls + rs                    # children must be skipped
    skip = max(lr, ls) + max(rr, rs)
    return (rob, skip)
return max(go(root))`,
  },
  "dp-bitmask": {
    story: "A row of light switches shows which kids already got a prize. That row of ON/OFF is just one number, so you can use it as the address in a table.",
    eg: { q: "2 people, 2 tasks, costs [[3, 1], [2, 4]]. Cheapest way to give each person a different task?", steps: ["mask 00: cost 0", "Person 0 takes task 0 → mask 01 costs 3. Takes task 1 → mask 10 costs 1", "Person 1 takes the other task: from 01 take task 1: 3 + 4 = 7. From 10 take task 0: 1 + 2 = 3", "mask 11 = min(7, 3)"], a: "3. Only use it when n is about 20 or less, because there are 2ⁿ masks." },
    code: `INF = float("inf")
dp = [INF] * (1 << n); dp[0] = 0
for mask in range(1 << n):
    person = bin(mask).count("1")           # next person to assign
    if person >= n: continue
    for task in range(n):
        if not mask & (1 << task):
            nm = mask | (1 << task)
            dp[nm] = min(dp[nm], dp[mask] + cost[person][task])
return dp[(1 << n) - 1]`,
  },
  "game-minimax-dp": {
    story: "Two clever kids take turns picking chocolates from either end of a row. Don't track who holds what. Track the lead: my pick minus the lead my opponent can build from what remains.",
    eg: { q: "Piles [1, 5, 2]: players take one pile from either end, both play perfectly. Does the first player win?", steps: ["If I take 1, the opponent faces [5, 2] and can lead by max(5 − 2, 2 − 5) = 3. My lead: 1 − 3 = −2", "If I take 2, the opponent faces [1, 5] and can lead by 4. My lead: 2 − 4 = −2", "Best I can do is −2"], a: "No, the first player loses by 2. Win means the lead is at least 0." },
    code: `from functools import lru_cache
@lru_cache(None)
def diff(l, r):                      # best lead for the player to move
    if l == r: return nums[l]
    return max(nums[l] - diff(l + 1, r), nums[r] - diff(l, r - 1))
return diff(0, len(nums) - 1) >= 0`,
  },

  // ===================== Advanced structures and design =====================
  "trie": {
    story: "A phone book where words share their first letters. Instead of storing \"car\", \"card\" and \"care\" separately, you store c-a-r once and branch after it.",
    eg: { q: "Insert \"car\" and \"card\", then ask: does any word start with \"ca\"?", steps: ["Insert car: root → c → a → r (mark end)", "Insert card: reuse c-a-r, add d (mark end)", "Prefix \"ca\": follow c, then a → both exist"], a: "Yes. A prefix check costs only the length of the prefix, not the number of words." },
    code: `root = {}
def insert(w):
    node = root
    for ch in w: node = node.setdefault(ch, {})
    node["$"] = True                       # end of a word
def starts_with(p):
    node = root
    for ch in p:
        if ch not in node: return False
        node = node[ch]
    return True`,
  },
  "segment-tree-bit": {
    story: "A scoreboard for a long row of players where scores change and people ask \"total of players 3 to 9?\". Instead of re-adding, keep subtotals for blocks of size 1, 2, 4, 8… and when a score changes, only update the few blocks that contain it.",
    eg: { q: "Fenwick tree over [1, 2, 3, 4] (positions 1 to 4): sum of the first 3, then add 5 at position 2 and ask again.", steps: ["Blocks: t[1] = 1, t[2] = 1 + 2 = 3, t[3] = 3, t[4] = 10", "sum(3) = t[3] + t[2] = 3 + 3 = 6", "add 5 at position 2: t[2] becomes 8, then jump to position 4: t[4] becomes 15", "sum(3) = t[3] + t[2] = 3 + 8 = 11"], a: "6, then 11. Both query and update touch only about log n blocks." },
    code: `class BIT:
    def __init__(self, n): self.t = [0] * (n + 1)
    def add(self, i, v):                  # i is 1-indexed
        while i < len(self.t):
            self.t[i] += v
            i += i & -i                   # next block that covers i
    def sum(self, i):                     # sum of positions 1..i
        s = 0
        while i > 0:
            s += self.t[i]
            i -= i & -i
        return s`,
  },
  "ordered-set": {
    story: "A bookshelf kept in alphabetical order. To find the book just before or just after a title you don't scan the shelf. You jump to the spot where it would sit and look at its neighbours.",
    eg: { q: "Calendar has bookings [10,20) and [30,40). Can you add [20,30)?", steps: ["Find the booking that starts just before 20: [10,20) ends at 20, which is not after 20 → no clash", "Find the booking that starts just after 20: [30,40) starts at 30, which is not before 30 → no clash"], a: "Yes, add it. Check only the two neighbours." },
    code: `from bisect import bisect_right, insort
starts = []; ends = {}               # sorted starts, and start -> end
def book(s, e):
    i = bisect_right(starts, s)
    if i > 0 and ends[starts[i - 1]] > s: return False     # previous one runs into s
    if i < len(starts) and starts[i] < e: return False      # next one starts before e
    insort(starts, s); ends[s] = e
    return True`,
  },
  "design-ds": {
    story: "Building a gadget from two simple tools, where each covers the other's weakness: a phone book (fast lookup but no order) and a stack of cards (fast reordering but slow lookup).",
    eg: { q: "LRU cache with capacity 2: put 1, put 2, get 1, put 3. Which key is thrown out?", steps: ["Order from oldest to newest: 1, 2", "get 1 → 1 becomes the newest: 2, 1", "put 3 → over capacity, so remove the oldest = 2 → left with 1, 3"], a: "Key 2. A hash map gives O(1) lookup and a doubly linked list gives O(1) move-to-front and remove-oldest." },
    code: `from collections import OrderedDict
class LRU:
    def __init__(self, cap): self.cap = cap; self.d = OrderedDict()
    def get(self, k):
        if k not in self.d: return -1
        self.d.move_to_end(k); return self.d[k]
    def put(self, k, v):
        self.d[k] = v; self.d.move_to_end(k)
        if len(self.d) > self.cap: self.d.popitem(last=False)
# in interviews you often build it yourself: hash map + doubly linked list`,
  },
  "design-time-versioned": {
    story: "A diary where every page is stamped with a time. \"What did I write as of Tuesday?\" means flipping to the last page stamped on or before Tuesday.",
    eg: { q: "set(\"a\", \"x\", time 1), set(\"a\", \"y\", time 5). What is get(\"a\", time 3)?", steps: ["History of a: [(1, x), (5, y)]", "Binary search for the last entry with time ≤ 3 → (1, x)"], a: "\"x\". Times arrive in increasing order, so each list stays sorted for free." },
    code: `from bisect import bisect_right
times = {}; vals = {}
def set(key, val, t):
    times.setdefault(key, []).append(t); vals.setdefault(key, []).append(val)
def get(key, t):
    i = bisect_right(times.get(key, []), t)      # entries with time <= t
    return vals[key][i - 1] if i else ""`,
  },
  "randomized": {
    story: "A prize wheel where fatter slices get picked more often. Lay all slices end to end on a number line, throw a dart at the line, and whichever slice it lands in wins.",
    eg: { q: "Pick an index with probability proportional to the weights [1, 3].", steps: ["Total = 4. Prefix sums = [1, 4]", "Pick a random whole number from 1 to 4", "1 lands in the first slice (index 0). 2, 3 and 4 land in the second (index 1)"], a: "Index 1 is picked 3 out of 4 times, as it should be. Binary search finds the slice in O(log n)." },
    code: `import random
from bisect import bisect_left
pre = []; total = 0
for w in weights:
    total += w; pre.append(total)
def pick():
    r = random.randint(1, total)
    return bisect_left(pre, r)           # first prefix >= r`,
  },
  "merge-sort-count": {
    story: "Counting how many pairs of kids stand in the wrong order. When you merge two lines that are already sorted, you can count wrong-order pairs in bulk instead of one at a time.",
    eg: { q: "Count inversions (pairs i < j with a[i] > a[j]) in [2, 4, 1, 3, 5].", steps: ["Split into [2, 4, 1] and [3, 5]. Inside [2, 4, 1] there are 2 (2>1, 4>1). Inside [3, 5] there are 0", "Sorted halves: [1, 2, 4] and [3, 5]", "Merging: 3 is smaller than 4, so 3 jumps ahead of 1 item still waiting on the left → +1", "5 is bigger than everything on the left → +0"], a: "2 + 0 + 1 = 3 inversions: (2,1), (4,1), (4,3)." },
    code: `def sort_count(a):
    if len(a) <= 1: return a, 0
    mid = len(a) // 2
    L, x = sort_count(a[:mid]); R, y = sort_count(a[mid:])
    merged, i, j, cross = [], 0, 0, 0
    while i < len(L) and j < len(R):
        if L[i] <= R[j]: merged.append(L[i]); i += 1
        else:
            merged.append(R[j]); j += 1
            cross += len(L) - i          # R[j] beats everything left in L
    merged += L[i:] + R[j:]
    return merged, x + y + cross`,
  },
};

// Path questions that use each pattern, in path order: { main: [{id, cue}], also: [{id, cue}] }.
// "main" = the pattern is the first one listed for that question.
export function questionsByPattern() {
  const out = {};
  for (const [id, entry] of Object.entries(PATH_PATTERNS)) {
    const { keys, cue } = parseEntry(entry);
    keys.forEach((k, i) => { ((out[k] ||= { main: [], also: [] })[i === 0 ? "main" : "also"]).push({ id, cue }); });
  }
  return out;
}

const SIMPLE = "Use simple words, like you're explaining to a 12-year-old. Short sentences. Everyday pictures instead of jargon. Whenever you must use a technical word, explain it in the same breath.";
const FORMAT = `How to write your reply:
- Reply right here in the chat as a normal message. Don't create a file, document, canvas or artifact.
- Put every piece of code in its own code block.
- Keep each numbered part's title on its own line in capitals (like "1. THE STORY").`;

// The prompt you copy into any AI chat. `titles` are example questions from your path (optional).
export function patternPrompt(key, { lang = "C++", titles = [] } = {}) {
  const p = PATTERNS[key];
  if (!p) return "";
  const lines = [
    "I'm preparing for coding interviews and online coding tests, where recognising the PATTERN behind a question matters more than anything. I want to learn one pattern really well.",
    "",
    `PATTERN: ${p.name}`,
    `Group: ${groupOf(key) || "—"}`,
    "",
    "What I already know about it (my short notes):",
    ...p.signals.map(s => `- Clue: ${s}`),
    `- The move: ${p.move}`,
    `- Cost: ${p.cost}`,
    `- Common trap: ${p.trap}`,
  ];
  if (titles.length) lines.push("", `Questions I will practise this on (do NOT solve these for me, they are my practice): ${titles.join("; ")}.`);
  lines.push("",
    "Please teach me this pattern from zero.", SIMPLE, "",
    `1. THE STORY
   An everyday picture from real life (school, games, food, travel) that matches how this pattern works. No code in this part.

2. THE PROBLEM IT SOLVES
   Show the slow, obvious way first, then this pattern, on the same tiny example, so I can see exactly where the time is saved.

3. HOW TO SPOT IT
   Give me 6 clues that appear in problem statements, each with a made-up one-line problem statement that shows the clue. Then tell me which clues are strong (almost always this pattern) and which are weak (could be something else).

4. EXAMPLE 1 (EASY)
   A small problem. Show the input, then every step with how the variables change, like a dry run on paper. Then clean, commented ${lang} code.

5. EXAMPLE 2 (MEDIUM)
   Same format. Pick one with a twist that people often get wrong.

6. EXAMPLE 3 (IN DISGUISE)
   A problem whose statement does not look like this pattern at all. Show how to see through the disguise, and which words in the statement gave it away.

7. THE TEMPLATE
   A reusable ${lang} skeleton for this pattern with comments on which parts change from problem to problem.

8. MISTAKES AND EDGE CASES
   The 5 mistakes people make most (off-by-one, empty input, duplicates, and so on) and how to avoid each.

9. LOOKALIKES
   Which other patterns get confused with this one, and the quickest question I can ask myself to tell them apart.

10. QUICK QUIZ
   Give me 5 short problem statements. I will name the pattern for each. Put the answers in a separate section at the very end so I can try first.`,
    "", FORMAT);
  return lines.join("\n");
}
