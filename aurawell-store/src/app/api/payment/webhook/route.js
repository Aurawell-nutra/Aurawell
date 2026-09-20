import { Prisma } from "@prisma/client";
import { json } from "@/lib/server/http";
import { env } from "@/lib/server/env";
import { prisma } from "@/lib/server/db";
import { verifyWebhookSignature } from "@/lib/server/signatures";
import { markOrderPaid, markOrderPaymentFailed } from "@/lib/server/orders";
import { logger } from "@/lib/server/logger";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 256 * 1024;

/**
 * Razorpay webhook (configure events: payment.captured, order.paid, payment.failed).
 * Acts as a safety net when the browser closes before /api/payment/verify runs.
 */
export async function POST(request) {
  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody) > MAX_BODY_BYTES) return json({ error: "Too large" }, { status: 413 });

  let secret;
  try {
    secret = env.razorpayWebhookSecret;
  } catch {
    return json({ error: "Not configured" }, { status: 503 });
  }

  const signature = request.headers.get("x-razorpay-signature");
  if (!verifyWebhookSignature({ rawBody, signature, secret })) {
    logger.warn("Rejected webhook with invalid signature");
    return json({ error: "Invalid signature" }, { status: 400 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventId = request.headers.get("x-razorpay-event-id") || `${payload.event}:${payload.payload?.payment?.entity?.id ?? payload.created_at}`;

  // Idempotency: record the event id first; a duplicate delivery hits the unique constraint.
  try {
    await prisma.webhookEvent.create({ data: { id: eventId.slice(0, 120), event: String(payload.event).slice(0, 60) } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") return json({ ok: true, duplicate: true });
    throw err;
  }

  try {
    const payment = payload.payload?.payment?.entity;
    switch (payload.event) {
      case "payment.captured":
      case "order.paid":
        if (payment?.order_id) {
          await markOrderPaid({ razorpayOrderId: payment.order_id, razorpayPaymentId: payment.id, amount: Number(payment.amount) });
        }
        break;
      case "payment.failed":
        if (payment?.order_id) await markOrderPaymentFailed(payment.order_id);
        break;
      default:
        break; // other events are acknowledged and ignored
    }
  } catch (err) {
    if (err?.status && err.status < 500) {
      // Permanent problem (unknown order, amount mismatch) — acknowledge so Razorpay stops retrying.
      logger.warn("Webhook event not applied", { event: payload.event, reason: err.message });
      return json({ ok: true, ignored: true });
    }
    // Transient failure: forget the event so Razorpay's retry is processed.
    await prisma.webhookEvent.delete({ where: { id: eventId.slice(0, 120) } }).catch(() => {});
    logger.error("Webhook processing failed", { event: payload.event, error: err });
    return json({ error: "Processing failed" }, { status: 500 });
  }

  return json({ ok: true });
}
