// Storefront data access. Products and reviews come from PostgreSQL via Prisma.
import "server-only";
import { getActiveProductBySlug, listActiveProducts } from "@/lib/server/products";
import { listApprovedReviews, listHomepageReviews } from "@/lib/server/reviews";

export const getProducts = listActiveProducts;
export const getProductBySlug = getActiveProductBySlug;
export const getProductReviews = listApprovedReviews;
export const getHomepageReviews = listHomepageReviews;

export function getCategories(products) {
  return ["All", ...new Set(products.map((p) => p.category))];
}
