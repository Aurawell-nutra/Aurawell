import { handler, json, assertSameOrigin, readJson, HttpError } from "@/lib/server/http";
import { requireAdminApi } from "@/lib/server/auth";
import { idSchema, reviewUpdateSchema } from "@/lib/server/validation";
import { deleteReview, updateReview } from "@/lib/server/admin-reviews";

export const dynamic = "force-dynamic";

async function reviewId(params) {
  const parsed = idSchema.safeParse((await params).id);
  if (!parsed.success) throw new HttpError(404, "Review not found");
  return parsed.data;
}

export const PATCH = handler("PATCH /api/admin/reviews/[id]", async (request, { params }) => {
  assertSameOrigin(request);
  await requireAdminApi(request);
  const id = await reviewId(params);
  const data = await readJson(request, reviewUpdateSchema, 1024);
  const review = await updateReview(id, data);
  return json({ review: { id: review.id, status: review.status, isFeatured: review.isFeatured } });
});

export const DELETE = handler("DELETE /api/admin/reviews/[id]", async (request, { params }) => {
  assertSameOrigin(request);
  await requireAdminApi(request);
  await deleteReview(await reviewId(params));
  return json({ ok: true });
});
