import { handler, json, assertSameOrigin } from "@/lib/server/http";
import { destroySession } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export const POST = handler("POST /api/admin/logout", async (request) => {
  assertSameOrigin(request);
  await destroySession();
  return json({ ok: true });
});
