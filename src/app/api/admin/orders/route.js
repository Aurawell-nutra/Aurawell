import { handler, json } from "@/lib/server/http";
import { requireAdminApi } from "@/lib/server/auth";
import { listAdminOrders, parseOrderFilters } from "@/lib/server/admin-orders";

export const dynamic = "force-dynamic";

export const GET = handler("GET /api/admin/orders", async (request) => {
  await requireAdminApi(request);
  const filters = parseOrderFilters(Object.fromEntries(new URL(request.url).searchParams));
  return json(await listAdminOrders(filters));
});
