# Payments (Razorpay)

## Setup

1. Create an account at [dashboard.razorpay.com](https://dashboard.razorpay.com). Use **Test Mode** during development.
2. **Settings → API Keys → Generate Test Key**, then put the values in `.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
   ```
3. **Settings → Payment capture:** set to **automatic**, so payments are captured without a manual step.
4. **Webhook** (strongly recommended — it confirms orders when a customer closes the browser before returning):
   * **Settings → Webhooks → Add New Webhook**
   * URL: `https://YOUR_DOMAIN/api/payment/webhook`
   * Secret: a long random string, also saved as `RAZORPAY_WEBHOOK_SECRET`
   * Events: `payment.captured`, `order.paid`, `payment.failed`
   * Locally, expose your dev server with a tunnel (e.g. ngrok or cloudflared) to test webhooks.

## Flow

```text
Browser                                   Server                                  Razorpay
───────                                   ──────                                  ────────
POST /api/orders/create ───────────────►  price cart from DB
                                          create PENDING order (+ item snapshots)
                                          orders.create(amount = server total) ─► order_xxx
                        ◄───────────────  { orderNumber, razorpayOrderId, amount, keyId }
open Razorpay Checkout ─────────────────────────────────────────────────────────► customer pays
handler(response) ◄─────────────────────────────────────────────────────────────  payment id + signature
POST /api/payment/verify ──────────────►  1. verify HMAC(order_id|payment_id)
                                          2. order_id belongs to orderNumber
                                          3. payments.fetch(payment_id) ───────► amount, currency, status
                                          4. transaction: mark PAID, deduct stock (once)
                                          5. send emails (failure doesn't undo payment)
                        ◄───────────────  { ok, order }
                                          POST /api/payment/webhook ◄─────────── payment.captured (safety net)
```

## Guarantees

| Risk | Protection |
| --- | --- |
| Tampered amount | Razorpay order is created with the server-calculated total. Verification re-fetches the payment and checks the amount and currency. The webhook also checks the amount. |
| Fake "success" from browser | An order becomes `PAID` only after signature and API verification. |
| Payment for a different order | `razorpay_order_id` must match the stored order for that order number. |
| Double submit / retries | `checkoutKey` idempotency on creation. Verification is idempotent, and a conditional update lets only one caller mark the order paid. |
| Webhook replays | `WebhookEvent` table keyed by `x-razorpay-event-id`, plus the idempotent `markOrderPaid`. |
| Stock deducted twice | Stock is deducted only in the same transaction that changes `PENDING/FAILED → PAID`. |
| Sensitive data | No card or UPI data ever reaches our server. The signature is stored for audit but never returned by any API or shown in the admin panel. Secrets are never logged. |

## Failed, cancelled and abandoned payments

* **Customer closes the window without paying:** the order stays `PENDING`, and the checkout page offers a retry that reuses the same Razorpay order.
* **Payment fails inside Razorpay:** Razorpay lets the customer retry. On close, the browser reports `/api/payment/failed` → `FAILED`. A later successful payment on the same Razorpay order still marks it `PAID` (through verify or the webhook).
* **Abandoned `PENDING` orders:** they hold no stock. Admins can filter by payment status `PENDING` and cancel old ones. A scheduled clean-up job can be added later.

## Refunds

Issue refunds from the Razorpay dashboard, then open the order in the admin panel (`admin.aaurawell.com/orders/[id]`) and click **Mark refunded** (and **Cancel order** if it won't ship, which returns the items to stock). Automatic refunds through the Razorpay API can be added later.

## Testing

In Test Mode, use Razorpay's [test cards and UPI IDs](https://razorpay.com/docs/payments/payments/test-card-details/), e.g. UPI `success@razorpay` / `failure@razorpay`. Never use real card details in test mode.
