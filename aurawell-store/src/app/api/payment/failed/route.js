import { handler, json, getClientIp, enforceRateLimit, assertSameOrigin, readJson } from "@/lib/server/http";
import { LIMITS } from "@/lib/server/rate-limit";
import { paymentFailedSchema } from "@/lib/server/validation";
import { prisma } from "@/lib/server/db";

export const dynamic = "force-dynamic";

// Records a failed/cancelled payment attempt reported by the browser. It can only move a
// PENDING order to FAILED — it can never affect a paid order, and a later successful
// payment (verified server-side) still marks the order PAID.
export const POST = handler("POST /api/payment/failed", async (request) => {
  assertSameOrigin(request);
  enforceRateLimit(`verify:${getClientIp(request)}`, LIMITS.paymentVerifyPerIp);
  const data = await readJson(request, paymentFailedSchema, 2048);
  await prisma.order.updateMany({
    where: { orderNumber: data.orderNumber, razorpayOrderId: data.razorpay_order_id, paymentStatus: "PENDING" },
    data: { paymentStatus: "FAILED" },
  });
  return json({ ok: true });
});
