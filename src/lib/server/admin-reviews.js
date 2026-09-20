import "server-only";
import { z } from "zod";
import { prisma } from "./db.js";
import { HttpError } from "./http.js";
import { REVIEW_STATUSES } from "./validation.js";
import { revalidateStorefront } from "./admin-products.js";

const PAGE_SIZE = 20;

const filterSchema = z.object({
  q: z.string().trim().max(100).optional().catch(undefined),
  status: z.enum(REVIEW_STATUSES).optional().catch(undefined),
  product: z.string().trim().regex(/^[a-zA-Z0-9_-]{1,64}$/).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(10000).optional().catch(1),
});

export function parseReviewFilters(params) {
  return filterSchema.parse(params ?? {});
}

export async function listAdminReviews({ q, status, product, page = 1 }) {
  const where = {
    ...(status && { status }),
    ...(product && { productId: product }),
    ...(q && {
      OR: [
        { customerName: { contains: q, mode: "insensitive" } },
        { customerEmail: { contains: q, mode: "insensitive" } },
        { title: { contains: q, mode: "insensitive" } },
        { comment: { contains: q, mode: "insensitive" } },
      ],
    }),
  };
  const [reviews, total] = await prisma.$transaction([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { product: { select: { name: true, slug: true } } },
    }),
    prisma.review.count({ where }),
  ]);
  return { reviews, total, page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function updateReview(id, data) {
  const review = await prisma.review.findUnique({ where: { id }, include: { product: { select: { slug: true } } } });
  if (!review) throw new HttpError(404, "Review not found");
  // Only approved reviews can be featured.
  if (data.isFeatured && (data.status ?? review.status) !== "APPROVED") {
    throw new HttpError(400, "Only approved reviews can be featured.");
  }
  const update = { ...data };
  if (data.status && data.status !== "APPROVED") update.isFeatured = false;
  const updated = await prisma.review.update({ where: { id }, data: update });
  revalidateStorefront([review.product.slug]);
  return updated;
}

export async function deleteReview(id) {
  const review = await prisma.review.findUnique({ where: { id }, include: { product: { select: { slug: true } } } });
  if (!review) throw new HttpError(404, "Review not found");
  await prisma.review.delete({ where: { id } });
  revalidateStorefront([review.product.slug]);
}
