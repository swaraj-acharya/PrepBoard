// System design roadmap (learning mode) and interview prep (interview mode) for app/system-design.
// Nothing here copies a question: phases and the interview map point at questions that already live in
// lib/systemDesign.js (hld:, lld:) and lib/cs.js (cs:), so progress is shared with every other page.
// Phase order follows The Boring Education's System Design Engineer Roadmap, and the interview map follows
// their Top 30 list. Explanations are in lib/topics.js; every text here is written for this project.
import { SD_BY_ID, TBE_ROADMAP, TBE_QA } from "./systemDesign.js";
import { CS_SUBJECTS, CS_BY_ID, csId } from "./cs.js";
import { RESOURCES as LAB_RESOURCES } from "./lab.js";

const sd = text => csId("sd", text);
const cn = text => csId("cn", text);
const db = text => csId("dbms", text);
const PRIMER = "https://github.com/donnemartin/system-design-primer";

// ---------------------------------------------------------------- resources
// kind = what you do with it; level and when = who it suits and where in the roadmap it fits.
export const SD_RESOURCES = [
  { id: "tbe-roadmap", kind: "Roadmap", name: "System Design Engineer Roadmap", source: "The Boring Education", url: TBE_ROADMAP.url, level: "All levels",
    purpose: "Ten phases from networking to mock interviews, each with free videos. The roadmap below follows its order.", when: "from day one, next to each phase" },
  { id: "tbe-top30", kind: "Interview", name: "Top 30 System Design Interview Questions", source: "The Boring Education", url: TBE_QA.url, level: "Intermediate",
    purpose: "Short model answers, with diagrams, to the 30 questions interviewers repeat most.", when: "after phase 4, and again in the weeks before interviews", interview: true },
  { id: "primer", kind: "Read", name: "System Design Primer", source: "GitHub", url: PRIMER, level: "All levels",
    purpose: "A free study guide to every building block, plus solved designs with diagrams.", when: "as the main reading for phases 1–9", interview: true },
  { id: "asdr", kind: "Read", name: "awesome-system-design-resources", source: "GitHub", url: "https://github.com/ashishps1/awesome-system-design-resources", level: "All levels",
    purpose: "Short articles and videos for each concept, and the source of many design questions here.", when: "whenever a concept needs a second explanation" },
  { id: "microservices-io", kind: "Read", name: "A pattern language for microservices", source: "microservices.io", url: "https://microservices.io/patterns/", level: "Advanced",
    purpose: "One page per pattern: saga, transactional outbox, CQRS, event sourcing, API gateway, circuit breaker and tracing.", when: "in phases 6–8" },
  { id: "sre-monitoring", kind: "Read", name: "Site Reliability Engineering, chapter 6: Monitoring Distributed Systems", source: "Google, free book", url: "https://sre.google/sre-book/monitoring-distributed-systems/", level: "Advanced",
    purpose: "The four golden signals, and what should and shouldn't wake someone up at night.", when: "in phase 8" },
  { id: "alld", kind: "Practice", name: "awesome-low-level-design", source: "GitHub", url: "https://github.com/ashishps1/awesome-low-level-design", level: "Beginner to advanced",
    purpose: "Solved LLD problems with class diagrams and code in several languages, plus design pattern notes.", when: "in phase 10 and with the Low-level design tab", interview: true },
  { id: "bytebytego", kind: "Watch", name: "ByteByteGo", source: "YouTube", url: "https://www.youtube.com/@ByteByteGo", level: "Beginner to intermediate",
    purpose: "Short animated explanations of caching, CDNs, consistent hashing and real architectures.", when: "when a diagram helps more than text" },
  { id: "gkcs", kind: "Watch", name: "Gaurav Sen", source: "YouTube", url: "https://www.youtube.com/@gkcs", level: "Intermediate",
    purpose: "First-principles whiteboard walkthroughs of scaling, sharding, consensus and classic design questions.", when: "in phases 4–9", interview: true },
];

