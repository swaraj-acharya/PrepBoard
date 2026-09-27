// Your local copy of the repo, opened with the browser's File System Access API (Chrome and Edge on a computer).
// Everything here works on folder handles, so the tests can pass in a fake folder.
//
// Where the link is kept: a folder link is a browser object, not text, so it can't go in localStorage.
// It's kept in IndexedDB (the browser's other storage, like saved solutions), and the folder's
// name is kept in localStorage so the page can show it straight away.

export const STORAGE_DIR = "progress";
export const FOLDER_META_KEY = "prepboard:folder";

export const folderSupported = () =>
  typeof window !== "undefined" && typeof window.showDirectoryPicker === "function" && window.isSecureContext !== false;

// ---- the folder link, in IndexedDB
const DB = "prepboard-folder", STORE = "kv";
let dbp = null;
const openDB = () => (dbp ||= new Promise((resolve, reject) => {
  const req = indexedDB.open(DB, 1);
  req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE); };
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
}));
async function kv(mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    t.oncomplete = () => resolve(req?.result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error || new Error("Saving the folder link was cancelled."));
  });
}
export const kvGet = key => kv("readonly", s => s.get(key)).catch(() => null);
export const kvSet = (key, value) => kv("readwrite", s => s.put(value, key));
export const kvDelete = key => kv("readwrite", s => s.delete(key)).catch(() => {});

// ---- files
// A file that isn't valid JSON and can't be repaired (see readJSONFile). Saving stops until it's fixed.
export class FolderFileError extends Error {}

const missing = e => e?.name === "NotFoundError" || e?.name === "TypeMismatchError";
const splitPath = path => { const parts = path.split("/").filter(Boolean); return [parts.slice(0, -1), parts[parts.length - 1]]; };
async function walk(dir, parts, create) {
  for (const p of parts) dir = await dir.getDirectoryHandle(p, { create });
  return dir;
}

export async function has(dir, name, kind) {
  try { await (kind === "directory" ? dir.getDirectoryHandle(name) : dir.getFileHandle(name)); return true; }
  catch (e) { if (missing(e)) return false; throw e; }
}

// The file's text, or null when it isn't there.
export async function readText(dir, path) {
  const [dirs, name] = splitPath(path);
  try {
    const d = await walk(dir, dirs, false);
    return await (await (await d.getFileHandle(name)).getFile()).text();
  } catch (e) { if (missing(e)) return null; throw e; }
}

// Creates any missing folders on the way. The browser writes to a temporary file and swaps it in
// on close, so a half-written file never replaces a good one.
export async function writeText(dir, path, text) {
  const [dirs, name] = splitPath(path);
  const d = await walk(dir, dirs, true);
  const w = await (await d.getFileHandle(name, { create: true })).createWritable();
  try { await w.write(text); await w.close(); }
  catch (e) { await w.abort?.().catch(() => {}); throw e; }
}

// After a `git pull` where two computers changed the same file, Git leaves both versions in it
// between <<<<<<< ======= >>>>>>> lines. This returns [ours, theirs] as two whole files, or null.
export const hasConflict = text => /^<<<<<<< /m.test(text || "") && /^>>>>>>> /m.test(text || "");
export function conflictSides(text) {
  if (!hasConflict(text)) return null;
  const ours = [], theirs = [];
  let mode = "both"; // both | ours | base (diff3 style) | theirs
  for (const line of text.split("\n")) {
    if (line.startsWith("<<<<<<< ") && mode === "both") mode = "ours";
    else if (line.startsWith("||||||| ") && mode === "ours") mode = "base";
    else if (line.replace(/\r$/, "") === "=======" && (mode === "ours" || mode === "base")) mode = "theirs";
    else if (line.startsWith(">>>>>>> ") && mode === "theirs") mode = "both";
    else {
      if (mode === "both" || mode === "ours") ours.push(line);
      if (mode === "both" || mode === "theirs") theirs.push(line);
    }
  }
  return mode === "both" ? [ours.join("\n"), theirs.join("\n")] : null;
}

