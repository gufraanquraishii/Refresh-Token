import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

export function AppNav() {
  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <nav
        className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-sm"
        aria-label="Main"
      >
        <Link
          href="/"
          className="font-medium text-zinc-900 hover:underline dark:text-zinc-50"
        >
          Home
        </Link>
        <span className="text-zinc-300 dark:text-zinc-600">|</span>
        <Link href="/login" className="text-zinc-700 hover:underline dark:text-zinc-300">
          Login
        </Link>
        <span className="text-zinc-300 dark:text-zinc-600">|</span>
        <Link
          href="/dashboard"
          className="text-zinc-700 hover:underline dark:text-zinc-300"
        >
          Dashboard
        </Link>
        <span className="text-zinc-300 dark:text-zinc-600">|</span>
        <Link
          href="/profile"
          className="text-zinc-700 hover:underline dark:text-zinc-300"
        >
          Profile
        </Link>
        <span className="text-zinc-300 dark:text-zinc-600">|</span>
        <Link
          href="/aliya"
          className="text-zinc-700 hover:underline dark:text-zinc-300"
        >
          Aliya
        </Link>
        <span className="text-zinc-300 dark:text-zinc-600">|</span> <Link
          href="/create-todo"
          className="text-zinc-700 hover:underline dark:text-zinc-300"
        >
          CreateTodo
        </Link>
        <span className="ml-auto flex items-center gap-2">
          <LogoutButton />
        </span>
      </nav>
    </header>
  );
}
