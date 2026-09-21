// System design questions. "from" = the list the question is taken from; "ref" = where to read a reference answer.
const ASDR = { name: "awesome-system-design-resources (GitHub)", url: "https://github.com/ashishps1/awesome-system-design-resources#-system-design-interview-problems" };
const ALLD = { name: "awesome-low-level-design (GitHub)", url: "https://github.com/ashishps1/awesome-low-level-design#-low-level-design-interview-problems" };
const PRIMER = { name: "System Design Primer (GitHub)", url: "https://github.com/donnemartin/system-design-primer#system-design-interview-questions-with-solutions" };
const primerSD = d => ({ platform: "GitHub", url: `https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/${d}/README.md` });
const primerOOD = (d, f) => ({ platform: "GitHub", url: `https://github.com/donnemartin/system-design-primer/blob/master/solutions/object_oriented_design/${d}/${f}.ipynb` });
const am = path => ({ platform: "AlgoMaster", url: `https://algomaster.io/learn/${path}` });
const yt = v => ({ platform: "YouTube", url: `https://www.youtube.com/watch?v=${v}` });
const lld = f => ({ platform: "GitHub", url: `https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/${f}.md` });
const lc = s => ({ platform: "LeetCode", url: `https://leetcode.com/problems/${s}/` });

const h = (id, title, level, concepts, ref, from = ASDR, more = []) => ({ id: `hld:${id}`, kind: "hld", title, level, concepts, ref, from, more });
const l = (id, title, level, concepts, file, more = []) => ({ id: `lld:${id}`, kind: "lld", title, level, concepts: ["OOP", "Class Diagrams", ...concepts], ref: lld(file), from: ALLD, more });

