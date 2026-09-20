import { handler, json, assertSameOrigin, readJson } from "@/lib/server/http";
import { requireAdminApi } from "@/lib/server/auth";
import { productSchema } from "@/lib/server/validation";
import { prisma } from "@/lib/server/db";
import { createProduct, toAdminProduct } from "@/lib/server/admin-products";

export const dynamic = "force-dynamic";

export const GET = handler("GET /api/admin/products", async (request) => {
  await requireAdminApi(request);
  const products = await prisma.product.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  return json({ products: products.map(toAdminProduct) });
});

export const POST = handler("POST /api/admin/products", async (request) => {
  assertSameOrigin(request);
  await requireAdminApi(request);
  const data = await readJson(request, productSchema, 128 * 1024);
  const product = await createProduct(data);
  return json({ product: toAdminProduct(product) }, { status: 201 });
});
