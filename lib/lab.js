// Problem Solving Lab: an engineering reasoning gym, separate from DSA and CP.
// Everything here is data. The logic that uses it is in lib/labEngine.js.
//
// Content rules: every challenge is original, every "what actually happened" in a case study comes from the
// company's own public postmortem (linked), and every claim in a reveal is one an experienced engineer would
// sign off on. To add a challenge, copy one of the same category and keep the same fields; npm test checks them.

export const DIMENSIONS = [
  ["algorithms", "Algorithms"], ["debugging", "Debugging"], ["systems", "Systems"], ["networking", "Networking"],
  ["databases", "Databases"], ["os", "Operating systems"], ["security", "Security"], ["performance", "Performance"],
  ["architecture", "Architecture"], ["testing", "Testing"], ["tooling", "Tooling"], ["quality", "Code quality"],
  ["product", "Product thinking"], ["math", "Mathematics"], ["communication", "Communication"], ["opensource", "Open source"],
].map(([id, name]) => ({ id, name }));

// The problem-solver roadmap. A stage opens when you've completed 2 challenges of the stage before it.
export const STAGES = [
  { n: 1, name: "Decompose", skills: "Understand requirements, define inputs and outputs, find the unknowns, break a problem into steps." },
  { n: 2, name: "Investigate", skills: "Gather evidence, form hypotheses, test assumptions." },
  { n: 3, name: "Build and read", skills: "Implement, test and debug; understand code you didn't write." },
  { n: 4, name: "Optimise", skills: "Measure, find the bottleneck, change one thing, measure again." },
  { n: 5, name: "Design", skills: "Architecture, trade-offs, scale, reliability, failure handling." },
  { n: 6, name: "Reason under uncertainty", skills: "Incomplete information, ambiguity, unfamiliar technology, research." },
  { n: 7, name: "Operate", skills: "Incidents, troubleshooting, rollback, recovery, postmortems." },
  { n: 8, name: "Create", skills: "First-principles builds, significant projects, open-source contributions." },
];

// Difficulty of the *reasoning*, separate from technical difficulty: a simple bug can be hard to find.
export const REASONING = { familiar: "Familiar", slightly: "Slightly unfamiliar", unfamiliar: "Unfamiliar", highly: "Highly unfamiliar", ambiguous: "Ambiguous" };

// Reasoning templates: the steps you write before anything is revealed. [key, label, what to write]
export const TEMPLATES = {
  investigate: [
    ["know", "What do you know?", "Facts only: what's observed, since when, where."],
    ["unknown", "What don't you know?", "Missing information. What would you ask for?"],
    ["hypotheses", "Hypotheses", "One per line. Aim for at least three before you pick one."],
    ["rank", "What would you check first, and why?", "Rank by how likely it is and how cheap it is to check."],
    ["evidence", "Evidence", "For each hypothesis: what would confirm it, and what would rule it out?"],
    ["experiment", "Experiment", "The smallest test that separates your top two hypotheses."],
    ["rootcause", "Most likely root cause", ""],
    ["fix", "Fix", "If users are hurting, mitigate first, then fix."],
    ["prevent", "Prevent it happening again", "Tests, alerts, process or design changes."],
  ],
  debug: [
    ["observed", "Observed behaviour", ""],
    ["expected", "Expected behaviour", ""],
    ["hypotheses", "Hypotheses", "One per line. What could produce exactly this symptom?"],
    ["investigation", "Investigation", "What would you run, log, inspect or change to test them?"],
    ["rootcause", "Root cause", "The mechanism, not just the line."],
    ["fix", "Fix", "And any trade-off it brings."],
    ["regression", "Regression prevention", "Which test, check or alert stops it coming back?"],
  ],
  estimate: [
    ["assumptions", "Assumptions", "Every number you're assuming, one per line."],
    ["approximation", "Approximation", "The formula: which quantities multiply or add?"],
    ["calculation", "Calculation", "Round numbers, powers of ten."],
    ["sanity", "Sanity check", "Compare with something you know. Is it plausible?"],
    ["sensitivity", "Sensitivity", "Which assumption matters most? How far does the answer move if it's wrong?"],
  ],
  tradeoff: [
    ["constraints", "Constraints", "What actually matters here? What's fixed?"],
    ["options", "Options and how each works", ""],
    ["pros", "Advantages and disadvantages", ""],
    ["failure", "How each option fails", ""],
    ["cost", "Operational cost and complexity", "Money, people, on-call, things to monitor."],
    ["decision", "Your choice, and when you'd choose differently", ""],
  ],
  review: [
    ["summary", "What does this change do?", ""],
    ["correctness", "Correctness", "Does it do what it claims, in every case?"],
    ["design", "Design, complexity and naming", ""],
    ["tests", "Tests", "What's tested? What isn't?"],
    ["risks", "Security, concurrency and failure handling", ""],
    ["verdict", "Verdict", "Approve or request changes? Mark each comment blocking or non-blocking."],
  ],
  frame: [
    ["real", "What is the real problem?", ""],
    ["missing", "What information is missing?", ""],
    ["metric", "What metric defines success?", "Plus guardrail metrics that must not get worse."],
    ["causes", "Possible causes", "One per line."],
    ["experiment", "What would you measure or test first?", ""],
    ["avoid", "What would you avoid doing for now, and why?", ""],
  ],
  decompose: [
    ["goal", "Goal", "What problem does this solve, and for whom?"],
    ["users", "Users and use cases", ""],
    ["functional", "Functional requirements", ""],
    ["nonfunctional", "Non-functional requirements", "Scale (as rates, not user counts), latency, reliability, cost."],
    ["unknowns", "Unknowns and questions to ask", ""],
    ["failures", "Failure scenarios", ""],
    ["slice", "Simplest useful first version", ""],
  ],
  counter: [
    ["assumptions", "Hidden assumptions in the claim", ""],
    ["counter", "Counterexamples", "Concrete situations where it's false. One per line."],
    ["holds", "When is it true?", ""],
    ["better", "Rewrite the claim so it's accurate", ""],
  ],
  measure: [
    ["baseline", "Baseline", "What will you measure, and on what?"],
    ["hypothesis", "Hypothesis", ""],
    ["experiment", "Experiment design", "What exactly will you run, how many times, on which inputs?"],
    ["confounders", "What could fool you?", "Warm-up, caching, noise, different machines, order of runs."],
    ["criteria", "Success criteria", "Decided before you measure."],
    ["change", "The change, and the result you'd expect", ""],
  ],
  threat: [
    ["threat", "Threat", "What could an attacker, or a curious user, do?"],
    ["surface", "Attack surface", "Which inputs do they control?"],
    ["rootcause", "Root cause", "In the code or the design."],
    ["impact", "Impact", ""],
    ["mitigation", "Mitigation", ""],
    ["verification", "Verification", "How would you prove the fix works, and find similar bugs?"],
  ],
  read: [
    ["purpose", "What does this code do?", "One sentence."],
    ["flow", "Execution flow", "Step by step."],
    ["data", "Where does data enter, and where does it change?", ""],
    ["assumptions", "Assumptions it makes", "About its inputs, its environment, time, memory."],
    ["failure", "What can fail or be abused?", ""],
    ["change", "What would you change, and why?", ""],
  ],
  research: [
    ["question", "Your precise question", ""],
    ["sources", "Sources", "Prefer official docs and primary sources. One per line."],
    ["evidence", "Evidence", ""],
    ["contradictions", "Where do sources disagree, and why?", ""],
    ["conclusion", "Conclusion", ""],
    ["confidence", "Confidence", "How sure are you, and what would change your mind?"],
  ],
  howworks: [
    ["input", "Input", "What starts it, and what data goes in?"],
    ["processing", "Processing", "Step by step, which parts do what?"],
    ["storage", "Storage", "What's stored, where, for how long?"],
    ["network", "Networking", "Who talks to whom, in what order?"],
    ["failure", "Failure modes", ""],
    ["scale", "Scaling and security", ""],
  ],
};

// Optional write-ups after the reveal.
export const EXTRAS = {
  postmortem: { name: "Postmortem", steps: [
    ["happened", "What happened?", ""], ["why", "Why did it happen?", ""],
    ["failed", "What failed?", "Systems and processes, not people."], ["signals", "Which signals were missed or came late?", ""],
    ["slow", "What made diagnosis or recovery slow?", ""], ["change", "What should change?", "Concrete actions, most important first."],
  ] },
  adr: { name: "Decision record (ADR)", steps: [
    ["context", "Context", ""], ["decision", "Decision", ""], ["alternatives", "Alternatives considered", ""],
    ["tradeoffs", "Trade-offs", ""], ["consequences", "Consequences", "What becomes easier, and what becomes harder?"],
  ] },
};

// Asked after every challenge. The average of the answers is your process score for it.
export const SELF_REVIEW = [
  ["understood", "Did I understand the problem before solving it?"],
  ["constraints", "Did I identify the constraints that mattered?"],
  ["assumptions", "Did I state my assumptions?"],
  ["hypotheses", "Did I consider more than one hypothesis or option?"],
  ["tested", "Did I say how I'd test them, instead of guessing?"],
  ["patient", "Did I avoid jumping to a solution too early?"],
  ["measured", "Did I measure, or say what I'd measure?"],
  ["failures", "Did I consider failure cases?"],
  ["tradeoffs", "Did I consider trade-offs?"],
  ["explain", "Can I explain the result in two minutes?"],
];

// Reasoning mistakes you can tag. Each points at the mental model that helps most.
export const MISTAKES = [
  ["wrong-assumption", "Wrong assumption", "constraint-first"],
  ["premature-optimization", "Premature optimisation", "measure-first"],
  ["poor-decomposition", "Poor decomposition", "constraint-first"],
  ["insufficient-investigation", "Insufficient investigation", "bayesian-updating"],
  ["tool-misuse", "Tool misuse", "bisection"],
  ["ignored-constraint", "Ignored a constraint", "constraint-first"],
  ["missed-edge-case", "Missed an edge case", "invariants"],
  ["wrong-mental-model", "Incorrect mental model", "bottlenecks"],
  ["weak-communication", "Weak communication", "simplest-valid"],
  ["overengineering", "Overengineering", "simplest-valid"],
  ["underengineering", "Underengineering", "second-order"],
  ["failed-experiment", "Poor experiment design", "measure-first"],
].map(([id, name, model]) => ({ id, name, model }));

export const CATEGORIES = [
  ["debug", "Bug hunt", "debug"], ["data", "Data lab", "debug"], ["incident", "Incident", "investigate"],
  ["api", "API failure lab", "debug"], ["reading", "Code archaeology", "read"], ["review", "Code review", "review"],
  ["estimate", "Estimation", "estimate"], ["tradeoff", "Trade-offs", "tradeoff"], ["reasoning", "Counterexamples and proof", "counter"],
  ["perf", "Performance lab", "measure"], ["security", "Security lab", "threat"], ["design", "Decomposition", "decompose"],
  ["product", "Product problems", "frame"], ["howworks", "How does this work?", "howworks"], ["case", "Real incident case study", "investigate"],
  ["unknown", "Unknown technology", "investigate"], ["research", "Engineering research", "research"], ["ai", "AI-assisted engineering", "review"],
].map(([id, name, template]) => ({ id, name, template }));

// Default weekly rotation (0 = Sunday). The daily pick overrides it when a weakness needs attention.
export const DAY_ROTATION = {
  1: ["debug", "data"], 2: ["api", "design", "howworks"], 3: ["reading", "review", "ai"], 4: ["estimate", "tradeoff", "reasoning"],
  5: ["perf", "security"], 6: ["case", "product", "unknown"], 0: ["incident", "research", "case"],
};

// How your daily study time is split. Engineering never drops to zero.
export const MODES = {
  interview: { name: "Interview", dsa: 60, cp: 20, eng: 20 },
  engineer: { name: "Engineer", dsa: 40, cp: 20, eng: 40 },
  elite: { name: "Elite problem solver", dsa: 35, cp: 25, eng: 40 },
};

