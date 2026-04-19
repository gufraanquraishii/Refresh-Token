import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import { decodeJwtExpiryMs, decodeJwtPayload } from "@/lib/jwt-decode";

const authApiUrl = "http://localhost:4000";


async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const res = await fetch(`${authApiUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });

    const data = (await res.json()) as { accessToken?: string };

    if (!res.ok || !data.accessToken) {
      throw new Error("Refresh failed");
    }

    const newExp = decodeJwtExpiryMs(data.accessToken);
    return {
      ...token,
      accessToken: data.accessToken,
      accessTokenExpires: newExp,
      error: undefined,
    };
  } catch (e) {
    console.log("refreshAccessToken: ERROR", e);
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
        console.log("authorize: callback running", 
          "this is credentials:", credentials);
        if (!credentials?.email || !credentials?.password) return null;


        const res = await fetch(`${authApiUrl}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });
        console.log("authorize: callback running", 
          "this is res:", res);

        const data = (await res.json()) as {
          accessToken?: string;
          refreshToken?: string;
        };

        if (!res.ok || !data.accessToken || !data.refreshToken) { 
          return null;
        }

        const claims = decodeJwtPayload(data.accessToken);
        const id = claims.id != null ? String(claims.id) : "";
        const email =
          typeof claims.email === "string" ? claims.email : undefined;


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
      console.log("jwt: callback running", 
        "this is token:", token,
        "this is user:", user);
      if (user && "accessToken" in user && user.accessToken) {
        const expMs = decodeJwtExpiryMs(user.accessToken as string);

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
        return token;
      }

      const refreshedToken = await refreshAccessToken(token);
      console.log("jwt: callback returning: ACCESS TOKEN EXPIRED", 
        "this is new refreshed token:", refreshedToken);
      return refreshedToken;
    },
    async session({ session, token }) {
      console.log("session: callback running", 
        "this is session:", session,
        "this is token:", token);
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
      console.log("session: callback returning", 
        "this is session:", session);
      return session;
    },
  },
});
