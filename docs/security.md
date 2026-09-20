# Security

This document records the security decisions in the Aaurawell backend and what to review before and after launch.

## Input validation

* **Zod schemas for every input:** request bodies, route params and query strings are all validated with schemas in `src/lib/server/validation.js`.
* **Strict objects:** unknown fields are rejected, so a client can't sneak in `price`, `totalAmount`, `role` or `paymentStatus`.
* **Normalising and limits:** strings are trimmed and length-limited, and plain-text fields reject `<`, `>` and control characters. Emails are lower-cased, and phones are normalised to `+91XXXXXXXXXX`.
* **Body limits:** JSON bodies are size-limited and must be `application/json`.
* **Database access:** Prisma parameterises every query, and no raw SQL is built from user input.
* **Image paths:** images must match a local-path pattern (`/images/...` or `/api/media/<hex>.<ext>`). External URLs, `..` and unexpected extensions are rejected.

## Never trusting the browser

* **Checkout:** the browser sends only `productId` and `quantity`. The server reads prices, names, stock and active status from the database and calculates every total.
* **Payments:** an order becomes `PAID` only after three server-side checks:
  1. The HMAC signature is verified with the Razorpay secret, using a constant-time comparison.
  2. The Razorpay order id must belong to our order.
  3. The payment is fetched from Razorpay's API, and its amount and currency must match the stored total.
* **Browser failure reports:** `/api/payment/failed` can only move a `PENDING` order to `FAILED`.

## Admin authentication

* **Passwords:** hashed with bcrypt (cost 12). Unknown emails are compared against a dummy hash, so response timing doesn't reveal which emails exist.
* **Sessions:**
  * The cookie holds a random 256-bit token.
  * The database stores only its HMAC-SHA256 (keyed with `ADMIN_SESSION_SECRET`), so a database leak alone can't be used to sign in.
  * The cookie is `HttpOnly`, `SameSite=Strict`, `Secure` in production and `Path=/`.
  * Sessions expire after 8 hours, and logout deletes the session row.
  * Changing the password deletes all other sessions.
* **Authorisation:**
  * Admin pages check the session in `app/admin/(panel)/layout.jsx`, and every admin API calls `requireAdminApi()` again. Hiding pages is never relied on.
  * Deactivated admins (`isActive=false`) are rejected immediately.
* **Login errors:** every failure returns the same "Invalid email or password." message.
* **Brute force:** logins are limited to 10 per IP and 5 per email per 15 minutes.

## CSRF

* **Cookie:** `SameSite=Strict` session cookie.
* **Origin check:** state-changing requests must carry an `Origin`/`Referer` matching the host or `NEXT_PUBLIC_APP_URL`.
* **Token:** admin mutations also need the per-session CSRF token in `x-csrf-token`, compared in constant time.
* **Webhook exception:** the webhook is the only cross-origin POST, and it is authenticated by its HMAC signature instead.

## Rate limiting

`src/lib/server/rate-limit.js` is an in-memory fixed-window limiter:

| Action | Limit |
| --- | --- |
| Admin login | 10 / 15 min per IP, 5 / 15 min per email |
| Review submission | 5 / hour per IP (+ 1 per email per product per 30 days, honeypot field) |
| Checkout validate/create | 15 / 10 min per IP |
| Payment verify/failed | 30 / 10 min per IP |
| Order lookup | 20 / 10 min per IP |
| Contact form | 5 / hour per IP |
| Public product APIs | 120 / min per IP |
| Admin uploads | 30 / 10 min per admin |

**Production limitation:** the counters live in one Node.js process. They reset on restart and aren't shared across instances or serverless functions.

* **More than one instance:** replace the `buckets` Map with Redis (e.g. `INCR` + `PEXPIRE`), keeping the same `rateLimit()` signature.
* **Behind a proxy or CDN:** make sure `X-Forwarded-For` is set by your proxy and can't be forged by clients. Otherwise per-IP limits can be bypassed.

## File uploads

* **Allowed files:** JPG, PNG and WebP up to 2 MB. The type is decided from the **file's magic bytes** and must match both the declared MIME type and the extension.
* **Filenames:** the original filename is ignored, and a random 32-hex-character name is generated.
* **Storage:** files are saved in `uploads/products/`, **outside** `public/`, and served only by `/api/media/[file]`. That route accepts a strict filename pattern (no path traversal) and responds with `X-Content-Type-Options: nosniff` and `Content-Security-Policy: default-src 'none'; sandbox`.
* **No SVG:** SVG is not accepted, because it can contain script.

## Output safety

* **Reviews:** rendered as React text nodes. React escapes HTML, and `dangerouslySetInnerHTML` is never used.
* **Emails:** HTML emails escape every customer-supplied value, and the contact form sends plain text only.
* **Private fields:** public APIs never return customer emails from reviews, internal order notes, Razorpay signatures, checkout keys or password hashes.

## HTTP security headers (`next.config.mjs`)

* **Content-Security-Policy:**
  * `default-src 'self'`.
  * Scripts from `'self'`, inline (required by Next.js hydration) and `https://checkout.razorpay.com`.
  * Frames from `api.razorpay.com` and `checkout.razorpay.com`.
  * Connections to `api.razorpay.com` and `lumberjack.razorpay.com`.
  * Images from `'self'`, `data:`, `blob:` and `*.razorpay.com`.
  * `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`.
  * Development also allows `'unsafe-eval'` and websockets for hot reload.
* **Other headers:**
  * `X-Content-Type-Options: nosniff`
  * `Referrer-Policy: strict-origin-when-cross-origin`
  * `X-Frame-Options: DENY`
  * `Permissions-Policy`: camera, microphone and geolocation disabled; payment allowed for self and Razorpay.
  * `Strict-Transport-Security` (production only).
  * Admin pages: `Cache-Control: no-store` and `X-Robots-Tag: noindex`.

**Allowed external domains:** `checkout.razorpay.com`, `api.razorpay.com`, `lumberjack.razorpay.com`, `*.razorpay.com` (images). Fonts are self-hosted by `next/font`. If you add analytics or another service, add only its exact domains to the right CSP directive.

## Errors and logging

* **Responses:** production responses never include stack traces or database messages (`src/lib/server/http.js`).
* **Server logs:** `src/lib/server/logger.js` redacts keys that look like passwords, secrets, tokens, signatures, cookies or card/UPI data.
* **Never logged:** full request bodies and customer addresses.

## Secrets

* **`.env`:** git-ignored. `.env.example` contains placeholders only.
* **Browser exposure:** only `NEXT_PUBLIC_APP_URL` and the Razorpay **key id** reach the browser. `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, SMTP credentials and `ADMIN_SESSION_SECRET` stay on the server.
* **Rotating `ADMIN_SESSION_SECRET`:** this signs every admin out, which is expected.

## Pre-launch checklist

- [ ] Strong unique `ADMIN_SESSION_SECRET` (≥ 32 random chars) and live Razorpay keys in the host's secret manager
- [ ] `NEXT_PUBLIC_APP_URL` set to the real `https://` domain
- [ ] HTTPS enforced; reverse proxy sets `X-Forwarded-For`
- [ ] `ADMIN_SEED_PASSWORD` removed after creating the admin
- [ ] Razorpay webhook configured with its secret
- [ ] Rate limiter moved to Redis if running more than one instance
- [ ] Database backups enabled and a restore tested
- [ ] `npm audit` reviewed
- [ ] Policy pages reviewed by a legal/compliance advisor
