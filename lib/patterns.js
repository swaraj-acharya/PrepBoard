// Pattern recognition for DSA questions.
// A pattern is the reusable move behind a question. In a test you don't have time to invent a solution:
// you read the statement, spot the pattern, and fill in the details.
//
//   PATTERNS      every pattern: the signals that give it away, the move, the cost, and the usual trap.
//   PATH_PATTERNS (lib/patternMap.js) a hand-written pattern + cue for every question on the DSA path.
//   patternsFor() what the "Learn the topic" tab shows. Path questions use the hand-written entry;
//                 any other question falls back to hints derived from its topic tags (and says so).
import { PATH_PATTERNS } from "./patternMap.js";

export const PATTERNS = {
  "simulation": {
    name: "Simulation / direct implementation",
    signals: ["The statement describes exactly what to do, step by step", "Small constraints, or the process is the whole problem", "Building a string or array by following rules"],
    move: "Do what it says, carefully. Pick the right loop, keep the state in a few variables, and handle the edges (empty input, first and last element).",
    cost: "Usually O(n) or O(n·m).",
    trap: "Off-by-one errors and forgetting to reset state between rounds. Dry-run the smallest example by hand.",
  },
  "math-digits": {
    name: "Digit and arithmetic tricks",
    signals: ["Digits of a number, reversing, palindromic numbers", "Divisibility, remainders, \"modulo 1e9+7\"", "n is huge so you can't loop up to n"],
    move: "Peel digits with % 10 and / 10. Look for a formula or a cycle instead of looping. Use 64-bit numbers and check overflow before it happens.",
    cost: "O(number of digits) or O(1) with a formula.",
    trap: "Integer overflow, negative numbers, and trailing zeroes.",
  },
  "number-theory": {
    name: "GCD, primes and sieve",
    signals: ["Greatest common divisor, least common multiple, coprime", "Count or list primes up to n", "Factors, divisors, trailing zeroes of n!"],
    move: "Euclid for GCD: gcd(a, b) = gcd(b, a % b). Sieve of Eratosthenes to mark primes up to n. Test divisibility only up to √n. Count factors of 5 for trailing zeroes.",
    cost: "GCD O(log n). Sieve O(n log log n).",
    trap: "Looping to n instead of √n, and starting the sieve's inner loop at 2·p instead of p·p.",
  },
  "combinatorics-math": {
    name: "Counting with combinations",
    signals: ["\"Number of ways\" where each choice is independent", "Paths on a grid with only right/down moves", "n is far too large for DP, answer mod 1e9+7"],
    move: "Turn the question into nCr or a product of independent choices. Use fast power for big exponents and modular inverse for division.",
    cost: "O(log n) per power.",
    trap: "Dividing under a modulus without an inverse.",
  },
  "hash-lookup": {
    name: "Hash map: seen-before / complement lookup",
    signals: ["Find a pair or triple that hits a target", "\"Have I seen this before?\"", "Map one thing to another (value → index, character → character)"],
    move: "Walk once. For each element ask the map for what you need (target − x), then store x. Turns a nested O(n²) loop into one O(n) pass.",
    cost: "O(n) time, O(n) space.",
    trap: "Inserting before checking, which lets an element pair with itself.",
  },
  "frequency-count": {
    name: "Frequency counting / signature",
    signals: ["Anagrams, permutations of a word, \"same letters\"", "Most or least frequent, first unique, count of each", "Compare two multisets"],
    move: "Count occurrences with a map or an int[26]. Two things are \"the same\" when their count tables match. For grouping, use the sorted word or the count table as the key.",
    cost: "O(n) with a 26-array, O(n log n) if you sort for the key.",
    trap: "Forgetting uppercase, digits or unicode when you size the array.",
  },
  "prefix-sum": {
    name: "Prefix sum",
    signals: ["Many range-sum queries on a fixed array", "Running total, balance, altitude", "Total of everything left of i vs right of i"],
    move: "Build pre[i] = sum of the first i items. Then sum(l..r) = pre[r+1] − pre[l] in O(1). Works in 2D too with inclusion-exclusion.",
    cost: "O(n) build, O(1) per query.",
    trap: "Off-by-one: decide up front whether pre[0] = 0 means \"nothing taken\".",
  },
  "prefix-hash": {
    name: "Prefix sum + hash map (count subarrays)",
    signals: ["Count or find subarrays whose sum equals / is divisible by k", "Subarray with equal number of 0s and 1s (treat 0 as −1)", "Negative numbers are allowed, so sliding window fails"],
    move: "Subarray (i..j] has sum k when pre[j] − pre[i] = k. Walk j, and look up how many earlier prefixes equal pre[j] − k. Seed the map with {0: 1}. For divisibility, store prefix % k.",
    cost: "O(n) time, O(n) space.",
    trap: "Forgetting the {0: 1} seed, and negative remainders in some languages.",
  },
  "two-pointers-opposite": {
    name: "Two pointers from both ends",
    signals: ["Sorted array and you need a pair/triple with a property", "Palindrome check", "Maximise something that depends on the distance between two ends"],
    move: "Start left = 0, right = n−1. Compare, then move whichever pointer can only improve the answer. For 3Sum/4Sum, fix the first element(s), then run this on the rest and skip duplicates.",
    cost: "O(n) after sorting, so O(n log n) overall.",
    trap: "Duplicates in k-Sum, and moving the wrong pointer.",
  },
  "two-pointers-same": {
    name: "Read / write pointers (in-place)",
    signals: ["Modify the array in place, O(1) extra space", "Remove, move or compact elements", "Merge from the back so you don't overwrite"],
    move: "One pointer reads every element, a second marks where the next kept element goes. Copy when the read element qualifies. When merging in place, fill from the end.",
    cost: "O(n) time, O(1) space.",
    trap: "Overwriting an element you still need to read.",
  },
  "fast-slow": {
    name: "Fast and slow pointers",
    signals: ["Cycle in a list or in a repeated function (x → f(x))", "Middle of a list in one pass", "Array of n+1 numbers in 1..n with a duplicate"],
    move: "Slow moves 1 step, fast moves 2. If they meet there's a cycle. Reset one to the start and step both by 1 to find where the cycle begins. When fast reaches the end, slow is at the middle.",
    cost: "O(n) time, O(1) space.",
    trap: "Null checks: test fast and fast.next before stepping.",
  },
  "sliding-window-fixed": {
    name: "Sliding window, fixed size",
    signals: ["\"Subarray / substring of length k\"", "Maximum or average over every window of size k", "Compare a window with a pattern of the same length (anagram, permutation)"],
    move: "Add the new element on the right, remove the old one on the left, update the answer. Never recompute the whole window.",
    cost: "O(n).",
    trap: "Updating the answer before the first window is full.",
  },
  "sliding-window-variable": {
    name: "Sliding window, variable size",
    signals: ["Longest or shortest subarray/substring that satisfies a condition", "\"At most k distinct / at most k zeros / sum ≥ target\"", "All numbers are positive (or counts only grow), so adding never hurts and removing never helps"],
    move: "Expand right to include the next element. While the window is invalid, shrink from the left. Record the best size at each step. \"Exactly k\" = atMost(k) − atMost(k−1).",
    cost: "O(n), each pointer moves forward at most n times.",
    trap: "Negative numbers break it. Use prefix sum + hash map instead.",
  },
  "binary-search-index": {
    name: "Binary search on a sorted / rotated array",
    signals: ["Sorted array, find a value, insert position, first/last occurrence", "Rotated sorted array", "O(log n) is asked for"],
    move: "Keep lo..hi as the range that can still contain the answer. Look at mid, throw away the half that cannot hold it. For rotated arrays, one half is always sorted: check whether the target is in that half.",
    cost: "O(log n).",
    trap: "Infinite loops from lo = mid; pick the half-open or closed form and stay consistent. mid = lo + (hi − lo) / 2.",
  },
  "binary-search-answer": {
    name: "Binary search on the answer",
    signals: ["\"Minimum possible maximum\" or \"maximum possible minimum\"", "\"Minimum speed / capacity / days such that…\"", "You can check one candidate answer quickly, and bigger candidates never make it harder (monotonic)"],
    move: "Binary search the answer value, not an index. Write feasible(x) as a simple greedy scan. If feasible, try smaller (or larger); if not, go the other way.",
    cost: "O(n · log(range)).",
    trap: "Wrong search bounds, and a feasible() that is not truly monotonic.",
  },
  "sort-then-scan": {
    name: "Sort first, then scan",
    signals: ["Order in the input doesn't matter for the answer", "Closest pair, smallest difference, duplicates", "Match items greedily (smallest with smallest)"],
    move: "Sort to put related elements next to each other. After that a single pass, two pointers, or a binary search finishes the job. Counting/bucket sort when values are small.",
    cost: "O(n log n).",
    trap: "Sorting loses the original indices; sort pairs (value, index) if you need them.",
  },
  "greedy": {
    name: "Greedy choice",
    signals: ["\"Minimum number of…\" or \"maximum number of…\" with simple rules", "Each step has an obvious best-looking option", "Scheduling, assigning, covering, reaching the end"],
    move: "Take the best local choice, never go back. Sort by the right key (end time, ratio, size). Try to break it with a counter-example; if you can, it is DP.",
    cost: "Usually O(n log n) for the sort.",
    trap: "Sorting by the wrong key. Test the rule on a tricky 4-element input.",
  },
  "intervals": {
    name: "Intervals: sort by start, merge or sweep",
    signals: ["Pairs [start, end], meetings, ranges", "Overlap, merge, insert, minimum removals", "Points where the number of active things peaks"],
    move: "Sort by start (or end for \"keep the most / remove the fewest\"). Walk once, comparing the current start with the previous end. Sweep line: +1 at start, −1 at end, sort the events, track the running count.",
    cost: "O(n log n).",
    trap: "Touching intervals ([1,2] and [2,3]): decide whether that counts as overlap.",
  },
  "monotonic-stack": {
    name: "Monotonic stack (next greater / smaller)",
    signals: ["\"Next greater / next smaller element\"", "\"How many days until a warmer day\", \"span\"", "Largest rectangle, area or contribution of each element as min/max", "Remove k digits to get the smallest number"],
    move: "Keep a stack that is always increasing (or decreasing). When a new element breaks the order, pop and settle the answer for everything you popped. Each element is pushed and popped once.",
    cost: "O(n).",
    trap: "Store indices, not values, when you need distances.",
  },
  "stack-matching": {
    name: "Stack for nesting, matching and undo",
    signals: ["Brackets/parentheses, nested structures", "Evaluate an expression, decode a nested string, simplify a path", "The most recent unfinished thing is the one you handle next (last in, first out)"],
    move: "Push when something opens, pop when it closes or when you need to undo. For expressions, keep a stack of numbers and apply operators as they arrive (or a stack of sub-results at each \"(\").",
    cost: "O(n).",
    trap: "Popping an empty stack, and leftover items at the end.",
  },
  "monotonic-deque": {
    name: "Monotonic deque (window max / min)",
    signals: ["Maximum or minimum of every window of size k", "Window query that is more than a sum", "DP transition that looks back at the best of the last k states"],
    move: "Keep indices in a deque with values in decreasing order. Pop from the back while the new value is bigger, pop from the front when the index leaves the window. The front is always the answer.",
    cost: "O(n).",
    trap: "Forgetting to drop indices that fell out of the window.",
  },
  "heap-topk": {
    name: "Heap / Top-K",
    signals: ["k-th largest / smallest, top k frequent, k closest", "Repeatedly take the best remaining item", "Schedule or merge by always picking the smallest/largest next"],
    move: "Keep a min-heap of size k for the k largest (or a max-heap for the k smallest). Or heapify everything and pop k times. Quickselect gives O(n) average.",
    cost: "O(n log k).",
    trap: "Using a max-heap when you need a min-heap of size k (and vice versa).",
  },
  "two-heaps": {
    name: "Two heaps (running median)",
    signals: ["Median of a stream", "Split data into a lower half and an upper half and read the boundary", "Sliding window median"],
    move: "Max-heap for the smaller half, min-heap for the larger half. Keep sizes equal or off by one. The median is at the tops.",
    cost: "O(log n) per insert.",
    trap: "Rebalancing after every insert.",
  },
  "k-way-merge": {
    name: "K-way merge with a heap",
    signals: ["k sorted lists / arrays / rows", "Smallest range, k-th smallest across lists", "Merge many sorted sources"],
    move: "Push the head of each list into a min-heap as (value, list, index). Pop the smallest, push the next from the same list.",
    cost: "O(N log k).",
    trap: "Tracking the current max separately when the problem is about a range.",
  },
  "linked-list-pointer": {
    name: "Linked list pointer rewiring",
    signals: ["Reverse all or part of a list", "Merge, reorder, rotate, remove the n-th from the end, split into parts", "Copy a list with extra pointers"],
    move: "Use a dummy head so the first node isn't special. Reverse with prev/curr/next. n-th from the end: move one pointer n steps ahead, then move both. Draw the pointers before coding.",
    cost: "O(n) time, O(1) space.",
    trap: "Losing the rest of the list by overwriting next before saving it.",
  },
  "index-marking": {
    name: "Array as its own hash (cyclic sort / sign marking)",
    signals: ["Values are in 1..n (or 0..n−1) and you need missing / duplicate / first missing positive", "O(1) extra space required", "Each value can be used as an index"],
    move: "Put value v at index v−1 by swapping (cyclic sort), or flip the sign at index |v|−1 to mark \"seen\". Then one scan shows which positions are wrong or marked.",
    cost: "O(n) time, O(1) space.",
    trap: "Duplicates can make swap loops run forever. Swap only if the target slot differs.",
  },
  "kadane": {
    name: "Kadane (best subarray ending here)",
    signals: ["Maximum sum of a contiguous subarray", "Maximum product subarray (track min too)", "Best contiguous run where each step is extend or restart"],
    move: "best_here = max(x, best_here + x). Keep a global best. For products keep both the max and min so far because a negative flips them.",
    cost: "O(n), O(1) space.",
    trap: "All-negative arrays: initialise with the first element, not 0.",
  },
  "boyer-moore": {
    name: "Boyer-Moore voting",
    signals: ["Element that appears more than n/2 (or n/3) times", "O(1) space majority element"],
    move: "Keep a candidate and a count. Same value: count++. Different: count−−. At zero, replace the candidate. For n/3 keep two candidates, then verify.",
    cost: "O(n), O(1) space.",
    trap: "Verify the candidate when a majority isn't guaranteed.",
  },
  "xor-trick": {
    name: "XOR cancellation",
    signals: ["Everything appears twice except one (or two)", "Find the missing number using 0..n", "Swap or flip without extra space"],
    move: "a ^ a = 0 and a ^ 0 = a, so XOR everything and the duplicates cancel. For two singles, XOR all, split the numbers into two groups by any set bit of the result, XOR each group.",
    cost: "O(n), O(1) space.",
    trap: "Only works when the \"extra\" copies come in pairs. For triples count bits mod 3 instead.",
  },
  "bit-manipulation": {
    name: "Bit manipulation",
    signals: ["Power of two, count set bits, reverse bits", "Add / divide without the operators", "Subsets as masks, bit n of a number", "Common prefix of a range"],
    move: "n & (n−1) clears the lowest set bit. n & −n isolates it. 1 << i is a mask. Shift to test bits. Counting bits: dp[i] = dp[i >> 1] + (i & 1). Add without +: sum = a ^ b, carry = (a & b) << 1.",
    cost: "O(bits) = O(32) or O(64).",
    trap: "Signed shifts and negative numbers; use unsigned shifts where it matters.",
  },
  "matrix-traversal": {
    name: "Matrix traversal / in-place transform",
    signals: ["Rotate, transpose, spiral, diagonal", "Set rows/columns when a cell is 0", "Validate a board (Sudoku)"],
    move: "Use direction arrays or four shrinking borders for spirals. Rotate = transpose then reverse each row. For \"set zeroes\" in O(1) space, use the first row and column as flags. Row/col/box index for Sudoku: (r/3)*3 + c/3.",
    cost: "O(rows × cols).",
    trap: "Bounds checks and changing the matrix while you are still reading it.",
  },
  "recursion-divide": {
    name: "Recursion / divide and conquer",
    signals: ["The problem on size n is built from the same problem on smaller sizes", "Split in half, solve, combine (merge sort, fast power)", "Exponent or n is huge, so halve it"],
    move: "Define what the function returns for the smallest input, assume it works for smaller inputs, and combine. Fast power: x^n = (x^(n/2))², times x if n is odd.",
    cost: "Often O(log n) or O(n log n). Draw the recursion tree.",
    trap: "No base case, or repeating the same subproblem (add memo, then it is DP).",
  },
  "backtracking-subsets": {
    name: "Backtracking: choose, explore, un-choose",
    signals: ["\"Return all\" subsets / permutations / combinations / partitions", "Place things under constraints (N-Queens, Sudoku, word search)", "n is small (up to about 15–20)"],
    move: "Build the answer one decision at a time. Choose, recurse, then undo the choice. Prune as soon as the partial answer is impossible. To skip duplicates: sort, then skip a value equal to the previous one at the same depth.",
    cost: "Exponential: O(2ⁿ) subsets, O(n!) permutations.",
    trap: "Appending the same list object to the result instead of a copy.",
  },
  "grid-dfs-bfs": {
    name: "Flood fill on a grid (connected regions)",
    signals: ["Islands, regions, connected cells, enclaves, \"surrounded\"", "Grid of 0/1 where neighbours matter", "Paint or count a connected area"],
    move: "Loop over every cell. When you find an unvisited land cell, run DFS/BFS over its 4 neighbours, marking visited (or sinking the land). One run = one region. For \"surrounded\" problems start from the border and work inward.",
    cost: "O(rows × cols).",
    trap: "Deep recursion on big grids; switch to an explicit stack or BFS.",
  },
  "bfs-shortest": {
    name: "BFS for shortest path (unit steps)",
    signals: ["\"Minimum number of steps / moves / mutations\"", "Every move costs the same", "Things spreading from several sources at once (rotting oranges, 0-1 matrix)", "Puzzle states as nodes (word ladder, lock)"],
    move: "Queue + visited. Process level by level; the level number is the distance. For many sources, push them all in at the start (multi-source BFS). The nodes can be abstract states, not only cells.",
    cost: "O(V + E).",
    trap: "Mark visited when you enqueue, not when you dequeue.",
  },
  "graph-traversal": {
    name: "Graph DFS / BFS (components, clone, paths)",
    signals: ["Nodes and edges, \"connected\", \"reachable\", \"how many groups\"", "Copy a graph, check a path exists, collect all paths", "Edges given as a list; you need to build the graph first"],
    move: "Build an adjacency list. Keep a visited set. DFS or BFS from each unvisited node; each start is a new component. Clone with a map old → new.",
    cost: "O(V + E).",
    trap: "Forgetting to loop over all start nodes in a disconnected graph.",
  },
  "graph-coloring": {
    name: "Two-colouring (bipartite check)",
    signals: ["Split into two groups so no connected pair shares a group", "\"Is the graph bipartite?\", \"possible bipartition\"", "Odd cycle makes it impossible"],
    move: "BFS/DFS and colour each neighbour with the opposite colour. A neighbour that already has your colour means failure.",
    cost: "O(V + E).",
    trap: "Disconnected graphs: start from every uncoloured node.",
  },
  "topo-sort": {
    name: "Topological sort / cycle in a directed graph",
    signals: ["Prerequisites, dependencies, ordering of tasks", "\"Can all courses be finished?\"", "Safe nodes, longest path in a DAG"],
    move: "Kahn's: compute in-degrees, queue everything at 0, pop, reduce neighbours' in-degree. If you processed fewer nodes than exist, there is a cycle. Or DFS with three colours.",
    cost: "O(V + E).",
    trap: "Edge direction: prerequisite → course.",
  },
  "union-find": {
    name: "Union-Find (disjoint sets)",
    signals: ["Merge groups and ask \"are these connected?\"", "Redundant edge, number of components as edges arrive", "Accounts / items that share something must be merged"],
    move: "parent[] with find (path compression) and union (by size/rank). Union the two ends of each edge; a union that finds the same root is a cycle/redundant edge. Components = starting count − successful unions.",
    cost: "≈ O(α(n)) per operation.",
    trap: "Forgetting find() on both sides before comparing.",
  },
  "dijkstra": {
    name: "Dijkstra (weighted shortest path)",
    signals: ["Edges have different non-negative weights/costs/times", "Cheapest route, minimum effort/time to reach a node", "\"Minimise the maximum edge on a path\" (a Dijkstra variation)"],
    move: "Min-heap of (distance, node). Pop the closest, skip it if stale, relax each neighbour. Change what \"distance\" means to fit the problem (max edge, effort, probability).",
    cost: "O((V + E) log V).",
    trap: "Negative edges break it. Use Bellman-Ford.",
  },
  "bellman-ford-dp": {
    name: "Bellman-Ford / shortest path with at most K edges",
    signals: ["\"At most k stops / edges\"", "Negative edge weights", "All-pairs shortest path on a small graph (Floyd-Warshall)"],
    move: "Relax all edges k+1 times, using a copy of last round's distances so you don't use more than one new edge per round. Floyd-Warshall: three loops over k, i, j.",
    cost: "O(k·E) or O(V³).",
    trap: "Updating in place lets a path use more than k edges.",
  },
  "mst": {
    name: "Minimum spanning tree (Kruskal / Prim)",
    signals: ["Connect all points / cities with minimum total cost", "Cheapest set of edges that keeps everything connected"],
    move: "Kruskal: sort edges, add the cheapest edge that doesn't form a cycle (Union-Find). Prim: grow from one node with a min-heap.",
    cost: "O(E log E).",
    trap: "Points given as coordinates: generate edges with Manhattan distance, and watch the O(n²) edge count.",
  },
  "euler-path": {
    name: "Eulerian path (use every edge once)",
    signals: ["Use every ticket / edge exactly once", "Itinerary with lexical order"],
    move: "Hierholzer: DFS taking edges in order (a min-heap or sorted list per node), add the node to the route after all its edges are used, then reverse the route.",
    cost: "O(E log E).",
    trap: "Appending before finishing a node's edges.",
  },
  "bridges-tarjan": {
    name: "Bridges and articulation points (Tarjan)",
    signals: ["Critical connections, edges whose removal disconnects the network"],
    move: "DFS with discovery time and low-link. Edge (u, v) is a bridge if low[v] > disc[u].",
    cost: "O(V + E).",
    trap: "Don't treat the parent edge as a back edge.",
  },
  "tree-dfs-recursion": {
    name: "Tree DFS (recursion on subtrees)",
    signals: ["Depth, height, balanced, symmetric, same tree, path sum", "Answer for a node depends on its left and right answers", "Traversals: inorder, preorder, postorder"],
    move: "Solve for the null node, then combine left and right. Two styles: bottom-up (return a value to the parent) or top-down (pass a parameter such as the current sum or the allowed range down). For \"best path through a node\" return the one-sided best, update a global with both sides.",
    cost: "O(n) time, O(h) stack.",
    trap: "Confusing what you return (one branch) with what you record globally (both branches).",
  },
  "tree-bfs-level": {
    name: "Tree level-order BFS",
    signals: ["Level by level, right-side view, zigzag, width, minimum depth", "Anything that asks about a whole row of the tree"],
    move: "Queue. At each round, take size = queue.length nodes: that is one level. Collect, then push children.",
    cost: "O(n).",
    trap: "Read the level size before you start pushing children.",
  },
  "tree-construct": {
    name: "Build or encode a tree",
    signals: ["Construct a tree from two traversals", "Serialize / deserialize, flatten, convert a sorted array or list to a BST"],
    move: "Preorder gives the root, inorder tells you the left/right split (use a map value → inorder index). Recurse on the two halves. For a sorted array, the middle element is the root.",
    cost: "O(n).",
    trap: "Slicing arrays inside recursion makes it O(n²). Pass index bounds.",
  },
  "bst-inorder": {
    name: "BST property / inorder is sorted",
    signals: ["Binary search tree: left < node < right", "k-th smallest, validate, two-sum in BST, minimum difference", "Search/insert/delete using the ordering"],
    move: "Inorder traversal visits a BST in sorted order, so many questions become array questions. To search/insert, go left or right by comparing. To validate, pass (low, high) bounds down; don't just compare with the children.",
    cost: "O(h) per search, O(n) for a full inorder.",
    trap: "A node must be within the bounds from all ancestors, not just its parent.",
  },
  "lca": {
    name: "Lowest common ancestor",
    signals: ["Smallest subtree containing two given nodes", "Distance between two nodes in a tree"],
    move: "Binary tree: if the current node is p or q return it; if both sides return something, this node is the LCA. BST: go left if both are smaller, right if both are bigger, else it is the split point.",
    cost: "O(n) or O(h) in a BST.",
    trap: "In a plain tree you can't use the ordering.",
  },
  "tree-to-graph": {
    name: "Tree as a graph (parent pointers)",
    signals: ["Nodes at distance k from a target, moving up and down", "Anything needing the parent of a node"],
    move: "Record each node's parent in a map (one DFS), then BFS outwards from the target over left, right and parent.",
    cost: "O(n).",
    trap: "Keep a visited set so you don't walk back.",
  },
  "dp-linear": {
    name: "1D DP: take / skip, previous states",
    signals: ["\"Number of ways to reach step n\", \"maximum you can collect without taking neighbours\"", "Answer for i depends on i−1, i−2 (or a few earlier steps)", "Decode / split a string in how many ways"],
    move: "Say what dp[i] means in a sentence. Write dp[i] from earlier dp values, set base cases, fill left to right, then shrink to a few variables if only the last two matter. Circular version: run twice, excluding first then last.",
    cost: "O(n).",
    trap: "A vague definition of dp[i]. If you cannot say it in words, the recurrence will be wrong.",
  },
  "dp-knapsack": {
    name: "Knapsack / subset-sum / coin change DP",
    signals: ["Pick items to reach a target sum or capacity", "\"Can we split into two equal halves?\", \"number of ways to make amount\"", "Each item once (0/1) or unlimited (unbounded)"],
    move: "dp[s] = can we (or how many ways to / min coins to) reach sum s. 0/1: loop sums downward so each item is used once. Unbounded: loop sums upward. Combinations: items outer loop; permutations: sums outer loop.",
    cost: "O(n · target).",
    trap: "Loop order decides combinations vs permutations, and 0/1 vs unbounded.",
  },
  "dp-grid": {
    name: "Grid DP",
    signals: ["Move only right/down in a grid, count paths or minimum cost", "Triangle, falling path, largest square of 1s", "Two robots/walkers moving at once (add a dimension)"],
    move: "dp[r][c] depends on the cell above and the cell to the left (or the three above). Blocked cells are 0 ways. Rolling one row cuts space to O(cols).",
    cost: "O(rows × cols).",
    trap: "Initialising the first row and column.",
  },
  "dp-string-two": {
    name: "Two-string DP (LCS, edit distance, matching)",
    signals: ["Two strings, compare or transform one into another", "Longest common subsequence, edit distance, interleaving, distinct subsequences", "Wildcard / regex matching"],
    move: "dp[i][j] = answer for the first i characters of A and first j of B. If A[i−1] == B[j−1] extend the diagonal. Otherwise take the best of dropping a character from A, from B, or (edit distance) replacing.",
    cost: "O(n·m).",
    trap: "Use length+1 sizing so the empty prefix is row/column 0.",
  },
  "dp-interval": {
    name: "Interval DP (split point)",
    signals: ["Burst balloons, cut a stick, matrix-chain style", "Best way to combine a range [l, r] by choosing the last/first action"],
    move: "dp[l][r] = best for the segment l..r. Try every split k, with the \"last thing done\" at k so the two sides stay independent. Fill by increasing segment length.",
    cost: "O(n³).",
    trap: "Choose k as the LAST action, not the first, so the sides don't interact.",
  },
  "dp-lis": {
    name: "Longest increasing subsequence",
    signals: ["Longest increasing / chain / nested sequence", "Envelopes or boxes that nest", "Subsequence where each element relates to an earlier one"],
    move: "O(n²): dp[i] = 1 + max dp[j] for earlier j with a[j] < a[i]. O(n log n): keep tails[], where tails[k] is the smallest tail of an increasing run of length k+1; binary search where each number goes. For 2D (envelopes) sort by width ascending and height descending, then LIS on height.",
    cost: "O(n log n).",
    trap: "tails[] is not itself a valid subsequence.",
  },
  "dp-state-machine": {
    name: "State-machine DP (buy / sell / cooldown)",
    signals: ["Stock buy and sell with limits (k transactions, cooldown, fee)", "Each day you are in one of a few states (holding, not holding, cooling down)"],
    move: "One variable per state (hold, sold, rest). Each day, each state's best comes from yesterday's allowed states. Add a transaction-count dimension for \"at most k\".",
    cost: "O(n·k).",
    trap: "Count a transaction on buy or on sell, never both.",
  },
  "dp-tree": {
    name: "Tree DP",
    signals: ["Optimal choice on a tree: rob or skip a node, maximum path, split product", "Each node's answer needs both children's answers"],
    move: "DFS returns a small tuple per node, such as (best if I take this node, best if I skip it). Combine the children, and update a global answer when a path bends at this node.",
    cost: "O(n).",
    trap: "Returning a pair vs updating a global: be clear which is which.",
  },
  "dp-bitmask": {
    name: "Bitmask DP / state compression",
    signals: ["n ≤ 15–20 and you must track which items are used", "Visit all nodes, partition into k equal groups, assign tasks"],
    move: "Encode the used set as an integer mask. dp[mask] (plus a current position if needed) = best/possible. Transition by adding one unused item.",
    cost: "O(2ⁿ · n).",
    trap: "Sizes: 2ⁿ states only works for small n.",
  },
  "palindrome-expand": {
    name: "Palindrome: expand around centre / interval DP",
    signals: ["Longest palindromic substring, count palindromic substrings", "Make a string a palindrome with the fewest inserts or cuts", "Palindrome partitioning"],
    move: "Each palindrome has a centre (n single characters, n−1 gaps). Expand while both sides match: O(n²). For counting/partitioning, dp[i][j] = s[i] == s[j] and dp[i+1][j−1]. Manacher gets O(n).",
    cost: "O(n²).",
    trap: "Forgetting even-length palindromes (centre in a gap).",
  },
  "trie": {
    name: "Trie (prefix tree)",
    signals: ["Many words queried by prefix, autocomplete, replace words by roots", "Search a grid for many words at once", "Maximum XOR of two numbers (bitwise trie)"],
    move: "Each node has children by character (or bit). Insert walks/creates nodes, search walks them. Store an end-of-word flag. Combine with DFS/backtracking for word-search II.",
    cost: "O(length of the word) per operation.",
    trap: "Prune finished branches in grid search to avoid TLE.",
  },
  "segment-tree-bit": {
    name: "Segment tree / Fenwick tree",
    signals: ["Range query AND point/range update on an array", "Count smaller / larger elements to the right, reverse pairs", "Skyline, coordinate-compressed counting"],
    move: "Fenwick (BIT) for prefix sums with updates; segment tree for min/max/sum on ranges with lazy updates. For counting problems: compress values, then walk the array and query/update.",
    cost: "O(log n) per query and update.",
    trap: "1-indexed Fenwick, and compress values first when they are large.",
  },
  "ordered-set": {
    name: "Ordered set / sorted container",
    signals: ["Insert and query floor / ceiling (nearest ≤ or ≥)", "Calendar bookings without overlap", "Sliding window median / order statistics"],
    move: "A balanced BST or a sorted list with binary search keeps elements ordered. Ask for the neighbour of x in O(log n).",
    cost: "O(log n) per op.",
    trap: "Python has no built-in TreeSet; use bisect on a list or a library.",
  },
  "string-matching": {
    name: "String matching: KMP / rolling hash / Z",
    signals: ["Find a pattern in a text in linear time", "Repeated string, rotation, shortest palindrome by adding a prefix", "Longest duplicate substring"],
    move: "KMP builds a failure table (longest proper prefix that is also a suffix). Rolling hash compares windows in O(1); combine with binary search on length for \"longest repeated\". Rotation check: B is in A + A.",
    cost: "O(n + m).",
    trap: "Hash collisions: use a large modulus or double hash.",
  },
  "design-ds": {
    name: "Design a data structure (map + list / stack / heap)",
    signals: ["\"Design a class with these operations in O(1)\"", "LRU / LFU cache, getRandom, min stack, iterator", "Operations over a stream of calls"],
    move: "Pair structures so each one covers the other's weakness: hash map + doubly linked list (LRU), hash map + array (getRandom, swap-with-last on delete), two stacks (queue), stack of (value, min so far).",
    cost: "As required, usually O(1) per operation.",
    trap: "Keep the two structures consistent on every update.",
  },
  "design-time-versioned": {
    name: "Versioned / timestamped storage (map + binary search)",
    signals: ["Get the value as of time t", "Snapshots, history, per-key timelines", "Calendar-like booking by ranges"],
    move: "Store a list of (time, value) per key (they arrive in increasing order) and binary search for the last entry ≤ t.",
    cost: "O(log n) per query.",
    trap: "Return the floor entry, not an exact match.",
  },
  "game-minimax-dp": {
    name: "Two-player game DP (minimax)",
    signals: ["Two players take turns and both play optimally", "\"Can the first player win?\", \"best score difference\"", "Stones, coins or numbers taken from the ends"],
    move: "dp[state] = best score difference the player to move can force. Take a move, subtract the opponent's best result on the remaining state. The first player wins if the difference is ≥ 0.",
    cost: "O(n²) for interval states.",
    trap: "Track the difference (me − opponent), which avoids two arrays.",
  },
  "randomized": {
    name: "Random pick with weights / sampling",
    signals: ["Pick an index randomly with probability proportional to a weight", "Uniform random from a dynamic collection"],
    move: "Weighted: prefix sums, random number in [1, total], binary search for its bucket. Uniform on a changing set: array + map with swap-delete. Streams: reservoir sampling.",
    cost: "O(log n) per pick after O(n) setup.",
    trap: "Off-by-one on the bucket boundary.",
  },
  "merge-sort-count": {
    name: "Count pairs during merge sort / with a BIT",
    signals: ["Count inversions, reverse pairs, smaller numbers after self", "Range-sum counts across split points"],
    move: "In merge sort, count cross pairs while both halves are sorted (two pointers across halves). Or coordinate-compress and use a Fenwick tree while walking the array.",
    cost: "O(n log n).",
    trap: "Count before you merge, and watch int overflow in the comparison.",
  },
  "meet-in-middle": {
    name: "Meet in the middle",
    signals: ["n up to about 40: too big for 2ⁿ, small enough for 2^(n/2)", "Split into two halves and combine, e.g. minimise a subset-sum difference"],
    move: "Enumerate all subset sums of each half, sort one side, and binary search or two-pointer to pair them.",
    cost: "O(2^(n/2) · n).",
    trap: "Track how many elements each half used when the count matters.",
  },
};

