# Database

PostgreSQL, accessed only through **Prisma ORM** (`prisma/schema.prisma`). The application never builds raw SQL from user input.

## Setup (local PostgreSQL)

1. Create a database (for example with pgAdmin or `psql`): `CREATE DATABASE aurawell;`
2. In `.env`: `DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/aurawell?schema=public`
   URL-encode special characters in the password, e.g. `@` → `%40`.
3. Apply migrations and seed:

```bash
npx prisma migrate dev     # development: applies migrations (and creates new ones after schema edits)
npm run db:seed            # imports the 4 products from src/data/products.js (skips existing slugs)
```

In production use `npx prisma migrate deploy` (never `migrate dev`).

After editing `schema.prisma`: `npx prisma migrate dev --name describe-change`, then commit the generated migration.

## Money

All amounts are **integers in paise** (`₹599.00` → `59900`) to avoid floating-point errors. The admin form accepts rupees and the validation layer converts them. Storefront prices include GST, so `taxAmount` is `0` and exists for reporting.

## Models

| Model | Purpose | Key rules |
| --- | --- | --- |
| `AdminUser` | Staff who can use `/admin` | `email` unique · bcrypt `passwordHash` · `isActive` · `role` (`OWNER`/`ADMIN`) |
| `AdminSession` | Server-side sessions | Stores an HMAC of the token (never the token) + per-session CSRF token + `expiresAt` (8 h) |
| `Product` | Catalogue | unique `slug`, `name`, `sku` · `price > 0` · `compareAtPrice >= price` · `stockQuantity >= 0` · JSON `ingredients` / `benefits` · local image paths only |
| `Order` | Guest orders | unique `orderNumber`, `checkoutKey` (idempotency), `razorpayOrderId`, `razorpayPaymentId` · enums `PaymentStatus`, `OrderStatus`, `EmailStatus` · `stockDeducted` flag |
| `OrderItem` | Line items | **Snapshot** of name, SKU, image and unit price at purchase time; `productId` becomes `NULL` if the product is later deleted |
| `Review` | Product reviews | `rating` 1–5 · `status` `PENDING`/`APPROVED`/`REJECTED` · `isFeatured` · private `customerEmail` |
| `WebhookEvent` | Processed Razorpay webhook ids | Primary key = event id → duplicate deliveries are ignored |

Besides the Zod validation, PostgreSQL `CHECK` constraints enforce positive prices, non-negative stock, a valid compare-at price, positive quantities and ratings from 1 to 5. They are defined in the initial migration.

### Enums

* `PaymentStatus`: `PENDING → PAID` (only after server verification), `PENDING → FAILED`, `PAID → REFUNDED` (admin, after refunding in Razorpay).
* `OrderStatus`: `PENDING → CONFIRMED` (automatic on payment) `→ PROCESSING → SHIPPED → DELIVERED`, or `CANCELLED`. Allowed admin transitions live in `ORDER_TRANSITIONS` (`src/lib/server/validation.js`). Unpaid orders can only be cancelled.

## Transactions and concurrency

| Operation | Protection |
| --- | --- |
| Create order + items | Single nested `create` (atomic) |
| Mark paid + deduct stock | `$transaction`; conditional `updateMany` (`paymentStatus IN (PENDING, FAILED)`) so only one caller wins; guarded stock decrement (`stockQuantity >= qty`) |
| Duplicate checkout submits | Unique `checkoutKey` returns the existing pending order |
| Webhook retries | Unique `WebhookEvent.id` |
| Delete product with orders | `$transaction`: deactivates instead of deleting |
| Cancel paid order | `$transaction`: restocks once and clears `stockDeducted` |

## Useful queries

```bash
npm run db:studio   # visual browser at http://localhost:5555
```
