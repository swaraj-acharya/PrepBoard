# Prepboard

A free placement-prep dashboard. No paid course, no AI key, no server costs.

- **DSA path, zero to Google**: 456 free LeetCode questions in 28 steps, starting from FizzBuzz. Each step explains what you learn and why, with milestones (online tests after step 10, SDE-1 after step 17, Google at the end). The final step is Google's most asked questions of the last year.
- **More questions**: 19,000+ questions: every LeetCode problem (4,059, including 783 Premium with a free statement link), Codeforces (11,261) and CodeChef (3,807). Filter by topic, difficulty, Premium and status, or pick a random one.
- **Company questions**: 683 companies plus an "All companies" view, with last 30 days, 3 months, 6 months, **last 1 year** and all time.
- **System design**: 145 high-level and 74 low-level design questions (including machine-coding rounds and concurrency).
- **CS subjects**: 252 DBMS, OS, computer networks and OOPs interview questions with free study resources, plus all 323 LeetCode SQL problems.
- **Every question** shows its platform and has its topic explained like you're 12 (133 explanations).
- **Copy-paste AI prompts**: 3 hints (only hint 3 gives the solution), "check my solution" (reviews your code, then all approaches from brute force to optimal), and "get/check my answer" for CS questions.
- A 2,500-question goal with a finish date, revisions after 1, 3, 7, 21 and 45 days, streaks, heatmap and notes.

## Upload to GitHub (no Git needed)

The whole project is under 100 files, so it fits in one upload.

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
official **Codeforces difficulty ratings** (from codeforces.com/api) and **newer CodeChef problems** (from CodeChef's own list).
Then commit and push; Vercel redeploys automatically.

## Sources

| What | Where it comes from |
|---|---|
| All LeetCode problems, incl. Premium statements | github.com/doocs/leetcode |
| Company questions and frequency | github.com/snehasishroy/leetcode-companywise-interview-questions |
| More companies and topic tags | github.com/liquidslr/leetcode-company-wise-problems |
| "Last 1 year" | the Feb 2026 and Jul 2026 six-month lists from snehasishroy's repo, combined |
| Codeforces | codeforces.com/api, or github.com/Ronin5205/Codeforces-Problemset-Statements (MIT) |
| CodeChef | github.com/captn3m0/codechef + codechef.com's problem list |
| High-level design | ashishps1/awesome-system-design-resources, donnemartin/system-design-primer, prasadgujar/low-level-design-primer, Grokking notes |
| Low-level design | ashishps1/awesome-low-level-design, prasadgujar/low-level-design-primer, System Design Primer, tssovi's Grokking OOD notes |
| DSA path, topic explanations, CS questions | Written for this project |

## Customise

- DSA path: `scripts/sequence.mjs`, then `npm run data`.
- System design: `lib/systemDesign.js`. CS questions and resources: `lib/cs.js`.
- Topic explanations: `lib/topics.js`. Prompt wording: `lib/prompts.js`.

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

## Where progress lives

In your browser (localStorage), and in your GitHub repo too if you turn on GitHub saving. **Settings → Download backup** also works for moving it between devices.
