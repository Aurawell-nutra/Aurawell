import { handler, json, assertSameOrigin, readJson, HttpError, enforceRateLimit } from "@/lib/server/http";
import { LIMITS } from "@/lib/server/rate-limit";
import { passwordChangeSchema } from "@/lib/server/validation";
import { requireAdminApi, hashPassword, verifyPassword } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export const POST = handler("POST /api/admin/password", async (request) => {
  assertSameOrigin(request);
  const { admin, session } = await requireAdminApi(request);
  enforceRateLimit(`password:${admin.id}`, LIMITS.adminLoginPerEmail);
  const { currentPassword, newPassword } = await readJson(request, passwordChangeSchema, 2048);

  const record = await prisma.adminUser.findUnique({ where: { id: admin.id } });
  if (!(await verifyPassword(currentPassword, record.passwordHash))) {
    throw new HttpError(400, "Please check the highlighted fields.", { fields: { currentPassword: "Current password is incorrect" } });
  }

  // Changing the password signs out every other session.
  await prisma.$transaction([
    prisma.adminUser.update({ where: { id: admin.id }, data: { passwordHash: await hashPassword(newPassword) } }),
    prisma.adminSession.deleteMany({ where: { adminId: admin.id, id: { not: session.id } } }),
  ]);
  return json({ ok: true });
});