export const HLD_GROUPS = [
  { id: "hld-basics", name: "Foundations", topics: ["Scalability", "Estimation", "Load Balancer", "Caching", "Databases"], items: [
    h("scaling-aws", "Scale a web app from 1 to millions of users", "E", ["Scalability", "Estimation", "Load Balancer", "Caching", "Replication", "CDN"], primerSD("scaling_aws"), PRIMER),
    h("url-shortener", "Design a URL shortener like TinyURL", "E", ["Estimation", "Unique IDs", "Databases", "Caching"], am("system-design-interviews/design-url-shortener"), ASDR, [primerSD("pastebin")]),
    h("pastebin", "Design Pastebin", "E", ["Unique IDs", "Object Storage", "Caching"], primerSD("pastebin"), PRIMER),
    h("load-balancer", "Design a load balancer", "E", ["Load Balancer", "Consistent Hashing", "Scalability"], am("system-design-interviews/design-load-balancer")),
    h("cdn", "Design a content delivery network (CDN)", "E", ["CDN", "Caching", "Load Balancer"], yt("8zX0rue2Hic")),
  ]},
  { id: "hld-easy", name: "Easy", topics: ["Caching", "Consistent Hashing", "Replication"], items: [
    h("distributed-cache", "Design a distributed cache", "E", ["Caching", "Consistent Hashing", "Replication"], yt("iuqZvajTOyA")),
    h("kv-store", "Design a distributed key-value store", "E", ["Consistent Hashing", "Replication", "CAP Theorem", "Sharding"], yt("rnZmdmlR-2M")),
    h("query-cache", "Design a key-value cache for a search engine", "E", ["Caching", "Consistent Hashing", "Sharding"], primerSD("query_cache"), PRIMER),
    h("autocomplete", "Design autocomplete for a search engine", "E", ["Search Index", "Caching", "Sharding"], { platform: "GitHub", url: ASDR.url }),
    h("auth", "Design an authentication system", "E", ["Authentication", "API Design", "Databases", "Caching"], yt("uj_4vxm9u90")),
    h("parking-garage", "Design a parking garage booking system", "E", ["API Design", "Databases", "Transactions and Locking"], yt("NtMvNh0WFVM")),
    h("upi", "Design Unified Payments Interface (UPI)", "E", ["Transactions and Locking", "Message Queue", "API Design"], yt("QpLy0_c_RXk")),
  ]},
  { id: "hld-medium", name: "Medium", topics: ["Message Queue", "Fan-out", "Object Storage"], items: [
    h("rate-limiter", "Design a rate limiter", "M", ["Rate Limiting", "Caching", "API Design"], yt("mhUQe4BKZXs")),
    h("notification", "Design a notification service", "M", ["Message Queue", "Rate Limiting", "API Design"], am("system-design-interviews/design-notification-service")),
    h("whatsapp", "Design WhatsApp", "M", ["Real-time Connections", "Message Queue", "Databases", "Replication"], am("system-design-interviews/design-whatsapp"), ASDR, [primerSD("social_graph")]),
    h("instagram", "Design Instagram", "M", ["Object Storage", "CDN", "Fan-out", "Caching", "Sharding"], am("system-design-interviews/design-instagram")),
    h("twitter", "Design Twitter", "M", ["Fan-out", "Caching", "Search Index", "Sharding"], yt("wYk0xPP_P_8"), ASDR, [primerSD("twitter")]),
    h("facebook", "Design Facebook news feed", "M", ["Fan-out", "Caching", "Sharding"], yt("9-hjBGxuiEs")),
    h("social-graph", "Design the data structures for a social network", "M", ["Sharding", "Caching", "Databases"], primerSD("social_graph"), PRIMER),
    h("reddit", "Design Reddit", "M", ["Databases", "Caching", "Search Index"], yt("KYExYE_9nIY")),
    h("spotify", "Design Spotify", "M", ["Object Storage", "CDN", "Databases", "Caching"], am("system-design-interviews/design-spotify")),
    h("youtube", "Design YouTube", "M", ["Object Storage", "CDN", "Message Queue", "Databases"], yt("jPKTo1iGQiE")),
    h("netflix", "Design Netflix", "M", ["CDN", "Object Storage", "Microservices", "Caching"], yt("psQzyFfsUGU")),
    h("tiktok", "Design TikTok", "M", ["Object Storage", "CDN", "Caching", "Message Queue"], yt("Z-0g_aJL5Fw")),
    h("tinder", "Design Tinder", "M", ["Geospatial Index", "Caching", "Databases"], yt("tndzLznxq40")),
    h("job-scheduler", "Design a distributed job scheduler", "M", ["Message Queue", "Transactions and Locking", "Sharding"], { platform: "AlgoMaster blog", url: "https://blog.algomaster.io/p/design-a-distributed-job-scheduler" }),
    h("kafka", "Design a distributed message queue like Kafka", "M", ["Message Queue", "Replication", "Sharding"], yt("iJLL-KPqBpM")),
    h("ecommerce", "Design an e-commerce store like Amazon", "M", ["Microservices", "Transactions and Locking", "Caching", "Search Index"], yt("EpASu_1dUdE")),
    h("sales-rank", "Design Amazon's sales rank by category", "M", ["Message Queue", "Databases", "Caching"], primerSD("sales_rank"), PRIMER),
    h("shopify", "Design Shopify", "M", ["Microservices", "Sharding", "Caching"], yt("lEL4F_0J3l8")),
    h("airbnb", "Design Airbnb", "M", ["Geospatial Index", "Search Index", "Transactions and Locking"], yt("YyOXt2MEkv4")),
    h("flight-booking", "Design a flight booking system", "M", ["Transactions and Locking", "Caching", "Search Index"], yt("qsGcfVGvFSs")),
    h("google-search", "Design Google Search", "M", ["Search Index", "Sharding", "Caching"], yt("CeGtqouT8eA")),
    h("mint", "Design Mint.com (personal finance tracker)", "M", ["Message Queue", "Databases", "Sharding"], primerSD("mint"), PRIMER),
    h("code-editor", "Design an online code editor and judge", "M", ["Message Queue", "Real-time Connections", "Scalability"], yt("07jkn4jUtso")),
    h("analytics", "Design a metrics and logging platform", "M", ["Message Queue", "Databases", "Sharding"], yt("kIcq1_pBQSY")),
    h("payment", "Design a payment system", "M", ["Transactions and Locking", "Message Queue", "API Design"], yt("olfaBgJrUBI")),
    h("wallet", "Design a digital wallet", "M", ["Transactions and Locking", "Replication", "Databases"], yt("4ijjIUeq6hE")),
  ]},
  { id: "hld-hard", name: "Hard", topics: ["Geospatial Index", "Real-time Connections", "Transactions and Locking"], items: [
    h("yelp", "Design a location service like Yelp", "H", ["Geospatial Index", "Search Index", "Caching"], yt("M4lR_Va97cQ")),
    h("uber", "Design Uber", "H", ["Geospatial Index", "Real-time Connections", "Message Queue"], yt("umWABit-wbk")),
    h("food-delivery", "Design a food delivery app like Swiggy or DoorDash", "H", ["Geospatial Index", "Real-time Connections", "Message Queue"], yt("iRhSAR3ldTw")),
    h("bookmyshow", "Design a ticket booking system like BookMyShow", "H", ["Transactions and Locking", "Caching", "Databases"], yt("lBAwJgoO3Ek")),
    h("google-docs", "Design Google Docs", "H", ["Real-time Connections", "Transactions and Locking", "Databases"], yt("2auwirNBvGg")),
    h("google-maps", "Design Google Maps", "H", ["Geospatial Index", "Caching", "CDN"], yt("jk3yvVfNvds")),
    h("zoom", "Design Zoom", "H", ["Real-time Connections", "Load Balancer", "Scalability"], yt("G32ThJakeHk")),
    h("dropbox", "Design a file sharing system like Dropbox", "H", ["Object Storage", "Transactions and Locking", "Message Queue"], yt("U0xTu6E2CT8")),
    h("web-crawler", "Design a distributed web crawler", "H", ["Message Queue", "Databases", "Sharding"], yt("BKZxZwUgL3Y"), ASDR, [primerSD("web_crawler")]),
    h("deploy", "Design a code deployment system", "H", ["Message Queue", "Object Storage", "Replication"], yt("q0KGYwNbf-0")),
    h("s3", "Design distributed cloud storage like S3", "H", ["Object Storage", "Replication", "Consistent Hashing"], yt("UmWtcgC96X8")),
    h("lock-service", "Design a distributed locking service", "H", ["Transactions and Locking", "CAP Theorem", "Replication"], yt("v7x75aN9liM")),
  ]},
];