const C1 = [
  {
    id: "design-notifications", title: "“Design a notification system for 10 million users”", category: "design", stage: 1,
    reasoning: "ambiguous", minutes: 20, skills: ["architecture", "product", "communication"], models: ["constraint-first", "queues-backpressure", "simplest-valid"],
    brief: "Your manager: “We need a notification system. 10 million users. Can you design it?” That's all you get.\n\nBefore drawing a single box, break the problem down. What would you need to know, and what are the pieces?",
    hints: [
      "Who sends notifications, who receives them, and through which channels?",
      "Is a one-time password the same kind of notification as a marketing campaign? Compare their latency, volume and cost.",
      "Separate three jobs: accepting a request, deciding what to send to whom and when (preferences, quiet hours, duplicates), and delivering on each channel with retries.",
    ],
    reveal: {
      keyPoints: [
        "Asked which kinds of notification exist (transactional vs marketing) and which channels (push, email, SMS, in-app): they have very different latency, cost and reliability needs.",
        "Turned “10 million users” into rates: notifications per second at peak, not a user count.",
        "Asked about user preferences, opt-outs and quiet hours, and consent rules for marketing messages.",
        "Noticed that retries mean messages can be sent twice, so deduplication or idempotency is needed.",
        "Named failure scenarios: an email or SMS provider is down or rate-limits you, a campaign creates a huge burst, a retry loop.",
        "Separated ingestion, processing (templates, preferences, rate limits) and per-channel delivery, with queues between them so one slow channel doesn't block the rest.",
        "Chose a small first version (one channel, transactional only) before the full design.",
      ],
      answer: "There is no single design. A strong answer spends most of its effort on questions: which messages, which channels, what rates, what guarantees, and what happens when a provider fails. Only then does a design with queues per channel, a preferences service and idempotent delivery make sense.",
      principle: "Requirements first: the same words can describe systems that differ a hundredfold in cost and complexity.",
    },
    followUps: [
      "Constraint change: marketing wants one campaign sent to all 10 million users at 9 am. What breaks, and what changes?",
      "One-time passwords must now arrive within 10 seconds, even during that campaign. How do you keep them fast?",
    ],
    extra: "adr",
  },
  {
    id: "estimate-chat-storage", title: "How much storage do chat messages need?", category: "estimate", stage: 1,
    reasoning: "slightly", minutes: 15, skills: ["math", "databases", "architecture"], models: ["constraint-first"], noSearch: true,
    brief: "A chat app has 10 million daily active users. Leadership asks how much storage text messages will need per year.\n\nDon't look anything up. Give a number, and make your reasoning easy to check.",
    constraints: ["Text messages only; images are a separate question.", "Messages are kept forever."],
    hints: [
      "Break it into users × messages per user per day × bytes per message × days.",
      "A message is more than its text: ids, sender, chat, timestamps. Guess the size of each.",
      "Stored data is copied: replicas, backups and indexes all multiply the raw size.",
    ],
    reveal: {
      keyPoints: [
        "Stated each assumption explicitly (messages per user per day, bytes per message).",
        "Counted metadata, not just the text.",
        "Accounted for replication, backups and indexes.",
        "Sanity-checked the result, for example storage per user per year.",
        "Named the most sensitive assumption and how far the answer moves if it's wrong.",
        "Gave an order of magnitude, not false precision.",
      ],
      answer: "One reasonable chain: 10M users × 40 messages a day = 400M messages a day. About 100 bytes of text plus 100 bytes of metadata ≈ 200 bytes, so 80 GB a day, or about 29 TB a year raw. Three replicas and some index overhead make it roughly 100 TB a year. Sanity check: 40 × 200 bytes × 365 ≈ 3 MB per user per year, which is plausible for text. The answer is linear in messages per day, the least certain input: if heavy users send 200 a day, it's five times bigger.",
      principle: "An estimate is a chain of assumptions. Make each link visible so it can be challenged.",
    },
    followUps: ["Now 5% of messages carry a 200 KB image. Recompute. Which term dominates, and what does that mean for the design?"],
  },
  {
    id: "estimate-peak-rps", title: "Peak requests per second for a food-delivery app", category: "estimate", stage: 1,
    reasoning: "slightly", minutes: 15, skills: ["math", "architecture", "performance"], models: ["littles-law", "constraint-first"], noSearch: true,
    brief: "A food-delivery app handles 2 million orders a day. You're planning backend capacity. Estimate the peak number of API requests per second.",
    hints: [
      "One order is not one request. Count the API calls in a typical order session.",
      "Many sessions end without an order. How much traffic do they add?",
      "Traffic isn't spread evenly over 24 hours. When do people order food?",
    ],
    reveal: {
      keyPoints: [
        "Counted requests per user action (browse, search, menu, cart, pay, tracking), not one per order.",
        "Included sessions that never become orders.",
        "Worked out the average first, using a day ≈ 86,400 s ≈ 10^5 s.",
        "Applied a peak factor for lunch and dinner, and said what it was based on.",
        "Designed for the peak with headroom, not for the average.",
      ],
      answer: "One chain: 2M orders × ~50 requests per ordering session = 100M requests, doubled for browsing without ordering = 200M a day. Average: 200M ÷ 86,400 ≈ 2,300 per second. If half the day's traffic falls in 4 meal-time hours, that's 100M ÷ 14,400 ≈ 7,000 per second, and the busiest minute is higher still, so plan for around 10,000.",
      principle: "Design for the peak, not the average, and know what your peak factor is.",
    },
    followUps: ["Order tracking polls every 5 seconds for 40 minutes per order. How many requests per second is that at dinner time? Would push updates change it?"],
  },
  {
    id: "product-checkout", title: "Checkout abandonment went up", category: "product", stage: 1,
    reasoning: "ambiguous", minutes: 20, skills: ["product", "communication", "databases"], models: ["measure-first", "bayesian-updating"],
    brief: "A product manager messages you: “Checkout abandonment went from 60% to 68% this month. Can you fix it?”\n\nYou don't get anything else yet. Work out what the real problem is before proposing a fix.",
    hints: [
      "Is the metric itself trustworthy? What could change a metric without changing user behaviour?",
      "Break the checkout into steps. Where exactly do people drop off, and is it everyone or one group?",
      "What changed this month: releases, payment providers, prices, delivery fees?",
    ],
    reveal: {
      keyPoints: [
        "Asked exactly how abandonment is defined and checked that tracking didn't change (a new app version that drops an event looks like abandonment).",
        "Broke the funnel into steps (address, payment, OTP, confirmation) to find where the drop happens.",
        "Segmented: device, app version, payment method, region, new vs returning users.",
        "Lined the change up with what else happened this month.",
        "Proposed an experiment with a clear success metric (completed orders per checkout session) and guardrails (refunds, fraud, latency).",
        "Avoided redesigning checkout before knowing the cause.",
      ],
      answer: "The first job is to trust the number, then to locate the drop. Often it's one segment (a payment method failing on one Android version, say) rather than the whole checkout.",
      principle: "Before fixing a metric, check the metric: measurement changes cause many “regressions”.",
    },
    followUps: ["You find the drop is all on one bank's UPI payments. What do you do today, and what do you do this quarter?"],
  },
  {
    id: "debug-async-foreach", title: "Every order total is ₹0", category: "debug", stage: 2,
    reasoning: "familiar", minutes: 15, skills: ["debugging", "testing", "quality"], models: ["bisection"],
    brief: "Checkout shows ₹0 for every order. The pricing service's logs show every getPrice call succeeding, with sensible prices.",
    artifacts: [{ label: "cart.js", lang: "js", text: `async function orderTotal(items) {
  let total = 0;
  items.forEach(async (item) => {
    const price = await getPrice(item.sku); // calls the pricing service
    total += price * item.qty;
  });
  return total;
}` }],
    hints: [
      "The calls succeed and the prices are right. So when do the prices arrive, compared with when total is returned?",
      "What does forEach do with the value your callback returns?",
      "forEach ignores the promise each async callback returns. Nothing waits for them.",
    ],
    reveal: {
      keyPoints: [
        "Used the evidence: the calls succeed, so the problem is timing, not the pricing service.",
        "forEach doesn't await async callbacks: it starts them all and returns immediately, so total is returned before any price arrives.",
        "Fix: await Promise.all(items.map(...)) and sum the results, or a for...of loop with await.",
        "Named the trade-off: Promise.all sends every request at once (fast, but may overload the pricing service without a concurrency limit); for...of is sequential and slower.",
        "Regression: a test whose mock getPrice resolves on a later tick, so the bug can't hide. typescript-eslint's no-misused-promises rule can flag async callbacks where a void return is expected.",
      ],
      answer: "total is read before any await finishes, because Array.prototype.forEach never waits for the promises its callback returns.",
      principle: "When every part works but the result is wrong, suspect timing and ordering between the parts.",
    },
    followUps: ["Carts can have 300 items and the pricing service allows 20 concurrent requests per client. How do you change the fix?"],
  },
  {
    id: "data-left-join", title: "Customers vanished from the report", category: "data", stage: 2,
    reasoning: "familiar", minutes: 15, skills: ["databases", "debugging", "testing"], models: ["invariants"],
    brief: "The report should list every customer and how many orders they placed in 2026, including customers with none. There are 9,540 customers, but the report has 8,112 rows. No errors anywhere.",
    artifacts: [{ label: "report.sql", lang: "sql", text: `SELECT c.id, c.name, COUNT(o.id) AS orders_2026
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.created_at >= '2026-01-01'
GROUP BY c.id, c.name;` }],
    hints: [
      "Which customers are missing? Check a few by hand.",
      "For a customer with no matching orders, what is o.created_at in the joined row?",
      "WHERE runs after the join, and a comparison with NULL is never true.",
    ],
    reveal: {
      keyPoints: [
        "Treated the row-count mismatch as the key clue and looked at which rows were missing.",
        "For unmatched customers the LEFT JOIN fills o.* with NULL; NULL >= '2026-01-01' isn't true, so WHERE removes them, turning the query into an inner join.",
        "Noticed customers with only older orders vanish too, not just those with no orders.",
        "Fix: move the date condition into the ON clause, and add an upper bound (< '2027-01-01') if the year matters.",
        "Kept COUNT(o.id), not COUNT(*): COUNT(*) would count 1 for customers with no orders.",
        "Regression: a test fixture with a customer with no orders and one with only 2025 orders, asserting the row count equals the customer count.",
      ],
      answer: "The filter on the right-hand table sits in WHERE, which discards the NULL-extended rows the LEFT JOIN created.",
      principle: "Check row counts against an independent source. Silent data loss rarely raises an error.",
    },
    followUps: ["The report must now also show each customer's total spend in 2026, with 0 for none. What changes?"],
  },
  {
    id: "data-timezone", title: "Late-night orders land on the wrong day", category: "data", stage: 2,
    reasoning: "slightly", minutes: 15, skills: ["databases", "debugging", "product"], models: ["invariants"],
    brief: "The business runs in India. Finance says the daily sales report for 24 September is lower than the shop's own records. Orders from just after midnight seem to appear in the 23 September report instead. The monthly total is almost right.",
    artifacts: [{ label: "daily_sales.sql (the database session runs in UTC)", lang: "sql", text: `-- orders.created_at is a timestamptz (stored as UTC)
SELECT DATE(created_at) AS day, SUM(amount) AS sales
FROM orders
GROUP BY 1
ORDER BY 1;` }],
    hints: [
      "Which orders are wrong? Only those near midnight. What kind of bug depends on the time of day?",
      "What date is 00:30 in India, in UTC?",
      "India is UTC+5:30. DATE() here takes the date in the session's time zone, UTC.",
    ],
    reveal: {
      keyPoints: [
        "Used the pattern (only orders near midnight are wrong, the monthly total is nearly right) to point at a day boundary, not lost data.",
        "Worked out that orders from 00:00 to 05:29 IST fall on the previous UTC date.",
        "Fix: group by the Indian date, e.g. DATE(created_at AT TIME ZONE 'Asia/Kolkata') in PostgreSQL.",
        "Kept storing UTC and converting at the edges; defined “business day” explicitly in the requirement.",
        "Regression: fixture orders at 23:59 and 00:01 IST, asserting which day each lands on.",
      ],
      answer: "The report buckets by UTC date, but the business day is the Indian date, 5½ hours ahead.",
      principle: "Bugs that depend on the time of day are usually boundary or time-zone bugs.",
    },
    followUps: ["The company expands to Dubai (UTC+4). Whose “day” should a report use now?"],
  },
  {
    id: "data-not-in-null", title: "The query that suddenly returns nothing", category: "data", stage: 3,
    reasoning: "unfamiliar", minutes: 15, skills: ["databases", "debugging"], models: ["bisection", "bayesian-updating"],
    brief: "This query, which finds employees who manage nobody, returned 212 rows yesterday. Today it returns 0. Nobody changed the query. Yesterday, HR added a record for the new CEO.",
    artifacts: [{ label: "no_reports.sql", lang: "sql", text: `SELECT e.id, e.name
FROM employees e
WHERE e.id NOT IN (SELECT manager_id FROM employees);` }],
    hints: [
      "The code didn't change, so what did?",
      "Who manages the CEO? What's in their manager_id?",
      "What is 5 NOT IN (1, 2, NULL)? Think in true, false and unknown.",
    ],
    reveal: {
      keyPoints: [
        "Reasoned that if the query didn't change, the data did, and looked at the new row.",
        "The CEO's manager_id is NULL, so the subquery now contains NULL.",
        "x NOT IN (…, NULL) can never be true: comparing with NULL gives unknown, and WHERE keeps only true rows.",
        "Fix: NOT EXISTS (which handles NULL correctly), or filter WHERE manager_id IS NOT NULL in the subquery.",
        "Regression: a test with a NULL manager_id.",
      ],
      answer: "One NULL in the subquery makes every NOT IN comparison unknown, so no row qualifies.",
      principle: "If the code didn't change but the behaviour did, the input did.",
    },
    followUps: ["Where else in your own code could a single NULL (or undefined) silently change results?"],
  },
  {
    id: "debug-react-stale", title: "The timer that stops at 1", category: "debug", stage: 3,
    reasoning: "slightly", minutes: 15, skills: ["debugging", "quality", "testing"], models: ["state-machines"],
    brief: "This React component should count seconds. It shows “1s” after a second and then stays at 1 forever. No errors in the console.",
    artifacts: [{ label: "Timer.jsx", lang: "jsx", text: `function Timer() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(seconds + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return <p>{seconds}s</p>;
}` }],
    hints: [
      "Is the interval still running? How could you check?",
      "Inside the interval callback, which value of seconds does it see, and when was that value captured?",
      "The effect runs once, so its callback keeps the seconds from the first render: 0.",
    ],
    reveal: {
      keyPoints: [
        "Checked that the interval keeps firing (it does), so the problem is the value it computes.",
        "The callback closes over seconds from the first render (0); every tick sets 0 + 1 = 1.",
        "Fix: a functional update, setSeconds(s => s + 1), which always uses the latest value.",
        "Compared with adding seconds to the dependency array: it works, but tears down and recreates the interval every second.",
        "Regression: a test with fake timers that advances 3 seconds and expects “3s”. The react-hooks/exhaustive-deps lint rule warns about the missing dependency.",
      ],
      answer: "A stale closure: the interval callback captured seconds = 0 and the effect never re-runs.",
      principle: "A closure keeps the values from when it was created. Ask which version of the variable the code is seeing.",
    },
    followUps: ["The timer must pause when the tab is hidden and resume where it left off. What changes?"],
  },
  {
    id: "debug-cpp-overflow", title: "Right on the samples, negative on big tests", category: "debug", stage: 3,
    reasoning: "familiar", minutes: 10, skills: ["debugging", "algorithms", "testing"], models: ["invariants"],
    brief: "The program prints the total revenue of n orders. It passes the three sample tests. On a large hidden test it prints a negative number.",
    constraints: ["1 ≤ n ≤ 2·10^5", "1 ≤ price ≤ 10^9"],
    artifacts: [{ label: "total.cpp", lang: "cpp", text: `int main() {
    int n; cin >> n;
    int total = 0;
    for (int i = 0; i < n; i++) {
        int p; cin >> p;
        total += p;
    }
    cout << total << "\\n";
}` }],
    hints: [
      "Adding positive numbers gave a negative one. What can do that?",
      "What's the largest possible total, from the constraints? What's the largest int?",
      "INT_MAX is about 2.1·10^9; the total can reach 2·10^14.",
    ],
    reveal: {
      keyPoints: [
        "Recognised “positive inputs, negative output” as a sign of overflow.",
        "Computed the bound from the constraints before touching code: 2·10^5 × 10^9 = 2·10^14, far above INT_MAX (2,147,483,647).",
        "Knew that signed overflow is undefined behaviour in C++: wrapping to a negative number is common but not guaranteed.",
        "Fix: long long total.",
        "Regression: test at the maximum constraints; compile with -fsanitize=undefined to catch overflow at run time.",
      ],
      answer: "int overflows: the sum can reach 2·10^14.",
      principle: "Check the largest possible value against your type before writing the code.",
    },
    followUps: ["The task now asks for the average price, rounded down. Which new mistakes become possible?"],
  },
];

