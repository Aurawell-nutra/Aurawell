import { handler, json, getClientIp, enforceRateLimit, HttpError } from "@/lib/server/http";
import { LIMITS } from "@/lib/server/rate-limit";
import { getActiveProductBySlug } from "@/lib/server/products";

export const dynamic = "force-dynamic";

export const GET = handler("GET /api/products/[slug]", async (request, { params }) => {
  enforceRateLimit(`public:${getClientIp(request)}`, LIMITS.publicApiPerIp);
  const { slug } = await params;
  const product = await getActiveProductBySlug(slug);
  if (!product) throw new HttpError(404, "Product not found");
  return json({ product });
});