// { value, conflict }. value is null when the file isn't there. A Git conflict is repaired with
// merge(ours, theirs) when one is given; anything else unreadable throws FolderFileError.
// shown is the path as you'd see it in your repo, for the error message.
export async function readJSONFile(dir, path, merge = null, shown = path) {
  const text = await readText(dir, path);
  if (text === null) return { value: null, conflict: false };
  try { return { value: JSON.parse(text), conflict: false }; } catch {}
  const sides = merge && conflictSides(text);
  if (sides) {
    try { return { value: merge(JSON.parse(sides[0]), JSON.parse(sides[1])), conflict: true }; } catch {}
  }
  throw new FolderFileError(hasConflict(text)
    ? `${shown} has a Git merge conflict that couldn't be repaired automatically, so nothing was saved over it. Fix the conflict in your editor, then click Save now.`
    : `${shown} isn't valid JSON, so nothing was saved over it. Fix it or restore it with Git, then click Save now.`);
}

// ---- the folder you pick
// Pick your repo: progress goes in its progress/ folder, which is created only if it isn't there.
// Picking the progress/ folder itself works too.
export async function openStorage(root) {
  if (await has(root, STORAGE_DIR, "directory")) {
    return { dir: await root.getDirectoryHandle(STORAGE_DIR), inRoot: true, created: false, label: `${root.name}/${STORAGE_DIR}` };
  }
  const isProgressFolder = await has(root, "progress.json", "file") || (root.name === STORAGE_DIR && !(await isGitRepo(root)));
  if (isProgressFolder) return { dir: root, inRoot: false, created: false, label: root.name };
  return { dir: await root.getDirectoryHandle(STORAGE_DIR, { create: true }), inRoot: true, created: true, label: `${root.name}/${STORAGE_DIR}` };
}

export async function isGitRepo(root) {
  return (await has(root, ".git", "directory")) || (await has(root, ".git", "file"));
}

// Which commit your repo is on, and whether GitHub has it (compared with origin's branch, as of your
// last push or fetch). Only reads a few small files in .git; never changes anything there.
// Null when the folder isn't a repo or .git can't be read (for example a worktree).
export async function gitStatus(root) {
  let git;
  try { git = await root.getDirectoryHandle(".git"); } catch { return null; }
  const headText = (await readText(git, "HEAD").catch(() => null))?.trim();
  if (!headText) return null;
  const packed = await readText(git, "packed-refs").catch(() => null);
  const refSha = async ref => {
    const loose = (await readText(git, ref).catch(() => null))?.trim();
    if (loose && /^[0-9a-f]{40,64}$/.test(loose)) return loose;
    for (const line of (packed || "").split("\n")) {
      const [sha, name] = line.trim().split(" ");
      if (name === ref && /^[0-9a-f]{40,64}$/.test(sha)) return sha;
    }
    return null;
  };
  if (!headText.startsWith("ref: ")) return { branch: null, head: /^[0-9a-f]{40,64}$/.test(headText) ? headText : null, pushed: null };
  const ref = headText.slice(5).trim();
  const branch = ref.replace(/^refs\/heads\//, "");
  const head = await refSha(ref);
  const remote = await refSha(`refs/remotes/origin/${branch}`);
  return { branch, head, pushed: head && remote ? head === remote : null };
}

// ---- small helpers
// JSON with sorted keys, so two copies of the same progress compare equal whatever order their keys are in.
export const canon = value => JSON.stringify(value, (k, v) =>
  v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map(key => [key, v[key]])) : v);

// A commit message that's safe inside double quotes in bash, zsh, PowerShell and cmd.
export const shellSafe = message => String(message).replace(/"/g, "'").replace(/[`$!\\%\r\n]/g, "").trim();
export const commitCommand = (message, path = STORAGE_DIR) =>
  `git add ${path} && git commit -m "${shellSafe(message)}" && git push`;
