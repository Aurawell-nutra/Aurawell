# Aaurawell Nutra

Source for the Aaurawell Nutra wellness store.

* **`aurawell-store/`** — the Next.js application (storefront + admin panel + API). See [its README](aurawell-store/README.md) for setup, commands and documentation.
* **`IMG_*.PNG`, `WhatsApp Image *.jpeg`** — original product and design reference images.

## Deploying to Vercel

1. **Import this repository** at [vercel.com/new](https://vercel.com/new).
2. **Set Root Directory to `aurawell-store`** (Project Settings → General → Root Directory). Vercel then detects Next.js automatically.
3. **Database:** create a hosted PostgreSQL database (Vercel Postgres, Neon, Supabase…). A local `localhost` database will not work in production.
4. **Environment variables** (Project Settings → Environment Variables) — copy the names from [`aurawell-store/.env.example`](aurawell-store/.env.example):

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | hosted PostgreSQL connection string |
   | `NEXT_PUBLIC_APP_URL` | `https://aaurawell.com` |
   | `ADMIN_APP_URL` | `https://admin.aaurawell.com` |
   | `ADMIN_HOSTS` | `admin.aaurawell.com` |
   | `ADMIN_SESSION_SECRET` | a new random 48-byte string (do not reuse the local one) |
   | `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | live keys when going live |
   | `RAZORPAY_WEBHOOK_SECRET` | same secret you set on the Razorpay webhook |
   | `SMTP_*`, `ADMIN_NOTIFICATION_EMAIL` | email settings |

5. **Domains:** add both `aaurawell.com` and `admin.aaurawell.com` to the same Vercel project. The store and the admin panel are one deployment; `src/middleware.js` serves the admin panel only on the admin domain.
6. **Database migrations:** run them against the hosted database before or after the first deploy:
   `npx prisma migrate deploy` (with `DATABASE_URL` pointing at production), then `npm run db:seed` and `npm run admin:create` once.
7. **Razorpay webhook:** `https://aaurawell.com/api/payment/webhook`, events `payment.captured`, `order.paid`, `payment.failed`.

### Before going live

* **Sample reviews:** remove the placeholder reviews — `npm run db:seed:reviews -- --remove`.
* **Admin image uploads:** Vercel's filesystem is read-only, so uploads to `uploads/` fail there. Use the bundled `/images/...` paths, or switch the upload routes to object storage (S3, Cloudflare R2, Vercel Blob). See `docs/admin-panel.md`.
* **Rate limiting** is per-instance in memory; move it to Redis for serverless. See `docs/security.md`.
* **Policy pages** are placeholder text — have them reviewed.
