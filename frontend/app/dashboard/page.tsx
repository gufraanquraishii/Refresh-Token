import { auth } from "@/auth";
import { DashboardUserMe } from "@/components/dashboard-user-me";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const tokenPreview = session.accessToken
    ? `${session.accessToken.slice(0, 24)}…`
    : "—";

  const accessRemainingSec = session.accessTokenSecondsRemaining ?? null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Dashboard
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Protected route: you must be signed in to see this page.
      </p>
      {accessRemainingSec != null && accessRemainingSec > 60 ? (
        <aside className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          <strong className="font-medium">Long TTL on this access token ({accessRemainingSec}s left).</strong>{" "}
          Restarting Next.js does not mint a new token. If you set{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">ACCESS_TOKEN_EXPIRY=10s</code>{" "}
          on the API, click <strong>Logout</strong> and log in again (API must be restarted too).
        </aside>
      ) : null}
      <dl className="mt-8 space-y-4 text-sm">
        <div>
          <dt className="font-medium text-zinc-700 dark:text-zinc-300">User ID</dt>
          <dd className="mt-1 font-mono text-zinc-900 dark:text-zinc-100">
            {session.user.id ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-700 dark:text-zinc-300">Email</dt>
          <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
            {session.user.email ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-700 dark:text-zinc-300">
            Access token (preview)
          </dt>
          <dd className="mt-1 break-all font-mono text-xs text-zinc-800 dark:text-zinc-200">
            {tokenPreview}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-700 dark:text-zinc-300">
            Access JWT time left (from API token)
          </dt>
          <dd className="mt-1 font-mono text-zinc-900 dark:text-zinc-100">
            {accessRemainingSec != null ? `${accessRemainingSec}s` : "—"}
          </dd>
        </div>
        {session.error ? (
          <div>
            <dt className="font-medium text-red-700 dark:text-red-400">
              Session error
            </dt>
            <dd className="mt-1 text-red-600">{session.error}</dd>
          </div>
        ) : null}
      </dl>

      <DashboardUserMe />
    </div>
  );
}
