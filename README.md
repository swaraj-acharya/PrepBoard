# Prepboard

A free placement-prep dashboard. No paid course, no AI key, no server costs.

- **DSA path, zero to Google**: 456 free LeetCode questions in 28 steps, starting from FizzBuzz. Each step explains what you learn and why, with milestones (online tests after step 10, SDE-1 after step 17, Google at the end). The final step is Google's most asked questions of the last year.
- **More questions**: 19,000+ questions: every LeetCode problem (4,059, including 783 Premium with a free statement link), Codeforces (11,261), CodeChef (3,807) and AtCoder (the full archive after `npm run data`). Filter by topic, difficulty, Premium, AtCoder contest type and status, or pick a random one.
- **AtCoder in the DSA path**: DP and data-structure steps link AtCoder problems on the same topic (Educational DP Contest, AtCoder Library Practice Contest), each with a line on why it's there. They're optional and don't change the path's numbering or your progress.
- **CP training**: an AtCoder ladder in five stages by estimated difficulty (A: beginner to E: elite), a Codeforces ladder from 800 to 2400+, and how AtCoder's contests work. It suggests where to start from your ratings.
- **DSA profile**: problems solved per platform, how many you solved on your own (not after a hint, the editorial or reference code), revision recall, streaks, your AtCoder and Codeforces rating history with the date you reached each colour or rank, and three separate kinds of evidence (interview skill, contest skill, public proof). No single "readiness score", and no promises about jobs.
- **Company questions**: 683 companies plus an "All companies" view, with last 30 days, 3 months, 6 months, **last 1 year** and all time.
- **System design**: a ten-phase roadmap from how one request travels to interview practice, following the order of The Boring Education's System Design Engineer Roadmap, where each phase says why it matters, what it builds on, which interview questions test it and which free resources to use. An interview-prep tab built on their Top 30 questions adds answer structures for HLD and LLD rounds, the trade-offs to have ready, and where you stand. Plus 146 high-level and 74 low-level design questions (including machine-coding rounds and concurrency) and 21 system design concept questions with answer prompts.
- **CS subjects**: 252 DBMS, OS, computer networks and OOPs interview questions with free study resources, plus all 323 LeetCode SQL problems.
- **Every question** shows its platform and has its topic explained like you're 12 (144 explanations).
- **Copy-paste AI prompts**: 3 hints (only hint 3 gives the solution), "check my solution" (reviews your code, then all approaches from brute force to optimal), and "get/check my answer" for CS questions.
- A 2,500-question goal with a finish date, revisions after 1, 3, 7, 21 and 45 days, streaks, heatmap and notes.
- **Fair to AtCoder's rules**: AtCoder bans generative AI during live ABC, ARC and AGC contests, so the AI prompts switch off for a problem while its contest is running. Practising past problems with them is allowed.

## Upload to GitHub (no Git needed)

The project is under 100 files (not counting the `progress/` folder), so it fits in one upload.

1. Create a new repo on GitHub (or open your existing one).
2. Click **Add file → Upload files** (on an empty repo: "uploading an existing file").
3. Open this folder on your computer, select **everything inside it** (Ctrl+A / Cmd+A) and drag it onto the page. Drag the contents, not the folder itself, so `package.json` ends up at the top of the repo.
4. Click **Commit changes**.

## Deploy to Vercel (free)

1. Upload this folder to a GitHub repo (see above).
2. On vercel.com: **Add New → Project → Import** the repo → **Deploy**.

## Run locally

```
npm install
npm run dev      # http://localhost:3000
```

## Refresh the data (recommended once)

