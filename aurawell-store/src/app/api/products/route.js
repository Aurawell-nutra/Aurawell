import { handler, json, getClientIp, enforceRateLimit } from "@/lib/server/http";
import { LIMITS } from "@/lib/server/rate-limit";
import { listActiveProducts } from "@/lib/server/products";

export const dynamic = "force-dynamic";

export const GET = handler("GET /api/products", async (request) => {
  enforceRateLimit(`public:${getClientIp(request)}`, LIMITS.publicApiPerIp);
  const products = await listActiveProducts();
  return json({ products });
});
