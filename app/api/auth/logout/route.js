import { COOKIE, cookieOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = Response.json({ ok: true });
  res.headers.append("Set-Cookie", `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${cookieOptions().secure ? "; Secure" : ""}`);
  return res;
}
