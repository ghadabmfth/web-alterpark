import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/modules/auth/schemas";
import { verifyCredentials } from "@/modules/auth/service";
import { requestFingerprint } from "@/server/security/request";
import { consumeRateLimit, RATE_LIMITS } from "@/server/security/rate-limit";
import { hashToken, normalizeEmail } from "@/modules/auth/tokens";

/*
 * Auth.js v5 (ADR-008): e-mail + password, JWT session in an encrypted HttpOnly cookie.
 * The JWT carries only the user id and its sessionVersion; authorisation always reloads the user
 * from the database (src/server/auth/session.ts), so revocation is immediate.
 * Rate limiting lives in `authorize`, which every sign-in path goes through — the login Server
 * Action AND Auth.js's own /api/auth/callback/credentials endpoint.
 */

/** Signals rate limiting to the login action (shown as « Trop de tentatives »). */
export class RateLimited extends CredentialsSignin {
  override code = "rate_limited";
}

declare module "next-auth" {
  interface User {
    sessionVersion?: number;
  }
  interface Session {
    sv?: number;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    sv?: number;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  // A wrong password is an expected outcome (audit-logged, rate-limited), not an application error:
  // keep error logs for real failures only.
  logger: {
    error(error) {
      // `type` survives minification (class names do not); RateLimited inherits it.
      if ((error as { type?: string }).type === "CredentialsSignin") return;
      console.error("[auth]", error);
    },
  },
  session: { strategy: "jwt", maxAge: 7 * 24 * 3600, updateAge: 24 * 3600 },
  pages: { signIn: "/connexion" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const meta = await requestFingerprint();
        const [byIp, byAccount] = await Promise.all([
          consumeRateLimit(RATE_LIMITS.loginIp, meta.ipHash),
          consumeRateLimit(RATE_LIMITS.loginAccount, hashToken(normalizeEmail(parsed.data.email))),
        ]);
        if (!byIp.allowed || !byAccount.allowed) throw new RateLimited();
        const user = await verifyCredentials(parsed.data.email, parsed.data.password, meta);
        return user ? { id: user.id, sessionVersion: user.sessionVersion } : null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
        token.sv = user.sessionVersion ?? 0;
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user = { ...session.user, id: token.sub };
      session.sv = token.sv;
      return session;
    },
  },
});
