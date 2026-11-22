import { NextResponse, type NextRequest } from "next/server";

/*
 * Optimistic redirect only: without a session cookie, protected areas send the visitor to the
 * login page straight away. Security is enforced by the Data Access Layer (src/server/auth/session.ts)
 * in every page, layout and Server Action — never here.
 */
const SESSION_COOKIES = ["authjs.session-token", "__Secure-authjs.session-token"];

export function proxy(request: NextRequest) {
  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));
  if (hasSession) return NextResponse.next();
  const login = new URL("/connexion", request.url);
  login.searchParams.set("suivant", request.nextUrl.pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/compte/:path*", "/admin/:path*"],
};