const C2 = [
  {
    id: "debug-race-stock", title: "100 units in stock, 163 customers charged", category: "debug", stage: 4,
    reasoning: "slightly", minutes: 20, skills: ["debugging", "databases", "systems"], models: ["invariants", "idempotency"], antipatterns: ["check-then-act"],
    brief: "A flash sale had 100 units. 163 customers were charged, and at the end the product page still showed 41 in stock. Every request logged success. The endpoint is below.",
    artifacts: [{ label: "buy.js", lang: "js", text: `app.post("/buy/:id", async (req, res) => {
  const [{ stock }] = await db.query(
    "SELECT stock FROM products WHERE id = $1", [req.params.id]);
  if (stock <= 0) return res.status(409).send("Sold out");
  await chargeCard(req.user, req.body.payment);          // ~800 ms
  await db.query("UPDATE products SET stock = $1 WHERE id = $2",
    [stock - 1, req.params.id]);
  res.send("OK");
});` }],
    hints: [
      "Two requests arrive 10 ms apart. Walk through both, line by line. What does each one read and write?",
      "What does the 800 ms charge do to that window?",
      "The UPDATE writes an absolute value computed from an old read. Concurrent writes overwrite each other.",
    ],
    reveal: {
      keyPoints: [
        "Found the check-then-act race: many requests read the same stock before any of them writes.",
        "Found the lost update: writing stock - 1 from a stale read overwrites other requests' decrements, which is why stock ended at 41.",
        "Saw that the slow card charge widens the race window.",
        "Fix: an atomic conditional update, UPDATE products SET stock = stock - 1 WHERE id = $1 AND stock > 0 RETURNING stock, treating 0 rows as sold out.",
        "Ordered the steps: reserve stock, then charge, then release the reservation if the charge fails. Avoided holding a row lock during the 800 ms external call.",
        "Regression: a concurrency test (hundreds of parallel buys) asserting charges ≤ stock and stock never below 0.",
      ],
      answer: "Concurrent requests all pass the stock check, then overwrite each other's writes.",
      principle: "Any read-then-write on shared state is a race until proven otherwise.",
    },
    followUps: ["The card charge succeeds but your server crashes before the stock update. What state are you in, and how do you recover?"],
  },
  {
    id: "review-password-reset", title: "Review: “Add password reset”", category: "review", stage: 3,
    reasoning: "slightly", minutes: 25, skills: ["security", "quality", "testing"], models: ["invariants"], antipatterns: ["secrets-in-logs"],
    brief: "A teammate opens a pull request. Description: “Adds password reset. Tested manually, works.” Would you approve it? Don't answer yes or no: review it.",
    artifacts: [{ label: "reset.js (the whole change)", lang: "js", text: `app.post("/forgot-password", async (req, res) => {
  const user = await db.users.findByEmail(req.body.email);
  if (!user) return res.status(404).json({ error: "No account with that email" });
  const token = Math.random().toString(36).slice(2);
  await db.resetTokens.insert({ userId: user.id, token });
  logger.info(\`reset token for \${user.email}: \${token}\`);
  await mailer.send(user.email, \`Reset: https://app.example.com/reset?token=\${token}\`);
  res.json({ ok: true });
});

app.post("/reset-password", async (req, res) => {
  const row = await db.resetTokens.findByToken(req.body.token);
  if (!row) return res.status(400).json({ error: "Invalid token" });
  await db.users.setPassword(row.userId, req.body.password);
  res.json({ ok: true });
});` }],
    hints: [
      "Pretend you're an attacker who knows only this code. What would you try?",
      "Look at the life of a token: how it's made, stored, logged, used, and whether it ever expires.",
      "Compare the two responses for an email that exists and one that doesn't.",
    ],
    reveal: {
      keyPoints: [
        "Math.random() isn't cryptographically secure: use crypto.randomBytes (e.g. 32 bytes).",
        "Tokens never expire and aren't deleted after use: add a short expiry and make them single-use.",
        "Tokens are stored in plain text: store a hash, so a database leak doesn't hand out valid reset links.",
        "The token is written to the logs: anyone with log access can reset any account.",
        "The 404 message reveals which emails have accounts: return the same response either way.",
        "No rate limiting: someone can flood a user's inbox or hammer the endpoint.",
        "Existing sessions stay logged in after a reset, and the new password isn't validated.",
        "“Tested manually” isn't enough for security code: ask for tests of expiry, reuse and wrong tokens.",
        "Verdict: request changes, with the security issues marked blocking.",
      ],
      answer: "It works on the happy path and is unsafe in several independent ways.",
      principle: "Review for what the code allows, not only for what it was written to do.",
    },
    followUps: ["Write the three review comments you'd post first. Keep each one short, specific and kind."],
  },
  {
    id: "read-rate-limiter", title: "Read this rate limiter", category: "reading", stage: 3,
    reasoning: "slightly", minutes: 20, skills: ["quality", "security", "systems"], models: ["invariants", "failure-domains"], antipatterns: ["unbounded"],
    brief: "You've joined a team and this middleware protects the public API. Nobody who wrote it is still here. Before changing anything, work out what it does and what it assumes.",
    artifacts: [{ label: "limiter.js", lang: "js", text: `const buckets = new Map();

function allow(key, now = Date.now()) {
  const RATE = 5;    // tokens per second
  const BURST = 10;  // bucket size
  let b = buckets.get(key);
  if (!b) { b = { tokens: BURST, last: now }; buckets.set(key, b); }
  const elapsed = (now - b.last) / 1000;
  b.tokens = Math.min(BURST, b.tokens + elapsed * RATE);
  b.last = now;
  if (b.tokens >= 1) { b.tokens -= 1; return true; }
  return false;
}

module.exports = function rateLimit(req, res, next) {
  const key = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (allow(key)) return next();
  res.status(429).set("Retry-After", "1").send("Too many requests");
};` }],
    hints: [
      "Name the algorithm. What rate and burst does a single client get?",
      "Who decides the value of the X-Forwarded-For header?",
      "The service runs on 4 servers behind a load balancer and restarts on every deploy. What does that do to the limits?",
    ],
    reveal: {
      keyPoints: [
        "Identified a token bucket: 5 requests a second sustained, bursts up to 10, per key.",
        "The key comes from X-Forwarded-For, which the client can set unless a trusted proxy overwrites it, so an attacker can rotate it to get unlimited requests.",
        "The Map is never cleaned: every new key stays forever, and spoofed keys make memory grow without bound.",
        "State is per process: 4 servers give 4× the limit, and every restart resets it.",
        "Date.now() can jump backwards (clock adjustments), making elapsed negative and briefly draining tokens.",
        "Suggested changes: take the client IP from the trusted proxy configuration, evict idle keys (TTL or LRU), use a shared store if limits must be global, and use a monotonic clock.",
      ],
      answer: "A per-process token bucket keyed by a client-controlled header, with no eviction.",
      principle: "Every piece of code encodes assumptions about its environment. List them, then ask which ones production breaks.",
    },
    followUps: ["Limits must now be per API key, shared across all servers, with 1 ms of added latency at most. What do you build?"],
  },
  {
    id: "perf-n-plus-one", title: "Fast on your laptop, 1.9 s in production", category: "perf", stage: 4,
    reasoning: "familiar", minutes: 20, skills: ["performance", "databases", "networking"], models: ["amortization", "measure-first"], antipatterns: ["n-plus-one"],
    brief: "The order-history page takes about 180 ms locally and 1.9 s in production. Database CPU in production is low, and each of these queries takes about 2 ms inside the database. Make it faster, but prove it.",
    artifacts: [{ label: "orders.js (20 orders per page, ~4 items per order)", lang: "js", text: `const orders = await db.query(
  "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20", [userId]);
for (const o of orders) {
  o.items = await db.query("SELECT * FROM order_items WHERE order_id = $1", [o.id]);
  for (const it of o.items) {
    it.product = (await db.query(
      "SELECT name, image FROM products WHERE id = $1", [it.product_id]))[0];
  }
}` }],
    hints: [
      "Count the queries for one page load.",
      "The database is fast and idle. So where do 1.9 seconds go?",
      "Each query is a network round trip. Locally a round trip is ~1 ms; in production it can be 10–20 ms.",
    ],
    reveal: {
      keyPoints: [
        "Counted the queries: 1 + 20 + 80 = 101 sequential round trips per page.",
        "Explained the local vs production gap with round-trip latency, not query cost (the database is idle and each query is fast).",
        "Baseline first: queries per request and p50/p95 latency.",
        "Fix: batch, e.g. order_items WHERE order_id = ANY($1), then products WHERE id = ANY($2): 3 queries. Or one JOIN.",
        "Measured again and compared p95, not just one request.",
        "Prevented regressions: log or assert the query count per request in tests.",
      ],
      answer: "101 sequential round trips at ~15–20 ms each in production. Batching brings it to 3.",
      principle: "Latency adds up per round trip. Count the trips before optimising the queries.",
    },
    followUps: ["A JOIN returns order columns repeated for every item. When would that matter, and what would you do instead?"],
  },
  {
    id: "perf-prove-faster", title: "“The new version feels way faster”", category: "perf", stage: 4,
    reasoning: "slightly", minutes: 20, skills: ["performance", "testing", "math"], models: ["measure-first", "bayesian-updating"],
    brief: "A teammate replaced a JSON parser with a new library and posted this benchmark. Before merging, prove or disprove that it's faster in a way that matters.",
    artifacts: [{ label: "bench.js and its output", lang: "js", text: `console.time("old"); parseOld(sample); console.timeEnd("old");
console.time("new"); parseNew(sample); console.timeEnd("new");

// old: 41.2ms
// new: 9.8ms` }],
    hints: [
      "How many times did each version run? What happens the first time any code runs in a JIT-compiled runtime?",
      "Is one sample input representative of production inputs?",
      "Even if parsing got 4× faster, how much of a request's time is parsing?",
    ],
    reveal: {
      keyPoints: [
        "One run each, no warm-up: the first run pays one-time costs (JIT compilation, cold caches), and “old” ran first.",
        "One input: measure across realistic sizes and shapes.",
        "Report distributions (median, p95, spread) from many iterations, in random order.",
        "Checked correctness: both parsers produce identical output, including edge cases.",
        "Asked whether parsing matters: measure end-to-end request latency, not just the function.",
        "Decided success criteria before measuring. Tools: a benchmarking library, or hyperfine for command-line programs.",
      ],
      answer: "This benchmark can't tell. It needs warm-up, repetition, realistic inputs and an end-to-end measurement.",
      principle: "One run is an anecdote. A benchmark needs warm-up, repetition, a baseline and a spread.",
    },
    followUps: ["The new parser is 2× faster but uses 3× the memory. Which do you ship, and what would decide it?"],
  },
  {
    id: "tradeoff-live-updates", title: "Live order tracking: polling, SSE or WebSocket?", category: "tradeoff", stage: 5,
    reasoning: "slightly", minutes: 25, skills: ["architecture", "networking", "performance"], models: ["simplest-valid", "constraint-first", "littles-law"],
    brief: "Customers watch their delivery rider on a map. The rider's location updates every 5 seconds. At dinner time about 200,000 people watch at once, on the web and in mobile apps. Choose how updates reach them.",
    constraints: ["The team knows HTTP APIs well and has never run WebSockets in production.", "Some customers are on office Wi-Fi with strict proxies.", "Budget matters."],
    hints: [
      "Work out what polling every 5 seconds costs, in requests per second.",
      "Do updates flow one way or both ways?",
      "What happens to 200,000 long-lived connections when you deploy?",
    ],
    reveal: {
      keyPoints: [
        "Did the maths: 200,000 clients polling every 5 s = 40,000 requests a second, mostly returning small, cacheable data.",
        "Noticed updates are one-way (server to client), which fits Server-Sent Events: plain HTTP, and browsers reconnect automatically.",
        "WebSocket is two-way and flexible, but needs connection-aware load balancing, scaling by connection count, and new operational skills.",
        "Long-lived connections have their own failure mode: a deploy or crash drops them all, and every client reconnects at once.",
        "Used push notifications for status changes (picked up, arriving) when the app is in the background, not for location.",
        "Said when the answer changes: riders chatting with customers (two-way) favours WebSocket; 30-second updates make polling cheap and simple.",
      ],
      answer: "No universal answer. For one-way updates every few seconds, polling or SSE are strong, simpler choices; WebSocket earns its cost when you need two-way, low-latency messaging.",
      principle: "There's no best technology, only the best fit for the constraints. Change a constraint and the answer moves.",
    },
    followUps: ["Constraint change: riders and customers can now chat in real time. What changes in your choice?"],
    extra: "adr",
  },
  {
    id: "api-webhook-duplicates", title: "Some wallets were credited twice", category: "api", stage: 5,
    reasoning: "slightly", minutes: 25, skills: ["systems", "databases", "architecture"], models: ["idempotency", "state-machines"], antipatterns: ["missing-idempotency"],
    brief: "Your payment provider sends a webhook when a payment succeeds. Some users were credited twice. It happens more when the email service is slow. The provider's docs say: “We retry any webhook that doesn't receive a 2xx response within 10 seconds. Events may be delivered more than once and out of order.”",
    artifacts: [{ label: "webhook.js", lang: "js", text: `app.post("/webhooks/payments", async (req, res) => {
  const event = verifySignature(req);                // throws if invalid
  const order = await db.orders.find(event.data.order_id);
  await db.wallets.credit(order.user_id, event.data.amount);
  await sendReceiptEmail(order);                     // 2-15 s (third-party email API)
  res.sendStatus(200);
});` }],
    hints: [
      "Line up the timing: the email takes up to 15 s, the provider waits 10 s.",
      "Even with a fast handler, the docs say duplicates can happen. What must be true of your handler?",
      "What does “out of order” mean for an order that was paid and then refunded?",
    ],
    reveal: {
      keyPoints: [
        "Connected the symptom to the timing: a slow email makes the response miss the 10 s timeout, so the provider retries and the credit runs again.",
        "Saw that even a fast handler must cope with duplicates, since delivery is at-least-once.",
        "Fix: record the event id with a unique constraint in the same transaction as the credit; a second delivery hits the constraint and does nothing.",
        "Respond quickly: store the event, return 200, and do the slow work (email) asynchronously from a queue.",
        "Handled ordering with a state machine: a late “succeeded” event must not undo a “refunded” order.",
        "Regression: a test that delivers the same event twice and out of order; an alert on duplicate event ids.",
      ],
      answer: "Retries after timeouts, plus a handler that isn't idempotent.",
      principle: "At-least-once delivery means your handler must be idempotent.",
    },
    followUps: ["Your app also calls POST /orders over flaky mobile networks, and a timed-out request is retried. How do you avoid duplicate orders there?"],
  },
  {
    id: "security-idor", title: "Any logged-in user can read any invoice", category: "security", stage: 4,
    reasoning: "familiar", minutes: 15, skills: ["security", "testing"], models: ["invariants"],
    brief: "A security researcher reports that they could download other customers' invoices. Invoice ids are sequential numbers. Here's the endpoint. Analyse it the way a security engineer would.",
    artifacts: [{ label: "invoices.js", lang: "js", text: `app.get("/api/invoices/:id", requireLogin, async (req, res) => {
  const invoice = await db.invoices.findById(req.params.id);
  if (!invoice) return res.sendStatus(404);
  res.json(invoice);
});` }],
    hints: [
      "requireLogin answers one question. Which question is never asked?",
      "What changes if an attacker simply counts from 1 upwards?",
      "Would switching to random ids be a fix?",
    ],
    reveal: {
      keyPoints: [
        "Named it: broken object-level authorisation (IDOR), number one in the OWASP API Security Top 10 (2023).",
        "Authentication (who you are) is checked; authorisation (may you see this invoice?) isn't.",
        "Impact: every invoice, with names and addresses, can be enumerated by counting ids.",
        "Fix: scope the query to the owner (WHERE id = $1 AND user_id = $2), with an explicit rule for admins; return 404 either way so existence isn't confirmed.",
        "Random ids make guessing harder but aren't a fix: ids leak through URLs, logs and shared links.",
        "Verification: an automated test where user B requests user A's invoice; review every endpoint that takes an id.",
      ],
      answer: "The endpoint checks that you're logged in, never that the invoice is yours.",
      principle: "Authentication says who you are. Authorisation must be checked for every object, every time.",
      source: { name: "OWASP API Security Top 10 (2023): API1 Broken Object Level Authorization", url: "https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/" },
    },
    followUps: ["How would you find every other endpoint with the same bug in a codebase of 300 routes?"],
  },
  {
    id: "security-ssrf", title: "Link previews that fetch any URL", category: "security", stage: 6,
    reasoning: "unfamiliar", minutes: 25, skills: ["security", "networking", "architecture"], models: ["failure-domains"],
    brief: "New chat feature: paste a link and the server fetches the page to show a preview (title and image). It runs on a cloud virtual machine. Threat-model it before launch.",
    artifacts: [{ label: "preview.js", lang: "js", text: `app.post("/preview", requireLogin, async (req, res) => {
  const html = await fetch(req.body.url).then(r => r.text());
  res.json(extractPreview(html));
});` }],
    hints: [
      "Your server makes the request, from inside your network. What can it reach that the user can't?",
      "Cloud VMs can ask a special internal address for information about themselves.",
      "What if the page is 5 GB, never finishes, or redirects somewhere else?",
    ],
    reveal: {
      keyPoints: [
        "Named it: server-side request forgery (SSRF). The server fetches URLs an attacker chooses, from inside your network.",
        "Internal targets: localhost admin ports, internal services, and the cloud metadata address (169.254.169.254), which can expose instance credentials on some setups.",
        "Redirects and DNS can point a harmless-looking URL at an internal address, so checking the hostname once isn't enough.",
        "Resource abuse: huge or never-ending responses tie up memory and workers.",
        "Mitigations: allow only http and https, resolve the address and block private, loopback and link-local ranges (on every redirect too), time and size limits, run the fetcher with restricted network access, and require session-based metadata access (for example AWS IMDSv2).",
        "Verification: tests with internal addresses and redirects; alerts on blocked requests.",
      ],
      answer: "A URL fetcher is a door into your network. Decide what's behind it before launch.",
      principle: "Any feature where your server fetches something a user chose needs an explicit list of what it may reach.",
      source: { name: "OWASP SSRF Prevention Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html" },
    },
    followUps: ["Product wants previews for internal company wiki links too. How do you allow that safely?"],
  },
  {
    id: "reasoning-caching", title: "“Adding a cache always makes things faster”", category: "reasoning", stage: 3,
    reasoning: "slightly", minutes: 10, skills: ["performance", "architecture", "systems"], models: ["caching", "second-order"], antipatterns: ["cache-stampede"],
    brief: "A teammate says: “Adding a cache always makes things faster.” Find the counterexamples.",
    hints: [
      "What if most requests ask for something new?",
      "What if the data changes often, or must never be stale?",
      "What happens when a popular entry expires?",
    ],
    reveal: {
      keyPoints: [
        "Low hit rate (unique or long-tail keys): every request pays an extra lookup and gets nothing.",
        "Frequently changing data: invalidation costs, and stale reads cause correctness bugs (the price shown isn't the price charged).",
        "Expiry of a hot key: many requests miss at once and stampede the database.",
        "Cold start after a deploy or restart: the cache is empty exactly when load arrives.",
        "The cache costs more than the work: serialising and a network hop can be slower than recomputing something cheap.",
        "Memory pressure: an in-process cache can evict useful data or increase garbage-collection pauses.",
        "True when: reads repeat a lot (skewed access), the source is expensive, and some staleness is acceptable.",
      ],
      answer: "Caching helps when access repeats and staleness is acceptable; it hurts or adds bugs when neither holds.",
      principle: "Every “always” in engineering has boundary conditions. Find them before relying on the rule.",
    },
    followUps: ["Where does caching appear in a CPU, a browser, DNS and your DP solutions? What's the same, and what's different?"],
  },
  {
    id: "reasoning-threads", title: "“More threads make the program faster”", category: "reasoning", stage: 4,
    reasoning: "slightly", minutes: 10, skills: ["performance", "os", "math"], models: ["bottlenecks", "littles-law"],
    brief: "Claim: “More threads make a program faster.” Find situations where it's false, and say when it's true.",
    hints: [
      "The machine has 8 cores. What happens with 64 threads doing pure computation?",
      "What if every thread needs the same lock, or the same database with 10 connections?",
      "If 10% of the work can't run in parallel, what's the best possible speed-up?",
    ],
    reveal: {
      keyPoints: [
        "CPU-bound work with more threads than cores: extra threads only add context switches.",
        "Contention: a shared lock serialises the work; Amdahl's law bounds speed-up at 1 / ((1 − p) + p/n), so with 10% serial work it can never exceed 10×.",
        "A shared resource with a fixed limit, such as a 10-connection database pool: extra threads just wait.",
        "Memory bandwidth, cache effects and false sharing can make more threads slower.",
        "In standard CPython builds, the global interpreter lock stops threads running Python code in parallel, so CPU-bound threads don't speed up.",
        "True when: work is independent and waits on I/O, or CPU work is parallel up to the number of cores.",
      ],
      answer: "Threads help independent, waiting or parallel work, up to the limit of the scarcest shared resource.",
      principle: "Speed-up is limited by whatever doesn't parallelise.",
    },
    followUps: ["You add threads and throughput stays flat while CPU sits at 30%. What are your next three hypotheses?"],
  },
];

