// Sign-in for the whole site. Your ID and password live in Vercel environment variables
// (AUTH_ID, AUTH_PASSWORD), never in the code. After you sign in, the browser keeps a signed
// cookie for 7 days. Changing AUTH_PASSWORD (or AUTH_SECRET) signs out every device.
export const COOKIE = "prepboard_auth";
export const MAX_AGE = 7 * 24 * 60 * 60; // 7 days, in seconds

const enc = new TextEncoder();
const b64url = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export const authConfigured = () => Boolean(process.env.AUTH_ID && process.env.AUTH_PASSWORD);

async function hmac(text) {
  const secret = process.env.AUTH_SECRET || `${process.env.AUTH_ID}\n${process.env.AUTH_PASSWORD}`;
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(text)));
}
function sameString(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let x = 0; for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return x === 0;
}
// Compares hashes, so the check takes the same time whatever you typed.
async function sameSecret(a, b) {
  const h = async s => b64url(await crypto.subtle.digest("SHA-256", enc.encode(String(s ?? ""))));
  return sameString(await h(a), await h(b));
}

export async function checkLogin(id, password) {
  if (!authConfigured()) return false;
  const [a, b] = await Promise.all([sameSecret(id, process.env.AUTH_ID), sameSecret(password, process.env.AUTH_PASSWORD)]);
  return a && b;
}

// Token: "<expiry in ms>.<signature>". The server checks the expiry, so an old cookie can't be reused.
export async function makeToken() {
  const exp = Date.now() + MAX_AGE * 1000;
  return `${exp}.${await hmac(`v1.${exp}`)}`;
}
export async function verifyToken(token) {
  if (!authConfigured() || typeof token !== "string") return false;
  const [exp, sig] = token.split(".");
  if (!/^\d+$/.test(exp || "") || Number(exp) < Date.now()) return false;
  return sameString(sig || "", await hmac(`v1.${exp}`));
}

export const cookieOptions = () => ({
  httpOnly: true, sameSite: "lax", path: "/", maxAge: MAX_AGE,
  secure: process.env.NODE_ENV === "production",
});

// Only send people back to a page on this site after signing in.
export const safeNext = n => (typeof n === "string" && n.startsWith("/") && !n.startsWith("//") && !n.startsWith("/\\") && !n.startsWith("/login") ? n : "/");
