import { z } from "zod";
import { handler, json, getClientIp, enforceRateLimit, assertSameOrigin, readJson } from "@/lib/server/http";
import { LIMITS } from "@/lib/server/rate-limit";
import { cartLineSchema, customerSchema } from "@/lib/server/validation";
import { quoteCart } from "@/lib/server/orders";
import { MAX_ITEMS_PER_ORDER } from "@/lib/pricing-rules";

export const dynamic = "force-dynamic";

const schema = z
  .object({
    customer: customerSchema.optional(),
    items: z.array(cartLineSchema).min(1, "Your cart is empty").max(MAX_ITEMS_PER_ORDER),
  })
  .strict();

// Validates customer details and returns server-calculated prices and totals for the review step.
export const POST = handler("POST /api/checkout/validate", async (request) => {
  assertSameOrigin(request);
  enforceRateLimit(`checkout:${getClientIp(request)}`, LIMITS.checkoutPerIp);
  const { items } = await readJson(request, schema);
  const quote = await quoteCart(items);
  return json({
    lines: quote.lines.map(({ productId, productName, productImage, quantity, unitPrice, totalPrice }) => ({
      productId, productName, productImage, quantity, unitPrice, totalPrice,
    })),
    subtotal: quote.subtotal,
    discountAmount: quote.discountAmount,
    shippingAmount: quote.shippingAmount,
    taxAmount: quote.taxAmount,
    totalAmount: quote.totalAmount,
  });
});
