import { handler, json, assertSameOrigin, HttpError } from "@/lib/server/http";
import { requireAdminApi } from "@/lib/server/auth";
import { idSchema } from "@/lib/server/validation";
import { prisma } from "@/lib/server/db";

export const dynamic = "force-dynamic";

// Permanently removes a subscriber (e.g. a data-deletion request).
export const DELETE = handler("DELETE /api/admin/subscribers/[id]", async (request, { params }) => {
  assertSameOrigin(request);
  await requireAdminApi(request);
  const parsed = idSchema.safeParse((await params).id);
  if (!parsed.success) throw new HttpError(404, "Subscriber not found");
  const { count } = await prisma.subscriber.deleteMany({ where: { id: parsed.data } });
  if (count === 0) throw new HttpError(404, "Subscriber not found");
  return json({ ok: true });
});
