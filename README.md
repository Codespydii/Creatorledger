# Caelo

**The financial OS for creators.** Track sponsorships, send invoices, scan receipts, forecast cash flow, and analyze contracts with AI — built for creators on every platform.

> Status: **beta**. Free during beta, no credit card. Built solo, in public.

---

## What it does

| Area | What you can do |
|---|---|
| **Income** | Log AdSense, sponsorships, affiliate, brand deals, merch. Auto-sync YouTube AdSense daily once you connect your channel. |
| **Expenses** | Manual entry or snap a receipt photo — AI extracts vendor, amount, date, and tax category in seconds. |
| **Invoices** | Branded printable invoices with auto-reminders. Stripe payment links optional. |
| **Brand Deals** | Drag-and-drop pipeline from prospect to paid. Paste a sponsorship email — AI drafts the deal for you. |
| **Contracts** | Drop a PDF — AI flags risky clauses, missing protections, and below-market rates in ~15 seconds. |
| **Forecast** | 90-day cash flow projection based on confirmed deals + recurring revenue. |
| **Rate Benchmarks** | Anonymized rates from other creators in your niche & size. Score every offer before you respond. |
| **Media Kit** | Auto-filled from your YouTube channel stats. Public shareable page at `/m/your-slug`. |
| **Reports** | Period filter (month / quarter / year / custom) with CSV export. |

### Currency support

Pick from **USD, GBP, EUR, CAD, AUD, INR** in Settings. Every monetary display flips to your chosen symbol. No FX conversion in v1 — display layer only.

---

## Tech stack

- **Framework:** Next.js 16.2 (App Router, Turbopack), React 19, TypeScript
- **Database:** PostgreSQL via Supabase, Prisma 7 with `@prisma/adapter-pg`
- **Auth:** JWT sessions (`jose`) in HttpOnly cookies, bcrypt password hashing, Google Sign-In OAuth
- **AI:** Google Gemini 2.5 Flash for contract analysis, receipt OCR, email-to-deal extraction
- **Email:** Resend (transactional + reminders)
- **Payments:** Stripe payment links (per-creator key, Connect deferred)
- **Styling:** Tailwind CSS v4, Lucide icons, Recharts
- **Crypto:** AES-256-GCM at-rest encryption for OAuth refresh tokens and Stripe keys

---

## Local setup

### 1. Clone & install

```bash
git clone https://github.com/Codespydii/Creatorledger.git
cd Creatorledger
npm install
```

### 2. Environment variables

Create `.env.local` in the project root:

```env
# Required
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
SESSION_SECRET="<at least 32 random characters>"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# AI features (free tier at https://aistudio.google.com/apikey)
GEMINI_API_KEY="<your gemini key>"
GEMINI_MODEL="gemini-2.5-flash"  # optional, defaults to flash

# Google OAuth — for Sign-in and YouTube sync
GOOGLE_OAUTH_CLIENT_ID=""
GOOGLE_OAUTH_CLIENT_SECRET=""
GOOGLE_OAUTH_REDIRECT_URI="http://localhost:3000/api/oauth/youtube/callback"
GOOGLE_SIGNIN_REDIRECT_URI="http://localhost:3000/api/oauth/google/callback"

# Email (https://resend.com) — required for verification + welcome + password reset + invoice reminders
# RESEND_FROM_EMAIL must be an address on a domain verified in Resend. Defaults to noreply@usecaelo.com.
# SUPPORT_EMAIL is the reply-to for system mail + the public contact address. Defaults to support@usecaelo.com.
# It must be able to RECEIVE mail (set up a Hostinger mailbox or forwarder) — Resend only sends.
RESEND_API_KEY=""
RESEND_FROM_EMAIL="noreply@usecaelo.com"
SUPPORT_EMAIL="support@usecaelo.com"

# Cron auth (any random string; required by Vercel cron routes)
CRON_SECRET="<random string>"

# Rate limiting — REQUIRED in production (https://upstash.com — free tier covers beta)
# In dev, leave blank for an in-memory fallback that warns loudly.
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# Error monitoring — optional (https://sentry.io — free tier)
# Server-side DSN
SENTRY_DSN=""
# Client-side DSN (usually same as SENTRY_DSN)
NEXT_PUBLIC_SENTRY_DSN=""
# Optional: source-map upload during build
SENTRY_ORG=""
SENTRY_PROJECT=""
SENTRY_AUTH_TOKEN=""
```

### 3. Database

```bash
npm run db:push      # creates tables in your Supabase Postgres
npm run db:generate  # generates the Prisma client
```

### 4. Run

```bash
npm run dev
```

Open http://localhost:3000.

---

## Project structure