// Lowercase topic tag → pattern keys, strongest first. Used only for questions that have no hand-written entry.
const STRONG = {
  "sliding window": ["sliding-window-variable", "sliding-window-fixed"],
  "two pointers": ["two-pointers-opposite", "two-pointers-same"],
  "fast and slow pointers": ["fast-slow"],
  "floyd cycle detection": ["fast-slow"],
  "binary search": ["binary-search-index", "binary-search-answer"],
  "prefix sum": ["prefix-sum", "prefix-hash"],
  "monotonic stack": ["monotonic-stack"],
  "monotonic queue": ["monotonic-deque"],
  "stack": ["stack-matching"],
  "parentheses": ["stack-matching"],
  "heap (priority queue)": ["heap-topk"],
  "quickselect": ["heap-topk"],
  "data stream": ["two-heaps"],
  "linked list": ["linked-list-pointer"],
  "doubly-linked list": ["design-ds"],
  "backtracking": ["backtracking-subsets"],
  "union find": ["union-find"],
  "union-find": ["union-find"],
  "topological sort": ["topo-sort"],
  "shortest path": ["dijkstra", "bellman-ford-dp"],
  "dijkstra": ["dijkstra"],
  "bellman-ford": ["bellman-ford-dp"],
  "minimum spanning tree": ["mst"],
  "bipartite graph": ["graph-coloring"],
  "graph coloring": ["graph-coloring"],
  "eulerian circuit": ["euler-path"],
  "bridge": ["bridges-tarjan"],
  "binary search tree": ["bst-inorder"],
  "lowest common ancestor": ["lca"],
  "trie": ["trie"],
  "segment tree": ["segment-tree-bit"],
  "binary indexed tree": ["segment-tree-bit"],
  "ordered set": ["ordered-set"],
  "string matching": ["string-matching"],
  "rolling hash": ["string-matching"],
  "kmp": ["string-matching"],
  "suffix array": ["string-matching"],
  "bitmask": ["dp-bitmask"],
  "bit manipulation": ["bit-manipulation"],
  "game theory": ["game-minimax-dp"],
  "minimax": ["game-minimax-dp"],
  "randomized": ["randomized"],
  "reservoir sampling": ["randomized"],
  "meet in the middle": ["meet-in-middle"],
  "design": ["design-ds"],
  "intervals": ["intervals"],
  "sweep line": ["intervals"],
  "boyer-moore voting": ["boyer-moore"],
  "greatest common divisor": ["number-theory"],
  "number theory": ["number-theory"],
  "sieve": ["number-theory"],
  "primality test": ["number-theory"],
  "combinatorics": ["combinatorics-math"],
  "merge sort": ["merge-sort-count"],
  "counting": ["frequency-count"],
  "counting sort": ["frequency-count"],
  "bucket sort": ["frequency-count"],
};
const WEAK = {
  "greedy": ["greedy"],
  "sorting": ["sort-then-scan"],
  "hash table": ["hash-lookup"],
  "hash function": ["hash-lookup"],
  "divide and conquer": ["recursion-divide"],
  "recursion": ["recursion-divide"],
  "matrix": ["matrix-traversal"],
  "simulation": ["simulation"],
  "math": ["math-digits"],
  "string": [],
  "array": [],
};

