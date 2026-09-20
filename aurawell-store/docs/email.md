# Email

Order emails are sent with **Nodemailer** over SMTP (`src/lib/server/email.js`).

## Configuration

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587                 # 465 = implicit TLS, 587 = STARTTLS
SMTP_USER=apikey-or-username
SMTP_PASSWORD=app-password-or-api-key
SMTP_FROM_EMAIL="Aaurawell Nutra <orders@aaurawell.com>"
ADMIN_NOTIFICATION_EMAIL=store@aaurawell.com
```

Any SMTP provider works. For production, use a transactional provider (e.g. Amazon SES, Postmark, SendGrid, Brevo, Zoho ZeptoMail). Set up SPF, DKIM and DMARC for your sending domain so emails don't land in spam. For Gmail/Google Workspace, use an **app password**, not your account password.

If `SMTP_HOST` or `SMTP_FROM_EMAIL` is missing, emails are skipped, the order's `emailStatus` stays `NOT_SENT`, and a warning is logged. Checkout keeps working.

## Emails sent

| Trigger | Recipient | Contents |
| --- | --- | --- |
| Order paid (first time only) | Customer | Store name, order number, name, items with quantity, unit price and total, subtotal, shipping, discount/tax if any, total, payment status, delivery address, order date, support contact |
| Order paid (first time only) | `ADMIN_NOTIFICATION_EMAIL` | New-order notice with customer name, email, phone, items, total, payment status, address, date and a link to the admin order page |
| Contact form | `ADMIN_NOTIFICATION_EMAIL` | Plain-text message with `Reply-To` set to the customer |

No payment credentials, signatures or card/UPI details are ever included.

## Failure handling

* **Order saved first:** the order is committed as `PAID` **before** any email is sent. An email failure never fails or rolls back the payment.
* **Result recorded:** each send result is stored on `Order.emailStatus` (`SENT`, `FAILED` or `NOT_SENT`) and shown in the admin order page. Failures are logged without customer addresses.
* **Retries:** emails are sent only once — the first time the order becomes paid — so webhook retries don't send duplicates. To re-send failed emails manually, filter orders with `emailStatus = FAILED` (Prisma Studio) and contact the customer. An automatic retry job can be added later using this field.

Customer-supplied values in HTML emails are HTML-escaped.

## Newsletter and new product emails

**Signing up (double opt-in)**

1. A visitor enters their email in the homepage newsletter form (`POST /api/newsletter/subscribe`).
2. A `PENDING` subscriber is saved and a confirmation email is sent. The link expires after 48 hours.
3. Clicking the link (`/newsletter/confirm`) marks the subscriber `ACTIVE`. Only `ACTIVE` subscribers are ever emailed.

The form shows the same message whether the email is new, pending or already subscribed, so it never reveals who is on the list. It is also protected by a rate limit (5 per hour per IP) and a honeypot field.

**New product announcements**

When a product becomes live for the first time, every `ACTIVE` subscriber gets a "New at Aaurawell" email. "Live for the first time" means either:

* it is created as active, or
* an inactive product is activated.

`Product.announcedAt` is claimed before sending, so the same product is never announced twice. The four seeded products are already marked as announced. Emails are sent in the background in batches of 50, after the admin's save has finished.

**Unsubscribing**

Every newsletter email includes:

* an unsubscribe link (`/newsletter/unsubscribe`, which asks for a click so link scanners can't unsubscribe people), and
* `List-Unsubscribe` headers, so Gmail and Outlook show a one-click Unsubscribe button.

Order confirmation emails are transactional and are not affected by unsubscribing.

**Admin:** **Subscribers** shows confirmed, pending and unsubscribed counts, lets you search, and deletes a subscriber permanently (for data-deletion requests).

Without SMTP configured, sign-ups are saved as `PENDING` but no confirmation email is sent, so nobody becomes `ACTIVE`.