// Phase resources point at resources that already exist (above, in CS subjects or in the Lab) instead of
// repeating them. Anything that can't be found is listed in SD_MISSING, which the tests check is empty.
export const SD_MISSING = [];
const miss = what => { SD_MISSING.push(what); return null; };
const use = (id, note) => {
  const r = SD_RESOURCES.find(x => x.id === id);
  return r ? { kind: r.kind, name: `${r.name} (${r.source})`, url: r.url, note: note || r.purpose } : miss(`resource ${id}`);
};
const fromCS = (subject, urlPart, note) => {
  const r = CS_SUBJECTS.find(s => s.id === subject)?.resources.find(x => x.url.includes(urlPart));
  return r ? { kind: r.kind, name: r.name, url: r.url, note } : miss(`CS resource ${subject}/${urlPart}`);
};
const fromLab = (id, note) => {
  const r = LAB_RESOURCES.find(x => x.id === id);
  return r ? { kind: "Build", name: r.name, url: r.url, note: note || r.learn } : miss(`Lab resource ${id}`);
};
const link = (kind, name, url, note) => ({ kind, name, url, note });
const tbePhase = (n, what) => ({ kind: "Roadmap", name: `System Design Engineer Roadmap, phase ${String(n).padStart(2, "0")} (The Boring Education)`, url: TBE_ROADMAP.url, note: `Free videos on ${what}.` });

