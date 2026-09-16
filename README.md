# BPS EC Election-2026 — Nomination System

A pnpm monorepo with two Next.js apps sharing MongoDB models:

- `apps/web` — the public nomination form (replaces the Google Form)
- `apps/admin` — password-protected dashboard that lists every submitted response and exports CSV
- `packages/db` — Mongoose connection + the `Nomination` model + duplicate-check logic
- `packages/shared` — the position dropdown list, zod validation schema, ID normalization

## Duplicate-submission rules

A person can submit the form multiple times (e.g. once per position), but a submission is
rejected as `DUPLICATE` if any of these three values has already been used in an earlier
response, checked in this order:

1. **Nominated position** (`মনোনয়নকৃত পদের নামঃ`) — each position can only be nominated once,
   ever. → `"Nominated position already used"`
2. **Proposer membership ID** — a membership ID can only be used as a proposer once.
   → `"Proposer membership ID already used"`
3. **Supporter membership ID** — a membership ID can only be used as a supporter once.
   → `"Supporter membership ID already used"`

Membership ID comparisons are case/whitespace-insensitive (`p001` and `P001` collide).
This is implemented in `packages/db/src/checkDuplicate.ts`, checked before the file upload
happens, and backed by unique MongoDB indexes (`packages/db/src/models/Nomination.ts`) to
close the race-condition window between two near-simultaneous submissions.

Verified against your exact example sequence:

```
Submission 1: সভাপতি / P001 / S001        → PASS
Submission 2: সম্পাদক / P002 / S002        → PASS
Submission 3: সভাপতি / P003 / S003        → DUPLICATE — Nominated position already used
Submission 4: কোষাধ্যক্ষ / P001 / S004      → DUPLICATE — Proposer membership ID already used
```

## Setup

### 1. MongoDB

Create a free cluster at MongoDB Atlas (or run MongoDB locally/Docker) and get a connection
string.

### 2. Cloudinary (receipt file storage)

Create a free account at cloudinary.com, grab your Cloud Name, API Key, and API Secret from
the dashboard.

### 3. Environment variables

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/admin/.env.example apps/admin/.env.local
```

Fill in `apps/web/.env.local`:

```
MONGODB_URI=...
MONGODB_DB=bps_ec_election
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Fill in `apps/admin/.env.local` (use the **same** `MONGODB_URI`/`MONGODB_DB`):

```
MONGODB_URI=...
MONGODB_DB=bps_ec_election
ADMIN_PASSWORD=pick-a-strong-password
SESSION_SECRET=long-random-string   # e.g. openssl rand -hex 32
```

### 4. Install & run

```bash
pnpm install
pnpm dev:web     # http://localhost:3000  — public nomination form
pnpm dev:admin   # http://localhost:3001  — admin dashboard (login with ADMIN_PASSWORD)
```

## Editing the position list

Edit `packages/shared/src/positions.ts` — it's a single array, shown in the form's dropdown
in that order. I transcribed it from your screenshot; please double-check
`পরিচালক (বিষয়ক পরিবেশ আইন ও নীতি)` — the wording looked like it may have overlapped with
the row above in the screenshot capture.

## Deployment notes

- Deploy `apps/web` and `apps/admin` as two separate Vercel projects (or any Node host),
  each with its own env vars, both pointing at the same MongoDB database.
- `apps/admin` uses Edge middleware for the session check — no extra config needed on Vercel.
- The admin password is a single shared secret compared in constant time
  (`apps/admin/app/api/login/route.ts`). Rotate `SESSION_SECRET` to invalidate all sessions.
