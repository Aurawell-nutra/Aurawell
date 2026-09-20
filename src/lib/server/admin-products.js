import "server-only";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { prisma } from "./db.js";
import { HttpError } from "./http.js";
import { announceProductIfNew } from "./newsletter.js";
import { logger } from "./logger.js";

export function revalidateStorefront(slugs = []) {
  revalidatePath("/");
  revalidatePath("/shop");
  for (const slug of slugs) if (slug) revalidatePath(`/shop/${slug}`);
}

/** Admin-facing product shape: prices in rupees for the form. */
export function toAdminProduct(p) {
  return {
    ...p,
    price: p.price / 100,
    compareAtPrice: p.compareAtPrice != null ? p.compareAtPrice / 100 : null,
  };
}

// Emails subscribers after the response is sent, the first time a product is live.
function scheduleAnnouncement(product) {
  if (!product.isActive || product.announcedAt) return;
  after(() => announceProductIfNew(product.id).catch((err) => logger.error("Product announcement failed", { error: err })));
}

export async function createProduct(data) {
  const product = await prisma.product.create({ data });
  revalidateStorefront([product.slug]);
  scheduleAnnouncement(product);
  return product;
}

export async function updateProduct(id, data) {
  const before = await prisma.product.findUnique({ where: { id }, select: { slug: true } });
  if (!before) throw new HttpError(404, "Product not found");
  const product = await prisma.product.update({ where: { id }, data });
  revalidateStorefront([before.slug, product.slug]);
  scheduleAnnouncement(product); // e.g. a draft product being activated for the first time
  return product;
}

/**
 * Products with order history are deactivated instead of deleted, so order records stay intact.
 * @returns {"deleted" | "deactivated"}
 */
export async function deleteProduct(id) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id }, select: { slug: true, _count: { select: { orderItems: true } } } });
    if (!product) throw new HttpError(404, "Product not found");

    if (product._count.orderItems > 0) {
      await tx.product.update({ where: { id }, data: { isActive: false, isFeatured: false } });
      revalidateStorefront([product.slug]);
      return "deactivated";
    }
    await tx.product.delete({ where: { id } });
    revalidateStorefront([product.slug]);
    return "deleted";
  });
}