```
npm run data
```
This needs Git and internet, and takes a few minutes the first time. It also downloads things that couldn't be bundled:
official **Codeforces difficulty ratings** (from codeforces.com/api), **newer CodeChef problems** (from CodeChef's own list)
and **the full AtCoder list** with difficulty estimates (from AtCoder Problems; about 5 small requests, spaced out and cached for a week).
Then check and commit:

```
npm run validate   # duplicates, broken links between files, missing metadata
npm test           # the AtCoder pipeline, profile numbers and sync merging (no internet needed)
```

Commit and push; Vercel redeploys automatically. If a download fails, the script keeps the file you already have.
`npm run data -- --offline` rebuilds from what's already downloaded.

The repo ships with a small AtCoder list (the Educational DP Contest and the AtCoder Library Practice Contest), so the DSA path's AtCoder links work straight away. The CP training ladder needs the full list.

## Sources

| What | Where it comes from |
|---|---|
| All LeetCode problems, incl. Premium statements | github.com/doocs/leetcode |
| Company questions and frequency | github.com/snehasishroy/leetcode-companywise-interview-questions |
| More companies and topic tags | github.com/liquidslr/leetcode-company-wise-problems |
| "Last 1 year" | the Feb 2026 and Jul 2026 six-month lists from snehasishroy's repo, combined |
| Codeforces | codeforces.com/api, or github.com/Ronin5205/Codeforces-Problemset-Statements (MIT) |
| CodeChef | github.com/captn3m0/codechef + codechef.com's problem list |
| AtCoder problems and difficulty estimates | kenkoooo.com/atcoder ([AtCoder Problems](https://github.com/kenkoooo/AtCoderProblems), unofficial). Only titles, ids and numbers are stored, never problem statements. |
| AtCoder topics for the DSA path | Only sets whose topic is certain: every Educational DP Contest task is DP, and the Library Practice Contest's topics come from [atcoder/ac-library](https://github.com/atcoder/ac-library) (`test/example/problems.toml`) |
| Your contest ratings | atcoder.jp/users/&lt;you&gt;/history/json and codeforces.com/api/user.rating (official), fetched when you ask |
| High-level design | ashishps1/awesome-system-design-resources, donnemartin/system-design-primer, prasadgujar/low-level-design-primer, Grokking notes |
| Low-level design | ashishps1/awesome-low-level-design, prasadgujar/low-level-design-primer, System Design Primer, tssovi's Grokking OOD notes |
| System design roadmap order and interview question list | The Boring Education: [System Design Engineer Roadmap](https://resources.theboringeducation.com/resources/system-design-roadmap) and [Top 30 System Design Interview Questions](https://resources.theboringeducation.com/resources/system-design-interview-questions). Only the phase order and the question list are used; explanations and answer outlines are written for this project and link to their model answers. |
| DSA path, topic explanations, CS questions | Written for this project |

## Customise

- DSA path: `scripts/sequence.mjs`, then `npm run data`.
- System design questions: `lib/systemDesign.js`. The roadmap, interview map, resources and concept prerequisites: `lib/systemDesignPath.js` (`npm test` checks that every question and topic it points at exists). System design concept questions are the `sd` subject in `lib/cs.js`.
- CS questions and resources: `lib/cs.js`.
- Topic explanations: `lib/topics.js`. Prompt wording: `lib/prompts.js`.
- AtCoder problems linked from path steps: `scripts/atcoder-bridge.mjs`, then `npm run data`. Only add a problem when its topic is certain; the rest belong in More questions.
- Which AtCoder contests are imported: `classifyContest` and `PRACTICE` in `scripts/atcoder.mjs` (rated ABC, ARC and AGC, sponsored contests at those levels, AHC, and a few practice sets).

## Sign-in (required)

Every page needs a sign-in. Without one, you're sent to `/login`.

1. In Vercel → Settings → Environment Variables add:
   - `AUTH_ID`: the ID you'll type to sign in
   - `AUTH_PASSWORD`: a long password
   - optional: `AUTH_SECRET`, a long random string used to sign the cookie. Without it, the cookie is signed with your ID and password.

   Then redeploy.
2. Open the site and sign in. The browser keeps a signed, HttpOnly cookie for 7 days; after that you sign in again.

Don't put the ID or password in the code or any file in this repo. If the repo is public, anyone can read them there. To sign out every device at once, change `AUTH_PASSWORD` (or `AUTH_SECRET`) in Vercel and redeploy. Until `AUTH_ID` and `AUTH_PASSWORD` are set, the site stays locked.

To run locally with sign-in, create a file named `.env.local` (Git ignores it) containing `AUTH_ID=...` and `AUTH_PASSWORD=...`.

## Save progress to GitHub (optional)

Your ticks can be committed to your GitHub repo, so they show on your contribution graph and sync between devices.

1. Create a fine-grained token at https://github.com/settings/personal-access-tokens/new: **Only select repositories** → this repo, **Contents: Read and write**.
2. In Vercel → Settings → Environment Variables add:
   - `GITHUB_TOKEN`: the token
   - `GITHUB_REPO`: `yourname/your-repo`
   - `SYNC_SECRET`: a long password you make up
   - optional: `GITHUB_BRANCH` (defaults to the repo's default branch), `PROGRESS_DIR` (defaults to `progress`)

   Then redeploy.
3. On the site: **Settings → Save progress to GitHub**, type your `SYNC_SECRET`, click **Connect**. Do this once per device.

Nothing is committed while you tick. When you're done, open **Settings** and click **Push Progress Now**: everything since your last push goes up as one commit (`progress/progress.json`, `progress/README.md` and `progress/HISTORY.md`), with a message like "Solved 4 questions (Two Sum, Fizz Buzz, Valid Anagram and 1 more); 2 revised". The top bar shows how many changes haven't been pushed yet. `vercel.json` stops Vercel from redeploying for commits that only touch `progress/`. The token never reaches the browser; visitors can't save without your password. If the repo is public, your progress file (including notes and pasted code) is public too.

## Contest ratings and your profile

1. On the site: **Settings → Public profiles**. Type your AtCoder and Codeforces usernames (CodeChef, LeetCode and GitHub are links only) and click **Save**.
2. The **Profile** page shows your ratings, and **Refresh contest ratings** fetches them again.

Ratings are fetched by the site's own server (`/api/ratings`) from each site's official data, only when you ask, and cached for 30 minutes. Like every page, it needs you to be signed in. The last fetch is saved with your progress, so it syncs to GitHub, and `progress/README.md` lists your ratings. LeetCode and CodeChef have no official public rating API, so their ratings aren't shown.

**How solves are counted.** Only a solve with no hint, editorial or reference code counts as "on your own". After **Solved with help**, pick what helped in the question's panel. Opening hint 3 (the full-solution prompt) counts as reference code.

## Problem Solving Lab

`/lab` is an engineering reasoning gym, separate from DSA and CP. It trains what DSA doesn't: debugging, investigating unfamiliar failures, reading code you didn't write, estimation, trade-offs, security, performance measurement, product framing, and explaining your reasoning.

**Daily training.** Pick your study time and a mode (Interview 60/20/20, Engineer 40/20/40, Elite 35/25/40 for DSA/CP/Engineering). The Today tab gives one problem of the day that fits your engineering minutes, one mental model to review, a quick exercise when there's time, deep work on weekends, and a reflection. The pick rotates categories by weekday, repairs your weakest category first (self-review under 60%), avoids repeating a category from the last three days, and every few days gives a deliberately unfamiliar or ambiguous problem. It stays near your roadmap stage; everything is still open in Challenges.

**Each challenge** has a brief (with code, logs or metrics where relevant), a reasoning template (for example: what you know, what you don't, hypotheses, evidence, experiment, root cause, fix, prevention), thinking time before hints and AI help unlock, and three graded hints. Incidents and case studies reveal information in stages: you record a decision to get the next update. After you submit, you tick which of an experienced engineer's key points you covered, mark whether your answer matched, write the principle in your own words, answer a constraint-change follow-up, optionally write a postmortem or decision record, answer a 10-question reasoning review, and tag the reasoning mistakes you made.

**AI help** is a copy-paste prompt, like the rest of PrepBoard: Socratic (asks questions, never answers) by default, then Hint and Review; Solution and Expert comparison unlock only after you submit. Prompts only include what you've seen so far.

**Progress.** A breadth map across 16 areas with evidence-based levels: 1 challenge is Exposure, 3 is Practised, Applied needs real application (an incident, case study, project or real-world journal entry), Strong needs 6 plus high self-review and key-point coverage. Algorithms comes from your DSA and CP solves. You also get recurring failure patterns (last 30 days, each with the mental model to study) and weekly and monthly reviews with trends and a next priority. These numbers come from your own self-reviews: they're for diagnosis, not a grade.

**Library.** 16 mental models (spaced review, one a day, each with a transfer question), 10 anti-patterns, 20 resources levelled 1–5 and marked passive, active or applied, each tied to practice, and 12 build-to-understand projects with the principle each exposes and the evidence to produce. `npm run check-links` re-checks every external link.

**Journal and evidence.** Finished challenges become journal entries automatically; add real-world problems too. The principle notebook collects what you learned. "Copy as Markdown" gives a write-up for GitHub or a blog, and if you save progress to GitHub, your progress README gets a Lab section. Journal entries are public if the repository is.

**Content.** 33 original challenges in `lib/lab.js` across 18 categories: bug hunts in JS, React, C++ and SQL, data bugs, API failures, incidents, code review, code reading (including a real open-source file), estimation, trade-offs, counterexamples, performance, security, decomposition, product problems, how-does-it-work, unknown technology, engineering research, verifying AI-generated code, and three real case studies (Cloudflare 2019, AWS S3 2017, GitLab 2017) whose reveals follow each company's own postmortem. To add one, copy a challenge of the same category; `npm test` checks every field and link between challenges, models and resources.

## Limitations

- The Lab can't check your reasoning automatically. You mark your answer against the key points yourself, so be strict. The Review prompt gives a second opinion.
- 33 challenges is a starting set. The format repeats; your reasoning shouldn't.

- AtCoder has no official difficulty numbers or topic tags. The difficulties are AtCoder Problems' estimates (shown with ≈, and a ? when experimental). Problems without one are graded by their letter, or left "Unrated". So most AtCoder problems appear under More questions and CP training, not inside the DSA path.
- The CP training ladder and the Codeforces rating ladder need `npm run data` with internet. The committed Codeforces list has no official ratings yet, and the AtCoder list is only the small bundled set.
- Ratings can't be fetched when AtCoder or Codeforces is down or blocks the request; the profile keeps the last good numbers and shows the error.
- The AI-prompt switch-off relies on the contest times in the AtCoder list, so run `npm run data` now and then to include new contests.

## Where progress lives

In your browser (localStorage), and in your GitHub repo too if you turn on GitHub saving. **Settings → Download backup** also works for moving it between devices.
