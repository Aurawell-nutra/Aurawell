# API reference

All endpoints return JSON. Errors always use this shape:

```json
{ "error": "Human-readable safe message", "fields": { "email": "Enter a valid email" } }
```

`fields` is present only for validation errors. Stack traces and database errors are never returned.

**Conventions**

* **Money:** amounts in responses are integers in paise, except `/api/products`, which returns storefront-shaped products with rupee `price` / `mrp`.
* **Origin check:** every `POST`/`PATCH`/`DELETE` except the webhook must come from this site's origin (checked with the `Origin`/`Referer` header).
* **Request bodies:** they must be `application/json`, stay under the size limit, and contain only the documented fields. Unknown fields are rejected.
* **Rate limits:** exceeding one returns `429` with a `Retry-After` header.

## Public

| Method | Path | Body | Notes |
| --- | --- | --- | --- |
| GET | `/api/products` | — | Active products with approved-review rating. |
| GET | `/api/products/[slug]` | — | 404 for unknown or inactive products. |
| GET | `/api/products/[slug]/reviews` | — | Approved reviews only; no emails. |
| POST | `/api/products/[slug]/reviews` | `{ customerName, customerEmail, rating, title?, comment, website? }` | Creates a `PENDING` review. `website` is a honeypot. 5/hour per IP; one review per email per product per 30 days (409). |
| POST | `/api/checkout/validate` | `{ items: [{ productId, quantity }] }` | Returns server prices: `lines`, `subtotal`, `shippingAmount`, `totalAmount`… 409 with `problems[]` for unavailable/out-of-stock items. |
| POST | `/api/orders/create` | `{ customer, items, checkoutKey }` | Creates a `PENDING` order + Razorpay order. Returns `{ orderNumber, razorpayOrderId, amount, currency, keyId, customer }`. Same `checkoutKey` → same order (idempotent). |
| POST | `/api/orders/lookup` | `{ orderNumber, email }` | Customer order status. 404 unless both match (no enumeration). POST so the email never appears in URLs. |
| POST | `/api/payment/verify` | `{ orderNumber, razorpay_order_id, razorpay_payment_id, razorpay_signature }` | Verifies signature + fetches the payment from Razorpay + checks amount; marks paid. Idempotent. |
| POST | `/api/payment/failed` | `{ orderNumber, razorpay_order_id }` | Moves a `PENDING` order to `FAILED`. Can never affect a paid order. |
| POST | `/api/payment/webhook` | Razorpay event | Signature-verified (`x-razorpay-signature`); idempotent by `x-razorpay-event-id`. |
| POST | `/api/contact` | `{ name, email, phone?, subject, message, website? }` | Emails the store (plain text). 5/hour per IP. |
| GET | `/api/media/[file]` | — | Serves admin uploads (`<32 hex>.webp|png|jpg` only). |

`customer` object: `{ name, email, phone, addressLine1, addressLine2?, city, state, postalCode, country }`. `state` must be an Indian state or union territory, `postalCode` a 6-digit PIN code, and `country` `"India"`.

## Admin

Every admin endpoint requires a valid `aw_admin_session` cookie (`401` otherwise). `POST`/`PATCH`/`DELETE` also require the session's CSRF token in the `x-csrf-token` header (`403` otherwise). The admin UI sends it automatically.

| Method | Path | Body / query | Notes |
| --- | --- | --- | --- |
| POST | `/api/admin/login` | `{ email, password }` | Sets the session cookie. Generic 401 on any failure. 10 attempts / 15 min per IP, 5 per email. |
| POST | `/api/admin/logout` | — | Deletes the session. |
| GET | `/api/admin/me` | — | `{ admin: { name, email, role } }` |
| POST | `/api/admin/password` | `{ currentPassword, newPassword }` | New password: 12+ chars with upper, lower and a digit. Signs out other sessions. |
| GET | `/api/admin/products` | — | All products (prices in rupees). |
| POST | `/api/admin/products` | full product | 201; 409 on duplicate slug/name/SKU. |
| GET | `/api/admin/products/[id]` | — | |
| PATCH | `/api/admin/products/[id]` | full product | Validated with the same schema as create. |
| DELETE | `/api/admin/products/[id]` | — | `{ result: "deleted" \| "deactivated" }`. Products with orders are deactivated. |
| POST | `/api/admin/uploads` | `multipart/form-data` `file` | JPG/PNG/WebP ≤ 2 MB, magic-byte checked. Returns `{ path: "/api/media/…" }`. |
| GET | `/api/admin/orders` | `?q=&payment=&status=&page=` | Search by order number, name or email. |
| GET | `/api/admin/orders/[id]` | — | Excludes the Razorpay signature and checkout key. |
| PATCH | `/api/admin/orders/[id]` | `{ orderStatus?, paymentStatus?: "REFUNDED", notes? }` | Status changes are checked against allowed transitions. |
| GET | `/api/admin/reviews` | `?q=&status=&product=&page=` | |
| PATCH | `/api/admin/reviews/[id]` | `{ status?, isFeatured? }` | Only approved reviews can be featured. |
| DELETE | `/api/admin/reviews/[id]` | — | |

## Status codes

`200` OK · `201` created · `400` invalid input · `401` not signed in · `403` origin/CSRF failure · `404` not found · `409` conflict (duplicate, stock, already paid) · `413` too large · `415` wrong content type · `429` rate limited · `503` integration not configured · `500` unexpected error (details only in server logs)