export const LLD_GROUPS = [
  { id: "lld-easy", name: "Easy", topics: ["OOP", "Class Diagrams", "SOLID", "Singleton"], items: [
    l("parking-lot", "Design a parking lot", "E", ["Singleton", "Strategy", "Thread Safety"], "parking-lot", [primerOOD("parking_lot", "parking_lot")]),
    l("vending-machine", "Design a vending machine", "E", ["State", "Singleton"], "vending-machine"),
    l("logging", "Design a logging framework", "E", ["Singleton", "Chain of Responsibility", "Strategy"], "logging-framework"),
    l("traffic-signal", "Design a traffic signal control system", "E", ["State", "Observer"], "traffic-signal"),
    l("coffee-machine", "Design a coffee vending machine", "E", ["Decorator", "Factory", "State"], "coffee-vending-machine"),
    l("task-manager", "Design a task management system", "E", ["Observer", "Thread Safety"], "task-management-system"),
    l("stack-overflow", "Design Stack Overflow", "E", ["Observer", "SOLID"], "stack-overflow"),
    { id: "lld:deck-of-cards", kind: "lld", title: "Design a deck of cards", level: "E", concepts: ["OOP", "Class Diagrams", "SOLID"], ref: primerOOD("deck_of_cards", "deck_of_cards"), from: PRIMER, more: [] },
    { id: "lld:call-center", kind: "lld", title: "Design a call center", level: "E", concepts: ["OOP", "Class Diagrams", "Chain of Responsibility"], ref: primerOOD("call_center", "call_center"), from: PRIMER, more: [] },
  ]},
  { id: "lld-medium", name: "Medium", topics: ["Strategy", "Observer", "State"], items: [
    l("lru-cache", "Design an LRU cache", "M", ["SOLID", "Thread Safety"], "lru-cache", [lc("lru-cache"), primerOOD("lru_cache", "lru_cache")]),
    { id: "lld:hash-map", kind: "lld", title: "Design a hash map", level: "M", concepts: ["OOP", "Class Diagrams", "SOLID"], ref: primerOOD("hash_table", "hash_map"), from: PRIMER, more: [lc("design-hashmap")] },
    l("tic-tac-toe", "Design Tic Tac Toe", "M", ["Strategy", "State"], "tic-tac-toe"),
    l("atm", "Design an ATM", "M", ["State", "Chain of Responsibility"], "atm"),
    l("elevator", "Design an elevator system", "M", ["State", "Strategy", "Thread Safety"], "elevator-system"),
    l("pub-sub", "Design a pub-sub system", "M", ["Observer", "Thread Safety"], "pub-sub-system"),
    l("car-rental", "Design a car rental system", "M", ["Strategy", "Thread Safety"], "car-rental-system"),
    l("auction", "Design an online auction system", "M", ["Observer", "Thread Safety"], "online-auction-system"),
    l("hotel", "Design a hotel management system", "M", ["Strategy", "Thread Safety"], "hotel-management-system"),
    l("digital-wallet", "Design a digital wallet service", "M", ["Strategy", "Thread Safety"], "digital-wallet-service"),
    l("airline", "Design an airline management system", "M", ["Thread Safety", "SOLID"], "airline-management-system"),
    l("library", "Design a library management system", "M", ["Singleton", "SOLID"], "library-management-system"),
    l("social-network", "Design a social network like Facebook", "M", ["Observer", "SOLID"], "social-networking-service"),
    l("linkedin", "Design LinkedIn", "M", ["Observer", "SOLID"], "linkedin"),
    l("restaurant", "Design a restaurant management system", "M", ["Observer", "Factory"], "restaurant-management-system"),
    l("concert-tickets", "Design a concert ticket booking system", "M", ["Thread Safety", "Singleton"], "concert-ticket-booking-system"),
    { id: "lld:chat-server", kind: "lld", title: "Design a chat server", level: "M", concepts: ["OOP", "Class Diagrams", "Observer"], ref: primerOOD("online_chat", "online_chat"), from: PRIMER, more: [] },
  ]},
  { id: "lld-hard", name: "Hard", topics: ["Strategy", "Factory", "Thread Safety"], items: [
    l("splitwise", "Design Splitwise", "H", ["Strategy", "SOLID"], "splitwise"),
    l("snake-ladder", "Design Snake and Ladder", "H", ["Factory", "SOLID"], "snake-and-ladder"),
    l("chess", "Design a chess game", "H", ["Factory", "Strategy"], "chess-game"),
    l("cricinfo", "Design CricInfo", "H", ["Observer", "SOLID"], "cricinfo"),
    l("movie-tickets", "Design a movie ticket booking system", "H", ["Thread Safety", "Singleton"], "movie-ticket-booking-system"),
    l("course-registration", "Design a course registration system", "H", ["Thread Safety", "SOLID"], "course-registration-system"),
    l("ride-sharing", "Design a ride-sharing service like Uber", "H", ["Strategy", "Observer", "State"], "ride-sharing-service"),
    l("food-delivery", "Design a food delivery service like Swiggy", "H", ["State", "Observer", "Strategy"], "food-delivery-service"),
    l("shopping", "Design an online shopping system like Amazon", "H", ["Strategy", "Observer"], "online-shopping-service"),
    l("stock-brokerage", "Design an online stock brokerage system", "H", ["Observer", "Thread Safety"], "online-stock-brokerage-system"),
    l("music-streaming", "Design a music streaming service like Spotify", "H", ["Strategy", "Observer"], "music-streaming-service"),
  ]},
  { id: "lld-concurrency", name: "Concurrency", topics: ["Thread Safety", "Concurrency"], items: [
    ["print-foobar-alternately", "Print FooBar alternately", "M", lc("print-foobar-alternately")],
    ["print-zero-even-odd", "Print zero, even, odd", "M", lc("print-zero-even-odd")],
    ["fizz-buzz-multithreaded", "Fizz Buzz multithreaded", "M", lc("fizz-buzz-multithreaded")],
    ["building-h2o", "Building H2O", "M", lc("building-h2o")],
    ["ttl-cache", "Design a thread-safe cache with TTL", "M", am("concurrency-interview/design-thread-safe-cache-with-ttl")],
    ["concurrent-hashmap", "Design a concurrent hash map", "H", am("concurrency-interview/design-concurrent-hashmap")],
    ["blocking-queue", "Design a thread-safe blocking queue", "M", am("concurrency-interview/design-thread-safe-blocking-queue")],
    ["bloom-filter", "Design a concurrent Bloom filter", "H", am("concurrency-interview/design-concurrent-bloom-filter")],
    ["merge-sort", "Multi-threaded merge sort", "M", am("concurrency-interview/multi-threaded-merge-sort")],
  ].map(([id, title, level, ref]) => ({ id: `lld:${id}`, kind: "lld", title, level, concepts: ["Thread Safety", "Concurrency"], ref, from: ALLD, more: [] })) },
];

