<div align="center">

<img src="apps/web/app/icon.svg" width="56" height="56" alt="Levera" />

# Levera

**From brute force to optimal — an AI DSA mentor that teaches you how to think.**

Levera walks you through the whole problem-solving journey — the naive approach, the improvement, the optimal — and explains *why* each step beats the one before it.

[![License: MIT](https://img.shields.io/badge/License-MIT-FF5A1F.svg)](LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=next.js)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![AI SDK](https://img.shields.io/badge/Vercel-AI%20SDK%20v7-000000)](https://sdk.vercel.ai)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)](https://prisma.io)
[![Turborepo](https://img.shields.io/badge/Turborepo-2-EF4444?logo=turborepo)](https://turbo.build)

</div>

---

## Table of contents

- [Why Levera](#why-levera)
- [Features](#features)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Database & migrations](#database--migrations)
- [Chrome extension](#chrome-extension)
- [Models & rate limits](#models--rate-limits)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Why Levera

Most AI assistants hand you the optimal solution and move on. You get an answer, not an understanding — and the next problem is just as hard.

Levera is built around a different premise: **the interesting part is the gap between approaches.** Why is the brute force O(n²)? What observation collapses it to O(n log n)? What does the hash map actually buy you? Every response names the insight that unlocks the next approach, so you can find it yourself next time.

---

## Features

### Three approaches, not one

Every new problem returns a **brute force → better → optimal** progression. Each approach carries its own explanation, time and space complexity, and a plain statement of why it improves on the previous one.

### Progressive hints

Stuck but don't want the answer? Turn on **hint mode** and reveal one clue at a time. Unlock state is stored per problem, per user, so you can close the tab and pick up where you left off instead of re-reading spoilers.

### Spaced-repetition review

Save any solved problem to your notebook and Levera schedules it for review. Rating a review sets the next interval:

| Rating | Next review |
|--------|-------------|
| Again  | 1 day       |
| Hard   | 2 days      |
| Good   | 5 days      |
| Easy   | 10 days     |

The problems page separates what's **due today** from what's upcoming.

### LeetCode Chrome extension

A Manifest V3 extension that reads the problem you're on at `leetcode.com/problems/*` and gets you an optimal-approach breakdown without leaving the page. Sign-in uses a device-code pairing flow, so your credentials never touch the extension.

### Seven languages

C++, Python, Java, JavaScript, TypeScript, Go, and Rust. Set a preferred language once and every solution comes back in it.

### Conversation-aware

Levera distinguishes a **new problem** (full structured breakdown) from a **follow-up** ("explain that in Python", "why is this O(n log n)?") and answers follow-ups conversationally instead of re-dumping the whole structure. Paste your own code and it switches to review mode: what works, the exact line that breaks, and an input that proves it.

### Also included

- **Persistent chat history** with search, pagination, and per-conversation delete
- **Model switching** across Groq and OpenAI from the chat input
- **Dry runs and pattern naming** — a small input walked through the algorithm, plus the general pattern it belongs to
- **Light and dark themes**, responsive down to 320px
- **Auth**: email + password, email OTP, and Google OAuth, with transactional email via Brevo

---

## Architecture

A [Turborepo](https://turbo.build) monorepo managed with pnpm workspaces.

```
levera/
├── apps/
│   ├── web/                    # Next.js 16 App Router — the main product
│   │   ├── app/
│   │   │   ├── api/            # Route handlers (chat, auth, problems, extension)
│   │   │   ├── auth/           # Sign-in, sign-up, OTP, password reset
│   │   │   ├── dashboard/      # Chat UI, history, chat components
│   │   │   └── problems/       # Saved-problem notebook + review
│   │   ├── components/         # Shared UI, landing page, problem views
│   │   ├── lib/
│   │   │   ├── ai/             # Model registry, provider routing, system prompt
│   │   │   ├── auth.ts         # better-auth server config
│   │   │   ├── rateLimit.ts    # Upstash limiters
│   │   │   └── review.ts       # Spaced-repetition intervals
│   │   ├── prisma/             # Schema + migrations
│   │   └── proxy.ts            # Middleware: session gating + rate limiting
│   └── extension/              # Manifest V3 Chrome extension (Vite + CRXJS)
│       └── src/
│           ├── background/     # Service worker — calls the Levera API
│           ├── content/        # LeetCode problem scraper
│           └── popup/          # React popup UI
└── packages/
    ├── ui/                     # Shared React components
    ├── eslint-config/          # Shared ESLint config
    └── typescript-config/      # Shared tsconfig bases
```

### Request flow

```
Browser / Extension
        │
        ▼
  proxy.ts  ─────────────  IP rate limit, session gate, redirects
        │
        ▼
  Route handler  ────────  Session check → per-user rate limit → Zod validation
        │
        ├──────────────►  Prisma / PostgreSQL   (chats, problems, hint progress)
        │
        └──────────────►  Vercel AI SDK  ──►  Groq / OpenAI
                                   │
                                   ▼
                          Streamed response
```

Auth-sensitive endpoints are limited by IP in the middleware; chat endpoints are limited per user inside the handler, since the user identity isn't known until the session resolves.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS v4, shadcn/ui, Base UI, Framer Motion |
| AI | Vercel AI SDK v7 — Groq + OpenAI providers |
| Auth | better-auth (email/password, email OTP, Google OAuth) |
| Database | PostgreSQL (Neon) via Prisma 7 with the `pg` adapter |
| Rate limiting | Upstash Redis + `@upstash/ratelimit` |
| Email | Brevo (OTP + password reset) |
| Logging | pino |
| Extension | Manifest V3, Vite, CRXJS |
| Monorepo | Turborepo + pnpm workspaces |

---

## Getting started

### Prerequisites

- **Node.js 18+**
- **pnpm 9** — `npm install -g pnpm`
- A **PostgreSQL** database ([Neon](https://neon.tech) works well — use the pooled endpoint)
- A **Groq API key** ([console.groq.com/keys](https://console.groq.com/keys)) — this is the only AI key you strictly need

### Setup

```bash
git clone https://github.com/shreeteja172/Levera.git
cd Levera
pnpm install
```

Create your env file from the documented template:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Fill in at minimum `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `GROQ_API_KEY`. Generate a secret with:

```bash
openssl rand -hex 32
```

Apply the database schema:

```bash
cd apps/web && pnpm exec prisma migrate deploy
```

Start the dev server from the repo root:

```bash
pnpm dev
```

The app runs at **http://localhost:3000**.

---

## Environment variables

All variables live in `apps/web/.env.local` for development. `apps/web/.env.example` documents every one with inline notes.

### Required

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string. Use the pooled endpoint in serverless, or you will exhaust connections. |
| `BETTER_AUTH_SECRET` | Signs sessions. Generate with `openssl rand -hex 32`. |
| `BETTER_AUTH_URL` | Base URL of this deployment. Password-reset links are built from it — a wrong value sends users to the wrong host. |
| `GROQ_API_KEY` | Backs the default model and is the fallback whenever an unsupported model is requested. |

### Required in production

| Variable | Purpose |
|----------|---------|
| `UPSTASH_REDIS_REST_URL` | Rate limiting. Without it the limiters no-op and every quota is effectively unlimited. |
| `UPSTASH_REDIS_REST_TOKEN` | — |
| `BREVO_API_KEY` | OTP codes and password-reset links. Misconfigured means users cannot log in at all. |
| `BREVO_SENDER_EMAIL` | Must be a verified Brevo sender. Configure SPF and DKIM or auth mail lands in spam. |

### Optional

| Variable | Purpose |
|----------|---------|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth. Register both the localhost and production callbacks at `/api/auth/callback/google`. |
| `OPENAI_API_KEY` | Enables the GPT-4o option. |
| `OPENROUTER_API_KEY` | OpenRouter models (OpenAI-compatible endpoint). |
| `ZHIPU_API_KEY` | Zhipu / GLM models (OpenAI-compatible endpoint). |
| `AI_GATEWAY_API_KEY` | Only if routing through the Vercel AI Gateway. Read implicitly by the AI SDK; not referenced in application code. |

> **Note:** `.env.local` and `.env.production` are gitignored. On Vercel, set every variable in the project dashboard — nothing carries over from the repo.

---

## Database & migrations

The schema lives in `apps/web/prisma/schema.prisma` and covers users and sessions, chat sessions and messages, saved problems with review scheduling, per-problem hint progress, and extension device codes.

```bash
cd apps/web

pnpm exec prisma migrate dev --name <description>   # create a migration in development
pnpm exec prisma migrate deploy                     # apply pending migrations (production)
pnpm exec prisma studio                             # browse data
```

> **Migrations are not applied automatically on deploy.** The build script only runs `prisma generate`. Run `prisma migrate deploy` against your production database as part of your release process, or a new model will typecheck locally and 500 in production.

---

## Chrome extension

```bash
cd apps/extension
pnpm dev        # watch build for local development
pnpm build      # production bundle into dist/
```

Load it in Chrome:

1. Open `chrome://extensions` and enable **Developer mode**
2. Click **Load unpacked** and select `apps/extension/dist`
3. Open any problem at `leetcode.com/problems/*` and click the Levera icon

Point the extension at your API with `VITE_API_URL` — `apps/extension/.env` for local (`http://localhost:3000`), `.env.production` for the deployed URL.

**Sign-in flow:** the extension requests a device code, you approve it in the browser at `/auth/extension`, and it exchanges the code for a session token. Credentials are never entered into the extension itself.

---

## Models & rate limits

Configured in `apps/web/lib/ai/model-list.ts`. The chat input defaults to GPT-4o; any unsupported or unconfigured model falls back to Groq GPT OSS 120B.

| Model | Provider | Tier |
|-------|----------|------|
| GPT-4o | OpenAI | Premium |
| GPT OSS 120B | Groq | Standard |
| GPT OSS 20B | Groq | Standard |
| Qwen3.6 27B | Groq | Standard |

Limits are enforced with Upstash Redis (`apps/web/lib/rateLimit.ts`):

| Scope | Limit | Keyed by |
|-------|-------|----------|
| Chat messages | 10 / minute | user |
| Chat messages | 80 / day | user |
| Premium models | 25 / day | user |
| Auth endpoints | 5 / minute | IP |
| Page requests | 120 / minute | IP |

Limiter failures fail **open** — a Redis outage degrades quotas rather than taking chat down.

---

## Scripts

Run from the repo root; Turborepo fans them out across every workspace.

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Start all apps in development |
| `pnpm build` | Production build of every app |
| `pnpm lint` | ESLint across the monorepo |
| `pnpm check-types` | `tsc --noEmit` across the monorepo |
| `pnpm format` | Prettier over all `.ts`, `.tsx`, `.md` |

> `build` and `check-types` both run `prisma generate`. Running them concurrently on Windows can collide over the generated client — run them one at a time.

---

## Deployment

The web app deploys to Vercel with no extra configuration; the root `pnpm build` drives the Turborepo pipeline.

Before your first deploy:

1. Set every required environment variable in the Vercel dashboard
2. Point `BETTER_AUTH_URL` at your production domain
3. Add the production Google OAuth callback (`https://your-domain.com/api/auth/callback/google`)
4. Verify your Brevo sender domain, including SPF and DKIM
5. Run `prisma migrate deploy` against the production database

---

## Roadmap

Not yet built — contributions welcome:

- Interactive algorithm visualizations (BFS, DFS, sorting, DP tables)
- Step-through dry-run player with variable and pointer state
- Interview mode — the AI withholds the optimal solution and probes your reasoning
- Automatic edge-case generation
- Export solutions to Markdown, PDF, and shareable links
- Progress analytics and personalised learning paths
- Company-specific interview preparation tracks
- Voice explanations

---

## Contributing

Issues and pull requests are welcome — bug fixes, new visualizations, prompt improvements, or feature ideas.

Before opening a PR:

```bash
pnpm check-types
pnpm build
```

---

## License

MIT — see [LICENSE](LICENSE).

<div align="center">

**Learn. Understand. Optimize.**

If Levera taught you something, consider leaving a ⭐

</div>