// ---------------------------------------------------------------- roadmap
// needs = phases to finish first. topics = explanations to read first (lib/topics.js).
// practice = existing question ids, easiest ideas first. Each phase matches the same-numbered phase of
// The Boring Education's roadmap, adapted to the questions PrepBoard already has.
const RAW_PHASES = [
  {
    id: "sd-request", name: "How a request travels", stage: "Beginner", weeks: 2, needs: [],
    why: "Every design question starts with one request: DNS finds the server, TCP and TLS open a safe connection, and load balancers and CDNs sit along the way. Learn this path and the words used in every later phase make sense. Your CS subjects already cover the details, so this phase reuses those questions.",
    topics: ["DNS", "TCP and UDP", "HTTP and HTTPS", "Latency and Throughput"],
    practice: [
      cn("What is the difference between bandwidth, latency and throughput?"),
      cn("What happens when you type google.com into your browser and press Enter?"),
      cn("Explain how DNS resolution works step by step."),
      cn("What is the difference between a proxy and a reverse proxy?"),
      cn("How does the TLS handshake work?"),
    ],
    resources: [
      tbePhase(1, "DNS, TCP/IP, HTTPS, load balancers and CDNs"),
      fromCS("cn", "hpbn.co", "Free book: the chapters on latency, TCP and TLS."),
      fromCS("cn", "cloudflare.com/learning", "Plain explanations of DNS, TLS and CDNs."),
      link("Read", "Latency numbers every programmer should know (System Design Primer)", `${PRIMER}#latency-numbers-every-programmer-should-know`, "Remember the orders of magnitude, not the exact values."),
    ],
    milestone: "You can explain what happens between pressing Enter and seeing the page, and say where the time goes.",
  },
  {
    id: "sd-apis", name: "APIs and how services talk", stage: "Beginner", weeks: 2, needs: ["sd-request"],
    why: "A system is a set of services agreeing on how to talk. Learn to design a clean REST API (resources, status codes, pagination, versioning), when GraphQL or gRPC fits better, and when a connection should stay open for live updates. Start noticing which calls must answer right away and which could happen later: that choice shapes whole architectures.",
    topics: ["API Design", "Real-time Connections", "Authentication"],
    practice: [
      cn("What is REST? What makes an API RESTful?"),
      sd("REST, GraphQL or gRPC: when would you choose each?"),
      cn("What are WebSockets, and how are they different from HTTP polling?"),
      "hld:auth",
      "hld:api-aggregator",
    ],
    resources: [
      tbePhase(2, "REST design, GraphQL, gRPC, WebSockets and server-sent events"),
      fromCS("cn", "developer.mozilla.org", "HTTP methods, status codes, caching headers and CORS."),
      use("asdr", "API design, REST vs GraphQL and real-time protocols, one short article each."),
    ],
    milestone: "You can write the API for any feature and defend REST, GraphQL, gRPC or WebSockets for it.",
  },
  {
    id: "sd-data", name: "Databases and data modelling", stage: "Beginner", weeks: 3, needs: ["sd-request"],
    why: "Most design interviews are won or lost on the data model. Know SQL vs NoSQL cold, how indexes trade write speed for read speed, and why transactions matter for money and bookings. The DBMS subject has the theory; this phase applies it to designs.",
    topics: ["Databases", "Indexing", "Transactions and ACID"],
    practice: [
      db("SQL vs NoSQL: when would you choose each?"),
      db("Explain the ACID properties using a bank transfer example."),
      db("Why do databases use B+ trees for indexes?"),
      db("When should you NOT add an index?"),
      db("What is denormalization, and when is it a good idea?"),
      "hld:parking-garage",
      "hld:social-graph",
    ],
    resources: [
      tbePhase(3, "SQL vs NoSQL, indexing and ACID transactions"),
      fromCS("dbms", "use-the-index-luke", "Free book on how indexes really work."),
      fromCS("dbms", "15445", "Free university course, for more depth."),
    ],
    milestone: "You can pick a database for a feature, justify it, and sketch its tables or documents.",
  },
  {
    id: "sd-scale", name: "Scaling to millions of users", stage: "Intermediate", weeks: 3, needs: ["sd-apis", "sd-data"],
    why: "Scalability is the heart of system design. Start with back-of-the-envelope numbers, then learn why horizontal scaling wins, why servers shouldn't keep user state, how load balancers choose a server, and how rate limits protect the system from overload.",
    topics: ["Estimation", "Scalability", "Load Balancer", "Consistent Hashing", "Rate Limiting"],
    practice: [
      sd("What is scalability? Compare vertical and horizontal scaling."),
      sd("What does a load balancer do? Compare round robin, least connections and consistent hashing."),
      sd("How do you estimate requests per second, storage and bandwidth for a new system?"),
      sd("Compare the token bucket, leaky bucket and sliding window rate limiting algorithms."),
      "hld:scaling-aws",
      "hld:load-balancer",
      "hld:rate-limiter",
    ],
    resources: [
      tbePhase(4, "scaling, load balancing, consistent hashing and rate limiting"),
      link("Read", "Back-of-the-envelope calculations (System Design Primer)", `${PRIMER}#back-of-the-envelope-calculations`, "Powers of two, latency numbers and how to use them."),
      use("gkcs", "Scalability, load balancing and consistent hashing from first principles."),
    ],
    milestone: "You can take a one-server app to millions of users step by step and say what each step fixes.",
  },
  {
    id: "sd-cache", name: "Caching and scaling the data", stage: "Intermediate", weeks: 3, needs: ["sd-scale"],
    why: "A cache is the cheapest way to make a slow system fast. Learn the cache patterns and how cached data goes stale, then how read replicas and sharding scale the database. Reach for them in that order: a cache and a few replicas fix most read problems, and sharding is for when writes or data size outgrow one machine.",
    topics: ["Caching", "CDN", "Replication", "Sharding", "Bloom Filter"],
    practice: [
      sd("Compare cache-aside, write-through and write-back caching. How do you stop stale data?"),
      cn("What is a CDN?"),
      sd("Compare leader-follower and multi-leader replication."),
      db("What is database sharding?"),
      db("What is the difference between replication and sharding?"),
      sd("What is a Bloom filter, and where do large systems use one?"),
      "hld:cdn",
      "hld:distributed-cache",
      "hld:query-cache",
      "lld:lru-cache",
    ],
    resources: [
      tbePhase(5, "caching strategies, Redis, replication and sharding"),
      link("Read", "Cache (System Design Primer)", `${PRIMER}#cache`, "Where caches sit, and how each update strategy behaves."),
      use("bytebytego", "Caching pitfalls, CDNs and consistent hashing, animated."),
    ],
    milestone: "You know the order to reach for tools (cache, replicas, then shards) and what each one breaks.",
  },
  {
    id: "sd-async", name: "Queues, events and async work", stage: "Intermediate", weeks: 3, needs: ["sd-apis", "sd-scale"],
    why: "Not everything needs an answer right away. Queues and pub/sub decouple services and absorb traffic spikes. Learn how Kafka differs from RabbitMQ, why a message can arrive twice, how idempotency makes that safe, and how the outbox pattern keeps the database and the events in step.",
    topics: ["Message Queue", "Idempotency", "Event-Driven Architecture"],
    practice: [
      sd("What is a message queue, and when would you pick Kafka over RabbitMQ?"),
      sd("Explain at-most-once, at-least-once and exactly-once delivery."),
      sd("What is idempotency, and why do payment APIs need idempotency keys?"),
      sd("What problem does the transactional outbox pattern solve?"),
      sd("What are event sourcing and CQRS, and when are they worth the complexity?"),
      "hld:notification",
      "hld:kafka",
      "hld:job-scheduler",
      "lld:pub-sub",
    ],
    resources: [
      tbePhase(6, "Kafka, message queues, pub/sub and event-driven design"),
      use("microservices-io", "Read: transactional outbox, idempotent consumer, event sourcing and CQRS."),
    ],
    milestone: "You can decide what should be asynchronous and design a pipeline that survives retries and duplicates.",
  },
  {
    id: "sd-consistency", name: "Microservices and consistency", stage: "Advanced", weeks: 4, needs: ["sd-cache", "sd-async"],
    why: "Splitting a system into services creates problems a single app never had. Learn API gateways, service discovery and sagas; what CAP really forces you to choose; which consistency each feature needs; and how Raft lets machines agree on a leader. Don't split into microservices by default: a tidy monolith goes a long way.",
    topics: ["Microservices", "CAP Theorem", "Consistency Models", "Consensus and Leader Election", "Transactions and Locking"],
    practice: [
      db("Explain the CAP theorem."),
      sd("Compare strong, eventual and causal consistency, with an example of each."),
      sd("When should you split a monolith into microservices, and what does an API gateway do?"),
      sd("How does the saga pattern keep data consistent across microservices?"),
      sd("How do machines elect a leader and agree on data (Raft or Paxos)?"),
      "hld:kv-store",
      "hld:ecommerce",
      "hld:lock-service",
    ],
    resources: [
      tbePhase(7, "CAP, microservice patterns, Raft and sagas"),
      use("microservices-io", "Read: saga, API gateway, service discovery and database per service."),
      link("Read", "The Raft consensus algorithm", "https://raft.github.io/", "Try the live cluster on the page: stop the leader and watch a new election."),
      fromLab("gossip-glomers", "Optional and hands-on: build small distributed systems that must survive network partitions."),
    ],
    milestone: "You can say which consistency each feature needs and what the system does when the network splits.",
  },
  {
    id: "sd-reliability", name: "Reliability and observability", stage: "Advanced", weeks: 2, needs: ["sd-consistency"],
    why: "At scale, machines crash and networks split every day. Design for it: redundancy and failover, timeouts and retries with backoff, circuit breakers, bulkheads and graceful fallbacks. Then learn to see inside the system with metrics, logs and traces, and to measure reliability with SLOs and error budgets.",
    topics: ["Fault Tolerance", "Circuit Breaker", "Observability"],
    practice: [
      sd("How do you design a system that degrades gracefully instead of going down?"),
      sd("What is the circuit breaker pattern, and when would you use it?"),
      sd("What would you monitor and alert on for a system you just designed?"),
      sd("What are SLIs, SLOs, SLAs and error budgets?"),
      "hld:monitoring",
      "hld:analytics",
      "hld:zipkin",
    ],
    resources: [
      tbePhase(8, "fault tolerance, circuit breakers, monitoring and SRE basics"),
      use("sre-monitoring"),
      link("Read", "Site Reliability Engineering, chapter 4: Service Level Objectives (Google, free book)", "https://sre.google/sre-book/service-level-objectives/", "SLIs, SLOs, SLAs and error budgets, from the team that named them."),
      fromLab("sre-cascading", "How retries and overload spread a failure; the Lab's retry-storm incident uses it."),
    ],
    milestone: "Every dependency in your designs has a timeout, a fallback and a signal that tells you it broke.",
  },
  {
    id: "sd-case-studies", name: "Real systems, end to end", stage: "Applied", weeks: 6, needs: ["sd-consistency", "sd-reliability"],
    why: "Theory sticks once you apply it end to end. Design these classics from a blank page: requirements, estimates, API, data model, high-level design, deep dives and bottlenecks. The easier ones (URL shortener, ID generator, autocomplete) are fine to start after phase 5. Draw each design by hand and explain it out loud.",
    topics: ["Unique IDs", "Fan-out", "Object Storage", "Search Index", "Geospatial Index"],
    practice: [
      "hld:url-shortener",
      "hld:id-generator",
      "hld:autocomplete",
      "hld:whatsapp",
      "hld:facebook",
      "hld:youtube",
      "hld:payment",
      "hld:uber",
      "hld:dropbox",
      "hld:flash-sale",
    ],
    resources: [
      use("tbe-top30", "Answer outlines for Q20–Q29, the classic design rounds."),
      tbePhase(9, "URL shortener, chat, news feed, ride-sharing and video streaming walkthroughs"),
      use("primer", "Solved designs with diagrams to compare against yours."),
    ],
    milestone: "You can run any \"Design X\" question from requirements to bottlenecks without notes.",
  },
  {
    id: "sd-interview", name: "Interview practice: HLD and LLD", stage: "Applied", weeks: 4, needs: ["sd-case-studies"],
    why: "Interviews test four things: clarifying requirements, estimating scale, drawing the high-level design, and defending one part in depth. Many companies also run a low-level design or machine coding round: classes, relationships and patterns for one service. Use the answer structure in Interview prep, and treat each question here as a timed mock.",
    topics: ["Class Diagrams", "SOLID", "Strategy", "State"],
    practice: [
      "lld:parking-lot",
      "lld:elevator",
      "lld:text-editor",
      "lld:splitwise",
      "hld:bookmyshow",
      "hld:google-docs",
    ],
    resources: [
      use("tbe-top30", "Q30: how to spend the 45 minutes."),
      tbePhase(10, "capacity estimation, low-level design and mock interviews"),
      use("alld", "Solved LLD problems to compare against your class designs."),
      fromCS("oops", "refactoring.guru", "Design patterns explained with pictures."),
    ],
    milestone: "Interview-ready: you've done timed mocks, and you can explain the trade-offs in 3–5 designs you've written up.",
  },
];
export const SD_PHASES = RAW_PHASES.map((p, i) => ({ ...p, n: i + 1, resources: p.resources.filter(Boolean) }));

