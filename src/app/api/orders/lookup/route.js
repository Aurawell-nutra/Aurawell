import { handler, json, getClientIp, enforceRateLimit, assertSameOrigin, readJson, HttpError } from "@/lib/server/http";
import { LIMITS } from "@/lib/server/rate-limit";
import { orderLookupSchema } from "@/lib/server/validation";
import { findOrderForCustomer, toPublicOrder } from "@/lib/server/orders";

export const dynamic = "force-dynamic";

// POST (not GET) so the customer's email never appears in URLs or server access logs.
export const POST = handler("POST /api/orders/lookup", async (request) => {
  assertSameOrigin(request);
  enforceRateLimit(`lookup:${getClientIp(request)}`, LIMITS.orderLookupPerIp);
  const { orderNumber, email } = await readJson(request, orderLookupSchema, 2048);
  const order = await findOrderForCustomer(orderNumber, email);
  if (!order) throw new HttpError(404, "We couldn't find an order with those details.");
  return json({ order: toPublicOrder(order) });
});
