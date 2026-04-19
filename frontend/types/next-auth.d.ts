import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    /** Used client-side only to revoke this session on the API (logout). */
    refreshToken?: string;
    error?: string;
    /** Seconds until access JWT expires (computed when session is built). */
    accessTokenSecondsRemaining?: number;
    user: DefaultSession["user"] & { id?: string };
  }

  interface User {
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}
