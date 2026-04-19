"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Login failed. Check email and password.");
      return;
    }

    if (res?.ok) {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Login
      </h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Uses the Express backend at{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
          /auth/login
        </code>
        . Test user:{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
          test@test.com
        </code>{" "}
        /{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
          password123
        </code>
        .
      </p>
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            autoComplete="email"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
            autoComplete="current-password"
          />
        </label>
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="button"
          onClick={handleLogin}
          className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Login
        </button>
      </div>
      <p className="text-sm text-zinc-500">
        <Link href="/" className="underline hover:text-zinc-800 dark:hover:text-zinc-200">
          ← Home
        </Link>
      </p>
    </div>
  );
}