export const SD_BY_ID = Object.fromEntries([...HLD_GROUPS, ...LLD_GROUPS].flatMap(g => g.items.map(i => [i.id, i])));
export const isSD = id => typeof id === "string" && (id.startsWith("hld:") || id.startsWith("lld:"));

// ---------------------------------------------------------------- more questions, gathered from more lists
const HOSTS = { "youtube.com": "YouTube", "youtu.be": "YouTube", "highscalability.com": "High Scalability", "facebook.com": "Facebook Engineering", "blog.twitter.com": "Twitter Engineering",
  "slideshare.net": "SlideShare", "research.google.com": "Google Research paper", "static.googleusercontent.com": "Google Research paper", "read.seas.harvard.edu": "Paper (PDF)",
  "hadoop.apache.org": "Apache docs", "web.archive.org": "Web Archive", "cs.ucsb.edu": "Paper (PDF)", "erlang-factory.com": "Talk slides (PDF)", "michael-noll.com": "Blog",
  "journal.stuffwithstuff.com": "Blog", "github.com": "GitHub" };
const refOf = url => { const h = new URL(url).hostname.replace(/^www\./, ""); return { platform: HOSTS[h] || h, url }; };
const PRIMER_ADD = { name: "System Design Primer, additional questions (GitHub)", url: "https://github.com/donnemartin/system-design-primer#additional-system-design-interview-questions" };
const PRIMER_ARCH = { name: "System Design Primer, real world architectures (GitHub)", url: "https://github.com/donnemartin/system-design-primer#real-world-architectures" };
const PRASAD = { name: "low-level-design-primer, interview questions (GitHub)", url: "https://github.com/prasadgujar/low-level-design-primer/blob/master/questions.md" };
const grok = f => ({ platform: "GitHub (Grokking notes)", url: `https://github.com/Jeevan-kumar-Raj/Grokking-System-Design/blob/master/designs/${f}.md` });
const tssovi = f => ({ platform: "GitHub (Grokking OOD notes)", url: `https://github.com/tssovi/grokking-the-object-oriented-design-interview/blob/master/object-oriented-design-case-studies/${f}.md` });

