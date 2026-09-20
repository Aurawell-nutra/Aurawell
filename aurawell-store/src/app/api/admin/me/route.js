import { handler, json } from "@/lib/server/http";
import { requireAdminApi } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export const GET = handler("GET /api/admin/me", async (request) => {
  const { admin } = await requireAdminApi(request);
  return json({ admin: { name: admin.name, email: admin.email, role: admin.role } });
});
