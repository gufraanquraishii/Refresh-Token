"use client";

import { getPublicApiBaseUrl } from "@/lib/api-base";
import { getSession, useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

async function fetchMe(accessToken: string) {
  const apiBase = getPublicApiBaseUrl();
  return fetch(`${apiBase}/user/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function DashboardUserMe() {
  const { data: session, status, update } = useSession();
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const [meta, setMeta] = useState<string | null>(null);

  const hasToken = !!session?.accessToken;
  const displayUser = hasToken ? user : null;

  const awaitingProfile =
    hasToken && !fetching && user === null && err === null;

  const loadUser = useCallback(async () => {
    const accessToken = session?.accessToken;
    if (!accessToken) return;

    setFetching(true);
    setErr(null);
    setMeta(null);

    try {
      let res = await fetchMe(accessToken);

      if (res.status === 401 || res.status === 403) {
        setMeta("Access token rejected → calling session update (refresh)…");
        await update();
        const fresh = await getSession();
        if (fresh?.accessToken) {
          res = await fetchMe(fresh.accessToken);
          if (res.ok) {
            setMeta("Retry after refresh succeeded.");
          }
        }
      }

      if (!res.ok) {
        const text = await res.text();
        const base = getPublicApiBaseUrl();
        const looksLikeHtml =
          text.trimStart().startsWith("<!DOCTYPE") || text.includes("<html");
        let hint = "";
        if (looksLikeHtml) {
          const hitNextDev =
            base.includes(":3000") || base === "" || !base.startsWith("http");
          hint = hitNextDev
            ? ` — Likely hit Next.js, not the API. Set NEXT_PUBLIC_API_URL=http://localhost:4000 in frontend/.env.local and restart next dev.`
            : ` — API returned HTML (often Express 404). Restart backend: pnpm --filter backend dev. Check ${base}/ returns JSON.`;
        }
        setErr(`${res.status} ${text.slice(0, 200)}${hint}`);
        setUser(null);
      } else {
        setUser((await res.json()) as Record<string, unknown>);
      }
    } finally {
      setFetching(false);
    }
  }, [session?.accessToken, update]);

  useEffect(() => {
    if (status === "loading" || !session?.accessToken) {
      return;
    }

    const timerId = window.setTimeout(() => {
      void loadUser();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [session?.accessToken, status, loadUser]);

  if (status === "loading" || awaitingProfile) {
    return (
      <section className="mt-10 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
          GET /user/me (protected)
        </h2>
        <p className="mt-2 text-sm text-zinc-500">Loading…</p>
      </section>
    );
  }

  if (!hasToken) {
    return (
      <section className="mt-10 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
          GET /user/me (protected)
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          No access token in session — sign in to load profile from the API.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-10 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
          GET /user/me (protected)
        </h2>
        <button
          type="button"
          disabled={fetching}
          onClick={() => void loadUser()}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {fetching ? "Fetching…" : "Fetch user"}
        </button>
      </div>
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
        Browser calls your API with{" "}
        <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">
          Authorization: Bearer &lt;accessToken&gt;
        </code>
        . If it returns 401/403, we call{" "}
        <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">
          update()
        </code>{" "}
        so NextAuth refreshes, then retry. Use{" "}
        <strong className="font-medium">Fetch user</strong> to run the request
        again.
      </p>
      {meta ? (
        <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">{meta}</p>
      ) : null}
      {err ? (
        <pre className="mt-3 overflow-x-auto rounded bg-red-50 p-3 text-xs text-red-800 dark:bg-red-950 dark:text-red-200">
          {err}
        </pre>
      ) : null}
      {displayUser ? (
        <pre className="mt-3 overflow-x-auto rounded bg-zinc-50 p-3 text-xs text-zinc-800 dark:bg-zinc-200">
          {JSON.stringify(displayUser, null, 2)}
        </pre>
      ) : !err ? (
        <p className="mt-2 text-sm text-zinc-500">No data.</p>
      ) : null}
    </section>
  );
}
