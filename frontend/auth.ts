import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import { decodeJwtExpiryMs, decodeJwtPayload } from "@/lib/jwt-decode";

const authApiUrl = process.env.AUTH_API_URL ?? "http://localhost:4000";

/** Set AUTH_DEBUG=false in .env.local to turn off auth logs. */
const authDebug = process.env.AUTH_DEBUG !== "false";

/** Noisy: log every "access token still valid". Set AUTH_DEBUG_VERBOSE=true to enable. */
const authDebugVerbose =
  authDebug && process.env.AUTH_DEBUG_VERBOSE === "true";

function logAuth(...args: unknown[]) {
  if (authDebug) console.log("[next-auth]", ...args);
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  logAuth("↻ REFRESHING access token — POST /auth/refresh");
  try {
    const res = await fetch(`${authApiUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });

    const data = (await res.json()) as { accessToken?: string };

    if (!res.ok || !data.accessToken) {
      logAuth(
        "refreshAccessToken: failed",
        "status=",
        res.status,
        "body=",
        data
      );
      throw new Error("Refresh failed");
    }

    const newExp = decodeJwtExpiryMs(data.accessToken);
    logAuth(
      "refreshAccessToken: OK — new access token, expiresAt(ms)=",
      newExp,
      "in ~",
      Math.round((newExp - Date.now()) / 1000),
      "s"
    );

    return {
      ...token,
      accessToken: data.accessToken,
      accessTokenExpires: newExp,
      error: undefined,
    };
  } catch (e) {
    logAuth("refreshAccessToken: ERROR", e);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        logAuth("authorize: POST /auth/login for", credentials.email);

        const res = await fetch(`${authApiUrl}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        const data = (await res.json()) as {
          accessToken?: string;
          refreshToken?: string;
        };

        if (!res.ok || !data.accessToken || !data.refreshToken) {
          logAuth("authorize: login failed", "status=", res.status, data);
          return null;
        }

        const claims = decodeJwtPayload(data.accessToken);
        const id = claims.id != null ? String(claims.id) : "";
        const email =
          typeof claims.email === "string" ? claims.email : undefined;

        logAuth(
          "authorize: OK — tokens received, access exp(ms)=",
          decodeJwtExpiryMs(data.accessToken)
        );

        return {
          id,
          email,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user && "accessToken" in user && user.accessToken) {
        const expMs = decodeJwtExpiryMs(user.accessToken as string);
        logAuth(
          "jwt: initial sign-in — accessTokenExpires(ms)=",
          expMs,
          "(~",
          Math.round((expMs - Date.now()) / 1000),
          "s from now)"
        );
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: expMs,
          sub: user.id != null ? String(user.id) : token.sub,
          email: user.email ?? token.email,
        };
      }

      const now = Date.now();
      const exp =
        typeof token.accessTokenExpires === "number"
          ? token.accessTokenExpires
          : null;

      if (exp !== null && now < exp) {
        if (authDebugVerbose) {
          logAuth(
            "jwt: access token still valid — now=",
            now,
            "expires=",
            exp,
            "remaining(s)=",
            Math.round((exp - now) / 1000)
          );
        }
        return token;
      }

      logAuth(
        "jwt: access token expired or missing expiry — refreshing. now=",
        now,
        "exp=",
        exp
      );
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.sub) session.user.id = token.sub;
        if (token.email) session.user.email = token.email as string;
      }
      session.accessToken = token.accessToken as string | undefined;
      session.refreshToken = token.refreshToken as string | undefined;
      session.error = token.error as string | undefined;
      const exp = token.accessTokenExpires;
      if (typeof exp === "number") {
        session.accessTokenSecondsRemaining = Math.max(
          0,
          Math.round((exp - Date.now()) / 1000)
        );
      } else {
        session.accessTokenSecondsRemaining = undefined;
      }
      if (authDebug && session.error) {
        logAuth("session callback — Refresh/session error:", session.error);
      }
      return session;
    },
  },
});