// ---------------------------------------------------------------- interview map
// The Boring Education's Top 30, in their order and categories. short = our label for the question;
// ids = the questions here that practise it; hot = they flag it as among the most asked.
const q = (n, short, phase, ids, hot = false) => ({ n, short, phase, ids, hot });
export const SD_INTERVIEW = [
  { id: "sdi-fundamentals", name: "Fundamentals", topics: ["Scalability", "CAP Theorem", "Load Balancer", "Consistency Models", "Estimation"],
    why: "The vocabulary every interview starts with. Interviewers expect you to use these inside bigger answers without being asked.",
    questions: [
      q(1, "vertical vs horizontal scaling", "sd-scale", [sd("What is scalability? Compare vertical and horizontal scaling.")], true),
      q(2, "the CAP theorem", "sd-consistency", [db("Explain the CAP theorem.")], true),
      q(3, "load balancing algorithms", "sd-scale", [sd("What does a load balancer do? Compare round robin, least connections and consistent hashing."), "hld:load-balancer"]),
      q(4, "consistency models", "sd-consistency", [sd("Compare strong, eventual and causal consistency, with an example of each.")]),
      q(5, "capacity estimation", "sd-scale", [sd("How do you estimate requests per second, storage and bandwidth for a new system?")]),
    ] },
  { id: "sdi-communication", name: "Networking, APIs and communication", topics: ["HTTP and HTTPS", "CDN", "API Design", "Message Queue", "Real-time Connections", "Rate Limiting"],
    why: "How requests travel and how services talk. One broad question here, \"what happens when you type a URL?\", often opens the round.",
    questions: [
      q(6, "what happens when you type a URL", "sd-request", [cn("What happens when you type google.com into your browser and press Enter?")], true),
      q(7, "how a CDN cuts latency", "sd-cache", [cn("What is a CDN?"), "hld:cdn"]),
      q(8, "REST vs GraphQL vs gRPC", "sd-apis", [sd("REST, GraphQL or gRPC: when would you choose each?")]),
      q(9, "Kafka vs RabbitMQ", "sd-async", [sd("What is a message queue, and when would you pick Kafka over RabbitMQ?")], true),
      q(10, "WebSockets vs long polling", "sd-apis", [cn("What are WebSockets, and how are they different from HTTP polling?")]),
      q(11, "rate limiter algorithms", "sd-scale", [sd("Compare the token bucket, leaky bucket and sliding window rate limiting algorithms."), "hld:rate-limiter"], true),
    ] },
  { id: "sdi-data", name: "Databases and storage", topics: ["Databases", "Sharding", "Replication", "Indexing", "Caching"],
    why: "Where most interview time goes: picking a database, scaling it, and keeping reads fast.",
    questions: [
      q(12, "SQL vs NoSQL", "sd-data", [db("SQL vs NoSQL: when would you choose each?")], true),
      q(13, "how sharding works and what breaks", "sd-cache", [db("What is database sharding?")]),
      q(14, "leader-follower vs multi-leader replication", "sd-cache", [sd("Compare leader-follower and multi-leader replication.")]),
      q(15, "how a B-tree index speeds up queries", "sd-data", [db("Why do databases use B+ trees for indexes?")]),
      q(16, "caching strategies", "sd-cache", [sd("Compare cache-aside, write-through and write-back caching. How do you stop stale data?")], true),
    ] },
  { id: "sdi-reliability", name: "Distributed systems and reliability", topics: ["Idempotency", "Fault Tolerance", "Circuit Breaker", "Unique IDs"],
    why: "What separates mid-level from senior answers: retries, duplicates, failures and unique IDs across many machines.",
    questions: [
      q(17, "idempotency", "sd-async", [sd("What is idempotency, and why do payment APIs need idempotency keys?")]),
      q(18, "fault tolerance and graceful degradation", "sd-reliability", [sd("How do you design a system that degrades gracefully instead of going down?")]),
      q(19, "circuit breakers", "sd-reliability", [sd("What is the circuit breaker pattern, and when would you use it?")]),
      q(20, "a distributed ID generator", "sd-case-studies", ["hld:id-generator"], true),
    ] },
  { id: "sdi-designs", name: "Classic design rounds", topics: ["Unique IDs", "Fan-out", "Geospatial Index", "Object Storage", "Real-time Connections"],
    why: "The design rounds themselves. Each one combines the categories above; open every answer by clarifying requirements.",
    questions: [
      q(21, "a URL shortener", "sd-case-studies", ["hld:url-shortener"], true),
      q(22, "a distributed key-value store", "sd-consistency", ["hld:kv-store"]),
      q(23, "a chat app", "sd-case-studies", ["hld:whatsapp"], true),
      q(24, "a news feed", "sd-case-studies", ["hld:facebook"]),
      q(25, "ride-sharing", "sd-case-studies", ["hld:uber"]),
      q(26, "video streaming", "sd-case-studies", ["hld:youtube", "hld:netflix"]),
      q(27, "distributed file storage", "sd-case-studies", ["hld:dropbox"]),
    ] },
  { id: "sdi-closing", name: "Monitoring, correctness and answer strategy", topics: ["Observability", "Transactions and Locking", "Idempotency"],
    why: "The closing questions: how you'd watch the system, how you'd keep money and stock correct, and how you use your 45 minutes. Q30 is the answer structure at the top of this tab.",
    questions: [
      q(28, "monitoring and alerting", "sd-reliability", [sd("What would you monitor and alert on for a system you just designed?"), "hld:monitoring"], true),
      q(29, "checkout that never oversells", "sd-case-studies", ["hld:flash-sale"]),
      q(30, "structuring a 45-minute answer", "sd-interview", []),
    ] },
];
export const SD_TBE_QUESTIONS = SD_INTERVIEW.flatMap(c => c.questions);