const HLD_RULES = [
  [/chat|messenger|collab|real-?time|live |heatmap|streaming|translation|zoom|video kyc/i, ["Real-time Connections"]],
  [/feed|timeline|trending|twitter|social|community|forum|stories|product hunt/i, ["Fan-out", "Caching"]],
  [/video|audio|music|photo|picture|image|file|upload|download|clipboard|document|signature|content/i, ["Object Storage", "CDN"]],
  [/search|autocomplete|recommend|suggest|discovery|compar|salary|job|applicant|splunk|people you may know/i, ["Search Index"]],
  [/location|nearby|near |cars|ride|delivery|logistics|shipment|maps|navigation|agents|grocery/i, ["Geospatial Index"]],
  [/payment|wallet|bank|upi|stock|trading|order|booking|appointment|ticket|auction|coupon|tax|kyc|inventory|warehouse|exchange|portfolio/i, ["Transactions and Locking"]],
  [/rate limit/i, ["Rate Limiting"]],
  [/cache|memcached|redis/i, ["Caching", "Consistent Hashing"]],
  [/queue|kafka|notification|alert|schedul|crawler|webhook|analytics|tracking|monitoring|log|metrics|tracing|ads|mapreduce|spark|storm|interval/i, ["Message Queue"]],
  [/unique id|snowflake|uuid|shorten/i, ["Unique IDs"]],
  [/key-value|database|bigtable|hbase|cassandra|dynamo|mongo|spanner|file system|hdfs|storage|data centers|zookeeper|chubby|lock service/i, ["Replication", "Sharding"]],
  [/dynamo|cassandra|spanner|zookeeper|chubby|data centers/i, ["CAP Theorem"]],
  [/login|auth|sms|otp|secure|kyc/i, ["Authentication"]],
  [/platform|marketplace|e-?commerce|management system/i, ["Microservices"]],
  [/top k|leaderboard|rank/i, ["Caching"]],
  [/caller|spam|lookup/i, ["Caching", "Search Index"]],
];
function hldConcepts(title) {
  const out = [];
  for (const [re, cs] of HLD_RULES) if (re.test(title)) for (const c of cs) if (!out.includes(c)) out.push(c);
  for (const c of ["API Design", "Databases", "Scalability"]) if (out.length < 3 && !out.includes(c)) out.push(c);
  return out.slice(0, 5);
}
const LLD_RULES = [
  [/state machine|vending|jackpot|slot|atm|elevator|traffic|order|exam|workflow|locker/i, ["State"]],
  [/notif|alert|subscri|pub|auction|stock|score|chat|calendar|meeting|jira|task/i, ["Observer"]],
  [/json|csv|parser/i, ["Stack", "Recursion"]],
  [/text editor|undo/i, ["Stack"]],
  [/cache|eviction/i, ["Strategy", "Thread Safety"]],
  [/schedul|concurren|thread|parallel|booking|locker|inventory|wallet|payment|order book|exchange|access|garbage/i, ["Thread Safety"]],
  [/payment|pricing|split|navigator|transport|rule|coupon|assignment/i, ["Strategy"]],
  [/game|chess|jackpot|card|quiz|slot|chart|diagram|notification sender/i, ["Factory"]],
  [/logger|logging|config/i, ["Singleton"]],
  [/database|key-value|index|table|rocksdb/i, ["Hash Table", "Indexing"]],
  [/garbage/i, ["Memory and Object Lifecycle"]],
];
function lldConcepts(title) {
  const out = ["OOP", "Class Diagrams"];
  for (const [re, cs] of LLD_RULES) if (re.test(title)) for (const c of cs) if (!out.includes(c)) out.push(c);
  if (out.length < 3) out.push("SOLID");
  return out.slice(0, 6);
}
const H2 = (id, title, level, url, from) => ({ id: `hld:${id}`, kind: "hld", title, level, concepts: hldConcepts(title), ref: url ? refOf(url) : { platform: "GitHub", url: from.url }, from, more: [] });
const L2 = (id, title, level, url, from) => ({ id: `lld:${id}`, kind: "lld", title, level, concepts: lldConcepts(title), ref: url ? refOf(url) : { platform: "GitHub", url: from.url }, from, more: [] });