```
src/
├── app/
│   ├── (auth)/              login, signup, onboarding, password reset
│   ├── (dashboard)/         all authenticated app routes
│   ├── actions/             server actions (auth, revenue, invoices, …)
│   ├── api/
│   │   ├── cron/            reminders, youtube-sync (called by Vercel cron)
│   │   └── oauth/           google/start, google/callback, youtube/start, youtube/callback
│   ├── invoices/[id]/       printable invoice view
│   ├── legal/               terms, privacy
│   ├── m/[slug]/            public media-kit pages
│   └── page.tsx             landing
├── components/
│   ├── features/            feature-specific UI (deals, invoices, contracts, …)
│   ├── shared/              sidebar, topbar, theme toggle, banners
│   └── ui/                  primitives (Button, Input, Card, Select)
├── lib/
│   ├── currencies.ts        supported currencies + symbol lookup
│   ├── db.ts                Prisma client
│   ├── session.ts           JWT session helpers
│   ├── crypto-seal.ts       AES-256-GCM for tokens at rest
│   ├── gemini.ts            Gemini API client
│   ├── google-signin.ts     id_token verification via JWKS
│   ├── youtube.ts           OAuth + Analytics API + monthly revenue sync
│   ├── stripe.ts            Stripe payment link generation
│   ├── forecast.ts          90-day cash flow projection
│   ├── benchmarks-*.ts      rate benchmark seeding + stats
│   └── …
└── generated/prisma/        Prisma client output (committed for convenience)

prisma/
└── schema.prisma            data model

scripts/
├── e2e-signup.ts            end-to-end signup flow test
└── e2e-currency.ts          end-to-end currency switching test
```

---

## Available scripts

```bash
npm run dev          # start dev server (port 3000)
npm run build        # production build
npm run start        # run production build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run db:push      # push schema changes (no migration files)
npm run db:generate  # regenerate Prisma client
npm run db:migrate   # create a migration (if you switch off db:push)
npm run db:studio    # open Prisma Studio at localhost:5555
```

### End-to-end tests

```bash
# Both require the dev server to be running on localhost:3000.
npx tsx scripts/e2e-signup.ts    # signup → onboarding → dashboard flow
npx tsx scripts/e2e-currency.ts  # currency switching across all pages
```

---

## Cron jobs (Vercel)

Defined in `vercel.json`:

- `0 9 * * *` UTC → `/api/cron/reminders` — sends overdue-invoice reminder emails
- `0 4 * * *` UTC → `/api/cron/youtube-sync` — syncs AdSense revenue for every connected channel

Both routes require `Authorization: Bearer ${CRON_SECRET}` header.

---

## Roadmap

What's shipped is genuinely usable for solo creators in any of the 6 supported currencies. What's **not** in v1:

- **Multi-currency per row** — currently every display follows the user's single setting, no FX
- **EU VAT / Indian GST compliance** — flat tax % only
- **Stripe Connect** — payment links use the creator's own Stripe account key, not full Connect onboarding
- **Public invoice share links** — invoice page requires login
- **Server-rendered PDF download** — currently uses browser print-to-PDF
- **CSV bulk import** — for catching up months of historical data
- **Mobile-native experience** — responsive web only, no PWA install

See [persona walkthrough findings] in commit history for the full list of known gaps.

---

## Deploy to Vercel

1. **Push to GitHub** (already done — this repo).
2. Go to https://vercel.com/new and import `Codespydii/Creatorledger`.
3. Vercel auto-detects Next.js. **Framework Preset:** Next.js. **Build Command:** `next build` (default). **Install Command:** `npm install` (default).
4. Add all environment variables from `.env.local` to **Project Settings → Environment Variables**. At minimum: `DATABASE_URL`, `SESSION_SECRET`, `GEMINI_API_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CRON_SECRET`, `NEXT_PUBLIC_APP_URL` (set to your Vercel URL or custom domain), plus Google OAuth + Upstash if using.
5. Click **Deploy**. First build takes ~3 minutes.
6. After deploy:
   - Update `NEXT_PUBLIC_APP_URL` to the production URL and redeploy.
   - Update `GOOGLE_OAUTH_REDIRECT_URI` + `GOOGLE_SIGNIN_REDIRECT_URI` to use the production domain, and add those URIs in Google Cloud Console → Credentials → OAuth Client ID → Authorized redirect URIs.
   - In Resend, verify your sending domain (otherwise emails go to spam).
7. **Cron jobs** in `vercel.json` are automatically registered on deploy. Verify them under **Project → Cron Jobs**.

## Security notes

- Passwords are bcrypt-hashed (cost 12).
- Sessions are JWT-signed (HS256) and stored in HttpOnly cookies.
- OAuth refresh tokens and Stripe keys are encrypted at rest with AES-256-GCM (key derived from `SESSION_SECRET`).
- Gemini API key is sent in the `x-goog-api-key` header — never in URLs or access logs.
- Cron endpoints require a header-only bearer secret (no query-string variant).
- File uploads (contract PDFs, receipts) are validated by magic bytes, not just MIME type.

## License

Currently unlicensed. Will pick a license before public launch. Don't redistribute yet.

## Contact

Solo-built. For bugs, feedback, licensing, or anything else: **mahipalsinghrajput476@gmail.com**.

After signup, the welcome email is from the same address — replies go straight to the founder.
