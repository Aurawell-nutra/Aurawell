# Backend overview

Aaurawell runs as a single **Next.js 15 (App Router)** application written in JavaScript. The storefront, admin panel and API all live in one project — there is no separate Express server.

## Architecture

```text
Browser ──► Next.js pages (React Server Components)  ──┐
        └─► Route Handlers under /api/*  ───────────────┤
                                                        ▼
                                     src/lib/server/*  (business logic)
                                                        │
                    ┌───────────────┬───────────────────┼────────────────┐
                    ▼               ▼                   ▼                ▼
               PostgreSQL       Razorpay API       SMTP (Nodemailer)   uploads/ folder
               (Prisma)
```

| Layer | Location | Notes |
| --- | --- | --- |
| Storefront pages | `src/app/(store)` | Server components read products/reviews directly through `src/lib/catalog.js`. |
| Admin pages | `src/app/admin` | Served only on the admin host (see `src/middleware.js`). `(panel)/layout.jsx` requires an admin session for every page. |
| API routes | `src/app/api` | Thin handlers: validate → authorise → call `src/lib/server/*`. |
| Business logic | `src/lib/server` | Orders, payments, reviews, products, auth, email, validation, rate limiting. |
| Shared rules | `src/lib/pricing-rules.js`, `src/lib/constants.js` | Used by both server (authoritative) and client (display). |
| Database schema | `prisma/schema.prisma` | Migrations in `prisma/migrations`. |

Every module that touches secrets or the database starts with `import "server-only"`, so it can never be bundled into browser JavaScript.

## Customer flow (guest checkout — no customer accounts)

1. Customer adds products to the cart. The cart lives in `localStorage` and stores only display data plus `productId` and `quantity`.
2. Checkout **Details** step validates name, email, phone, address, city, state, PIN code and country.
3. **Review** step calls `POST /api/checkout/validate`. The server loads products from the database, checks they are active and in stock, and calculates the subtotal, shipping and total.
4. **Payment** step calls `POST /api/orders/create`. The server re-prices the cart, creates a `PENDING` order with item snapshots, and creates a Razorpay order for the server-calculated amount.
5. Razorpay Checkout opens in the browser. After payment, the browser calls `POST /api/payment/verify`.
6. The server verifies the signature, confirms the payment with Razorpay's API (order id, amount and currency), then marks the order `PAID` and deducts stock in one transaction.
7. Confirmation emails go to the customer and the store. An email failure never undoes a paid order.
8. `POST /api/payment/webhook` repeats step 6 if the browser closed before verification.

## Stock policy

Stock is **checked** when the order is created and **deducted only after payment is verified**, inside the same transaction that marks the order paid. It is not reserved at checkout.

* A conditional update (`stockQuantity >= quantity`) guarantees stock never goes negative.
* If two customers pay for the last unit at the same moment, the second order is still marked paid (their money was taken) but gets a `STOCK CONFLICT` internal note and a warning banner in the admin panel so staff can refund it.
* Cancelling a paid order in the admin panel returns its items to stock once.

## Local development

```bash
npm install                 # also runs `prisma generate`
cp .env.example .env        # then fill in DATABASE_URL and ADMIN_SESSION_SECRET at minimum
npx prisma migrate dev      # creates the tables
npm run db:seed             # imports the 4 Aaurawell products
npm run admin:create        # creates the first admin (uses ADMIN_SEED_* from .env)
npm run dev                 # store  → http://localhost:3000
npm run dev:admin           # admin  → http://localhost:3001  (run in a second terminal)
```

Other commands:

| Command | Purpose |
| --- | --- |
| `npm test` | Unit tests (no database needed) |
| `npm run test:integration` | API tests against the running dev server and database |
| `npm run db:studio` | Browse the database in Prisma Studio |
| `npm run build` / `npm start` | Production build and server |

## Production deployment

1. Provision PostgreSQL. Use a managed service with automated backups, or your own server.
2. Set every variable from `.env.example` in the hosting environment. Use **live** Razorpay keys, a new `ADMIN_SESSION_SECRET` and an `https://` `NEXT_PUBLIC_APP_URL`.
3. Run `npm ci`, `npx prisma migrate deploy` and `npm run build`, then `npm start` (store) and `npm run start:admin` (admin) — see [admin-panel.md](admin-panel.md) for the `admin.aaurawell.com` setup.
4. Serve over HTTPS only. Put the app behind a reverse proxy or platform that sets `X-Forwarded-For`.
5. Create the admin with `npm run admin:create`, then remove `ADMIN_SEED_PASSWORD` from the environment.
6. Configure the Razorpay webhook (see [payment.md](payment.md)).
7. Make sure the `uploads/` directory is on **persistent storage** (see [admin-panel.md](admin-panel.md)).
8. For more than one server instance, move rate limiting to Redis (see [security.md](security.md)).

## Backups

* Enable daily automated backups with point-in-time recovery on the database, and keep at least 7–30 days.
* Also take a manual `pg_dump` before every migration:
  `pg_dump --format=custom --file=aurawell-$(date +%F).dump "$DATABASE_URL"`
* Back up the `uploads/` directory together with the database. Uploaded image paths are stored in the database, so the two must match.
* Test a restore into a staging database regularly.
* Never store backups in a public bucket. Encrypt them at rest.

Related docs: [database](database.md) · [API](api.md) · [security](security.md) · [payments](payment.md) · [email](email.md) · [admin panel](admin-panel.md)