HLD_GROUPS.push({
  id: "hld-more", name: "More product designs", topics: ["Estimation", "API Design", "Databases"], items: [
    H2("id-generator", "Design a unique ID generator (like Twitter Snowflake)", "E", "https://blog.twitter.com/2010/announcing-snowflake", PRIMER_ADD),
    H2("top-k", "Find the top k requests in a time window", "M", "https://www.cs.ucsb.edu/sites/default/files/documents/2005-23.pdf", PRIMER_ADD),
    H2("trending", "Design trending topics like Twitter's", "M", "http://www.michael-noll.com/blog/2013/01/18/implementing-real-time-trending-topics-in-storm/", PRIMER_ADD),
    H2("twitter-search", "Design Twitter search", "M", grok("twitter-search").url, { name: "Grokking System Design notes (GitHub)", url: "https://github.com/Jeevan-kumar-Raj/Grokking-System-Design" }),
    H2("fb-timeline", "Design the Facebook timeline", "M", "https://www.facebook.com/note.php?note_id=10150468255628920", PRIMER_ADD),
    H2("fb-chat", "Design Facebook chat", "M", "http://www.erlang-factory.com/upload/presentations/31/EugeneLetuchy-ErlangatFacebook.pdf", PRIMER_ADD),
    H2("graph-search", "Design Facebook graph search", "H", "https://www.facebook.com/notes/facebook-engineering/under-the-hood-building-out-the-infrastructure-for-graph-search/10151347573598920", PRIMER_ADD),
    H2("recommendations", "Design a recommendation system like Amazon's", "H", "https://web.archive.org/web/20170406065247/http://tech.hulu.com/blog/2011/09/19/recommendation-system.html", PRIMER_ADD),
    H2("multi-dc", "Serve data from multiple data centers", "H", "http://highscalability.com/blog/2009/8/24/how-google-serves-data-from-multiple-datacenters.html", PRIMER_ADD),
    H2("card-game", "Design an online multiplayer card game", "M", "https://web.archive.org/web/20180929181117/http://www.indieflashblog.com/how-to-create-an-asynchronous-multiplayer-game.html", PRIMER_ADD),
    H2("stock-exchange", "Design a stock exchange like NASDAQ or Binance", "H", "https://youtu.be/b1e4t2k2KJY", PRIMER_ADD),
    ...[
      ["truecaller", "Design Truecaller (caller ID and spam detection)", "M"], ["sports-scores", "Design a live sports scores website", "M"],
      ["nearby-cars", "Design a nearby cars lookup by location", "M"], ["slow-upload", "Design video upload for users on slow networks", "M"],
      ["lms", "Design a learning management system", "M"], ["survey", "Design a survey tool like Google Forms", "E"],
      ["payment-gateway", "Design a payment gateway like Razorpay", "H"], ["home-automation", "Design a home automation system", "M"],
      ["comment-filter", "Design a comment filtering system for Amazon", "M"], ["mock-interview", "Design a mock interview platform like Pramp", "M"],
      ["ats", "Design an applicant tracking system like Greenhouse", "M"], ["logistics", "Design a logistics and shipment tracking system", "H"],
      ["employee-platform", "Design an employee management platform (payroll, IT, benefits)", "M"], ["engagement", "Design a user engagement platform", "M"],
      ["product-analytics", "Design a product analytics tool like Pendo", "M"], ["ipl-auction", "Design a live auction platform for IPL", "H"],
      ["browser-testing", "Design a browser testing service like BrowserStack", "H"], ["team-collab", "Design a real-time collaboration app for teams", "H"],
      ["diagram-tool", "Design an online diagram tool like Lucidchart", "M"], ["downloader", "Design an online audio and video downloader", "M"],
      ["warehouse", "Design a warehouse management system", "M"], ["game-streaming", "Design a game streaming platform", "H"],
      ["translation", "Design a real-time translation platform", "H"], ["forum", "Design a community discussion forum", "M"],
      ["online-exam", "Design an online exam platform (like GRE or TOEFL)", "M"], ["kyc", "Design a digital KYC verification platform", "M"],
      ["video-kyc", "Design video KYC verification", "H"], ["secure-cms", "Design a secure content management platform", "M"],
      ["freelance", "Design a freelancing marketplace", "M"], ["monitoring", "Design a monitoring and alerting system", "M"],
      ["income-tax", "Design an online income tax filing service", "M"], ["blue-collar-jobs", "Design a job portal for blue-collar workers in many languages", "M"],
      ["product-hunt", "Design a product discovery site like Product Hunt", "E"], ["cloud-clipboard", "Design a cloud clipboard service", "E"],
      ["salary-site", "Design a salary comparison site like Glassdoor or Levels.fyi", "M"], ["price-compare", "Design a price comparison system", "M"],
      ["virtual-events", "Design a virtual events platform", "H"], ["short-stories", "Design a short stories sharing platform", "E"],
      ["activity-tracking", "Design user activity tracking for a mobile app", "M"], ["secure-login", "Design a login API that stays safe even if SSL is compromised", "H"],
      ["api-aggregator", "Design an API that combines responses from three microservices", "M"], ["torrent", "Design a torrent service end to end", "H"],
      ["bigbasket", "Design a grocery delivery system like BigBasket", "H"], ["portfolio", "Design a personal investment portfolio tracker", "M"],
      ["esign", "Design an e-signature system like DocuSign", "M"], ["coupons", "Design a coupon and promo code system", "M"],
      ["quiz-app", "Design a quiz app", "E"], ["order-management", "Design an order management system", "M"],
      ["doc-viewers", "Design live viewers for a shared document", "M"], ["hospital-booking", "Design hospital appointment booking", "M"],
      ["stock-alerts", "Design stock price alerts", "M"], ["nav-alerts", "Design navigation alerts like Google Maps", "H"],
      ["data-quality", "Design a data quality checking system", "M"], ["plagiarism", "Design a plagiarism checker", "M"],
      ["sms-otp", "Design an SMS OTP validation service", "E"], ["zipkin", "Design request tracing across microservices like Zipkin", "H"],
      ["ads", "Design an ads system for a website", "H"], ["log-search", "Design a log search system like Splunk", "H"],
      ["people-you-may-know", "Design LinkedIn's people you may know", "H"], ["music-reco", "Design a music recommendation system", "M"],
      ["agent-heatmap", "Design a live heatmap of delivery agents", "M"], ["webhooks", "Design a webhook dispatcher", "M"],
      ["recently-viewed", "Design recently viewed listings for a user", "E"], ["referral-leaderboard", "Design a referral leaderboard", "E"],
      ["cert-dashboard", "Design a dashboard of machine certificate status", "M"], ["interval-caller", "Design a service that calls an endpoint at a fixed interval", "M"],
      ["weather", "Design a scalable weather service", "M"], ["history-tracking", "Design a change history tracking service", "M"],
    ].map(([id, t, lv]) => H2(id, t, lv, null, PRASAD)),
  ],
}, {
  id: "hld-classic", name: "Classic systems to study and redesign", topics: ["Replication", "Sharding", "CAP Theorem"], items: [
    ["mapreduce", "Design MapReduce (distributed batch processing)", "http://static.googleusercontent.com/media/research.google.com/zh-CN/us/archive/mapreduce-osdi04.pdf"],
    ["spark", "Design Spark (in-memory data processing)", "http://www.slideshare.net/AGrishchenko/apache-spark-architecture"],
    ["storm", "Design Storm (real-time stream processing)", "http://www.slideshare.net/previa/storm-16094009"],
    ["bigtable", "Design Bigtable (wide-column database)", "http://www.read.seas.harvard.edu/~kohler/class/cs239-w08/chang06bigtable.pdf"],
    ["hbase", "Design HBase (open-source Bigtable)", "http://www.slideshare.net/alexbaranau/intro-to-hbase"],
    ["cassandra", "Design Cassandra (distributed wide-column database)", "http://www.slideshare.net/planetcassandra/cassandra-introduction-features-30103666"],
    ["dynamodb", "Design DynamoDB (highly available key-value store)", "http://www.read.seas.harvard.edu/~kohler/class/cs239-w08/decandia07dynamo.pdf"],
    ["mongodb", "Design MongoDB (document database)", "http://www.slideshare.net/mdirolf/introduction-to-mongodb"],
    ["spanner", "Design Spanner (globally distributed SQL database)", "http://research.google.com/archive/spanner-osdi2012.pdf"],
    ["memcached", "Design Memcached (distributed memory cache)", "http://www.slideshare.net/oemebamo/introduction-to-memcached"],
    ["redis", "Design Redis (in-memory data store)", "http://www.slideshare.net/dvirsky/introduction-to-redis"],
    ["gfs", "Design the Google File System", "http://static.googleusercontent.com/media/research.google.com/zh-CN/us/archive/gfs-sosp2003.pdf"],
    ["hdfs", "Design HDFS (Hadoop file system)", "http://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html"],
    ["chubby", "Design Chubby (distributed lock service)", "http://static.googleusercontent.com/external_content/untrusted_dlcp/research.google.com/en/us/archive/chubby-osdi06.pdf"],
    ["dapper", "Design Dapper (distributed tracing)", "http://static.googleusercontent.com/media/research.google.com/en//pubs/archive/36356.pdf"],
    ["zookeeper", "Design ZooKeeper (coordination service)", "http://www.slideshare.net/sauravhaloi/introduction-to-apache-zookeeper"],
  ].map(([id, t, url]) => H2(id, t, "H", url, PRIMER_ARCH)),
});