// Incidents and case studies reveal information in stages. Write what you'd do at each stage to unlock the next.
const C3 = [
  {
    id: "incident-slow-after-deploy", title: "Everything is slow, and nobody knows why", category: "incident", stage: 4,
    reasoning: "slightly", minutes: 30, skills: ["systems", "databases", "debugging"], models: ["bottlenecks", "failure-domains"], antipatterns: ["missing-index"],
    brief: "You're on call. It's 8:10 pm.",
    stages: [
      { at: "T+0", info: "Several users report that the app is slow. Dashboards: p50 latency 120 ms → 900 ms, p99 2 s → 12 s. Error rate slightly up, all timeouts.", ask: "What do you look at first, and why?" },
      { at: "T+10", info: "Latency is up on every endpoint, not one. Application servers' CPU is normal (35%). Database CPU is at 95% (usually 30%).", ask: "Which hypotheses does this leave? What would tell them apart?" },
      { at: "T+20", info: "Top queries by total time: one dominates. SELECT * FROM order_items WHERE product_id = $1: 18,000 calls a minute, 40 ms each. Yesterday it was barely called.", ask: "Roll back, or keep investigating? What would make you choose each?" },
      { at: "T+30", info: "A deploy went out 40 minutes ago. The product page now shows “X people bought this”, counted from order_items. order_items has an index on order_id, not on product_id.", ask: "Mitigate now, fix properly later. What do you do, in what order?" },
    ],
    hints: [
      "Every endpoint is slow: that points at something they share.",
      "When the database is the shared bottleneck, which query is using it?",
      "What changed recently?",
    ],
    reveal: {
      keyPoints: [
        "Started from user impact and scope: all endpoints slow points to a shared dependency, not one handler.",
        "Compared application CPU with database CPU to find where the time goes.",
        "Used top queries by total time to find the one query that dominates.",
        "Connected the timing to the deploy: most incidents follow a change.",
        "Mitigated first: roll back (or switch off the feature flag) to restore service, then investigate.",
        "Fix: index product_id (in PostgreSQL, CREATE INDEX CONCURRENTLY to avoid blocking writes), or better for a hot page, keep a precomputed count.",
        "Prevention: check query plans for new queries in review, alert on slow queries, deploy gradually, and show deploys on dashboards.",
      ],
      answer: "A new feature ran an unindexed query on a hot page. The database became the shared bottleneck, so everything slowed down.",
      principle: "Mitigate first, then find the root cause. And ask what changed: most incidents follow a change.",
    },
    followUps: ["The rollback fails because the deploy also ran a database migration. What now?"],
    extra: "postmortem",
  },
  {
    id: "incident-cache-stampede", title: "Slow every hour, on the hour", category: "incident", stage: 5,
    reasoning: "unfamiliar", minutes: 30, skills: ["systems", "performance", "databases"], models: ["second-order", "feedback-loops", "caching"], antipatterns: ["cache-stampede"],
    brief: "The homepage API has a strange pattern, and you've been asked to find out why.",
    stages: [
      { at: "T+0", info: "Every hour, on the hour, the homepage API's p99 jumps from 150 ms to 6 s for about 90 seconds, then recovers. Nobody deploys hourly.", ask: "What does a precise period suggest? List what runs on a schedule." },
      { at: "T+10", info: "During each spike the database runs the same “homepage feed” query hundreds of times within seconds, and its connection pool is full (100 of 100). Cache hit rate drops from 99% to almost 0.", ask: "What's your hypothesis now, and how would you confirm it?" },
      { at: "T+20", info: "The feed is cached in Redis with a 1-hour TTL. A warm-up job filled every key at once when the servers restarted at 10:00 yesterday.", ask: "Why does this keep happening every hour rather than just once? How do you fix it?" },
    ],
    hints: [
      "A precise period points at timers: cron jobs, TTLs, scheduled tasks.",
      "When a popular cached value expires, how many requests notice at the same moment?",
      "After the stampede, all the keys are refreshed at almost the same moment again.",
    ],
    reveal: {
      keyPoints: [
        "Treated the exact period as evidence and listed scheduled things: cron jobs, TTLs, batch jobs.",
        "Recognised a cache stampede: hot keys expire together, hundreds of requests miss at once and all run the same slow query.",
        "Explained why it repeats: keys are refilled together during the stampede, so they expire together an hour later.",
        "Fixes: let one request recompute while others wait or get the stale value (request coalescing), refresh in the background before expiry, and add random jitter to TTLs.",
        "Second-order check: limiting recomputation keeps the database safe even if the cache empties completely.",
        "Prevention: alert on cache hit rate, and load-test with an empty cache.",
      ],
      answer: "Synchronised expiry of hot cache keys causes an hourly thundering herd on the database.",
      principle: "Periodic symptoms have periodic causes: look for timers, TTLs and cron jobs.",
    },
    followUps: ["Redis itself restarts and every key is gone at 7 pm on a Friday. What happens, and what protects the database?"],
    extra: "postmortem",
  },
  {
    id: "incident-retry-storm", title: "The provider recovered. You didn't.", category: "incident", stage: 6,
    reasoning: "unfamiliar", minutes: 35, skills: ["systems", "architecture", "networking"], models: ["feedback-loops", "littles-law", "second-order"], antipatterns: ["retry-storm"],
    brief: "Checkout is failing. The payment provider's status page says “degraded performance”.",
    stages: [
      { at: "T+0", info: "Checkout error rate: 0.1% → 30%. Payment provider latency: 300 ms → 8 s.", ask: "What do you expect to happen inside your service when a dependency gets 25× slower?" },
      { at: "T+10", info: "Your checkout service is using 100% of its worker threads, and requests are queueing. Requests per second to the provider have tripled, although checkout traffic is flat.", ask: "Why would requests to the provider triple? What would you check?" },
      { at: "T+20", info: "The mobile app retries a failed checkout 3 times. The API gateway retries 5xx errors 3 times. The payment client retries timeouts 3 times, immediately.", ask: "How many provider calls can one tap on “Pay” cause? What do you change right now?" },
      { at: "T+30", info: "The provider recovered 10 minutes ago. Your service is still failing.", ask: "Why hasn't your service recovered? How do you get it back?" },
    ],
    hints: [
      "Little's law: requests in flight = arrival rate × time per request. What happens to in-flight requests when time per request goes from 0.3 s to 8 s?",
      "Retries at several layers multiply.",
      "If retries and queued work keep the system overloaded, does it matter that the original cause is gone?",
    ],
    reveal: {
      keyPoints: [
        "Used Little's law: at the same traffic, 25× slower calls means about 25× more requests in flight, which exhausts worker threads.",
        "Multiplied the retries: 3 retries means 4 attempts per layer, so three layers allow up to 4 × 4 × 4 = 64 provider calls for one tap.",
        "Saw that immediate retries add load exactly when the dependency is struggling (positive feedback).",
        "Explained the failure to recover: queued work plus retries keep the service overloaded after the trigger is gone.",
        "Mitigation now: turn retries off with a config flag, fail fast (circuit breaker), shed load and drain queues.",
        "Fix: retry at one layer only, with exponential backoff and jitter and a retry budget; set timeouts shorter than the caller's; use idempotency keys so payment retries are safe.",
      ],
      answer: "Retries at three layers multiplied load on a slow dependency, and the overload kept itself going after the provider recovered.",
      principle: "Retries are load. Under failure they multiply, so budget them and back off with jitter.",
      source: { name: "Google SRE book: Addressing Cascading Failures", url: "https://sre.google/sre-book/addressing-cascading-failures/" },
    },
    followUps: ["Design the retry policy for the payment client: which errors, how many attempts, what delays, and who decides to stop?"],
    extra: "postmortem",
  },
  {
    id: "incident-memory-leak", title: "Fine for 10 minutes, then it times out", category: "incident", stage: 7,
    reasoning: "unfamiliar", minutes: 35, skills: ["debugging", "performance", "systems"], models: ["bayesian-updating", "measure-first"], antipatterns: ["unbounded"],
    brief: "A Node.js API works perfectly for about 10 minutes after each restart. Then response times climb steadily until requests time out. Restarting “fixes” it, for 10 minutes.",
    stages: [
      { at: "T+0", info: "That's all you know so far.", ask: "What do you know, what don't you know, and what are your first hypotheses?" },
      { at: "T+10", info: "Heap usage grows about 40 MB a minute after a restart and never drops. Time spent in garbage collection rises from 1% to 45% before the timeouts. Request rate is steady.", ask: "Which hypotheses survive? How would you find what's growing?" },
      { at: "T+20", info: "Comparing two heap snapshots (2 and 8 minutes after restart) shows millions of entries in one Map, responseCache, holding response bodies.", ask: "Read the code in the artifact. Why does it keep growing?" },
      { at: "T+30", info: "Access logs: the mobile app adds ?_t=<timestamp> to every request, to avoid stale HTTP caches.", ask: "Explain the whole chain from the query parameter to the timeouts. Then fix and prevent it." },
    ],
    artifacts: [{ label: "products.js", lang: "js", text: `const responseCache = new Map();

app.get("/api/products", async (req, res) => {
  const key = req.originalUrl;            // includes the query string
  if (responseCache.has(key)) return res.json(responseCache.get(key));
  const body = await loadProducts(req.query);
  responseCache.set(key, body);
  res.json(body);
});` }],
    hints: [
      "A restart fixes it and it gets worse with time: what accumulates?",
      "Rising garbage-collection time with a growing heap is the classic sign of a leak or an unbounded structure.",
      "If every key is unique, how often does this cache hit, and when does it ever delete anything?",
    ],
    reveal: {
      keyPoints: [
        "Read “restart fixes it, worse over time” as something accumulating (memory, connections, handles), and listed hypotheses before looking.",
        "Used heap growth plus rising GC time to narrow it to memory, then heap snapshots to find what grows.",
        "Explained the chain: the cache key includes a unique _t value, so every request adds an entry and nothing ever hits or gets evicted; the heap grows, garbage collection takes over the CPU, requests wait, and they time out.",
        "Mitigation meanwhile: rolling restarts buy time, but they're not a fix.",
        "Fix: build the key only from parameters that change the response, and bound the cache (LRU with a size limit and TTL), or drop the per-process cache.",
        "Prevention: alert on heap growth and GC time, load-test with production-like URLs, and a review rule that every cache or queue has a bound.",
      ],
      answer: "An unbounded in-process cache keyed by a URL with a unique timestamp grows forever, until garbage collection starves the event loop.",
      principle: "Every cache and queue needs a bound. Unbounded growth is just a slow outage.",
    },
    followUps: ["The heap is flat but the same symptoms appear. What else accumulates in a Node.js process? List at least three things and how you'd check each."],
    extra: "postmortem",
  },
  {
    id: "case-cloudflare-2019", title: "Case study: a worldwide CPU spike", category: "case", stage: 7,
    reasoning: "unfamiliar", minutes: 30, skills: ["systems", "performance", "architecture"], models: ["failure-domains", "second-order"], antipatterns: ["big-bang-rollout"],
    brief: "A real incident. Reason it through yourself first; the reveal shows what actually happened, from the company's own postmortem.",
    stages: [
      { at: "T+0", info: "2 July 2019, 13:42 UTC. Visitors to websites behind a large CDN start getting HTTP 502 errors, worldwide. CPU on the machines that serve HTTP and HTTPS traffic is near 100%, on every such core, everywhere at once.", ask: "Everywhere at the same moment: what kinds of causes fit that, and which don't?" },
      { at: "T+10", info: "The spike began within minutes of a routine update to the web application firewall (WAF) rules. The new rules were in simulate mode: they log matches but don't block traffic.", ask: "Can a rule that only logs cause an outage? How?" },
      { at: "T+20", info: "One of the new rules contained a regular expression meant to detect inline JavaScript used in attacks.", ask: "What's the mechanism? What do you do in the next five minutes, and what should change afterwards?" },
    ],
    hints: [
      "Hardware doesn't fail everywhere at once. Something that reaches every machine at the same time does.",
      "Log-only still means the rule runs on every request.",
      "Some regular expressions take exponentially long on certain inputs.",
    ],
    reveal: {
      keyPoints: [
        "Reasoned that simultaneous global failure means something deployed everywhere at once, not a hardware or regional fault.",
        "Realised that simulate (log-only) mode still evaluates the rule on every request.",
        "Identified catastrophic backtracking: a regular expression whose running time explodes on some inputs, burning CPU on the request path.",
        "Mitigation: a global kill switch or rollback for the rules.",
        "Prevention: roll out rule changes gradually like code, test rules for performance, and limit how much CPU a single rule can use.",
      ],
      answer: "What happened: Cloudflare deployed a WAF managed rule whose regular expression backtracked enormously and exhausted the CPUs serving HTTP/HTTPS worldwide. The rules were deployed globally in one go. At its worst, traffic dropped by 82%; the outage lasted about 27 minutes and ended when the rules were rolled back. Cloudflare's postmortem lists what failed and what they changed: read it and compare with your own list.",
      principle: "Configuration is code: it needs the same gradual rollout and testing.",
      source: { name: "Cloudflare: Details of the Cloudflare outage on July 2, 2019", url: "https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/" },
    },
    followUps: ["Design a rollout process for WAF rules that still lets you ship an urgent rule for a new vulnerability within an hour."],
    extra: "postmortem",
  },
  {
    id: "case-s3-2017", title: "Case study: one command, one region down", category: "case", stage: 7,
    reasoning: "unfamiliar", minutes: 30, skills: ["systems", "architecture", "tooling"], models: ["failure-domains", "invariants"],
    brief: "A real incident. Reason it through yourself first; the reveal shows what actually happened, from the provider's own summary.",
    stages: [
      { at: "T+0", info: "28 February 2017, US-EAST-1. An object-storage service starts failing requests in one region. Many other services and websites that depend on it break too. The storage team had been debugging a billing subsystem that was running slowly, following an established playbook.", ask: "What kinds of change could turn routine debugging into a region-wide outage?" },
      { at: "T+10", info: "An operator ran a command meant to remove a small number of servers from a billing-related subsystem.", ask: "Where could that go wrong? What should a tool like this refuse to do?" },
      { at: "T+20", info: "More servers than intended were removed, including ones supporting the index subsystem, which holds the metadata and location of every object in the region. Two subsystems had to be fully restarted.", ask: "Why might a full restart take hours? What does that say about how often a restart path gets exercised?" },
      { at: "T+30", info: "For the first couple of hours, the provider couldn't update the per-service status on its own status dashboard.", ask: "Why might that be? What's the lesson for status pages?" },
    ],
    hints: [
      "A typo in a parameter can change “a few servers” into “many servers”.",
      "A system that's never fully restarted has a restart path nobody has tested at today's size.",
      "Where does your status page run, and what does it depend on?",
    ],
    reveal: {
      keyPoints: [
        "Suspected an operational change with too much blast radius, rather than a random failure.",
        "Said a capacity tool should remove capacity slowly and refuse to take any subsystem below its minimum.",
        "Saw that rarely exercised recovery paths (full restarts) are slow and risky.",
        "Noticed the status dashboard's hidden dependency on the system that was down.",
        "Framed it blamelessly: the tool allowed the mistake; improve the tool, not just the person.",
      ],
      answer: "What happened: one of the inputs to an established command was entered incorrectly, and a larger set of servers was removed than intended, including servers supporting the index and placement subsystems. They needed full restarts; AWS's summary notes these hadn't been fully restarted in its larger regions for many years. The event began at 9:37 AM PST and S3 was operating normally by 1:54 PM PST. AWS changed the tool to remove capacity more slowly and to refuse to take a subsystem below its minimum required capacity, and audited other tools for similar safety checks. Its status dashboard's administration console also depended on S3.",
      principle: "Tools should make big mistakes hard: bound destructive operations, and regularly exercise recovery paths.",
      source: { name: "AWS: Summary of the Amazon S3 Service Disruption in the Northern Virginia (US-EAST-1) Region", url: "https://aws.amazon.com/message/41926/" },
    },
    followUps: ["List the destructive commands in a system you know. Which ones have a minimum-capacity or confirmation guard?"],
    extra: "postmortem",
  },
  {
    id: "case-gitlab-2017", title: "Case study: rebuilding a replica at midnight", category: "case", stage: 7,
    reasoning: "unfamiliar", minutes: 30, skills: ["databases", "systems", "tooling"], models: ["failure-domains", "invariants"], antipatterns: ["untested-backups"],
    brief: "A real incident. Reason it through yourself first; the reveal shows what actually happened, from the company's own postmortem.",
    stages: [
      { at: "T+0", info: "31 January 2017. A code-hosting site runs one primary PostgreSQL database and one hot-standby replica. Under unusual load, replication to the standby fell behind and stopped. Late at night, engineers are rebuilding the standby, which means wiping its data directory and copying everything from the primary again.", ask: "What are the risks of this operation? What would you check before each command?" },
      { at: "T+10", info: "An engineer ran the command to remove the data directory on the primary, not the standby. They stopped it within seconds, but a large amount of production data was already gone.", ask: "What are your recovery options? Rank them by data lost and time to restore." },
      { at: "T+20", info: "The team discovers that the regular database backups had not been working.", ask: "How could backups fail for a long time without anyone noticing? What would have caught it?" },
    ],
    hints: [
      "Two terminals, two nearly identical servers, late at night: what makes it obvious which machine you're on?",
      "A standby that's being rebuilt can't be your failover.",
      "A backup job can “succeed” while producing nothing useful, and alerts can go nowhere.",
    ],
    reveal: {
      keyPoints: [
        "Named the risk before it happened: a destructive command on the wrong host, with the standby already unusable.",
        "Proposed safeguards: clear host identification in prompts, a confirmation step or tool that checks the target's role, and a second person for destructive steps.",
        "Ranked recovery options by data loss and restore time.",
        "Asked how silent backup failure is possible: failures not alerting anyone, and restores never tested.",
        "Concluded that backups must be restored regularly, automatically, and monitored.",
      ],
      answer: "What happened: while rebuilding replication, data was accidentally removed from the primary database. GitLab.com was unavailable for many hours, and changes made between 17:20 and 00:00 UTC were lost for good: roughly 5,000 projects, 5,000 comments and 700 new user accounts. Git repositories and wikis weren't affected. The regular backups turned out not to be working; the site was restored from a snapshot an engineer happened to have taken about six hours earlier. GitLab's postmortem explains each backup failure and their fixes.",
      principle: "A backup you've never restored is a hope, not a backup. And make it obvious which machine a destructive command will hit.",
      source: { name: "GitLab: Postmortem of database outage of January 31", url: "https://about.gitlab.com/blog/postmortem-of-database-outage-of-january-31/" },
    },
    followUps: ["Design a weekly automated restore test for a 2 TB database. What does it check, and who gets told when it fails?"],
    extra: "postmortem",
  },
  {
    id: "unknown-kafka-lag", title: "You've never used Kafka. Its consumer is falling behind.", category: "unknown", stage: 6,
    reasoning: "highly", minutes: 35, skills: ["systems", "performance", "architecture"], models: ["bottlenecks", "queues-backpressure", "littles-law"],
    brief: "You've never used Kafka. The billing consumer (consumer group “billing”) is falling behind: its lag grows by about 20,000 messages an hour. The topic “payments” has 6 partitions. The team scaled the consumer service from 6 to 12 instances. Lag didn't improve. Each message takes about 150 ms to process, mostly a call to a slow tax API.\n\nYou may read the official documentation (it's the point of this exercise); don't search for the answer.",
    constraints: ["Messages for the same customer must be processed in order."],
    resourceLinks: [{ name: "Apache Kafka documentation: introduction and consumer groups", url: "https://kafka.apache.org/documentation/#intro_concepts_and_terms" }],
    hints: [
      "In the docs, find how partitions are shared between the consumers in one group.",
      "Work out the maximum throughput: messages per second per partition × partitions.",
      "Doubling the instances didn't help. What is the real unit of parallelism?",
    ],
    reveal: {
      keyPoints: [
        "Found in the docs that each partition is consumed by at most one consumer in a group, so 12 consumers on 6 partitions leaves 6 idle.",
        "Computed the ceiling: 1 ÷ 0.15 s ≈ 6.7 messages a second per partition × 6 ≈ 40 a second ≈ 144,000 an hour, below the incoming rate.",
        "Checked lag per partition: an uneven key distribution can make one partition the bottleneck.",
        "Options: more partitions (which changes which partition each key goes to), processing several messages at once within a consumer while keeping per-customer order, and cutting the 150 ms (batch or cache tax lookups).",
        "Kept the ordering constraint in every option.",
        "Reflected on the process: how the docs were used to build a mental model quickly.",
      ],
      answer: "Throughput is capped by 6 partitions × one slow message at a time. Extra consumers sit idle.",
      principle: "Before adding more workers, find the unit of parallelism: partitions, locks, connections or cores.",
    },
    followUps: ["The tax API allows only 20 requests a second in total. Now what limits you, and what would you change?"],
  },
  {
    id: "research-queue", title: "When should a team add a message queue?", category: "research", stage: 6,
    reasoning: "ambiguous", minutes: 45, skills: ["architecture", "systems", "communication"], models: ["queues-backpressure", "idempotency", "simplest-valid"],
    brief: "Your team runs one web service and a PostgreSQL database. A teammate proposes adding a message queue “because that's how real systems work”. Research it properly and write a conclusion you could defend.",
    hints: [
      "Start with what a queue gives you: which problems does it solve that you actually have?",
      "Every new component adds a way to fail. What does a queue add?",
      "What simpler options exist with the database you already run?",
    ],
    reveal: {
      keyPoints: [
        "Listed real benefits: decoupling producer and consumer availability, absorbing bursts, moving slow work off the request path, fan-out.",
        "Listed the costs: another system to run and monitor, at-least-once delivery (so consumers must be idempotent), ordering, poison messages and dead-letter queues, lag monitoring, harder debugging.",
        "Considered simpler options: a job table in PostgreSQL (SELECT … FOR UPDATE SKIP LOCKED), a background-job library, or a scheduled task.",
        "Used primary sources (official docs of the queue systems and the database) and noted where they disagree or oversell.",
        "Gave a conditional conclusion with a confidence level, not a universal rule.",
      ],
      answer: "Add a queue when you have a concrete need it meets (bursts, decoupling, slow work, fan-out) and the capacity to operate it; otherwise a database-backed job table is often enough to start.",
      principle: "Every added component buys a capability and a new way to fail. Name both.",
    },
    followUps: ["Write this as a one-page decision record your team could review."],
    extra: "adr",
  },
  {
    id: "ai-verify-generated", title: "Verify the AI's code before it ships", category: "ai", stage: 4,
    reasoning: "slightly", minutes: 20, skills: ["quality", "testing", "debugging"], models: ["measure-first", "invariants"],
    brief: "An AI assistant wrote this helper for the finance report, along with a test, and said “All tests pass.” You own the merge. Verify it.",
    artifacts: [{ label: "dailyTotals.js and its test", lang: "js", text: `// Groups orders by calendar day (YYYY-MM-DD) and sums the amounts.
export function dailyTotals(orders) {
  const byDay = orders.groupBy(o => o.createdAt.toISOString().split("T")[0]);
  return Object.entries(byDay).map(([day, list]) => ({
    day,
    total: list.reduce((sum, o) => sum + o.amount, 0),
  }));
}

test("dailyTotals", () => {
  const orders = [{ createdAt: new Date("2026-09-01T10:00:00Z"), amount: 100 }];
  expect(dailyTotals(orders)).toEqual([{ day: "2026-09-01", total: 100 }]);
});` }],
    hints: [
      "Does every function it calls actually exist? Where would you check?",
      "“All tests pass” is a claim. How do you verify a claim?",
      "Which calendar day does toISOString() give, for a business in India?",
    ],
    reveal: {
      keyPoints: [
        "Checked the API: arrays have no groupBy method. The feature shipped as the static Object.groupBy(items, fn) in ES2024, so this line throws a TypeError.",
        "Ran the tests instead of trusting “all tests pass”; they fail.",
        "Spotted the time-zone bug: toISOString() gives the UTC date, not the business day in India (see the “wrong day” data challenge).",
        "Asked about money: summing decimal rupee amounts in floating point can drift; integer paise are safer.",
        "Noted the test covers one order: no empty input, several days, or times near midnight.",
        "Asked about the spec: in which time zone is a “calendar day”, and should results be sorted?",
      ],
      answer: "It calls a method that doesn't exist, has a time-zone bug, and its only test would have caught the first problem, if anyone had run it.",
      principle: "Generated code is a claim. Verify it: run it, read it, and test the edges it skipped.",
    },
    followUps: ["Write the specification you should have given the assistant, so it couldn't have produced this."],
  },
  {
    id: "howworks-signin", title: "How does “Sign in with Google” work?", category: "howworks", stage: 5,
    reasoning: "unfamiliar", minutes: 25, skills: ["security", "networking", "architecture"], models: ["state-machines"],
    brief: "You click “Sign in with Google” on some website and end up logged in. Build your own model of everything that happened in between before reading anything. Then compare with the standard.",
    hints: [
      "How many parties are involved, and which of them ever sees your Google password?",
      "Why would Google send the website a short-lived code instead of your identity directly in the redirect URL?",
      "How does the website know the answer really came from Google, and was meant for it?",
    ],
    reveal: {
      keyPoints: [
        "Three parties: your browser, the website (client) and Google (authorisation server). The website never sees your password.",
        "The website redirects you to Google with its client id, a redirect URI, the scopes it wants (openid, email, profile), a random state value and, ideally, a PKCE code challenge.",
        "You sign in and consent at Google, which redirects back with a short-lived authorisation code and the same state.",
        "The website's server checks state (against cross-site request forgery) and exchanges the code for tokens directly with Google, proving itself with its client secret and/or the PKCE verifier.",
        "It verifies the ID token (a signed JWT): Google's signature, issuer, audience = its client id, expiry, then identifies you by the stable sub claim, not by email, and starts its own session.",
        "Failure and security thinking: redirect URI mismatch, clock skew, key rotation, a missing state check, why tokens don't travel in URLs.",
      ],
      answer: "It's the OAuth 2.0 authorisation code flow with OpenID Connect on top: redirect to Google, get a code back, swap it server-side for a signed ID token, verify it, start your own session.",
      principle: "Protocols are shaped by threats. For each step, ask which attack it prevents.",
      source: { name: "OpenID Connect Core 1.0", url: "https://openid.net/specs/openid-connect-core-1_0.html" },
    },
    followUps: ["The same flow for a mobile app, which can't keep a client secret. What changes, and why does PKCE exist?"],
  },
  {
    id: "read-oss-ms", title: "Read real code: how does ms(\"2 days\") work?", category: "reading", stage: 3,
    reasoning: "slightly", minutes: 25, skills: ["quality", "opensource", "testing"], models: ["invariants"],
    brief: "vercel/ms is a tiny, very widely used library that converts between strings like “2 days” and milliseconds. Open its source and read it the way you'd read an unfamiliar codebase. Don't read tests or docs first.",
    resourceLinks: [{ name: "vercel/ms: src/index.ts on GitHub", url: "https://github.com/vercel/ms/blob/main/src/index.ts" }],
    hints: [
      "Start at the exported functions. Which one handles strings, and which numbers?",
      "In parse: what happens before the regular expression runs, and why might that be there?",
      "Compare the length check with its own error message.",
    ],
    reveal: {
      keyPoints: [
        "Found the entry points: ms() dispatches to parse for strings and format for numbers.",
        "Traced parse: a length check, one regular expression with named groups for the number and the unit, a default unit of ms, and NaN when nothing matches.",
        "Noticed the unit table: a year is 365.25 days, and “mo” means months, which are approximations.",
        "Spotted that the check allows strings up to 100 characters (it throws only when length > 100) while the error message says “between 1 and 99”: the code and the message disagree.",
        "Reasoned about why a parser caps input length before running a regular expression on untrusted input: it bounds the work done per call.",
        "Looked for how you'd confirm a finding: a test, and the project's issue tracker, before reporting it.",
      ],
      answer: "A small parser built on one regular expression and a unit table, with a guard on input length whose message doesn't match its condition.",
      principle: "Read code with a question in mind, and check the code against its own messages and comments.",
    },
    followUps: ["If you reported the 99 vs 100 mismatch, what would your issue or pull request say? Which change is safer: the message or the condition?"],
  },
];

