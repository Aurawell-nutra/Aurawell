import { handler, json, getClientIp, enforceRateLimit, assertSameOrigin, readJson } from "@/lib/server/http";
import { LIMITS } from "@/lib/server/rate-limit";
import { checkoutSchema } from "@/lib/server/validation";
import { createCheckout } from "@/lib/server/orders";

export const dynamic = "force-dynamic";

// Creates a PENDING order from server-side prices and a matching Razorpay order.
export const POST = handler("POST /api/orders/create", async (request) => {
  assertSameOrigin(request);
  enforceRateLimit(`checkout:${getClientIp(request)}`, LIMITS.checkoutPerIp);
  const data = await readJson(request, checkoutSchema);
  const payload = await createCheckout(data);
  return json(payload, { status: 201 });
});