// ---------------------------------------------------------------- answer structures
// The HLD steps match the order the hint and review prompts already use (lib/prompts.js).
export const SD_FRAMEWORKS = [
  { id: "hld", name: "High-level design round", length: "45 min",
    note: "The hints and the review prompt on every design question follow these same steps.",
    steps: [
      { name: "Clarify requirements", time: "3–5 min", say: "What must it do, for how many users, how fast? Separate functional needs from non-functional ones (latency, availability, consistency) and note the read-to-write ratio." },
      { name: "Estimate the scale", time: "3–5 min", say: "Peak requests per second, storage per year, bandwidth. Round numbers, worked out loud: they decide what you need later." },
      { name: "Define the API and data model", time: "5 min", say: "The few endpoints that matter, then the main tables or documents and the database that fits them." },
      { name: "Draw the high-level design", time: "10 min", say: "Clients, load balancer, services, cache, database, queue. Walk one request through it from start to finish." },
      { name: "Go deep on 2–3 parts", time: "15 min", say: "Usually the data layer and the hardest feature. Compare two options before choosing one." },
      { name: "Bottlenecks, failures, trade-offs", time: "5–10 min", say: "Say what breaks at 10 times the load and how you'd fix it, what happens when each part fails, and what you'd monitor." },
    ] },
  { id: "lld", name: "Low-level design or machine coding round", length: "45–90 min",
    note: "Machine coding rounds run 60–90 minutes and expect code that runs; plain LLD rounds are shorter and focus on the class design.",
    steps: [
      { name: "Clarify use cases", time: "5 min", say: "List what it must do and what's out of scope. Ask about concurrency only if many users change the same thing." },
      { name: "Find the entities", time: "5 min", say: "Nouns become classes and verbs become methods. Decide which class owns which data." },
      { name: "Sketch the class diagram", time: "10 min", say: "Is-a (inheritance) vs has-a (composition), and interfaces wherever behaviour varies." },
      { name: "Choose patterns, with a reason", time: "5 min", say: "Strategy for swappable rules, State for lifecycles, Observer for notifications, Factory for creation. Only where they solve a real problem." },
      { name: "Code the core flow", time: "20–45 min", say: "Get one end-to-end path running first, then fill in the rest. Clear names beat clever code." },
      { name: "Extend and harden", time: "5–10 min", say: "Add the feature the interviewer asks for without rewriting classes, then handle concurrency and edge cases." },
    ] },
];

