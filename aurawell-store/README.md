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
