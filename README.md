# Refresh Token practice

Monorepo: **Express + MongoDB** API (access/refresh JWTs) and **Next.js** frontend with **NextAuth (Auth.js) v5** credentials flow.

## Prerequisites

- **Node.js** (LTS recommended)
- **pnpm** — version pinned in root `package.json` (`packageManager` field). Install: `npm install -g pnpm`
- **MongoDB** — local or Atlas URI

## Install

From the repo root:

```bash
pnpm install
```

This installs `backend/` and `frontend/` workspace packages.

## Environment variables

### Backend — `backend/.env`

Copy the example and edit:

```bash
cp backend/.env.example backend/.env
```

On Windows (PowerShell), you can copy manually: `copy backend\.env.example backend\.env`

| Variable | Purpose |
|----------|---------|
| `PORT` | API port (default `4000`) |
| `MONGO_URI` | MongoDB connection string (include database name in the path) |
| `ACCESS_TOKEN_SECRET` / `REFRESH_TOKEN_SECRET` | JWT signing secrets (use long random strings in production) |
| `ACCESS_TOKEN_EXPIRY` / `REFRESH_TOKEN_EXPIRY` | e.g. `10s` / `7d` |

The server loads **`backend/.env`** by path so it works even when you start the process from the monorepo root.

### Frontend — `frontend/.env.local`

Copy the example and fill **`AUTH_SECRET`** (e.g. `openssl rand -base64 32`):

```bash
cp frontend/.env.example frontend/.env.local
```

| Variable | Purpose |
|----------|---------|
| `AUTH_SECRET` | NextAuth secret — **required** |
| `AUTH_URL` | App origin, e.g. `http://localhost:3000` |
| `AUTH_API_URL` | Server-side calls to Express — e.g. `http://localhost:4000` |
| `NEXT_PUBLIC_API_URL` | Browser calls to Express (dashboard `/user/me`, etc.) |

Optional: `AUTH_DEBUG=false` to quiet logs; `AUTH_DEBUG_VERBOSE=true` for noisy token-valid logs.

## Seed data (optional)

Creates `test@test.com` / `password123` if missing (see `backend/src/scripts/seed.js`):

```bash
pnpm --filter backend seed
```

## Run in development

Use **two terminals**, both from the **repo root**.

**1 — API (port 4000)**

```bash
pnpm --filter backend dev
```

**2 — Next.js (port 3000)**

```bash
pnpm --filter frontend dev
```

Open [http://localhost:3000](http://localhost:3000). Log in against the API; protected pages use the access token via NextAuth session.

## Build / production checks

```bash
pnpm --filter frontend build
pnpm --filter frontend start
```

Run the backend with `pnpm --filter backend start` (or your process manager). Set the same env vars on the server; use HTTPS and secure secrets in production.

## Repo layout

| Path | Role |
|------|------|
| `backend/` | Express routes: `/auth/login`, `/auth/refresh`, `/auth/logout`, `/user/me` |
| `frontend/` | Next.js App Router, NextAuth route at `app/api/auth/[...nextauth]/` |

## Push to GitHub

Do not commit secrets. Root `.gitignore` excludes `node_modules` and env files; keep it that way. Then:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin git@github.com:gufraanquraishii/Refresh-Token.git
git branch -M main
git push -u origin main
```

Replace the remote URL if you use a different account or repo name.