// ---------------------------------------------------------------- trade-offs to have ready
export const SD_TRADEOFFS = [
  { choice: "SQL or NoSQL", first: "The data is relational and must stay correct: orders, payments, stock.", second: "The shape varies or writes are huge and spread across machines: feeds, logs, sensor data." },
  { choice: "Strong or eventual consistency", first: "A stale read costs money: balances, seat and stock counts.", second: "A few seconds of staleness is harmless: likes, views, follower counts." },
  { choice: "Read replicas or sharding", first: "Reads are the bottleneck (try a cache first too).", second: "Writes or total data outgrow one machine." },
  { choice: "Cache-aside or write-through", first: "Reads dominate and a briefly stale value is fine.", second: "Reads right after writes must be fresh; writes get a little slower." },
  { choice: "Fan-out on write or on read", first: "Most users have few followers and feeds must open instantly.", second: "The author has millions of followers. Real feeds mix both." },
  { choice: "Synchronous call or message queue", first: "The user needs the answer now: login, price check.", second: "The work can happen later or spikes must be absorbed: emails, video processing." },
  { choice: "Kafka or RabbitMQ", first: "Many consumers read and replay one event stream: analytics, audit logs.", second: "Each task goes to one worker, with flexible routing: send an email, resize an image." },
  { choice: "WebSockets or polling", first: "Updates are frequent and two-way: chat, live location, editing together.", second: "Updates are rare, or simplicity matters more than instant delivery." },
  { choice: "REST or gRPC and GraphQL", first: "A public API that must be simple and cacheable.", second: "gRPC for fast typed calls between your own services; GraphQL when screens need different fields." },
  { choice: "Monolith or microservices", first: "The team is small and the product still changes weekly.", second: "Teams or workloads truly need to scale and deploy on their own." },
];

