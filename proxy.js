// Runs before every page and API request. Without a valid sign-in cookie, pages redirect to /login
// and API or data requests get a 401.
import { NextResponse } from "next/server";
import { COOKIE, verifyToken, safeNext } from "@/lib/auth";

export async function proxy(req) {
  const { pathname, search } = req.nextUrl;
  const signedIn = await verifyToken(req.cookies.get(COOKIE)?.value);

  if (pathname === "/login") {
    return signedIn ? NextResponse.redirect(new URL(safeNext(req.nextUrl.searchParams.get("next")), req.url)) : NextResponse.next();
  }
  if (signedIn) return NextResponse.next();

  if (pathname.startsWith("/api/") || /\.[a-z0-9]+$/i.test(pathname)) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }
  const url = new URL("/login", req.url);
  if (pathname !== "/") url.searchParams.set("next", pathname + search);
  const res = NextResponse.redirect(url);
  if (req.cookies.has(COOKIE)) res.cookies.delete(COOKIE); // expired or from an old password
  return res;
}

export const config = {
  // Everything except the sign-in API, Next.js build files and the site icons.
  matcher: ["/((?!api/auth/|_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png).*)"],
};