LLD_GROUPS.splice(3, 0, {
  id: "lld-machine-coding", name: "Machine coding round (reported in interviews)", topics: ["OOP", "SOLID", "State"], items: [
    ["fsm", "Implement an extensible finite state machine", "M"], ["jira", "Design a task tracker like Jira (tasks, sprints)", "M"],
    ["order-matching", "Design a stock exchange order book with order matching", "H"], ["text-editor", "Build a text editor with undo and redo", "M"],
    ["product-qna", "Design product questions and answers like Amazon's", "E"], ["notification-sender", "Design a notification sender for iOS, Android and email", "M"],
    ["garbage-collector", "Implement a simple garbage collector", "H"], ["locker", "Design a parcel locker system like Amazon Locker", "M"],
    ["calendar", "Design a calendar app like Google Calendar", "M"], ["guitar-inventory", "Design a guitar shop inventory system", "E"],
    ["json-parser", "Build a JSON parser", "M"], ["maps-navigator", "Design a maps navigator for different transport modes", "M"],
    ["meeting-scheduler", "Design a meeting room scheduler", "M"], ["config-manager", "Design a configuration manager library", "M"],
    ["csv-parser", "Build a CSV parser", "E"], ["in-memory-db", "Design an in-memory database with tables and queries", "H"],
    ["restaurant-waitlist", "Design a restaurant waitlist and table assignment system", "M"], ["jackpot", "Design a jackpot slot machine", "E"],
    ["id-card-access", "Design an office ID card access system", "M"], ["bar-chart-lib", "Design a bar chart library", "M"],
    ["gym", "Design a gym management system", "E"], ["job-scheduler-limits", "Design a job scheduler that runs 100 jobs at a time", "H"],
    ["kv-index", "Design a key-value store with an index", "H"], ["cache-library", "Build an in-memory cache library with eviction policies", "M"],
    ["rule-engine", "Design a business rule engine", "M"], ["unit-test-framework", "Design a unit testing framework", "M"],
    ["rocksdb", "Implement a key-value database like RocksDB", "H"], ["inventory", "Design an inventory management system", "M"],
  ].map(([id, t, lv]) => L2(id, t, lv, null, PRASAD)),
});