// ---------------------------------------------------------------- concept prerequisites
// What each high-level design concept builds on. "Leads to" is worked out from this, so there's one list to edit.
const NEEDS = {
  "Latency and Throughput": ["HTTP and HTTPS"],
  "API Design": ["HTTP and HTTPS"],
  "Real-time Connections": ["API Design", "HTTP and HTTPS"],
  "Authentication": ["API Design"],
  "Databases": [],
  "Estimation": ["Latency and Throughput"],
  "Scalability": ["Latency and Throughput", "Estimation"],
  "Load Balancer": ["Scalability"],
  "Consistent Hashing": ["Hash Table", "Load Balancer"],
  "Rate Limiting": ["API Design", "Scalability"],
  "Caching": ["Latency and Throughput", "Databases"],
  "CDN": ["Latency and Throughput", "Caching"],
  "Replication": ["Databases", "Scalability"],
  "Sharding": ["Databases", "Replication", "Consistent Hashing"],
  "Bloom Filter": ["Hash Table", "Caching"],
  "Message Queue": ["API Design", "Scalability"],
  "Idempotency": ["API Design", "Message Queue"],
  "Event-Driven Architecture": ["Message Queue", "Idempotency"],
  "Microservices": ["API Design", "Message Queue"],
  "CAP Theorem": ["Replication"],
  "Consistency Models": ["CAP Theorem", "Replication"],
  "Consensus and Leader Election": ["Replication", "Consistency Models"],
  "Transactions and Locking": ["Transactions and ACID", "Idempotency"],
  "Fault Tolerance": ["Replication", "Load Balancer"],
  "Circuit Breaker": ["Fault Tolerance", "Microservices"],
  "Observability": ["Microservices", "Latency and Throughput"],
  "Unique IDs": ["Databases", "Sharding"],
  "Fan-out": ["Message Queue", "Caching"],
  "Object Storage": ["Databases", "CDN"],
  "Search Index": ["Databases", "Indexing"],
  "Geospatial Index": ["Indexing", "Sharding"],
};
export const SD_NEEDS = NEEDS;
export const homePhase = name => SD_PHASES.find(p => p.topics.includes(name)) || null;