const has = (set, ...names) => names.some(n => set.has(n));

// Tags that need other tags to decide (DFS on a tree is not DFS on a grid, DP on strings is not DP on a grid…).
function contextual(set) {
  const out = [];
  const traversal = has(set, "depth-first search", "breadth-first search");
  const tree = has(set, "tree", "binary tree");
  const grid = has(set, "matrix");
  if (set.has("dynamic programming") || set.has("memoization")) {
    if (has(set, "knapsack", "0-1 knapsack", "unbounded knapsack")) out.push("dp-knapsack");
    if (has(set, "longest increasing subsequence")) out.push("dp-lis");
    if (has(set, "longest common subsequence")) out.push("dp-string-two");
    if (has(set, "tree dp") || (tree && traversal)) out.push("dp-tree");
    if (set.has("bitmask")) out.push("dp-bitmask");
    if (grid) out.push("dp-grid");
    if (set.has("string") && !out.includes("dp-string-two")) out.push("dp-string-two");
    if (!out.length) out.push("dp-linear");
  }
  if (traversal) {
    if (tree) {
      if (set.has("breadth-first search")) out.push("tree-bfs-level");
      if (set.has("depth-first search")) out.push("tree-dfs-recursion");
    } else if (grid) {
      out.push("grid-dfs-bfs");
      if (set.has("breadth-first search")) out.push("bfs-shortest");
    } else {
      if (set.has("breadth-first search")) out.push("bfs-shortest");
      out.push("graph-traversal");
    }
  } else if (tree) {
    out.push("tree-dfs-recursion");
  }
  return out;
}