// Grokking notes as extra reading for questions that already exist
const EXTRA = {
  "hld:url-shortener": [grok("short-url")], "hld:pastebin": [grok("pastebin")], "hld:instagram": [grok("instagram")], "hld:dropbox": [grok("dropbox")],
  "hld:facebook": [grok("facebook-newsfeed")], "hld:twitter": [grok("twitter")], "hld:youtube": [grok("youtube")], "hld:yelp": [grok("yelp")],
  "hld:uber": [grok("uber-backend")], "hld:web-crawler": [grok("web-crawler")], "hld:bookmyshow": [grok("ticketmaster")], "hld:whatsapp": [grok("facebook-messenger")],
  "lld:parking-lot": [tssovi("design-a-parking-lot")], "lld:atm": [tssovi("design-an-atm")], "lld:chess": [tssovi("design-chess")], "lld:library": [tssovi("design-a-library-management-system")],
  "lld:hotel": [tssovi("design-a-hotel-management-system")], "lld:car-rental": [tssovi("design-a-car-rental-system")], "lld:movie-tickets": [tssovi("design-a-movie-ticket-booking-system")],
  "lld:restaurant": [tssovi("design-a-restaurant-management-system")], "lld:shopping": [tssovi("design-amazon-online-shopping-system")], "lld:airline": [tssovi("design-an-airline-management-system")],
  "lld:stock-brokerage": [tssovi("design-an-online-stock-brokerage-system")], "lld:cricinfo": [tssovi("design-cricinfo")], "lld:linkedin": [tssovi("design-linkedin")],
  "lld:stack-overflow": [tssovi("design-stack-overflow")], "lld:social-network": [tssovi("design-facebook")], "lld:ride-sharing": [tssovi("design-uber")], "lld:deck-of-cards": [tssovi("design-blackjack-and-a-deck-of-cards")],
};
for (const g of [...HLD_GROUPS, ...LLD_GROUPS]) for (const q of g.items) {
  if (EXTRA[q.id]) q.more = [...q.more, ...EXTRA[q.id]];
  SD_BY_ID[q.id] = q;
}