// { needs, leadsTo, phase } for a high-level design concept, or null for anything else.
export function conceptLinks(name) {
  if (!NEEDS[name]) return null;
  const leadsTo = Object.keys(NEEDS).filter(k => NEEDS[k].includes(name));
  return { needs: NEEDS[name], leadsTo, phase: homePhase(name) };
}

// For a phase: the Top 30 questions it prepares you for, the phases it builds on and the ones it opens up.
export function phaseLinks(id) {
  const byId = new Map(SD_PHASES.map(p => [p.id, p]));
  return {
    asked: SD_TBE_QUESTIONS.filter(x => x.phase === id),
    builds: (byId.get(id)?.needs || []).map(n => byId.get(n)),
    unlocks: SD_PHASES.filter(p => p.needs.includes(id)),
  };
}

// The first unfinished roadmap question, in phase order.
export function roadmapNext(prog) {
  for (const phase of SD_PHASES) {
    const id = phase.practice.find(x => !prog[x]?.status);
    if (id) return { phase, id };
  }
  return null;
}

// Three separate kinds of evidence, never one score (same idea as the DSA profile).
export function sdReadiness(prog) {
  const uniq = list => [...new Set(list)];
  const count = ids => ({ done: ids.filter(x => prog[x]?.status).length, total: ids.length });
  const mapped = SD_TBE_QUESTIONS.flatMap(x => x.ids);
  const caseStudies = SD_PHASES.find(p => p.id === "sd-case-studies").practice;
  const lldRound = SD_PHASES.find(p => p.id === "sd-interview").practice.filter(x => x.startsWith("lld:"));
  return [
    { label: "Concepts you can explain", ...count(uniq(mapped.filter(x => x.startsWith("cs:")))), hint: "Concept questions from the Top 30 that you marked \"I can answer this\"." },
    { label: "Design rounds solved", ...count(uniq([...mapped.filter(x => x.startsWith("hld:")), ...caseStudies])), hint: "The Top 30 design questions plus the roadmap's case studies." },
    { label: "LLD rounds solved", ...count(lldRound), hint: "Class design and machine coding practice from phase 10." },
  ];
}

// Every question id the roadmap and interview map use, for checks.
export const SD_PATH_IDS = [...new Set([...SD_PHASES.flatMap(p => p.practice), ...SD_TBE_QUESTIONS.flatMap(x => x.ids)])];
export const sdQuestionExists = id => !!(SD_BY_ID[id] || CS_BY_ID[id]);