export const CHALLENGES = [...C1, ...C2, ...C3];

// Mental models: reviewed on a spaced schedule (1, 3, 7, 21, 45 days). Knowledge you revise; skill you practise in the challenges.
export const MODELS = [
  { id: "bottlenecks", name: "Bottlenecks", meaning: "The slowest step limits the whole system's throughput. Speeding up anything else changes nothing, and fixing the bottleneck moves it somewhere else.", example: "Adding app servers when the database is saturated makes latency worse, not better.", exercise: "incident-slow-after-deploy", transfer: "Where is the bottleneck in your own study routine? In a CI pipeline?" },
  { id: "littles-law", name: "Little's law", meaning: "Items in a system = arrival rate × time each spends there (L = λW). It holds for any stable queue.", example: "200 requests/s × 0.5 s = 100 requests in flight. If latency becomes 2 s at the same rate, 400 are in flight and a 100-worker pool is exhausted.", exercise: "incident-retry-storm", transfer: "Open pull requests = PRs opened per week × weeks each stays open. What does that tell a team?" },
  { id: "queues-backpressure", name: "Queues and backpressure", meaning: "Queues absorb bursts but hide overload. Without a bound they grow until memory or latency explodes. Backpressure tells the producer to slow down instead.", example: "A consumer slower than its producer: lag grows forever, however long the queue is.", exercise: "unknown-kafka-lag", transfer: "Where do you see backpressure in TCP, in a restaurant kitchen, in your own to-do list?" },
  { id: "idempotency", name: "Idempotency", meaning: "Doing an operation twice has the same effect as doing it once. Needed wherever there are retries, timeouts or at-least-once delivery.", example: "Recording a webhook's event id under a unique constraint makes a second delivery harmless.", exercise: "api-webhook-duplicates", transfer: "Which commands in your terminal are idempotent? Which HTTP methods are meant to be?" },
  { id: "caching", name: "Caching and locality", meaning: "Keep a copy close to where it's used. It works because access repeats (locality). It costs staleness, invalidation and memory.", example: "A CDN serves a popular image from nearby instead of from the origin.", exercise: "reasoning-caching", transfer: "How is memoisation in dynamic programming a cache? What's its invalidation rule?" },
  { id: "amortization", name: "Amortisation and batching", meaning: "Pay a fixed cost (a round trip, a system call, a disk seek) once for many items instead of once per item.", example: "One query for 80 products instead of 80 queries.", exercise: "perf-n-plus-one", transfer: "Why is appending to a dynamic array O(1) amortised? What's being batched?" },
  { id: "invariants", name: "Invariants", meaning: "A condition that must always hold (stock ≥ 0, balances sum to a constant). Design every operation to preserve it, and test that it does.", example: "An atomic conditional update keeps stock from going negative under concurrency.", exercise: "debug-race-stock", transfer: "What's the invariant of a binary search loop? Of a heap?" },
  { id: "state-machines", name: "State machines", meaning: "List an entity's states and the legal transitions between them. Illegal transitions become impossible instead of merely unlikely.", example: "An order that's refunded can't go back to paid, even if a late event says so.", exercise: "api-webhook-duplicates", transfer: "Draw the states of a React component's data fetch. Which transitions do bugs usually break?" },
  { id: "feedback-loops", name: "Feedback loops", meaning: "Positive feedback amplifies (retries under overload make overload worse). Negative feedback stabilises (backoff, rate limits).", example: "Immediate retries tripled traffic to a struggling provider.", exercise: "incident-retry-storm", transfer: "What positive feedback loop could an autoscaler create?" },
  { id: "failure-domains", name: "Failure domains and blast radius", meaning: "Group what fails together. A change pushed everywhere at once makes the whole world one failure domain.", example: "A config change rolled out globally in one step took down every region together.", exercise: "case-cloudflare-2019", transfer: "What's the blast radius of a bad commit to your main branch? How would you shrink it?" },
  { id: "measure-first", name: "Measure before optimising", meaning: "Take a baseline, change one thing, measure again with enough repetitions to see the noise. Intuition about performance is often wrong.", example: "A one-run benchmark “proved” a 4× speed-up that was mostly JIT warm-up.", exercise: "perf-prove-faster", transfer: "How would you measure whether a new study technique works for you?" },
  { id: "bisection", name: "Bisection", meaning: "Halve the search space at each step: git bisect over commits, disabling half the code, halving the input.", example: "“It worked yesterday”: bisect the commits, or the data that changed.", exercise: "data-not-in-null", transfer: "How is this the same idea as binary search on the answer in DSA?" },
  { id: "bayesian-updating", name: "Updating on evidence", meaning: "Hold several hypotheses with rough confidence. Strong evidence is likely under one hypothesis and unlikely under the others. Update gradually; don't flip-flop.", example: "Rising garbage-collection time made “memory” far more likely than “slow database”.", exercise: "incident-memory-leak", transfer: "Which evidence would change your mind about your current biggest weakness?" },
  { id: "second-order", name: "Second-order effects", meaning: "Ask “and then what?” A fix changes the rest of the system: retries add load, caches add staleness, alerts add fatigue.", example: "Refreshing all cache keys together made them expire together again.", exercise: "incident-cache-stampede", transfer: "What's a second-order effect of solving 10 problems a day with hints?" },
  { id: "constraint-first", name: "Constraints first", meaning: "Scale, latency, budget, team and deadline decide the design. Ask for them before choosing a solution.", example: "“10 million users” means nothing until you know messages per second at peak.", exercise: "design-notifications", transfer: "Which constraints decide how you should prepare for interviews in the next 3 months?" },
  { id: "simplest-valid", name: "Simplest valid solution", meaning: "Build the smallest thing that meets today's real constraints, and know which change would force the next step.", example: "Polling every 30 s is fine until updates must be two-way and instant.", exercise: "tradeoff-live-updates", transfer: "What's the simplest version of a project you've been putting off?" },
];

