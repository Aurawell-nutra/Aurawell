import { handler, json, assertSameOrigin, readJson, HttpError } from "@/lib/server/http";
import { requireAdminApi } from "@/lib/server/auth";
import { idSchema, productSchema } from "@/lib/server/validation";
import { prisma } from "@/lib/server/db";
import { deleteProduct, toAdminProduct, updateProduct } from "@/lib/server/admin-products";

export const dynamic = "force-dynamic";

async function productId(params) {
  const parsed = idSchema.safeParse((await params).id);
  if (!parsed.success) throw new HttpError(404, "Product not found");
  return parsed.data;
}

export const GET = handler("GET /api/admin/products/[id]", async (request, { params }) => {
  await requireAdminApi(request);
  const product = await prisma.product.findUnique({ where: { id: await productId(params) } });
  if (!product) throw new HttpError(404, "Product not found");
  return json({ product: toAdminProduct(product) });
});

// The edit form always sends the full product, so PATCH validates with the complete schema.
export const PATCH = handler("PATCH /api/admin/products/[id]", async (request, { params }) => {
  assertSameOrigin(request);
  await requireAdminApi(request);
  const id = await productId(params);
  const data = await readJson(request, productSchema, 128 * 1024);
  const product = await updateProduct(id, data);
  return json({ product: toAdminProduct(product) });
});

export const DELETE = handler("DELETE /api/admin/products/[id]", async (request, { params }) => {
  assertSameOrigin(request);
  await requireAdminApi(request);
  const result = await deleteProduct(await productId(params));
  return json({
    ok: true,
    result,
    message: result === "deactivated" ? "This product has order history, so it was deactivated instead of deleted." : "Product deleted.",
  });
});
