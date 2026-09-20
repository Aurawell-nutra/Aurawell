import { handler, json, getClientIp, enforceRateLimit, assertSameOrigin, readJson, HttpError } from "@/lib/server/http";
import { LIMITS } from "@/lib/server/rate-limit";
import { reviewSubmitSchema, slugSchema } from "@/lib/server/validation";
import { getActiveProductBySlug } from "@/lib/server/products";
import { listApprovedReviews, submitReview } from "@/lib/server/reviews";

export const dynamic = "force-dynamic";

export const GET = handler("GET reviews", async (request, { params }) => {
  enforceRateLimit(`public:${getClientIp(request)}`, LIMITS.publicApiPerIp);
  const { slug } = await params;
  const product = await getActiveProductBySlug(slug);
  if (!product) throw new HttpError(404, "Product not found");
  return json({ reviews: await listApprovedReviews(product.id) });
});

export const POST = handler("POST review", async (request, { params }) => {
  assertSameOrigin(request);
  enforceRateLimit(`review:${getClientIp(request)}`, LIMITS.reviewPerIp);
  const { slug } = await params;
  const parsedSlug = slugSchema.safeParse(slug);
  if (!parsedSlug.success) throw new HttpError(404, "Product not found");

  const data = await readJson(request, reviewSubmitSchema, 8 * 1024);
  if (data.website) {
    // Honeypot filled in — pretend success so bots learn nothing.
    return json({ ok: true, message: "Thank you! Your review will appear once it has been approved." }, { status: 201 });
  }
  await submitReview(parsedSlug.data, data);
  return json({ ok: true, message: "Thank you! Your review will appear once it has been approved." }, { status: 201 });
});
