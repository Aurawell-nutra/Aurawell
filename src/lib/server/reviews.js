import "server-only";
import { prisma } from "./db.js";
import { HttpError } from "./http.js";

const PUBLIC_REVIEW_SELECT = {
  id: true,
  customerName: true,
  rating: true,
  title: true,
  comment: true,
  createdAt: true,
  product: { select: { name: true, slug: true } },
};

// Only the first name and last initial are shown publicly ("Priya Sharma" → "Priya S.").
function publicName(name) {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts.at(-1)[0].toUpperCase()}.` : parts[0];
}

function toPublic(r) {
  return {
    id: r.id,
    name: publicName(r.customerName),
    rating: r.rating,
    title: r.title,
    quote: r.comment,
    product: r.product?.name,
    productSlug: r.product?.slug,
    createdAt: r.createdAt.toISOString(),
  };
}

export async function listApprovedReviews(productId, take = 20) {
  const rows = await prisma.review.findMany({
    where: { productId, status: "APPROVED" },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take,
    select: PUBLIC_REVIEW_SELECT,
  });
  return rows.map(toPublic);
}

/** Homepage testimonials: featured approved reviews first, topped up with recent approved ones. */
export async function listHomepageReviews(take = 8) {
  const rows = await prisma.review.findMany({
    where: { status: "APPROVED", product: { isActive: true } },
    orderBy: [{ isFeatured: "desc" }, { rating: "desc" }, { createdAt: "desc" }],
    take,
    select: PUBLIC_REVIEW_SELECT,
  });
  return rows.map(toPublic);
}

const REPEAT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export async function submitReview(slug, data) {
  const product = await prisma.product.findFirst({ where: { slug, isActive: true }, select: { id: true } });
  if (!product) throw new HttpError(404, "Product not found");

  const recent = await prisma.review.findFirst({
    where: { productId: product.id, customerEmail: data.customerEmail, createdAt: { gt: new Date(Date.now() - REPEAT_WINDOW_MS) } },
    select: { id: true },
  });
  if (recent) throw new HttpError(409, "You have already reviewed this product recently. Thank you!");

  await prisma.review.create({
    data: {
      productId: product.id,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      rating: data.rating,
      title: data.title ?? null,
      comment: data.comment,
      status: "PENDING", // every review is moderated before it appears publicly
    },
  });
}
