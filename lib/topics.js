// Every topic explained like you're 12. story = a picture in your head, idea = what it really is, spot = when to use it.
export const TOPICS = {
  // ---------- DSA ----------
  "Array": {
    story: "Think of the row of lockers in your school corridor, numbered 0, 1, 2… If you know the locker number, you walk straight to it. You don't open all the others first.",
    idea: "An array keeps items side by side. Reading item i is instant, O(1). Putting something in the middle is slow, because everything after it has to shift.",
    spot: "Almost every problem gives you an array. The real question is which trick you use on it: two pointers, prefix sums, hashing or sorting.",
  },
  "String": {
    story: "A string is a train of letters, one letter per coach. \"cricket\" is a train with 7 coaches.",
    idea: "Treat it like an array of characters. Common moves: count letters (an array of 26 or a map), compare, reverse, build new strings. Adding to a string inside a loop can be slow in Java or Python, so use a builder or a list.",
    spot: "Words, palindromes, anagrams, anything that says substring or subsequence.",
  },
  "Hash Table": {
    story: "Your class teacher has a register. Say a roll number and she instantly finds the name. She doesn't read the whole list from the top.",
    idea: "A hash map stores key → value pairs and finds any key in about O(1). Use it to remember what you've already seen, or to count things.",
    spot: "\"Have I seen this before?\", counting how often things appear, finding a pair that adds up to a target, grouping things that are the same.",
  },
  "Math": {
    story: "Adding 1 to 100 one by one is slow. The shortcut 100 × 101 ÷ 2 = 5050 gives it in one step. Some problems have a shortcut like that.",
    idea: "Look for a pattern or formula: remainders (%), digits, powers, divisibility. Watch out for overflow and use 64-bit numbers (long).",
    spot: "Numbers and digits, \"return the answer modulo 1e9+7\", n so big you can't loop over it.",
  },
  "Dynamic Programming": {
    story: "If someone asks 7+8+9+10 you add it up. If they then say \"now add 11\", you don't start again. You remember 34 and add 11. DP means remembering answers to smaller questions so you never solve the same thing twice.",
    idea: "Decide what dp[state] means (the answer for a smaller version). Write how a bigger state is built from smaller ones (the recurrence). Set the base cases. Fill the table.",
    spot: "\"Number of ways\", \"minimum or maximum cost\", \"is it possible to…\", making a choice at every step where greedy gives wrong answers.",
  },
  "Sorting": {
    story: "Before picking a cricket team you line everyone up from best to worst. After that, choosing is easy.",
    idea: "Sorting takes O(n log n) and puts related things next to each other. After sorting you can use two pointers, binary search, or merge overlapping things.",
    spot: "When the original order doesn't matter for the answer, sorting first often makes the problem simple.",
  },
  "Greedy": {
    story: "In a game, you always grab the biggest coin you can reach. That's being greedy. Sometimes it wins, sometimes it walks you into a trap.",
    idea: "Make the best-looking choice at each step and never go back. It's fast, but you must be sure the best local choice leads to the best overall answer. Try to break it with a counter-example first.",
    spot: "Scheduling, \"minimum number of…\", intervals, jumping games. If you find a counter-example, switch to DP.",
  },
  "Depth-First Search": {
    story: "Exploring a maze: you keep walking down one path until you hit a dead end, then walk back to the last turn and try a different one.",
    idea: "DFS goes as deep as possible before coming back, using recursion or a stack. Mark places as visited so you don't go round in circles.",
    spot: "Trees, connected regions like islands, finding all paths, checking for cycles.",
  },
  "Breadth-First Search": {
    story: "Drop a stone in a pond. The ripples spread one ring at a time. BFS visits everything 1 step away, then 2 steps away, then 3.",
    idea: "Use a queue. Because it goes level by level, the first time you reach a place is the shortest way there, as long as every step costs the same.",
    spot: "\"Minimum steps\", shortest path in a grid or a graph without weights, tree level order, things spreading (rotting oranges, fire).",
  },
  "Binary Search": {
    story: "Guess-the-number from 1 to 100: you say 50, your friend says \"higher\", you say 75… You find it in about 7 guesses, not 100.",
    idea: "Cut the search space in half every step: O(log n). It works on sorted data, and also on answers: \"Is speed k enough? Yes → try a smaller k.\"",
    spot: "Sorted arrays, \"the minimum or maximum value such that…\", rotated arrays, a huge range of possible answers.",
  },
  "Matrix": {
    story: "A matrix is a chessboard or a Ludo board: rows and columns. Every square is grid[row][col].",
    idea: "Move with direction arrays (up, down, left, right) and always check you're still inside the board. Many grid problems are graph problems in disguise.",
    spot: "2D grids, islands, paths across a board, rotating or spiralling a table.",
  },
  "Bit Manipulation": {
    story: "A panel of light switches, each ON (1) or OFF (0). Every number is just a row of switches.",
    idea: "Use &, |, ^, << and >> to check or flip switches. A magic fact: x ^ x = 0, so XOR-ing everything together cancels out every pair.",
    spot: "\"Every number appears twice except one\", powers of two, subsets, doing maths without + or *.",
  },
  "Tree": {
    story: "Your family tree: grandparents at the top, parents under them, kids under the parents. Everyone has exactly one parent, except the person at the very top.",
    idea: "A tree is nodes joined with no loops and one root. Most tree problems use recursion: solve the children first, then combine their answers.",
    spot: "Hierarchies, folders inside folders, anything with a parent and children.",
  },
  "Binary Tree": {
    story: "A family tree where every person has at most two kids: a left one and a right one.",
    idea: "Think: \"If I already knew the answer for my left and right side, what's my answer?\" Traversals: preorder, inorder, postorder (DFS) and level order (BFS).",
    spot: "Height, diameter, paths, views of the tree, building a tree from traversals.",
  },
  "Two Pointers": {
    story: "Two friends start at opposite ends of a bench and walk towards each other. Together they check the whole bench in one walk.",
    idea: "Keep two indexes and move one of them based on a rule, so you check pairs in O(n) instead of O(n²). Often needs sorted data.",
    spot: "Sorted arrays, pairs or triplets that add up to a target, palindromes, removing duplicates in place.",
  },
  "Prefix Sum": {
    story: "The scoreboard shows the total after every over. Runs scored between over 5 and over 10? Total after 10 minus total after 4.",
    idea: "prefix[i] = sum of the first i items. Any range sum = prefix[r+1] − prefix[l], in O(1). Add a hash map to count subarrays that hit a target sum.",
    spot: "\"Sum of a subarray\", lots of range questions, \"subarray sum equals k\", equal numbers of 0s and 1s.",
  },
  "Heap (Priority Queue)": {
    story: "A hospital emergency room: the most serious patient is always treated next, no matter who arrived first.",
    idea: "A heap hands you the smallest (or largest) item in O(log n). Keep a heap of size k to track the top k things.",
    spot: "\"K largest, smallest or closest\", always choosing the best next thing, merging sorted lists, a running median.",
  },
  "Database": {
    story: "A database is a set of Excel sheets that are linked together. SQL is how you ask them questions, like \"show me every student who scored above 90\".",
    idea: "SELECT columns FROM table WHERE condition. JOIN links tables by a shared column. GROUP BY with COUNT or SUM makes summaries. Window functions rank rows.",
    spot: "LeetCode questions tagged Database. These show up in online tests and data roles.",
  },
  "Simulation": {
    story: "Just play the game exactly as the rules say, move by move, like moving your token in Ludo.",
    idea: "There's no clever trick. Code the rules carefully. The hard part is not missing an edge case.",
    spot: "Long statements full of rules: robots moving, games, clocks, queues of people.",
  },
  "Counting": {
    story: "Before a game, you count how many marbles of each colour are in the jar.",
    idea: "Build a frequency table (an array of 26 for letters, or a hash map) and answer the question from the counts.",
    spot: "Anagrams, \"most frequent\", \"appears more than n/2 times\", checking if two words use the same letters.",
  },
  "Stack": {
    story: "A pile of plates: you add plates on top and take them from the top. The last plate in is the first plate out.",
    idea: "Push and pop at one end, both O(1). It's perfect when the most recent thing matters most, like matching brackets.",
    spot: "Brackets, undo buttons, \"previous or next greater element\", solving expressions.",
  },
  "Graph Theory": {
    story: "Cities (dots) connected by roads (lines). Your WhatsApp contacts are a graph too: people are dots, friendships are lines.",
    idea: "Store it as an adjacency list (for each dot, the list of its neighbours). Then explore with BFS or DFS, and always keep a visited set.",
    spot: "Networks, dependencies, \"connected\", \"reachable\", grids where each cell links to its neighbours.",
  },
  "Sliding Window": {
    story: "From a bus window you see only a few coaches of a passing train at a time, and the view slides along the train.",
    idea: "Keep a window [left, right]. Grow it by moving right. When the window breaks a rule, shrink it from the left. Each element enters and leaves once, so it's O(n).",
    spot: "\"Longest or shortest substring or subarray with…\", \"at most k\", anything about consecutive elements.",
  },
  "Design": {
    story: "Your teacher says: \"Build a machine with these buttons, and every button must work fast.\" You choose what parts go inside.",
    idea: "Pick data structures so every operation is fast. For example, a hash map plus a linked list gives an O(1) LRU cache.",
    spot: "\"Implement class X with these methods\": LRU Cache, Min Stack, Design Twitter.",
  },
  "Enumeration": {
    story: "Opening a 3-digit number lock by trying 000, 001, 002… until it clicks.",
    idea: "Try every possibility when there aren't too many. Check the limits first: with n ≤ 20, 2^n is about a million, which is fine.",
    spot: "Small limits, \"try all\", or when no smarter trick shows up.",
  },
  "Backtracking": {
    story: "In a maze you pick a path. If you hit a wall you step back to the last turn and try the next one.",
    idea: "Build the answer one choice at a time. After trying a choice, undo it (backtrack) and try the next. Skip branches that can't possibly work (pruning).",
    spot: "\"All combinations, permutations or subsets\", N-Queens, Sudoku, word search.",
  },
  "Union-Find": {
    story: "Kids forming teams in the playground. Every team has a captain. To check if two kids are on the same team, ask who their captain is. To merge two teams, one captain joins the other.",
    idea: "find(x) returns the group's leader and union(a, b) merges two groups. With path compression, both are almost O(1).",
    spot: "Connected groups, \"are these two connected?\", finding a cycle, merging accounts, Kruskal's algorithm.",
  },
  "Number Theory": {
    story: "The maths of whole numbers: primes, factors and remainders, like working out how to share 24 sweets equally between friends.",
    idea: "GCD with Euclid's trick: gcd(a, b) = gcd(b, a % b). Find primes with the Sieve of Eratosthenes. Use modulo to keep huge answers small.",
    spot: "Divisors, primes, \"modulo 1e9+7\", GCD or LCM.",
  },
  "Linked List": {
    story: "A treasure hunt: each clue tells you where the next clue is hidden. You can't jump straight to clue 5. You follow the chain.",
    idea: "Each node holds a value and a pointer to the next node. Draw it on paper! A dummy head node avoids edge cases, and a fast and slow pointer finds the middle or a cycle.",
    spot: "Reverse, merge, find the middle, detect a cycle, reorder.",
  },
  "Segment Tree": {
    story: "A tournament bracket: each winner moves up, so the champion at the top knows about everyone. If one player changes, you only replay the matches on their path up.",
    idea: "A tree built over ranges of the array. It answers range sum, min or max and handles updates in O(log n). A Fenwick tree (BIT) is a lighter version for sums.",
    spot: "Lots of range questions mixed with updates.",
  },
  "Monotonic Stack": {
    story: "Kids stand in a line. Each kid wants to know the first taller kid behind them. Keep a stack of kids still waiting. When a tall kid arrives, every shorter kid gets their answer and leaves the stack.",
    idea: "Keep the stack always increasing or always decreasing. Each item is pushed once and popped once, so it's O(n).",
    spot: "\"Next greater or smaller element\", stock span, largest rectangle in a histogram, daily temperatures.",
  },
  "Ordered Set": {
    story: "A librarian who keeps books in alphabetical order even while new ones keep arriving, so she can instantly tell you the book just before or after any title.",
    idea: "A balanced tree set or map (C++ set/map, Java TreeMap) keeps items sorted, with O(log n) insert, delete, and \"next bigger or smaller\".",
    spot: "Order that keeps changing, floor or ceiling lookups, the median of a sliding window.",
  },
  "Divide and Conquer": {
    story: "Cleaning a messy room: split it in half, you clean one side and your brother cleans the other, then you're done together.",
    idea: "Split the problem into smaller parts, solve each part (often with recursion), then combine. Merge sort and quick sort work this way.",
    spot: "Problems that split neatly into halves, counting inversions, combining sorted results.",
  },
  "Trie": {
    story: "You type \"ca…\" and your phone suggests cat, car, cake. It walks down a tree of words, one letter at a time.",
    idea: "Each node is a letter, and words that start the same share the same path. Insert and search take O(length of the word).",
    spot: "Prefix search, autocomplete, looking up lots of words, maximum XOR using bits.",
  },
  "Queue": {
    story: "The lunch line: the first kid in line gets food first (first in, first out).",
    idea: "Add at the back, remove from the front, both O(1). It's the engine behind BFS.",
    spot: "Handling things in the order they arrive, BFS, recent events in a time window.",
  },
  "Combinatorics": {
    story: "How many different 11-player teams can you pick from 15 friends? You don't write them all down. You count them with a formula.",
    idea: "Use nCr, permutations and Pascal's triangle. When the answer is huge, take it modulo.",
    spot: "\"Number of ways\" where picking or order matters, answers modulo 1e9+7.",
  },
  "Bitmask": {
    story: "Your game inventory has 10 items, and each is either picked up (1) or not (0). The whole inventory fits inside one number.",
    idea: "Store a set of up to about 20 items as the bits of one integer. Loop over all 2^n masks, or use the mask as a DP state.",
    spot: "Small n (20 or less), \"visit all\", giving tasks to people, subsets.",
  },
  "Recursion": {
    story: "Two mirrors facing each other show a smaller copy inside a smaller copy. A recursive function calls a smaller version of itself.",
    idea: "Every recursive function needs a base case (when to stop) and a step that makes the problem smaller. Trust that the smaller call does its job.",
    spot: "Trees, backtracking, divide and conquer, anything defined in terms of itself.",
  },
  "Geometry": {
    story: "Maths class with points, lines and shapes drawn on graph paper.",
    idea: "Use coordinates, the distance formula, slopes stored as fractions (not decimals), and the cross product to tell left turns from right turns.",
    spot: "Points, rectangles, lines, areas.",
  },
  "Memoization": {
    story: "Writing the answers to hard sums at the back of your notebook, so next time you just look them up.",
    idea: "Top-down DP: write the plain recursive solution, then save each result in a map or array so every state is solved only once.",
    spot: "A recursion that keeps making the same calls again and again.",
  },
  "Binary Search Tree": {
    story: "A dictionary: open it in the middle. If your word comes earlier in the alphabet go left, if later go right.",
    idea: "Everything in the left subtree < node < everything in the right subtree. Inorder traversal gives sorted order. Searching costs O(height).",
    spot: "\"BST\" in the title, kth smallest, checking the order, inserting or deleting.",
  },
  "String Matching": {
    story: "Finding a word in a long page without starting over from scratch every time a letter doesn't match.",
    idea: "KMP, the Z-algorithm and rolling hash find a pattern in text in O(n + m) instead of O(n × m).",
    spot: "Finding a pattern in text, repeated substrings, prefixes that are also suffixes.",
  },
  "Hash Function": {
    story: "Giving every word a short fingerprint number, so you compare fingerprints instead of whole words.",
    idea: "A hash turns data into a number. A rolling hash updates the fingerprint in O(1) when a window slides by one letter.",
    spot: "Comparing many substrings quickly, finding duplicates, designing your own hash map.",
  },
  "Topological Sort": {
    story: "Getting dressed: socks before shoes, shirt before tie. Topological sort gives an order that follows every \"this before that\" rule.",
    idea: "Kahn's algorithm: keep taking tasks with no prerequisites left (in-degree 0). If some tasks never become free, there's a cycle.",
    spot: "Prerequisites, course schedules, build order, dependencies.",
  },
  "Shortest Path": {
    story: "Google Maps finding the fastest way home when every road takes a different amount of time.",
    idea: "Dijkstra: always expand the closest place not yet visited, using a min-heap (no negative weights). Bellman-Ford allows negative weights. Floyd-Warshall gives every pair for small graphs.",
    spot: "Weighted edges and \"minimum cost, time or effort to reach\".",
  },
  "Game Theory": {
    story: "Two players take turns and both play perfectly, like tic-tac-toe between two champions.",
    idea: "A position is winning if you can move to a position where your opponent loses. Use recursion or DP over game states (minimax).",
    spot: "\"Alice and Bob take turns, and both play optimally.\"",
  },
  "Data Stream": {
    story: "Watching a live cricket match: balls keep coming, and you update the scorecard after each one without rewatching the match.",
    idea: "Keep a small summary (heaps, counters, running sums) that you can update quickly for each new element.",
    spot: "Classes with add(num) and getMedian() style methods, input that never stops.",
  },
  "Interactive": {
    story: "The 20 Questions game: ask the judge a question, and use the answer to ask a better one.",
    idea: "You call a given function to learn things, and there's a limit on calls. Binary search or elimination usually keeps the calls low.",
    spot: "The problem gives you an API to call and limits how many times you can call it.",
  },
  "Monotonic Queue": {
    story: "Finding the tallest kid in every group of k as the line moves. A short kid standing behind a taller newcomer can never be the tallest again, so he leaves.",
    idea: "A deque kept in decreasing order gives the maximum of every sliding window in O(n) total.",
    spot: "\"Maximum or minimum of every window of size k\".",
  },
  "Brainteaser": {
    story: "A riddle: there's a trick, and once you see it the answer is one line.",
    idea: "Work out small cases by hand and look for the pattern.",
    spot: "A short, strange-sounding statement with huge limits.",
  },
  "Knapsack": {
    story: "Packing your bag for a school trip. It can only carry so much weight, so which snacks give you the most happiness without going over?",
    idea: "DP where dp[w] = the best value with capacity w. In 0/1 knapsack each item is used once, so loop the capacity backwards. In unbounded knapsack items can repeat, so loop forwards.",
    spot: "\"Pick items within a limit\", target sum, coin change, splitting into two equal halves.",
  },
  "Lowest Common Ancestor": {
    story: "In a family tree, the closest grandparent that two cousins share.",
    idea: "Recursively: if the two nodes are found in different subtrees, the current node is the LCA. Binary lifting answers many LCA questions fast.",
    spot: "Two nodes in a tree and their nearest shared parent, distance between two tree nodes.",
  },
  "Randomized": {
    story: "Shuffling cards, or picking a lucky-draw winner so that it's fair to everyone.",
    idea: "Use random numbers so every outcome has an equal chance: Fisher–Yates shuffle, reservoir sampling for a stream.",
    spot: "\"Return a random element\", \"equal probability\", shuffle.",
  },
  "Minimum Spanning Tree": {
    story: "Connecting every village with roads using the least cement in total, and without building any pointless loop.",
    idea: "Kruskal: sort the roads by cost and add each one unless it makes a loop (use Union-Find). Prim: grow outward from one village using a min-heap.",
    spot: "\"Connect all points with minimum cost\".",
  },
  "Intervals": {
    story: "Your timetable: some classes clash and some don't. Sort them by start time and the clashes become easy to spot.",
    idea: "Sort by start (or end) time, then walk through, merging or counting overlaps. Sweep line trick: +1 when something starts, −1 when it ends.",
    spot: "[start, end] pairs, meetings, bookings, merging ranges.",
  },
  "Bipartite Graph": {
    story: "Splitting your class into two teams so that no two kids who fight end up on the same team.",
    idea: "Colour the nodes with 2 colours using BFS or DFS. If two neighbours end up with the same colour, it's not bipartite.",
    spot: "\"Divide into two groups\", odd cycles, two-colouring.",
  },
  "Quickselect": {
    story: "Finding the 3rd tallest kid without lining up the whole class: split the class around one kid, then only look at the side that matters.",
    idea: "Partition the array like quicksort, then continue into just one side. On average that's O(n) to find the k-th element.",
    spot: "\"K-th largest or smallest\" when you don't need the whole array sorted.",
  },
  "Fast and Slow Pointers": {
    story: "Two runners on a track, one twice as fast. If the track is a loop, the fast runner will eventually lap the slow one.",
    idea: "Move slow one step and fast two steps. If they meet, there's a cycle. Resetting one pointer to the start then finds where the cycle begins.",
    spot: "Linked list cycles, the middle of a list, \"find the duplicate number\".",
  },
  "Boyer–Moore Majority Vote": {
    story: "A class vote where every pair of kids voting for different things cancel each other out. Whoever is still standing at the end is the majority.",
    idea: "Keep a candidate and a counter: same vote +1, different vote −1, and when the counter hits 0 pick a new candidate. O(n) time, O(1) space.",
    spot: "\"The element that appears more than n/2 times\".",
  },
  "Strongly Connected Component": {
    story: "A group of one-way streets where you can drive from any spot in the group to any other spot and back again.",
    idea: "Kosaraju's or Tarjan's algorithm finds these groups in O(V + E) using DFS.",
    spot: "Directed graphs and \"reachable from each other\".",
  },
  "Biconnected Component": {
    story: "A bridge on the only road into part of town. If it breaks, that part of town is cut off.",
    idea: "Tarjan's DFS tracks when each node was discovered and the lowest node it can reach back to. That finds bridges and weak points (articulation points).",
    spot: "\"Critical connections\": which one road or node, if removed, splits the network.",
  },
  "Flow Network": {
    story: "Water pipes running from a tank to your house, and every pipe has a maximum size. How much water can reach you each minute?",
    idea: "Max-flow algorithms (Ford–Fulkerson, Edmonds–Karp, Dinic) keep pushing water along paths until none can get through. They're also used for matching.",
    spot: "Rare in interviews. Capacity and matching problems.",
  },
  "Concurrency": {
    story: "Two kids writing on the same whiteboard at the same time will mess up each other's words. They need to take turns.",
    idea: "Use locks, semaphores or condition variables so threads take turns safely and in the right order.",
    spot: "\"Print in order\", multiple threads, thread-safe classes.",
  },
  "Shell": {
    story: "Talking to the computer by typing commands instead of clicking.",
    idea: "Bash commands like grep, awk, sed and sort process text files line by line.",
    spot: "LeetCode questions tagged Shell.",
  },

  "Time Complexity": {
    story: "Finding a friend's name in the school register: checking every page one by one takes longer as the register grows. Opening it in the middle and halving each time stays fast even for a huge register.",
    idea: "Big-O tells you how the work grows as the input grows: O(1) constant, O(log n) halving, O(n) one pass, O(n log n) sorting, O(n²) two nested loops, O(2^n) trying every subset. A computer does roughly 10^8 simple steps per second, so read the limits: n ≤ 10^5 needs O(n log n) or better, n ≤ 20 allows O(2^n).",
    spot: "Every problem. Before coding, check your idea against the input limits so you don't get Time Limit Exceeded.",
  },
  "How to Approach a Problem": {
    story: "Before building a Lego set, you look at the picture, sort the pieces, and build a rough version before the perfect one. Solving a coding problem works the same way.",
    idea: "Read the problem twice and note the limits. Work 2–3 small examples by hand. Write the simplest brute force that works. Then ask: what's repeated, what can be remembered, what can be sorted? Check your idea against the limits (n up to 10^5 usually needs O(n log n) or better).",
    spot: "Any problem, especially when you don't know which topic it belongs to.",
  },
  "Constructive Algorithms": {
    story: "Your teacher says: \"Arrange the chairs so no two red ones are next to each other.\" You don't search for the answer. You build one yourself, following a clever plan.",
    idea: "Instead of finding something, you must construct an answer (an array, a string, a graph) that meets the rules. Try small cases by hand, spot a pattern, then prove it always works.",
    spot: "\"Construct\", \"output any array/permutation such that…\", \"print YES and an example\".",
  },
  "Data Structures": {
    story: "Choosing the right bag for a trip: a backpack for books, a lunch box for food, a pencil box for pens. The right container makes everything easier.",
    idea: "The problem is really about picking or building the right structure (set, map, heap, segment tree, deque) so every query and update is fast enough.",
    spot: "Many queries or updates, tight time limits, \"after each operation, print…\".",
  },
  "Ad Hoc": {
    story: "A puzzle with no standard recipe. You look at it, play with small examples, and suddenly see the trick.",
    idea: "No famous algorithm applies. Write out small cases, look for a pattern or an invariant (something that never changes), then code the observation.",
    spot: "Short statements, odd rules, easy-looking problems in contests (Div. 2 A/B, CodeChef Starters).",
  },
  "Probability": {
    story: "Rolling a dice: each number has a 1 in 6 chance. If you roll it many times, the average comes out to 3.5.",
    idea: "Expected value = sum of (value × its chance). Linearity of expectation lets you add up expected values piece by piece. Answers are often asked modulo a prime, using modular inverse.",
    spot: "\"Expected number of…\", \"probability that…\", random choices in the statement.",
  },

  // ---------- System design: high level ----------
  "Scalability": {
    story: "When the school canteen gets crowded, you can build a bigger kitchen (scale up) or open more counters (scale out).",
    idea: "Vertical scaling means a bigger machine: easy, but it has a limit and one failure point. Horizontal scaling means more machines behind a load balancer, which needs servers that don't store user state. Keep sessions in Redis or a signed token so any server can answer any request, and let auto-scaling add or remove servers as traffic changes.",
    spot: "Every HLD interview asks \"what happens with 10 times more users?\"",
  },
  "Estimation": {
    story: "Before a school trip you quickly work out: 40 kids × 2 samosas = 80 samosas. It's rough, but good enough to plan.",
    idea: "Estimate users, requests per second, storage per day and bandwidth. Handy facts: one day ≈ 86,400 seconds ≈ 10^5. A million requests a day ≈ 12 per second. Plan for peaks of about 2–3 times the average, and note the read-to-write ratio.",
    spot: "The start of an HLD interview, to decide how big the system has to be.",
  },
  "Load Balancer": {
    story: "A traffic policeman at a junction waving each car towards whichever road is free.",
    idea: "It spreads requests across servers (round robin, least connections, hashing) and stops sending traffic to a dead server (health checks). Layer 4 balancers route by IP and port; layer 7 ones read the HTTP request (path, cookies). A reverse proxy such as Nginx does this job and can also cache and handle HTTPS.",
    spot: "Any design with more than one server, high availability.",
  },
  "Caching": {
    story: "Keeping your favourite comic on your desk instead of walking to the library every time you want to read it.",
    idea: "Keep popular data in fast memory (Redis, Memcached) close to the app. Decide what to throw out when it's full (LRU), how long things live (TTL), and how to keep it fresh: cache-aside (fill the cache on a miss), write-through (write cache and database together) or write-back (write the cache now and the database later: fast, but data can be lost). Stale data after an update is the classic bug, so delete or update the cached copy when the data changes.",
    spot: "Systems that read far more than they write, the same data asked for again and again.",
  },
  "CDN": {
    story: "Instead of every kid in India ordering a book from one shop in Delhi, copies are kept in a shop in every city.",
    idea: "A Content Delivery Network keeps copies of static files (images, videos, scripts) on servers close to users, so they load quickly.",
    spot: "Images, videos, users spread across the world.",
  },
  "Databases": {
    story: "SQL is a neat Excel sheet with fixed columns and strict rules. NoSQL is a big box of labelled folders where every folder can hold different stuff.",
    idea: "SQL gives tables, joins and strong transactions (money, bookings). NoSQL (key-value, document, wide-column) is flexible and spreads across machines easily (feeds, chats, logs). Indexes make reads fast but writes a bit slower.",
    spot: "Every design. Pick a database and explain why.",
  },
  "Sharding": {
    story: "One teacher can't check 3,000 answer sheets, so they're split: roll numbers 1–1000 go to teacher A, 1001–2000 to teacher B, and so on.",
    idea: "Split data across many databases using a shard key (user id, region). Pick a key that spreads the load evenly: hashing spreads well, ranges keep scans easy but can create hot spots. Queries and transactions across shards become harder, and adding shards means moving data, which consistent hashing keeps small. Try a cache and read replicas first.",
    spot: "Data too big or too busy for one database.",
  },
  "Replication": {
    story: "Photocopying your notes and giving copies to friends, so if you lose yours the notes aren't gone.",
    idea: "Keep copies of the data on several machines. A leader takes the writes and followers serve reads. It improves safety and read speed, but copies can be slightly behind (replication lag). Multi-leader setups accept writes in several regions but must settle conflicting writes. Leaderless stores (Dynamo, Cassandra) use quorums: with N copies, writing to W and reading from R where W + R > N means every read overlaps the latest write.",
    spot: "High availability, lots of reads, disaster recovery.",
  },
  "Consistent Hashing": {
    story: "Kids sit around a round table, and each toy goes to the next kid clockwise. If one kid leaves, only his toys move to the next kid. Nobody else is disturbed.",
    idea: "Put servers and keys on a ring of hash values. Adding or removing a server only moves a small share of the keys. Virtual nodes spread the load evenly.",
    spot: "Distributed caches, key-value stores, sharding when servers come and go.",
  },
  "CAP Theorem": {
    story: "Two shopkeepers share one stock register over the phone. If the phone line breaks, either they stop selling (stay consistent) or keep selling and risk both selling the last item (stay available).",
    idea: "When the network splits (a Partition), you must choose Consistency or Availability. Banks choose consistency. Social feeds choose availability and fix things up later (eventual consistency).",
    spot: "Distributed databases, and whenever you discuss trade-offs.",
  },
  "Message Queue": {
    story: "A letterbox: the postman drops letters in whenever he comes, and you read them when you're free. Nobody waits for anybody.",
    idea: "Producers put messages in a queue (Kafka, RabbitMQ, SQS) and consumers handle them later. It separates services, absorbs traffic spikes, and makes retries easy. Kafka is a durable log that many consumer groups can read and replay; RabbitMQ routes each task to one worker. Most queues deliver at least once, so consumers must handle duplicates.",
    spot: "Slow work that doesn't need an instant answer: emails, video processing, notifications.",
  },
  "Rate Limiting": {
    story: "The canteen rule: at most 2 samosas per kid each break, so one kid can't eat everything.",
    idea: "Limit how many requests each user can make in a time window. Common methods: token bucket, leaky bucket, fixed or sliding window counters, usually stored in Redis.",
    spot: "Protecting APIs from abuse or overload, \"Design a rate limiter\".",
  },
  "API Design": {
    story: "A restaurant menu tells you exactly what you can order and what you'll get, without showing you the kitchen.",
    idea: "Define clear endpoints (REST like GET /users/{id}, or gRPC), what goes in and comes out, errors, pagination and login. REST suits public APIs, GraphQL lets each screen ask for exactly the fields it needs, and gRPC is fast and strictly typed for calls between your own services. Version the API (/v1/) so old apps keep working, and make write APIs idempotent so retrying is safe.",
    spot: "Early in every HLD interview, right after the requirements.",
  },
  "Unique IDs": {
    story: "Giving every student a roll number nobody else has, even when lots of teachers add students at the same time.",
    idea: "Options: auto-increment (one database, becomes a bottleneck), UUID (random and long), Snowflake IDs (time + machine id + counter). For short links, base62-encode a number or a hash.",
    spot: "URL shorteners, Pastebin, orders, anything that needs IDs at scale.",
  },
  "Object Storage": {
    story: "A giant cloakroom: you hand over your bag, get a token, and later show the token to get the bag back.",
    idea: "Store big files (photos, videos) in S3-style storage by key, and keep only the key or URL in your database. It's cheap, safe, and works well with a CDN.",
    spot: "Images, videos, documents, backups.",
  },
  "Search Index": {
    story: "The index at the back of a textbook: look up a word and it lists every page it appears on.",
    idea: "An inverted index maps each word to the list of documents containing it (Elasticsearch, Lucene). Add ranking so the best matches come first.",
    spot: "Search bars, autocomplete, filtering lots of items by text.",
  },
  "Real-time Connections": {
    story: "A phone call stays open so either person can talk at any moment. Letters make you wait for a reply.",
    idea: "WebSockets (or long polling, or server-sent events) keep a connection open so the server can push updates instantly. You need connection servers and a way to know which server each user is connected to.",
    spot: "Chat, live location, multiplayer games, editing a document together.",
  },
  "Geospatial Index": {
    story: "Cut a map into squares, and each square into smaller squares. To find cabs near you, check only your square and the ones next to it.",
    idea: "Geohash, quadtrees or S2 cells turn a location into a searchable key, so \"nearby\" searches don't scan the whole world.",
    spot: "Uber, Swiggy, Tinder, Yelp: anything \"near me\".",
  },
  "Fan-out": {
    story: "When you post in the class group, either you hand a copy to every friend right away (push), or friends come and check your page when they feel like it (pull).",
    idea: "Fan-out on write builds each follower's feed in advance: fast to read, but heavy for celebrities with millions of followers. Fan-out on read builds the feed when it's opened. Real systems mix both.",
    spot: "Twitter, Instagram, Facebook news feeds.",
  },
  "Transactions and Locking": {
    story: "Two friends try to book the last cinema seat at the same second. Only one of them should get it.",
    idea: "Use database transactions (ACID), row locks, or optimistic locking with version numbers. Idempotency keys make payment retries safe. Across several services, use sagas.",
    spot: "Payments, wallets, ticket and seat booking, stock counts.",
  },
  "Microservices": {
    story: "A big school where each office does one job (admissions, fees, library) instead of one person doing everything.",
    idea: "Split the app into small services that each own their data and talk through APIs or queues. Each can scale and ship on its own, but debugging and keeping data consistent gets harder. An API gateway is the single front door (routing, login checks, rate limits), and service discovery tells services where the others are running. Start with a tidy monolith and split only when a team or workload really needs it.",
    spot: "Big products like Netflix or Amazon. Talk about the trade-offs compared with one big app (a monolith).",
  },
  "Authentication": {
    story: "Your school ID card: the guard checks it once at the gate, and after that you can move around inside.",
    idea: "Check who someone is (passwords stored as bcrypt hashes, OTP, \"Login with Google\" via OAuth), then give them a session or a signed token (JWT) to show with every request. Authorization then decides what they're allowed to do.",
    spot: "Login systems, APIs, \"Design an authentication system\".",
  },
  "Latency and Throughput": {
    story: "Latency is how long one pizza takes to reach your door. Throughput is how many pizzas the shop sends out in an hour. A shop can be quick for one order and still choke on a hundred.",
    idea: "Latency is the time for one request. Measure p50, p95 and p99, not the average, because the slowest 1% is what users complain about. Throughput is requests handled per second. Rough numbers: reading memory takes about 100 ns, a random SSD read about 150 µs, a round trip inside a data centre about 0.5 ms, and one across continents about 150 ms. That's why caches and CDNs help so much: they cut trips.",
    spot: "\"What happens when you type a URL?\", setting targets like \"p99 under 200 ms\", and trade-offs where batching or queueing raises throughput but adds latency.",
  },
  "Consistency Models": {
    story: "You change your WhatsApp photo. Strong consistency: every friend sees the new photo at once. Eventual consistency: some see the old one for a few seconds. Causal consistency: nobody ever sees a reply before the message it answers.",
    idea: "Strong consistency means every read sees the latest write, which costs speed and availability. Eventual consistency means copies agree after a short while, which is fast and always up. Causal consistency keeps cause-and-effect in order, and read-your-writes guarantees at least that you see your own changes. Pick the weakest model the feature can live with: money and stock counts need strong, likes and view counts can be eventual.",
    spot: "Justifying a database choice, replication lag bugs, \"what does the user see if two copies disagree?\", and every CAP follow-up question.",
  },
  "Idempotency": {
    story: "Pressing the lift button five times still brings the lift once. Pressing \"Pay ₹500\" five times on a slow network should also charge you once.",
    idea: "An operation is idempotent if doing it twice has the same effect as doing it once. Networks fail, so clients retry, so duplicates will arrive. The fix: the client sends a unique idempotency key with each request, and the server remembers the keys it has handled and returns the saved result for a repeat. Queue consumers do the same with message IDs.",
    spot: "Payments, orders, retries after a timeout, and any consumer of an at-least-once queue.",
  },
  "Event-Driven Architecture": {
    story: "When a new student joins, the office announces it once on the school speaker. The library, the canteen and the sports teacher each react in their own way. The office doesn't phone each of them.",
    idea: "Services publish events (OrderPlaced) and others subscribe, so the publisher doesn't know who listens. The outbox pattern saves the event in the same database transaction as the data, and a relay publishes it afterwards, so you never save an order but lose its event. Event sourcing stores every change as an event and rebuilds state by replaying them, and CQRS keeps separate models for writing and reading. Both are great for audit trails and history, and overkill for simple CRUD.",
    spot: "Order pipelines, notifications, analytics, audit trails, and \"how do you keep the database and the queue in step?\"",
  },
  "Consensus and Leader Election": {
    story: "Five class monitors must agree on one captain even if two are absent. Whoever gets a majority (at least 3 votes) becomes captain. If the captain falls sick, they vote again.",
    idea: "Consensus lets a group of machines agree on one value or one leader even when some fail. Raft (and the older, harder Paxos) elect a leader by majority vote and copy an ordered log of changes to the others. A cluster of 5 keeps working with 2 machines down, because 3 is still a majority. Tools like ZooKeeper and etcd run this so your app can simply ask \"who is the leader?\" or take a lock.",
    spot: "Distributed locks, choosing the primary database, configuration stores, and \"what happens if the leader dies?\"",
  },
  "Fault Tolerance": {
    story: "A wedding kitchen keeps a spare gas cylinder, a second cook and a backup menu. If the tandoor breaks, guests still eat, just without naan.",
    idea: "Assume everything fails. Remove single points of failure with redundancy (several servers, copies in several zones) and failover. Put a timeout on every call, and retry with exponential backoff and random jitter so retries don't pile up. Isolate parts with bulkheads (separate pools) so one slow dependency can't use up every thread. Degrade gracefully: show cached or simpler results instead of an error page.",
    spot: "\"What happens if X goes down?\", retry storms, multi-region designs, and the failure-handling part of every HLD answer.",
  },
  "Circuit Breaker": {
    story: "The fuse in your house cuts the power when a wire overheats, so one faulty fan can't burn the house down. After a while you switch it back on to test.",
    idea: "Wrap calls to another service. Closed: calls go through while it counts failures. Open: after too many failures, calls fail at once without waiting, which gives the other service time to recover. Half-open: after a cool-down, a few test calls go through; success closes it, failure opens it again. Pair it with a fallback answer.",
    spot: "Microservices calling each other, third-party APIs such as payment gateways, and stopping one failure from spreading.",
  },
  "Observability": {
    story: "A doctor checks your temperature and pulse (metrics), reads your diary of symptoms (logs), and follows one blood sample through every lab it visited (traces).",
    idea: "Metrics are numbers over time, logs are records of events, and traces follow one request across services with a shared trace ID. Watch the four golden signals: latency, traffic, errors and saturation. An SLI is a measurement (share of requests under 300 ms), an SLO is your target for it (99.9%), an SLA is a promise in a contract, and the error budget is the failure you can afford (0.1%) before slowing releases. Page a human for problems users feel, not for every internal blip.",
    spot: "\"How would you monitor this?\", the closing minutes of HLD interviews, and debugging slow requests across microservices.",
  },
  "Bloom Filter": {
    story: "A bouncer with a cheap, rough guest list. If your name isn't on it, you're definitely not invited. If it is, you're probably invited, so he checks the real list.",
    idea: "A bit array plus a few hash functions. To add an item, set the bits its hashes point to. To check one, look at those bits: any 0 means definitely absent, all 1s means maybe present. It uses very little memory and never misses a real item, but gives a small, tunable rate of false alarms, and a basic one can't delete.",
    spot: "Skipping disk reads for keys that don't exist (Cassandra, Bigtable), a web crawler's \"seen this URL?\", checking if a username or short link is taken.",
  },

  // ---------- System design: low level ----------
  "OOP": {
    story: "A Car blueprint (the class) and the real cars built from it (objects). Every car has a colour and can drive().",
    idea: "The four pillars: encapsulation (hide the insides), abstraction (show only what's needed), inheritance (a Truck is a Vehicle), polymorphism (vehicle.park() works for every vehicle type).",
    spot: "Every LLD question starts here: the nouns become classes and the verbs become methods.",
  },
  "SOLID": {
    story: "Five house rules that keep your code tidy, so adding a new toy doesn't break the old ones.",
    idea: "Single responsibility. Open to extension, closed to modification. Liskov substitution (a child class can stand in for its parent). Interface segregation (small interfaces). Dependency inversion (depend on interfaces, not concrete classes).",
    spot: "When the interviewer asks \"how would you add a new X without changing much code?\"",
  },
  "Class Diagrams": {
    story: "A map of your code city before you build it, showing the buildings (classes) and the roads between them (relationships).",
    idea: "Boxes list fields and methods. Arrows show inheritance (is-a). Lines show association and composition (has-a). Sketch it before writing code.",
    spot: "The first step of any LLD round.",
  },
  "Singleton": {
    story: "A school has only one principal. Everyone who needs the principal goes to the same person.",
    idea: "Make sure a class has exactly one object, with one global way to reach it, and make it thread-safe. Don't overuse it, because it makes testing harder.",
    spot: "One parking lot, one logger, one settings manager.",
  },
  "Factory": {
    story: "A toy factory: you ask for a car or a robot and it builds the right toy. You don't need to know how it's made.",
    idea: "A method or class that creates objects based on the input, hiding which exact class gets created.",
    spot: "Creating different vehicle types, payment methods, chess pieces, notification types.",
  },
  "Strategy": {
    story: "A cricket captain switches between pace and spin bowling without changing the team.",
    idea: "Put each way of doing something (pricing, payment, matching) behind the same interface, and swap between them while the program runs.",
    spot: "Several ways to do one job: fare calculation, bill-splitting types, choosing a parking spot.",
  },
  "Observer": {
    story: "Subscribing to a YouTube channel: when a new video goes up, every subscriber gets a notification.",
    idea: "The subject keeps a list of observers and tells all of them when something changes.",
    spot: "Notifications, live scores, auction bids, publish-subscribe.",
  },
  "State": {
    story: "A traffic light behaves one way on red and another on green, and it knows which colour comes next.",
    idea: "Make each state its own class with the same methods, so behaviour changes when the state changes. No giant if-else chains.",
    spot: "Vending machines, ATMs, elevators, order status, traffic signals.",
  },
  "Decorator": {
    story: "You order a coffee, then add extra milk, then chocolate. Each add-on wraps the drink and adds to the price.",
    idea: "Wrap an object in another object with the same interface that adds extra behaviour. You can stack wrappers while the program runs.",
    spot: "Add-ons and toppings, adding logging or features without editing the original class.",
  },
  "Chain of Responsibility": {
    story: "A complaint goes to the class teacher. If she can't solve it, it goes to the head of department, then to the principal.",
    idea: "Pass a request along a chain of handlers until one of them deals with it.",
    spot: "ATM cash dispensing (₹2000, then ₹500, then ₹100 notes), log levels, approval flows.",
  },
  "Thread Safety": {
    story: "Two kids write the class score on the same board at the same moment. Without taking turns, the number gets scrambled.",
    idea: "Protect shared data with locks (synchronized), atomic variables or concurrent collections. Avoid deadlocks by always taking locks in the same order.",
    spot: "Booking seats, parking spots, wallets: anything many users change at the same time.",
  },
  "Command": {
    story: "Each button on a TV remote sends one command. The TV doesn't care who pressed it, and the \"previous channel\" button can undo the last change.",
    idea: "Wrap each action as an object with execute() and undo(). Keep executed commands on a stack to support undo and redo, queue them to run later, or log them to replay.",
    spot: "Undo and redo in editors, remote controls, job queues, recording macros.",
  },
  "Adapter": {
    story: "A travel plug adapter lets your Indian charger fit a UK socket. Neither the charger nor the socket changes.",
    idea: "Wrap a class whose interface doesn't fit (often a third-party library) so it matches the interface your code expects. Each provider gets its own adapter, and the rest of the code never sees the difference.",
    spot: "Several payment gateways or SMS, email and push providers behind one interface, legacy code, third-party SDKs.",
  },

  // ---------- CS subjects: DBMS ----------
  "DBMS Basics": {
    story: "A school office keeps records in 50 separate notebooks, and they never match. A DBMS is one smart register that everyone uses, which keeps data correct and lets many people read it at once.",
    idea: "A Database Management System stores data in an organised way and handles searching, updating, security, backups and many users at the same time. A relational DBMS (MySQL, PostgreSQL) stores data in tables.",
    spot: "\"What is a DBMS?\", DBMS vs file system, types of databases, schema vs instance, data independence.",
  },
  "Keys": {
    story: "Every student has a roll number that nobody else has. That's how the school finds exactly one student, even if two are called Rahul.",
    idea: "A primary key identifies each row uniquely. Candidate keys are all columns that could be the primary key, and a super key is any set of columns that is unique. A foreign key points to a row in another table, linking the tables.",
    spot: "Primary vs unique key, foreign keys, candidate and super keys, composite keys.",
  },
  "ER Model": {
    story: "Before building a school, the architect draws a plan: classrooms, teachers, students, and who belongs where. An ER diagram is that plan for a database.",
    idea: "Entities (Student, Course) become boxes, attributes (name, age) become ovals, and relationships (enrolls in) become diamonds. Cardinality says one-to-one, one-to-many or many-to-many. The diagram is then turned into tables.",
    spot: "Drawing a database for an app, weak entities, cardinality, generalisation and specialisation.",
  },
  "Normalization": {
    story: "If a student's phone number is written in ten different notebooks, changing it means ten edits, and you'll forget one. Normalization means writing each fact in exactly one place.",
    idea: "Split big tables into smaller ones to remove repeated data and update mistakes (anomalies). 1NF: single values in each cell. 2NF: no partial dependency on part of a key. 3NF: no column depends on another non-key column. BCNF: every determinant is a key.",
    spot: "1NF, 2NF, 3NF, BCNF, functional dependencies, anomalies, and when to denormalize.",
  },
  "Transactions and ACID": {
    story: "You send ₹500 to a friend. Money must leave your account AND reach theirs. If the app crashes halfway, it must be as if nothing happened.",
    idea: "A transaction is a group of steps that succeed or fail together. ACID: Atomicity (all or nothing), Consistency (rules always hold), Isolation (transactions don't disturb each other), Durability (once saved, it stays saved even after a crash).",
    spot: "ACID properties, commit and rollback, transaction states, why banks need it.",
  },
  "Concurrency Control": {
    story: "Two people edit the same Google Sheet cell at the same moment. Without rules, one person's change silently disappears.",
    idea: "Locks (shared for reading, exclusive for writing), two-phase locking, timestamps and MVCC keep parallel transactions safe. Isolation levels (read uncommitted, read committed, repeatable read, serializable) trade safety for speed. Watch out for dirty reads, lost updates and deadlocks.",
    spot: "Isolation levels, dirty read, phantom read, locking, deadlocks in databases, optimistic vs pessimistic locking.",
  },
  "Indexing": {
    story: "Finding \"photosynthesis\" by reading a whole textbook is slow. The index at the back takes you to page 142 straight away.",
    idea: "An index (usually a B+ tree) lets the database find rows without scanning the whole table. Clustered index = the table itself is stored in that order (one per table). Non-clustered = a separate lookup structure. Indexes speed up reads but slow down writes and use space.",
    spot: "Why a query is slow, B-tree vs B+ tree, clustered vs non-clustered index, when not to index.",
  },
  "SQL Queries": {
    story: "SQL is how you talk to the database. \"Show me the top 3 scorers in each class\" becomes a short sentence the database understands.",
    idea: "SELECT … FROM … WHERE filters rows. JOIN combines tables (inner, left, right, full). GROUP BY with COUNT, SUM or AVG makes summaries, and HAVING filters the groups. Subqueries, CTEs (WITH) and window functions (ROW_NUMBER, RANK, LAG) handle trickier questions.",
    spot: "Joins, nth highest salary, GROUP BY vs HAVING, DELETE vs TRUNCATE vs DROP, window functions.",
  },

  // ---------- CS subjects: Operating systems ----------
  "Processes and Threads": {
    story: "A process is a whole restaurant with its own kitchen. Threads are the cooks inside it: they share the same kitchen, so they work fast together but can bump into each other.",
    idea: "A process is a running program with its own memory. Threads live inside a process and share its memory, so switching between them is cheaper. The OS keeps a Process Control Block (PCB) for each process, and a context switch saves one process's state and loads another's.",
    spot: "Process vs thread, process states, PCB, context switching, fork(), zombie and orphan processes.",
  },
  "CPU Scheduling": {
    story: "One teacher, twenty students with doubts. Who does the teacher help first? The one who came first, the one with the shortest doubt, or everyone for 2 minutes each in turns?",
    idea: "The scheduler decides which process gets the CPU next. FCFS (first come), SJF (shortest job first), priority, and Round Robin (fixed time slices). Measure with waiting time, turnaround time and response time. Preemptive schedulers can interrupt a running process.",
    spot: "Scheduling algorithms, Gantt chart numericals, starvation and aging, preemptive vs non-preemptive.",
  },
  "Process Synchronization": {
    story: "Two kids share one cricket bat. If both grab it at once, there's a fight. They need a rule: only whoever holds the token can use the bat.",
    idea: "When threads share data, a race condition can give wrong results. The part of code touching shared data is the critical section. Mutex locks, semaphores (counting and binary) and monitors make sure only the right threads enter it. Classic puzzles: producer-consumer, readers-writers, dining philosophers.",
    spot: "Race condition, critical section, mutex vs semaphore, producer-consumer, Peterson's solution.",
  },
  "Deadlock": {
    story: "Two cars meet on a narrow bridge from opposite sides. Neither will reverse, so both wait forever.",
    idea: "A deadlock needs four conditions at once: mutual exclusion, hold and wait, no preemption, and circular wait. You can prevent it (break one condition), avoid it (Banker's algorithm checks for a safe state), or detect it and recover.",
    spot: "The four conditions, Banker's algorithm, resource allocation graph, deadlock vs starvation.",
  },
  "Memory Management": {
    story: "Parking cars of different sizes in one long lot. Leave random gaps and soon no big car fits anywhere, even though there's space in total.",
    idea: "The OS decides where each program lives in RAM. Contiguous allocation causes fragmentation (external: gaps between blocks, internal: wasted space inside a block). Paging cuts memory into equal pages and frames, and segmentation cuts it into logical parts like code and stack.",
    spot: "Paging vs segmentation, internal vs external fragmentation, page tables, TLB, first/best/worst fit.",
  },
  "Virtual Memory": {
    story: "Your study table only fits 5 books, but you need 20 this week. You keep 5 on the table and swap them with the shelf when needed. The table feels bigger than it is.",
    idea: "Virtual memory lets programs use more memory than the RAM has, by keeping some pages on disk. A page fault happens when a needed page isn't in RAM. Page replacement (FIFO, LRU, Optimal) picks which page to throw out. Too much swapping is called thrashing.",
    spot: "Page faults, demand paging, LRU/FIFO/Optimal numericals, Belady's anomaly, thrashing.",
  },
  "File Systems and Disks": {
    story: "A library needs a catalogue to know where every book sits, and a librarian who plans the shortest walk to fetch many books.",
    idea: "A file system organises data into files and folders (with inodes storing file details). Allocation can be contiguous, linked or indexed. Disk scheduling (FCFS, SSTF, SCAN, C-SCAN, LOOK) reduces how far the disk head moves. RAID combines disks for speed or safety.",
    spot: "Inodes, file allocation methods, disk scheduling numericals, RAID levels.",
  },
  "Kernel and System Calls": {
    story: "In a bank, customers can't walk into the vault. They ask the cashier, who goes in for them. The kernel is the cashier, and system calls are the requests.",
    idea: "The kernel is the core of the OS that controls hardware. Programs run in user mode and ask for protected work (files, memory, devices) through system calls, which switch to kernel mode. Interrupts let hardware get the CPU's attention. Monolithic vs microkernel is about how much runs inside the kernel.",
    spot: "User vs kernel mode, system calls, interrupts, booting, monolithic vs microkernel, what happens when you turn on a computer.",
  },

  // ---------- CS subjects: Computer networks ----------
  "OSI and TCP/IP Models": {
    story: "Sending a gift by courier: you pack it, write the address, the courier picks the route, the truck drives the road. Each step has one job and doesn't care how the others work.",
    idea: "The OSI model has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application. The TCP/IP model used on the real internet has 4: Link, Internet, Transport, Application. Each layer adds its own header (encapsulation).",
    spot: "Name the layers and what each does, which devices and protocols work at which layer, OSI vs TCP/IP.",
  },
  "TCP and UDP": {
    story: "TCP is a registered post: it confirms delivery and resends lost letters, in order. UDP is shouting across the playground: fast, but some words may get lost.",
    idea: "TCP is connection-based (3-way handshake: SYN, SYN-ACK, ACK), reliable and ordered, with flow control and congestion control. UDP has no connection and no guarantees, but it's fast, which suits video calls, games and DNS. Ports identify which app gets the data.",
    spot: "TCP vs UDP, 3-way handshake, ports and sockets, which apps use which protocol.",
  },
  "HTTP and HTTPS": {
    story: "Your browser asks a website \"please give me the home page\" (a request), and the site replies with the page (a response). HTTPS is the same conversation, but inside a locked box nobody can peek into.",
    idea: "HTTP methods (GET, POST, PUT, DELETE), status codes (200 OK, 301 redirect, 404 not found, 500 server error), headers and cookies. HTTPS adds TLS encryption using certificates. HTTP/2 and HTTP/3 make it faster.",
    spot: "What happens when you type a URL, HTTP vs HTTPS, TLS handshake, cookies vs sessions, REST, status codes.",
  },
  "DNS": {
    story: "You remember your friend's name, not their phone number. Your phone's contact list turns the name into the number. DNS does that for websites.",
    idea: "DNS turns names like google.com into IP addresses. Your computer asks a resolver, which asks the root servers, then the .com servers, then Google's own name servers. Answers are cached for speed. Record types include A, AAAA, CNAME and MX.",
    spot: "How DNS resolution works, DNS record types, recursive vs iterative queries, DNS caching.",
  },
  "IP Addressing and Subnetting": {
    story: "Every house needs an address for letters to arrive. A big colony is split into blocks and lanes so the postman can find houses quickly.",
    idea: "An IPv4 address is 32 bits (like 192.168.1.10), and IPv6 is 128 bits. A subnet mask (/24) splits the address into network and host parts. Private IPs are used inside homes and offices, and NAT lets them share one public IP.",
    spot: "Subnetting numericals, classes, CIDR, public vs private IP, IPv4 vs IPv6, NAT.",
  },
  "Routing and Switching": {
    story: "A switch is the postman inside one building, delivering to the right flat. A router is the post office that sends letters between cities.",
    idea: "Switches forward frames inside a local network using MAC addresses. Routers forward packets between networks using IP addresses and routing tables (RIP, OSPF, BGP). ARP finds the MAC address for an IP, and DHCP hands out IP addresses automatically.",
    spot: "Hub vs switch vs router, MAC vs IP address, ARP, DHCP, routing protocols.",
  },
  "Flow and Congestion Control": {
    story: "If you talk too fast, your friend can't write it all down, so you slow down (flow control). If the whole road is jammed, every car slows down (congestion control).",
    idea: "Flow control stops the sender from overwhelming the receiver (sliding window). Congestion control stops everyone from overwhelming the network (slow start, congestion avoidance, fast retransmit). Error control finds and fixes corrupted data (checksums, CRC, ARQ).",
    spot: "Sliding window, Stop-and-Wait, Go-Back-N, Selective Repeat, TCP congestion control, CRC.",
  },
  "Network Security": {
    story: "A house has a gate guard (firewall), a locked safe (encryption) and ID checks (authentication). Thieves try tricks like pretending to be the milkman (phishing).",
    idea: "Symmetric encryption uses one shared key (AES). Asymmetric encryption uses a public and a private key (RSA). Hashing stores passwords safely. Firewalls filter traffic. Common attacks: DDoS, man-in-the-middle, SQL injection, XSS, phishing.",
    spot: "Symmetric vs asymmetric encryption, how HTTPS stays secure, firewalls, common attacks and defences.",
  },

  // ---------- CS subjects: OOP ----------
  "Classes and Objects": {
    story: "A cookie cutter (the class) and the cookies you cut with it (objects). Every cookie has the same shape but can have different toppings.",
    idea: "A class defines fields (data) and methods (actions). An object is a real instance created from it with new. Constructors set up a new object. static members belong to the class, not to each object, and this refers to the current object.",
    spot: "Class vs object, constructors (default, parameterised, copy), static, this, object memory.",
  },
  "Encapsulation": {
    story: "A TV remote: you press buttons, but the circuits inside are sealed. You can't break the TV by poking the wires.",
    idea: "Keep data private and expose it only through methods (getters and setters) that check the rules. Access modifiers (private, protected, public, default) control who can see what.",
    spot: "Access modifiers, data hiding, getters and setters, encapsulation vs abstraction.",
  },
  "Inheritance": {
    story: "A child inherits eye colour from a parent but can also learn new skills the parent never had.",
    idea: "A child class reuses and extends a parent class (is-a relationship). Types: single, multilevel, hierarchical, multiple (C++ allows it, Java only through interfaces). The diamond problem is why Java avoids multiple class inheritance. Prefer composition (has-a) when \"is-a\" doesn't truly fit.",
    spot: "Types of inheritance, diamond problem, super keyword, composition vs inheritance.",
  },
  "Polymorphism": {
    story: "The word \"play\" means different things: play cricket, play guitar, play a video. Same word, different action depending on what you use it with.",
    idea: "One name, many forms. Compile-time polymorphism: method overloading (same name, different parameters). Runtime polymorphism: method overriding, where a parent reference calls the child's version (virtual functions in C++, dynamic dispatch in Java).",
    spot: "Overloading vs overriding, virtual functions, vtable, compile-time vs runtime polymorphism.",
  },
  "Abstraction and Interfaces": {
    story: "You drive a car with a steering wheel and pedals, without knowing how the engine works inside. You only see what you need.",
    idea: "Abstraction hides how something works and shows only what it does. Abstract classes can mix finished and unfinished methods. Interfaces are pure contracts (\"anything that can fly() must have these methods\"), and a class can implement many of them.",
    spot: "Abstract class vs interface, pure virtual functions, abstraction vs encapsulation.",
  },
  "Memory and Object Lifecycle": {
    story: "Borrowing library books: you take them (allocate), use them, and must return them (free). If nobody returns books, the shelves run empty.",
    idea: "Objects live on the heap, and local variables live on the stack. C++ uses destructors and smart pointers to free memory. Java and Python use garbage collection. Shallow copy shares inner objects, and deep copy duplicates them.",
    spot: "Stack vs heap, destructors, garbage collection, shallow vs deep copy, memory leaks.",
  },
};

