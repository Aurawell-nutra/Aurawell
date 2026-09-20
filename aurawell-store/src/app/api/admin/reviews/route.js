import { handler, json } from "@/lib/server/http";
import { requireAdminApi } from "@/lib/server/auth";
import { listAdminReviews, parseReviewFilters } from "@/lib/server/admin-reviews";

export const dynamic = "force-dynamic";

export const GET = handler("GET /api/admin/reviews", async (request) => {
  await requireAdminApi(request);
  const filters = parseReviewFilters(Object.fromEntries(new URL(request.url).searchParams));
  return json(await listAdminReviews(filters));
});
