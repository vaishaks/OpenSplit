# OpenSplit

OpenSplit is a mobile-first group expense splitting app for roommates, trips, and events.

## Stack
- Next.js App Router + TypeScript
- Prisma + PostgreSQL
- Auth.js (Google OAuth)
- TanStack Query
- Zod validation

## Features in v1
- Google sign-in (plus optional test-mode credentials login)
- Create groups with single group currency
- Add expenses with split types: Even, Custom, Percentage, Shares
- Running net balances per group
- Suggested settle-up transfers
- Record manual settlement payments
- Invite members via reusable link or email-bound invite token

## Local setup
1. Install dependencies:
```bash
npm install
```
2. Copy env template:
```bash
cp .env.example .env.local
```
3. Fill `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and `AUTH_SECRET`.
4. Run migrations:
```bash
npx prisma migrate dev --name init
```
5. Start app:
```bash
npm run dev
```

## Test mode login for E2E
Set both values for local/e2e usage:
- `OPENSPLIT_TEST_MODE=true`
- `NEXT_PUBLIC_TEST_MODE=true`

Then use **Demo login** on the landing page.

## API routes
- `POST /api/groups`
- `GET /api/groups`
- `GET /api/groups/:groupId`
- `POST /api/groups/:groupId/invites`
- `POST /api/groups/join`
- `GET /api/groups/:groupId/expenses`
- `POST /api/groups/:groupId/expenses`
- `GET /api/groups/:groupId/balances`
- `GET /api/groups/:groupId/settlements`
- `POST /api/groups/:groupId/settlements`

## Vercel deployment
1. Create Postgres (Neon or Supabase Postgres).
2. Set env vars in Vercel:
- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `NEXTAUTH_URL`
3. Configure build command (default works):
```bash
npm run build
```
4. Run Prisma migrations on deploy:
```bash
npm run prisma:deploy
```

## CI
The repository includes a GitHub Actions workflow that runs type-check and tests.
