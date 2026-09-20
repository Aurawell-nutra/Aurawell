# Aaurawell Nutra — Store

Premium wellness gummy store built with **Next.js 15 (App Router)**, **JavaScript**, **Tailwind CSS v4**, **PostgreSQL + Prisma**, **Razorpay** and **Nodemailer**.

* **Storefront:** home, shop, product pages with reviews, about, why us, contact, FAQ, policies, cart, 3-step guest checkout, order confirmation and order tracking.
* **Admin panel** (separate site: `localhost:3001` in development, `admin.aaurawell.com` in production): dashboard, product management with image upload, order management and review moderation.
* **No customer accounts:** checkout is guest-only by design.

## Quick start

Requires **Node.js 22+** and **PostgreSQL**.

```bash
npm install
cp .env.example .env          # fill in DATABASE_URL and ADMIN_SESSION_SECRET (minimum)
npx prisma migrate dev        # create tables
npm run db:seed               # import the 4 Aaurawell products
npm run admin:create          # create your admin (ADMIN_SEED_* in .env)
npm run dev                   # store
npm run dev:admin             # admin (second terminal)
```

* Store: http://localhost:3000
* Admin: http://localhost:3001

Add Razorpay test keys to take payments and SMTP settings to send emails — see the docs below.

| Command | Purpose |
| --- | --- |
| `npm run dev` / `npm run dev:admin` | Store (3000) / admin (3001) development servers |
| `npm run build` | Production build (one build serves both sites) |
| `npm start` / `npm run start:admin` | Production store / admin servers |
| `npm test` | Unit tests (validation, pricing, signatures, rate limiting, uploads) |
| `npm run test:integration` | API tests against the running dev server + database |
| `npx prisma migrate deploy` | Apply migrations in production |
| `npm run db:seed` / `npm run db:studio` | Seed products / browse data |

## Deploying to Vercel

The Next.js app is at the repository root, so Vercel detects it automatically — no Root Directory setting needed.

1. **Import the repository** at [vercel.com/new](https://vercel.com/new).
2. **Database:** use a hosted PostgreSQL (this project uses [Neon](https://neon.tech)). A `localhost` database is not reachable from Vercel.
3. **Environment variables** (Project Settings → Environment Variables) — names are in [`.env.example`](.env.example):

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | Neon pooled connection string |
   | `DATABASE_URL_UNPOOLED` | Neon direct connection string (migrations) |
   | `NEXT_PUBLIC_APP_URL` | `https://aaurawell.com` |
   | `ADMIN_APP_URL` | `https://admin.aaurawell.com` |
   | `ADMIN_HOSTS` | `admin.aaurawell.com` |
   | `ADMIN_SESSION_SECRET` | a new random 48-byte string (not the local one) |
   | `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET` | live keys when going live |
   | `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `SMTP_FROM_EMAIL` | Hostinger mailbox |
   | `ADMIN_NOTIFICATION_EMAIL` | where new-order alerts are sent |

   Do **not** set `ADMIN_SEED_*` in Vercel.
4. **Domains:** add `aaurawell.com` and `admin.aaurawell.com` to the same project. One deployment serves both; `src/middleware.js` decides by host.
5. **Prepare the database once**, with `DATABASE_URL` pointing at production:
   `npx prisma migrate deploy` → `npm run db:seed` → `npm run admin:create`.
6. **Razorpay webhook:** `https://aaurawell.com/api/payment/webhook` with events `payment.captured`, `order.paid`, `payment.failed`.

### Before going live

* **Sample reviews:** `npm run db:seed:reviews -- --remove`.
* **Admin image uploads** need a writable disk. Vercel's filesystem is read-only, so either keep using the bundled `/images/...` paths or move the upload routes to object storage (Vercel Blob, S3, R2). See [docs/admin-panel.md](docs/admin-panel.md).
* **Rate limiting** is in-process; move it to Redis for serverless. See [docs/security.md](docs/security.md).
* **Policy pages** are placeholder text — have them reviewed.
* **Rotate** every credential that has been shared or committed anywhere.

## Documentation

| Doc | Covers |
| --- | --- |
| [docs/backend.md](docs/backend.md) | Architecture, order flow, stock policy, local & production setup, backups |
| [docs/database.md](docs/database.md) | Schema, money handling, migrations, transactions |
| [docs/api.md](docs/api.md) | Every API route |
| [docs/security.md](docs/security.md) | Validation, auth, CSRF, rate limits, headers, pre-launch checklist |
| [docs/payment.md](docs/payment.md) | Razorpay setup, verification, webhooks, refunds |
| [docs/email.md](docs/email.md) | SMTP setup and order emails |
| [docs/admin-panel.md](docs/admin-panel.md) | Admin setup and daily use |

## Project structure

```text
design-reference/      original product photos and design reference images
prisma/                 schema.prisma, migrations/, seed.mjs
scripts/create-admin.mjs
public/images/          product photos, banners, decorative SVGs
uploads/products/       admin-uploaded images (git-ignored)
src/
  app/
    (store)/            storefront pages (Navbar + Footer layout)
    admin/              admin site pages (served on the admin host via src/middleware.js)
    api/                route handlers (public + admin)
  components/           home, shop, product, cart, checkout, contact, admin, layout, ui
  data/                 seed catalogue, FAQs, policies, site links
  lib/
    server/             db, auth, orders, payments, email, validation, rate limiting (server-only)
    catalog.js          storefront data access
    pricing-rules.js    shipping/total rules (shared)
tests/unit, tests/integration
docs/
```

## Editing content

* **Products, prices, stock, images, reviews:** use the admin panel.
* **FAQs, policies, contact details, navigation:** `src/data/faqs.js`, `src/data/policies.js`, `src/data/site.js`
* **Colours and fonts:** the `@theme` block in `src/app/globals.css`