// Hints from topic tags. Honest about being a guess: it only ever says "likely".
export function patternHintsFromTags(tags = []) {
  const set = new Set(tags.map(t => String(t).toLowerCase()));
  const keys = [];
  const add = k => { if (PATTERNS[k] && !keys.includes(k)) keys.push(k); };
  for (const k of contextual(set)) add(k);
  for (const t of set) for (const k of STRONG[t] || []) add(k);
  if (keys.length < 2) for (const t of set) for (const k of WEAK[t] || []) add(k);
  return keys.slice(0, 3);
}

// Parse "key+key2: cue sentence". The first key is the main pattern.
export function parseEntry(entry) {
  const i = entry.indexOf(": ");
  const keys = (i < 0 ? entry : entry.slice(0, i)).split("+").map(s => s.trim()).filter(Boolean);
  return { keys, cue: i < 0 ? "" : entry.slice(i + 2).trim() };
}

// What the "Learn the topic" tab shows for one question:
//   { source: "curated" | "tags", items: [{ key, ...PATTERNS[key], cue? }] }  or null when nothing is known.
export function patternsFor(item) {
  if (!item || item.kind !== "dsa") return null;
  const hand = item.platform === "LeetCode" ? PATH_PATTERNS[item.id] : null;
  if (hand) {
    const { keys, cue } = parseEntry(hand);
    return { source: "curated", items: keys.filter(k => PATTERNS[k]).map((k, i) => ({ key: k, ...PATTERNS[k], cue: i === 0 ? cue : "" })) };
  }
  const keys = patternHintsFromTags(item.tags || []);
  if (!keys.length) return null;
  return { source: "tags", items: keys.map(k => ({ key: k, ...PATTERNS[k], cue: "" })) };
}
