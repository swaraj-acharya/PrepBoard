// Prompts you copy into any AI chat (ChatGPT, Claude, Gemini…). Nothing is sent from this app.

const SIMPLE = "Use simple words, like you're explaining to a 12-year-old, and use a tiny example if it helps.";
// Review prompts end with these so the reply is easy to revise from later, when it's pasted back
// into Prepboard. Prepboard stores the reply as-is and never depends on this structure.
const REMEMBER = `WHAT I SHOULD REMEMBER (for my revision notes)
   - The key insight, in one sentence.
   - My mistakes, as a short checklist for next time.
   - The pattern or idea this question is really about.`;
const FORMAT = "Format your reply in Markdown: a ## heading for each numbered part, and every piece of code in a fenced code block.";

function header(item) {
  if (item.kind === "cs") return `Subject: ${item.subjectName}\nInterview question: "${item.title}"\nTopic: ${item.concepts.join(", ")}`;
  const lines = [`Problem: "${item.title}"`, `Platform: ${item.platform} (${item.url})`];
  if (item.premium && item.freeStatement) lines.push(`This is a LeetCode Premium problem. The full statement is free here: ${item.freeStatement} (if you can't open links, tell me and I'll paste the statement).`);
  if (item.levelLabel) lines.push(`Difficulty: ${item.levelLabel}`);
  if (item.kind === "dsa" && item.tags?.length) lines.push(`Tags: ${item.tags.join(", ")}`);
  if (item.kind !== "dsa" && item.concepts?.length) lines.push(`Key concepts: ${item.concepts.join(", ")}`);
  return lines.join("\n");
}

const INTRO = {
  dsa: "I'm preparing for coding interviews and practising this problem on my own.",
  hld: "I'm preparing for system design (high-level design) interviews and practising this question on my own.",
  lld: "I'm preparing for low-level design (object-oriented design) interviews and practising this question on my own.",
  cs: "I'm preparing for the CS fundamentals part of placement interviews.",
};

const HINTS = {
  dsa: [
    `Give me HINT 1 of 3: a small nudge only.
Rules:
- Do NOT tell me the algorithm, the data structure to use, or any code.
- Point my attention to something in the problem I might be missing, or ask me one guiding question.
- Maximum 3 sentences.
- ${SIMPLE}`,
    `Give me HINT 2 of 3: the key idea, but still not the solution.
Rules:
- Tell me which pattern or data structure fits and WHY it fits this problem.
- Tell me the key observation that makes the fast solution possible.
- Do NOT give the step-by-step algorithm and do NOT write any code.
- Maximum 6 sentences.
- ${SIMPLE}`,
    lang => `Give me HINT 3 of 3: the full solution. I've tried and I'm ready to see it.
Please give:
1. The intuition, in simple words.
2. The step-by-step algorithm.
3. A dry run on a small example.
4. Clean, commented ${lang} code.
5. Time and space complexity, each with a one-line reason.
6. Edge cases I must not forget.
${SIMPLE}`,
  ],
  hld: [
    `Give me HINT 1 of 3: help me start, but don't design anything.
Rules:
- List the clarifying questions I should ask the interviewer, and the functional and non-functional requirements I should pin down.
- Tell me what to estimate (users, requests per second, storage), but do NOT give the numbers or any architecture.
- ${SIMPLE}`,
    `Give me HINT 2 of 3: the big idea, but not the full design.
Rules:
- Name the main building blocks I'll need (for example: which kind of database, cache, queue).
- Tell me the ONE or TWO hardest challenges in this system and what kind of technique solves each.
- Do NOT give the full architecture, the data model or the API list.
- ${SIMPLE}`,
    () => `Give me HINT 3 of 3: the full answer, the way a strong candidate would present it in a 45-minute interview.
1. Requirements (functional and non-functional).
2. Back-of-the-envelope estimates.
3. API design.
4. Data model and database choice, with reasons.
5. High-level architecture (describe each component; draw it as a Mermaid diagram if you can).
6. Deep dives on the 2–3 hardest parts.
7. Bottlenecks, failure handling, and trade-offs.
${SIMPLE}`,
  ],
  lld: [
    `Give me HINT 1 of 3: help me start, but don't design it.
Rules:
- List the requirements and use cases I should confirm with the interviewer.
- Help me find the main nouns (possible classes) and verbs (possible methods) in the problem, as questions or a rough list.
- Do NOT give the class design, relationships or code.
- ${SIMPLE}`,
    `Give me HINT 2 of 3: the key design idea, but not the solution.
Rules:
- Tell me the core classes and how they relate (in one short list, no fields or methods).
- Tell me which design pattern(s) fit and WHY.
- Point out the tricky part (for example concurrency, or extending it later).
- Do NOT write code or a full class diagram.
- ${SIMPLE}`,
    lang => `Give me HINT 3 of 3: the full solution.
1. Requirements you assumed.
2. Class diagram (as a Mermaid class diagram or a clear text list with fields, methods and relationships).
3. Design patterns used and why.
4. Complete, runnable ${lang} code with comments.
5. How the code follows SOLID, and how I would extend it (a new feature the interviewer might ask for).
6. Concurrency or edge cases to handle.
${SIMPLE}`,
  ],
};

export function hintPrompt(item, n, lang) {
  const t = HINTS[item.kind][n - 1];
  const body = typeof t === "function" ? t(lang) : t;
  return `${INTRO[item.kind]}\n\n${header(item)}\n\n${body}`;
}

