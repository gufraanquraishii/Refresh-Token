"use client";

import { getPublicApiBaseUrl } from "@/lib/api-base";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export function LogoutButton() {
  const { data: session } = useSession();
  const [busy, setBusy] = useState(false);

  const handleLogout = async () => {
    setBusy(true);
    try {
      const rt = session?.refreshToken;
      if (rt) {
        await fetch(`${getPublicApiBaseUrl()}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: rt }),
        });
      }
    } catch {
      // Still clear NextAuth session locally if API is down
    } finally {
      setBusy(false);
      await signOut({ callbackUrl: "/" });
    }
  };

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void handleLogout()}
      className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-800 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
    >
      {busy ? "Logging out…" : "Logout"}
    </button>
  );
}
