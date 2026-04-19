import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-16">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Auth practice
        </h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          Next.js + NextAuth (Auth.js v5) talking to your Express backend (
          <code className="rounded bg-zinc-100 px-1 text-sm dark:bg-zinc-800">
            /auth/login
          </code>
          ,{" "}
          <code className="rounded bg-zinc-100 px-1 text-sm dark:bg-zinc-800">
            /auth/refresh
          </code>
          ).
        </p>
      </div>
      <ul className="flex flex-col gap-3 text-zinc-800 dark:text-zinc-200">
        <li>
          <Link
            href="/login"
            className="font-medium text-blue-600 underline hover:text-blue-800 dark:text-blue-400"
          >
            Login
          </Link>
          <span className="text-zinc-500"> — sign in with credentials</span>
        </li>
        <li>
          <Link
            href="/dashboard"
            className="font-medium text-blue-600 underline hover:text-blue-800 dark:text-blue-400"
          >
            Dashboard
          </Link>
          <span className="text-zinc-500"> — server-protected page</span>
        </li>
        <li>
          <Link
            href="/profile"
            className="font-medium text-blue-600 underline hover:text-blue-800 dark:text-blue-400"
          >
            Profile
          </Link>
          <span className="text-zinc-500"> — full session JSON</span>
        </li>
      </ul>
      <p className="text-sm text-zinc-500">
        Start the API on port 4000, then run{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
          pnpm dev
        </code>{" "}
        here.
      </p>
    </div>
  );
}
