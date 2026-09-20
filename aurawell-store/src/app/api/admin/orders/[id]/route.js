import { handler, json, assertSameOrigin, readJson, HttpError } from "@/lib/server/http";
import { requireAdminApi } from "@/lib/server/auth";
import { idSchema, orderUpdateSchema } from "@/lib/server/validation";
import { getAdminOrder, updateAdminOrder } from "@/lib/server/admin-orders";

export const dynamic = "force-dynamic";

async function orderId(params) {
  const parsed = idSchema.safeParse((await params).id);
  if (!parsed.success) throw new HttpError(404, "Order not found");
  return parsed.data;
}

export const GET = handler("GET /api/admin/orders/[id]", async (request, { params }) => {
  await requireAdminApi(request);
  const order = await getAdminOrder(await orderId(params));
  if (!order) throw new HttpError(404, "Order not found");
  return json({ order });
});

export const PATCH = handler("PATCH /api/admin/orders/[id]", async (request, { params }) => {
  assertSameOrigin(request);
  await requireAdminApi(request);
  const id = await orderId(params);
  const data = await readJson(request, orderUpdateSchema, 8 * 1024);
  await updateAdminOrder(id, data);
  return json({ order: await getAdminOrder(id) });
});
