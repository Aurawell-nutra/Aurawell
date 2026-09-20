import { handler, json, getClientIp, enforceRateLimit, assertSameOrigin, readJson, HttpError } from "@/lib/server/http";
import { LIMITS } from "@/lib/server/rate-limit";
import { paymentVerifySchema } from "@/lib/server/validation";
import { verifyPaymentSignature } from "@/lib/server/signatures";
import { prisma } from "@/lib/server/db";
import { env } from "@/lib/server/env";
import { getRazorpay } from "@/lib/server/razorpay";
import { markOrderPaid, toPublicOrder } from "@/lib/server/orders";
import { logger } from "@/lib/server/logger";

export const dynamic = "force-dynamic";

/**
 * Called by the browser after Razorpay Checkout succeeds. The browser's word is never trusted:
 * 1. the signature must be valid for (razorpay_order_id | razorpay_payment_id),
 * 2. the Razorpay order must belong to the internal order number,
 * 3. the payment fetched from Razorpay must be captured/authorized for the exact order amount.
 */
export const POST = handler("POST /api/payment/verify", async (request) => {
  assertSameOrigin(request);
  enforceRateLimit(`verify:${getClientIp(request)}`, LIMITS.paymentVerifyPerIp);
  const data = await readJson(request, paymentVerifySchema, 4096);

  const valid = verifyPaymentSignature({
    orderId: data.razorpay_order_id,
    paymentId: data.razorpay_payment_id,
    signature: data.razorpay_signature,
    secret: env.razorpayKeySecret,
  });
  if (!valid) throw new HttpError(400, "Payment verification failed.");

  const order = await prisma.order.findUnique({ where: { orderNumber: data.orderNumber }, include: { items: true } });
  if (!order || order.razorpayOrderId !== data.razorpay_order_id) throw new HttpError(400, "Payment verification failed.");

  if (order.paymentStatus === "PAID") {
    // Idempotent: repeated verification of the same payment returns the same result.
    if (order.razorpayPaymentId !== data.razorpay_payment_id) throw new HttpError(409, "This order has already been paid.");
    return json({ ok: true, order: toPublicOrder(order) });
  }

  const payment = await getRazorpay().payments.fetch(data.razorpay_payment_id);
  if (payment.order_id !== order.razorpayOrderId || Number(payment.amount) !== order.totalAmount || payment.currency !== order.currency) {
    logger.warn("Payment details mismatch during verification", { orderNumber: order.orderNumber });
    throw new HttpError(400, "Payment verification failed.");
  }
  if (!["captured", "authorized"].includes(payment.status)) throw new HttpError(402, "Payment has not been completed.");

  const { order: paid } = await markOrderPaid({
    razorpayOrderId: order.razorpayOrderId,
    razorpayPaymentId: data.razorpay_payment_id,
    razorpaySignature: data.razorpay_signature,
    amount: Number(payment.amount),
  });
  return json({ ok: true, order: toPublicOrder(paid) });
});