// LeetCode has very fine-grained tags. These point to the explanation that covers them.
const ALIASES = {
  "DP on Trees": "Dynamic Programming", "Longest Increasing Subsequence": "Dynamic Programming", "Longest Common Subsequence": "Dynamic Programming",
  "Knapsack Problem": "Knapsack", "0-1 Knapsack": "Knapsack", "Complete Knapsack": "Knapsack", "Mixed Knapsack": "Knapsack", "Multiple Knapsack": "Knapsack",
  "Merge Sort": "Divide and Conquer", "Meet in the Middle": "Divide and Conquer",
  "Quicksort": "Sorting", "Counting Sort": "Sorting", "Bucket Sort": "Sorting", "Radix Sort": "Sorting", "Bubble Sort": "Sorting", "Sort": "Sorting", "Timsort": "Sorting", "Tournament Sort": "Sorting",
  "Doubly-Linked List": "Linked List",
  "Binary Indexed Tree": "Segment Tree", "Sqrt Decomposition": "Segment Tree", "Range Minimum/Maximum Query": "Segment Tree", "Sparse Table": "Segment Tree",
  "Greatest Common Divisor": "Number Theory", "Euclidean Algorithm": "Number Theory", "Prime Factorization": "Number Theory", "Sieve Theory": "Number Theory",
  "Primality Test": "Number Theory", "Prime Number Sieve": "Number Theory", "Least Common Multiple": "Number Theory", "Fermat's Little Theorem": "Number Theory",
  "Euler's Totient Function": "Number Theory", "Euler's Theorem": "Number Theory", "Extended Euclidean Algorithm": "Number Theory", "Bézout's Lemma": "Number Theory",
  "Inclusion-Exclusion Principle": "Combinatorics", "Pigeonhole Principle": "Math", "Probability and Statistics": "Probability",
  "Linear Algebra": "Math", "Newton's Method": "Math", "Ternary Search": "Binary Search",
  "Rolling Hash": "Hash Function",
  "Knuth–Morris–Pratt Algorithm": "String Matching", "Z Algorithm": "String Matching", "Boyer–Moore String-Search Algorithm": "String Matching",
  "Aho–Corasick Algorithm": "String Matching", "Manacher": "String Matching", "Suffix Array": "String Matching", "Suffix Tree": "String Matching",
  "Suffix Automaton": "String Matching", "Lexicographically Minimal String Rotation": "String Matching", "Lyndon Factorization": "String Matching",
  "Directed Acyclic Graph": "Topological Sort",
  "Dijkstra's Algorithm": "Shortest Path", "Bellman–Ford Algorithm": "Shortest Path", "Floyd–Warshall Algorithm": "Shortest Path", "0-1 BFS": "Shortest Path",
  "A* Search": "Shortest Path", "Heuristic Search": "Shortest Path", "K Shortest Path": "Shortest Path",
  "Bidirectional Search": "Breadth-First Search",
  "Minimax": "Game Theory", "Zero-Sum Game": "Game Theory", "Nim Game": "Game Theory", "Impartial Game": "Game Theory", "Sprague–Grundy Theorem": "Game Theory",
  "Bracket Sequences": "Stack", "Binary Lifting": "Lowest Common Ancestor",
  "Reservoir Sampling": "Randomized", "Rejection Sampling": "Randomized",
  "Prim's Algorithm": "Minimum Spanning Tree", "Kruskal's Algorithm": "Minimum Spanning Tree", "Borůvka's Algorithm": "Minimum Spanning Tree",
  "Sweep Line": "Intervals",
  "Graph Coloring": "Bipartite Graph", "Matching (Graph)": "Bipartite Graph", "Perfect Matching": "Bipartite Graph", "Maximum Matching": "Bipartite Graph", "Hungarian Algorithm": "Bipartite Graph",
  "Kosaraju's Algorithm": "Strongly Connected Component", "Tarjan's SCC Algorithm": "Strongly Connected Component",
  "Bridge (Graph)": "Biconnected Component", "Articulation Point": "Biconnected Component",
  "Edmonds–Karp Algorithm": "Flow Network", "MPM Algorithm": "Flow Network", "Push-Relabel Algorithm": "Flow Network", "Dinic's Algorithm": "Flow Network",
  "Minimum-Cost Flow": "Flow Network", "Successive Shortest Path Algorithm": "Flow Network", "Maximum Flow": "Flow Network", "Minimum Cut": "Flow Network",
  "Iterator": "Design",
  "Treap": "Ordered Set", "Splay Tree": "Ordered Set", "Cartesian Tree": "Monotonic Stack", "K-D Tree": "Geometry", "Persistent Data Structure": "Segment Tree",
  "Polygons": "Geometry", "Convex Hull": "Geometry", "Triangulation": "Geometry", "Minimum Enclosing Circle": "Geometry", "Nearest Pair of Points": "Geometry", "Planar Graph": "Graph Theory",
  "Eulerian Circuit": "Graph Theory", "Eulerian Path": "Graph Theory", "Eulerian Graph": "Graph Theory", "Semi-Eulerian Graph": "Graph Theory", "Hamiltonian Path": "Graph Theory",
  "Brute-Force Search": "Enumeration", "Dancing Links": "Backtracking", "Algorithm X": "Backtracking",
  "Floyd's Cycle Finding Algorithm": "Fast and Slow Pointers", "Boyer–Moore Majority Vote Algorithm": "Boyer–Moore Majority Vote",
  // doocs/leetcode tag spellings
  "Graph": "Graph Theory", "Union Find": "Union-Find", "Min-Cost Flow": "Flow Network", "Li Chao Tree": "Segment Tree", "KMP": "String Matching",
  "Tree DP": "Dynamic Programming", "Sieve": "Number Theory", "Sieve of Eratosthenes": "Number Theory", "Polygon": "Geometry", "Extended KMP": "String Matching",
  "Boyer–Moore": "String Matching", "Bounded Knapsack": "Knapsack", "Unbounded Knapsack": "Knapsack", "Kosaraju": "Strongly Connected Component", "Tarjan": "Strongly Connected Component",
  "Inclusion-Exclusion": "Combinatorics", "Dijkstra": "Shortest Path", "Parentheses": "Stack", "Edmonds–Karp": "Flow Network", "Dinic": "Flow Network", "MPM": "Flow Network",
  "Push-Relabel": "Flow Network", "Network Flow": "Flow Network", "k-Shortest Paths": "Shortest Path", "Sprague–Grundy": "Game Theory", "Palindromic Tre": "String Matching",
  "Palindromic Tree": "String Matching", "Graph Matching": "Bipartite Graph", "SSP": "Flow Network", "Smallest Enclosing Circle": "Geometry", "Suffix Automato": "String Matching",
  "Quick Sort": "Sorting", "Max Flow": "Flow Network", "Kruskal": "Minimum Spanning Tree", "Prim": "Minimum Spanning Tree", "Borůvka": "Minimum Spanning Tree",
  "Boyer-Moore Voting": "Boyer–Moore Majority Vote", "Min Cut": "Flow Network", "Floyd–Warshall": "Shortest Path", "Bellman–Ford": "Shortest Path",
  "Bézout's Identity": "Number Theory", "Bridge": "Biconnected Component", "Aho-Corasick": "String Matching", "Floyd Cycle Detection": "Fast and Slow Pointers",
  "Smallest Representation": "String Matching", "Closest Pair of Points": "Geometry", "Range Query": "Segment Tree",
};

export function topicName(tag) {
  const t = String(tag).trim();
  return TOPICS[t] ? t : ALIASES[t] || null;
}
// Unique explanation names for a list of tags, keeping order. Unknown tags are returned separately.
export function resolveTopics(tags = []) {
  const names = [], unknown = [];
  for (const t of tags) {
    const n = topicName(t);
    if (!n) unknown.push(t);
    else if (!names.includes(n)) names.push(n);
  }
  return { names, unknown };
}
const KEYS = Object.keys(TOPICS);
const at = k => KEYS.indexOf(k);
export const DSA_TOPIC_NAMES = KEYS.slice(0, at("Scalability"));
export const HLD_TOPIC_NAMES = KEYS.slice(at("Scalability"), at("OOP"));
export const LLD_TOPIC_NAMES = KEYS.slice(at("OOP"), at("DBMS Basics"));
export const CS_TOPIC_NAMES = KEYS.slice(at("DBMS Basics"));