function editorialLine(item) {
  if (item.platform === "Codeforces") return `check the official Codeforces editorial and comments for this contest (${item.editorial}), plus other popular explanations, so nothing is missed.`;
  if (item.platform === "AtCoder") return `check the official AtCoder editorial (${item.editorial}), plus other popular explanations, so nothing is missed.`;
  if (item.platform === "CodeChef") return `check the CodeChef editorial (${item.editorial}), plus other popular explanations, so nothing is missed.`;
  return `check the LeetCode editorial and top solution posts (${item.editorial}), GeeksforGeeks, and other popular explanations so nothing is missed.`;
}

export function answerPrompt(item) {
  return `${INTRO.cs}

${header(item)}

Answer this question the way a strong candidate would in an interview:
1. First, explain it like I'm 12, with an everyday example (cricket, school, games).
2. Then the interview answer: a clear definition and how it works, in 5–8 lines.
3. A small example, table or text diagram if it helps.
4. Key differences or trade-offs, if the question compares things.
5. Two or three follow-up questions an interviewer might ask next, with short answers.
6. A one-line summary I can remember.`;
}

export function checkAnswerPrompt(item, mine) {
  return `${INTRO.cs} I wrote my own answer and want honest feedback.

${header(item)}

My answer:
"""
${mine?.trim() || "(I haven't written an answer yet. Just give the model answer.)"}
"""

Please:
1. Score my answer out of 10, like an interviewer would.
2. What is correct, what is wrong, and what important point is missing?
3. Give the model answer an interviewer expects, in 5–8 lines.
4. Ask me two follow-up questions (don't answer them yet).
5. One line I should remember about this question.
Use simple words. ${FORMAT}`;
}

export function checkPrompt(item, lang, work) {
  const mine = work?.trim() || "(I haven't pasted my work — just show all approaches.)";
  if (item.kind === "dsa") return `${INTRO.dsa} I've written a solution and I want a full review.

${header(item)}

My ${lang} code:
\`\`\`
${mine}
\`\`\`

Please do the following, in this order:

1. VERDICT
   One line: correct, partly correct or wrong, and the main reason.

2. REVIEW MY CODE
   - What I did well.
   - Is it correct? If not, give me a failing test case, point to the exact line(s), and show only the fix.
   - Logical mistakes, and any edge cases my code misses.
   - Time and space complexity of MY code, each with a one-line reason.
   - Why my approach works, or why it doesn't.

3. ALL APPROACHES, FROM BRUTE FORCE TO MOST OPTIMISED
   For each approach give: the idea in simple words, ${lang} code, time and space complexity, and what makes the next approach better.
   Cover every well-known approach for this problem. If you can browse, ${editorialLine(item)} Mention where each approach comes from.

4. WHERE I STAND
   - Which approach did I use?
   - Which approach does an interviewer expect for this problem?
   - Common follow-up questions interviewers ask on this problem, and how to answer them.

5. ${REMEMBER}

6. THE BEST SOLUTION
   The optimal approach as one complete, clean ${lang} code block. Make it the last code block in your reply.

${SIMPLE} ${FORMAT}`;

  if (item.kind === "hld") return `${INTRO.hld} I've written my design and I want it reviewed like a real interview.

${header(item)}

My design notes:
"""
${mine}
"""

Please do the following, in this order:

1. REVIEW MY DESIGN like a senior interviewer
   - Score me out of 10 on: requirements, estimation, API, data model, architecture, scalability, trade-offs.
   - What did I do well? What is missing or wrong? What would break first at scale?

2. ALL DESIGN APPROACHES, FROM SIMPLE TO MOST SCALABLE
   Start from the simplest version (one server, one database) and evolve it step by step to the design used at large scale.
   For each step: what changed, why it was needed, and the trade-off.
   If you can browse, compare with well-known references for this question (the reference at ${item.url}, System Design Primer, ByteByteGo, and company engineering blogs) and mention which idea comes from where.

3. WHERE I STAND
   - Which level does my design reach?
   - The follow-up questions interviewers usually ask on this problem, with short answers.

4. ${REMEMBER}

${SIMPLE} ${FORMAT}`;

  return `${INTRO.lld} I've written my design and code and I want a full review.

${header(item)}

My ${lang} code / class design:
\`\`\`
${mine}
\`\`\`

Please do the following, in this order:

1. REVIEW MY DESIGN
   - Does it meet the usual requirements for this problem? What's missing?
   - Check OOP and SOLID: point to the exact classes or lines that break a principle, and show the fix.
   - Concurrency or edge-case bugs.

2. ALL DESIGN APPROACHES, FROM SIMPLE TO BEST
   Start from the simplest working design and improve it step by step (better abstractions, design patterns, thread safety, extensibility).
   For each step: the class structure, key ${lang} code, and why it's better than the step before.
   If you can browse, compare with well-known solutions for this problem (the reference at ${item.url}, and other popular LLD resources) and mention which idea comes from where.

3. WHERE I STAND
   - Which level is my design at?
   - Extension questions interviewers ask (e.g. "add a new type of X"), and how my design should change.

4. ${REMEMBER}

5. THE BEST DESIGN
   The complete ${lang} code of the best design as one code block. Make it the last code block in your reply.

${SIMPLE} ${FORMAT}`;
}

export function topicPrompt(item, tagList) {
  return `${INTRO[item.kind] || INTRO.dsa}

${header(item)}

${tagList?.length ? `Explain these topics: ${tagList.join(", ")}.` : "Which topics and patterns does this problem use? Explain each one."}
For each topic:
- A picture in my head (an everyday example, like cricket, school or video games).
- What it really is, in 2–3 sentences.
- How to spot when a problem needs it.
${item.kind === "cs" ? "Don't answer the interview question itself yet." : "Do NOT solve the problem."}
Explain it like I'm a 12-year-old.`;
}
