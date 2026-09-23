import { COOKIE, authConfigured, checkLogin, makeToken, cookieOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req) {
  if (!authConfigured()) {
    return Response.json({ error: "Sign-in isn't set up yet. Add AUTH_ID and AUTH_PASSWORD in Vercel → Settings → Environment Variables, then redeploy." }, { status: 501 });
  }
  let body; try { body = await req.json(); } catch { return Response.json({ error: "Bad request." }, { status: 400 }); }
  if (!(await checkLogin(body?.id, body?.password))) {
    await new Promise(r => setTimeout(r, 800)); // slows down password guessing
    return Response.json({ error: "That ID or password is wrong." }, { status: 401 });
  }
  const res = Response.json({ ok: true });
  const o = cookieOptions();
  res.headers.append("Set-Cookie", `${COOKIE}=${await makeToken()}; Path=${o.path}; Max-Age=${o.maxAge}; HttpOnly; SameSite=Lax${o.secure ? "; Secure" : ""}`);
  return res;
}