// Anti-patterns: symptom → cause → detection → fix → prevention, each tied to a challenge.
export const ANTIPATTERNS = [
  { id: "n-plus-one", name: "N+1 queries", symptom: "A page is fast locally and slow in production; the database is idle.", cause: "One query per item in a loop.", detect: "Count queries per request; ORM query logs.", fix: "Batch (WHERE id = ANY(...)) or join.", prevent: "Assert query counts in tests.", challenge: "perf-n-plus-one" },
  { id: "retry-storm", name: "Retry storm", symptom: "A dependency gets slow and your traffic to it multiplies; you don't recover when it does.", cause: "Retries at several layers, immediate, unbounded.", detect: "Outbound request rate rises while inbound is flat.", fix: "Retry at one layer, with backoff, jitter and a budget; circuit breakers.", prevent: "A written retry policy per dependency.", challenge: "incident-retry-storm" },
  { id: "unbounded", name: "Unbounded queues and caches", symptom: "Fine after a restart, degrades with time.", cause: "A structure that grows with input and never shrinks.", detect: "Heap growth, GC time, queue length metrics.", fix: "Size limits, eviction, TTLs, backpressure.", prevent: "Review rule: every cache and queue has a bound.", challenge: "incident-memory-leak" },
  { id: "missing-idempotency", name: "Missing idempotency", symptom: "Duplicate charges, credits or orders, often under slowness.", cause: "Retries or at-least-once delivery into a non-idempotent handler.", detect: "Duplicate event or request ids in logs.", fix: "Idempotency keys with a unique constraint.", prevent: "Replay tests that deliver everything twice.", challenge: "api-webhook-duplicates" },
  { id: "cache-stampede", name: "Cache stampede", symptom: "Periodic latency spikes; many identical queries at once.", cause: "Hot keys expiring together.", detect: "Hit-rate drops aligned with TTLs.", fix: "Request coalescing, early refresh, TTL jitter.", prevent: "Load-test with an empty cache.", challenge: "incident-cache-stampede" },
  { id: "missing-index", name: "Missing index on a hot path", symptom: "Database CPU saturates after a feature launch.", cause: "A new query filters on an unindexed column.", detect: "Top queries by total time; EXPLAIN.", fix: "Add the index (without blocking writes) or precompute.", prevent: "Check query plans in review.", challenge: "incident-slow-after-deploy" },
  { id: "check-then-act", name: "Check-then-act race", symptom: "Overselling, double booking, negative balances under load.", cause: "Read, decide, then write, without atomicity.", detect: "Invariant checks; concurrent load tests.", fix: "Atomic conditional updates, constraints or locks.", prevent: "Treat every read-modify-write on shared state as suspect.", challenge: "debug-race-stock" },
  { id: "big-bang-rollout", name: "Big-bang rollout", symptom: "One change breaks everything, everywhere, at once.", cause: "Deploying code or config to 100% in one step.", detect: "Failures start everywhere simultaneously.", fix: "Kill switch or rollback.", prevent: "Gradual rollouts with automatic checks, for config too.", challenge: "case-cloudflare-2019" },
  { id: "untested-backups", name: "Untested backups", symptom: "Discovering during an incident that restores don't work.", cause: "Backups are made but never restored; failures alert nobody.", detect: "Scheduled restore tests.", fix: "Automate restores and verify the result.", prevent: "Treat restore time and data loss as monitored numbers.", challenge: "case-gitlab-2017" },
  { id: "secrets-in-logs", name: "Secrets in logs", symptom: "Tokens, passwords or keys visible to anyone with log access.", cause: "Logging whole objects or debug values.", detect: "Search logs for token patterns; review logging calls.", fix: "Redact at the logger; rotate exposed secrets.", prevent: "Structured logging with an allow-list of fields.", challenge: "review-password-reset" },
];

