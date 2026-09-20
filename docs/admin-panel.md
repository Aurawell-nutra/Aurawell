# Admin panel

The admin panel runs as a **separate site**. It uses the same cream and green design as the store, isn't linked anywhere public, and is marked `noindex`.

| Environment | Store | Admin |
| --- | --- | --- |
| Development | `npm run dev` → http://localhost:3000 | `npm run dev:admin` → http://localhost:3001 (sign in at `/login`) |
| Production | `https://aaurawell.com` | `https://admin.aaurawell.com` |

## How the split works

Both sites come from the same codebase and build. `src/middleware.js` looks at the incoming host:

* **Admin host** (listed in `ADMIN_HOSTS`, or a process started with `APP_MODE=admin`):
  * Clean URLs such as `/products` are served from the internal `/admin/*` routes.
  * Storefront pages and public APIs return 404.
  * Responses are `no-store` and `noindex`.
* **Store host:**
  * `/admin/*` and `/api/admin/*` return **404**, so the panel doesn't exist on the public domain.

The admin session cookie is host-only, so it is only sent to the admin domain, never to the store.

## Production setup for admin.aaurawell.com

1. **DNS:** add an `A`/`CNAME` record for `admin.aaurawell.com` pointing to the same server as the store.
2. **Environment:**
   ```env
   NEXT_PUBLIC_APP_URL=https://aaurawell.com
   ADMIN_APP_URL=https://admin.aaurawell.com
   ADMIN_HOSTS=admin.aaurawell.com
   ```
3. **Run** — choose one option:
   * **One process for both domains:**
     * Run `npm start` with `APP_MODE` **unset**, so routing is decided by host.
     * Point both domains at port 3000 and keep the original `Host` header (nginx: `proxy_set_header Host $host;`).
     * Replace `npm start` with `npx next start -p 3000`, because the `start` script forces store mode.
   * **Separate processes** (recommended):
     * Run `npm start` (store, port 3000) and `npm run start:admin` (admin, port 3001, `ADMIN_PORT` to change) from the same build.
     * Proxy `aaurawell.com` → 3000 and `admin.aaurawell.com` → 3001.
4. Enable HTTPS on **both** domains.
5. **Optional hardening:** restrict `admin.aaurawell.com` by IP allow-list or VPN at the proxy or firewall.

Example nginx:

```nginx
server { server_name aaurawell.com;       location / { proxy_pass http://127.0.0.1:3000; proxy_set_header Host $host; proxy_set_header X-Forwarded-For $remote_addr; } }
server { server_name admin.aaurawell.com; location / { proxy_pass http://127.0.0.1:3001; proxy_set_header Host $host; proxy_set_header X-Forwarded-For $remote_addr; } }
```

## Creating the first admin

```env
# .env
ADMIN_SEED_NAME=Your Name
ADMIN_SEED_EMAIL=you@aaurawell.com
ADMIN_SEED_PASSWORD=a-Strong-Password-123   # 12+ chars, upper, lower, digit
```

```bash
npm run admin:create
```

Then **delete `ADMIN_SEED_PASSWORD` from `.env`**. Running the command again for the same email resets that admin's password and signs out their sessions, which is handy if you get locked out. Admins can change their own password in **Settings**.

To disable an admin, set `isActive = false` on the `AdminUser` row (Prisma Studio: `npm run db:studio`). Their sessions stop working immediately.

## Pages

| Page | What you can do |
| --- | --- |
| **Dashboard** `/` | Revenue (paid orders), order counts (total, paid, pending), products (total, active), pending reviews, low-stock alerts, recent orders and reviews. All figures come from database queries. |
| **Products** `/products` | List with price, stock, status and display order. **Add Product**. |
| **Add / edit product** | Name, slug (auto-generated), category, subtitle, tagline, short and full description, price and compare-at price (₹), stock, SKU, gummies per bottle, flavour, active/featured, display order, main/hero/gallery images (path or upload), ingredient rows, benefit icons, usage, warnings, storage, colour theme and script tagline. **Delete** removes products with no orders and **deactivates** products that have order history. |
| **Orders** `/orders` | Search by order number, customer name or email; filter by payment or order status; paginate. |
| **Order details** | Items (price snapshots), totals, customer and address, Razorpay order and payment ids, stock and email status. Move the status forward (Confirmed → Processing → Shipped → Delivered), cancel (restocks paid orders), mark refunded, and add internal notes. |
| **Reviews** `/reviews` | Filter by status or product, search, approve, reject, feature on the homepage (approved only), delete. |
| **Settings** `/settings` | Account info, change password, and which integrations are configured (booleans only — secrets are never shown). |

## Product images

* **Bundled images:** use paths like `/images/products/gut-comfort-gummy.webp`, i.e. files in `public/images/`.
* **Uploads:** JPG, PNG or WebP up to 2 MB. They are stored in `uploads/products/` with random names and served from `/api/media/<name>`.

`public/` is only served for files present at build time, which is why uploads live in `uploads/`.

**In production**, `uploads/` must be on persistent storage (a mounted volume). On ephemeral or serverless hosting, move uploads to object storage such as S3 or Cloudflare R2 by changing `src/app/api/admin/uploads/route.js` and `src/app/api/media/[file]/route.js`. Back up `uploads/` together with the database.

## Review moderation flow

1. A customer submits a review on a product page. It is saved as `PENDING` and isn't visible.
2. Admin opens **Reviews** (the dashboard shows the pending count) → **Approve** or **Reject**.
3. Approved reviews appear on the product page and count toward its star rating. **Feature on homepage** puts them first in the homepage "Loved by Many" section.
4. Rejecting a review hides it and removes featured status. **Delete** removes it permanently.

## Order handling flow

1. Paid orders arrive as `PAID` / `CONFIRMED`, and a notification email is sent to `ADMIN_NOTIFICATION_EMAIL`.
2. Pack the order → **Mark processing**. Hand it to the courier → **Mark shipped**. Delivered → **Mark delivered**.
3. For a refund: refund in Razorpay → **Mark refunded** → **Cancel order** if it won't ship.
4. Orders with a **stock conflict** banner were paid when stock had already run out. Check the internal notes and contact or refund the customer.