// Resources: few, strong, and each tied to practice. level 1–5; kind: passive (read/watch), active (exercises), applied (build/debug).
// checked = when the link and content were last verified; `npm run check-links` re-checks every URL.
export const RESOURCES = [
  { id: "missing-semester", name: "MIT: The Missing Semester of Your CS Education (2026)", url: "https://missing.csail.mit.edu/", level: 1, kind: "active", dims: ["tooling", "debugging", "quality"], learn: "The 2026 lectures on debugging and profiling, version control, code quality and agentic coding, with exercises.", practice: "Do each lecture's exercises, then the matching challenges.", challenges: ["debug-async-foreach", "perf-prove-faster", "ai-verify-generated"], checked: "2026-09" },
  { id: "eng-practices", name: "Google Engineering Practices: code review guides", url: "https://google.github.io/eng-practices/", level: 1, kind: "passive", dims: ["quality", "communication", "testing"], learn: "What reviewers look for (design, functionality, complexity, tests, naming) and how to write useful comments.", practice: "Review with its checklist, then write your comments as it recommends.", challenges: ["review-password-reset", "ai-verify-generated"] },
  { id: "exercism", name: "Exercism", url: "https://exercism.org/", level: 1, kind: "active", dims: ["quality", "communication"], learn: "Idiomatic code in a language, and other people's solutions to the same exercise.", practice: "After solving, read three community solutions and write down one idea you'd adopt." },
  { id: "advent-of-code", name: "Advent of Code (past events)", url: "https://adventofcode.com/", level: 2, kind: "active", dims: ["algorithms", "debugging", "math"], learn: "Unfamiliar problems with messy input, parsing and simulation. Part 2 of each day is a constraint change.", practice: "Ignore the leaderboard. Before part 2, predict what will break in your part 1 design." },
  { id: "project-euler", name: "Project Euler", url: "https://projecteuler.net/", level: 2, kind: "active", dims: ["math", "algorithms"], learn: "Mathematical reasoning where brute force is too slow and a pattern or formula is needed.", practice: "Write down why the fast method works, not just the answer." },
  { id: "sre-troubleshooting", name: "Google SRE book: Effective Troubleshooting", url: "https://sre.google/sre-book/effective-troubleshooting/", level: 2, kind: "passive", dims: ["debugging", "systems"], learn: "Troubleshooting as a repeated loop of observation, hypothesis and test, and the common traps.", practice: "Use its loop explicitly in every incident challenge.", challenges: ["incident-slow-after-deploy", "incident-memory-leak"] },
  { id: "sre-cascading", name: "Google SRE book: Addressing Cascading Failures", url: "https://sre.google/sre-book/addressing-cascading-failures/", level: 3, kind: "passive", dims: ["systems", "architecture"], learn: "Overload, retries, load shedding and how failures spread.", practice: "Redesign the retry policy in the retry-storm incident using it.", challenges: ["incident-retry-storm"] },
  { id: "use-method", name: "Brendan Gregg: the USE method", url: "https://www.brendangregg.com/usemethod.html", level: 2, kind: "active", dims: ["performance", "os"], learn: "For every resource, check utilisation, saturation and errors: a checklist that stops you guessing.", practice: "Apply it to your laptop while a build runs; write down the bottleneck." },
  { id: "post-mortems", name: "Dan Luu's collection of public postmortems", url: "https://github.com/danluu/post-mortems", level: 2, kind: "active", dims: ["systems", "communication"], learn: "Hundreds of real incidents, grouped by cause.", practice: "Pick one; write your hypotheses from the symptoms before reading the cause, exactly like the case studies here." },
  { id: "portswigger", name: "PortSwigger Web Security Academy", url: "https://portswigger.net/web-security", level: 2, kind: "applied", dims: ["security"], learn: "Free, legal labs for access control, SSRF, injection and more, against deliberately vulnerable targets.", practice: "Do the labs for the vulnerability behind each security challenge.", challenges: ["security-idor", "security-ssrf"] },
  { id: "juice-shop", name: "OWASP Juice Shop", url: "https://owasp.org/www-project-juice-shop/", level: 2, kind: "applied", dims: ["security", "debugging"], learn: "A deliberately insecure web app you run on your own machine.", practice: "Find a flaw, then write the fix and a test, not just the exploit." },
  { id: "ostep", name: "Operating Systems: Three Easy Pieces", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/", level: 3, kind: "active", dims: ["os", "systems"], learn: "Processes, memory, concurrency and persistence, with homework simulators. Free online.", practice: "Do the concurrency chapters' homework, then the stock race challenge.", challenges: ["debug-race-stock", "reasoning-threads"] },
  { id: "aosa", name: "The Architecture of Open Source Applications", url: "https://aosabook.org/", level: 3, kind: "passive", dims: ["architecture", "opensource"], learn: "How real projects are structured, explained by their authors. Free online.", practice: "Read one chapter, then open that project's repository and find three things the chapter describes." },
  { id: "crafting-interpreters", name: "Crafting Interpreters", url: "https://craftinginterpreters.com/", level: 3, kind: "applied", dims: ["algorithms", "quality", "os"], learn: "Building a complete interpreter, twice. Free online.", practice: "Build part II; keep a journal of every bug and its root cause." },
  { id: "nand2tetris", name: "Nand2Tetris", url: "https://www.nand2tetris.org/", level: 3, kind: "applied", dims: ["os", "systems", "algorithms"], learn: "12 projects from logic gates to an operating system.", practice: "Start with project 6 (assembler); go down into hardware (1–5) or up into the VM and compiler (7–11) as curiosity pulls." },
  { id: "gossip-glomers", name: "Fly.io: Gossip Glomers", url: "https://fly.io/dist-sys/", level: 4, kind: "applied", dims: ["systems", "architecture", "testing"], learn: "Six distributed-systems challenges run on Maelstrom, which injects network partitions and checks correctness. You observe failure, not just read about it.", practice: "Before each challenge, write down what you expect to break under partition.", checked: "2026-09" },
  { id: "mit-6-5840", name: "MIT 6.5840 Distributed Systems labs", url: "https://pdos.csail.mit.edu/6.824/", level: 4, kind: "applied", dims: ["systems", "testing", "debugging"], learn: "MapReduce, Raft and a fault-tolerant key-value store, with tests that inject failures.", practice: "Keep a debugging journal: most of the learning is in why tests fail intermittently." },
  { id: "cmu-15-445", name: "CMU 15-445 Database Systems (BusTub projects)", url: "https://15445.courses.cs.cmu.edu/", level: 4, kind: "applied", dims: ["databases", "performance"], learn: "A buffer pool, indexes, query execution and concurrency control, built in C++.", practice: "Benchmark your buffer pool's eviction policy against a simple alternative." },
  { id: "jepsen", name: "Jepsen analyses", url: "https://jepsen.io/analyses", level: 5, kind: "passive", dims: ["systems", "databases", "testing"], learn: "Rigorous tests of real databases under partitions and clock problems.", practice: "Read the system's claimed guarantees first and predict which anomalies Jepsen found." },
  { id: "build-your-own-x", name: "Build your own X (curated list)", url: "https://github.com/codecrafters-io/build-your-own-x", level: 3, kind: "applied", dims: ["systems", "opensource"], learn: "Tutorials for rebuilding databases, shells, Git, networking stacks and more.", practice: "Quality varies: pick one from the Projects list here, which says which principle each teaches." },
];

// Build to understand: projects chosen for the principle they expose, not for the count. stage = roadmap stage it fits.
export const PROJECTS = [
  { id: "log-analyzer", name: "Log analyser CLI", stage: 3, principle: "Streaming vs loading everything; measuring time and memory.", brief: "Read a 1 GB web-server log and report top endpoints and p95 latency per endpoint, in bounded memory.", evidence: "README with a benchmark: memory and time, streaming vs naive." },
  { id: "raw-http", name: "HTTP client over a raw TCP socket", stage: 3, principle: "What a request really is: headers, status codes, keep-alive, chunked bodies.", brief: "Fetch a page with only sockets. Handle redirects and chunked transfer encoding.", evidence: "Write-up of three things that surprised you, with packet captures or logs." },
  { id: "shell", name: "A small Unix shell", stage: 3, principle: "Processes, fork/exec, pipes and file descriptors.", brief: "Support pipes, redirection and background jobs.", evidence: "A debugging journal of the bugs you hit.", resource: "ostep" },
  { id: "rate-limiter", name: "Rate-limiter service", stage: 5, principle: "Concurrency, shared state and clocks.", brief: "Token bucket shared across instances, tested with concurrent clients and a clock that jumps.", evidence: "Load-test results and an ADR for your storage choice." },
  { id: "job-queue", name: "Job queue with retries", stage: 5, principle: "At-least-once delivery, idempotency, visibility timeouts, dead letters.", brief: "PostgreSQL-backed (SELECT … FOR UPDATE SKIP LOCKED), with retries, backoff and a dead-letter table.", evidence: "Tests that kill workers mid-job and prove no job is lost or run twice with side effects." },
  { id: "kv-wal", name: "Key-value store with a write-ahead log", stage: 5, principle: "Durability and crash recovery.", brief: "Append-only log, periodic compaction, recovery after kill -9.", evidence: "A crash-test script and its results." },
  { id: "cache-layer", name: "Caching layer with stampede protection", stage: 5, principle: "Hit rate, invalidation, request coalescing.", brief: "Put a cache in front of a slow service; add coalescing and early refresh.", evidence: "Before/after latency graphs with an empty and a warm cache." },
  { id: "interpreter", name: "An interpreter", stage: 7, principle: "Parsing, trees, environments, closures.", brief: "Follow Crafting Interpreters, part II.", evidence: "Your repo plus notes on the hardest bug.", resource: "crafting-interpreters" },
  { id: "glomers", name: "All six Gossip Glomers", stage: 7, principle: "Consistency and availability under partitions.", brief: "Echo to totally-available transactions.", evidence: "For each: what broke under the nemesis and why your fix works.", resource: "gossip-glomers" },
  { id: "raft", name: "Raft (MIT 6.5840 labs)", stage: 7, principle: "Consensus, leader election, log replication.", brief: "Pass the lab tests reliably, not just once.", evidence: "A write-up of one intermittent failure you tracked down.", resource: "mit-6-5840" },
  { id: "bustub", name: "Buffer pool and B+ tree (CMU 15-445)", stage: 8, principle: "How databases actually use memory and disk.", brief: "The BusTub projects.", evidence: "Benchmarks and a design note on your eviction policy.", resource: "cmu-15-445" },
  { id: "nand2tetris-upper", name: "Nand2Tetris projects 6–12", stage: 8, principle: "Every layer from machine code to an operating system.", brief: "Assembler, VM translator, compiler, OS.", evidence: "One README per layer: what it does and what you learned.", resource: "nand2tetris" },
];
