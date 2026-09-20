import { handler, json, getClientIp, enforceRateLimit, assertSameOrigin, HttpError } from "@/lib/server/http";
import { LIMITS, resetRateLimit } from "@/lib/server/rate-limit";
import { adminLoginSchema } from "@/lib/server/validation";
import { authenticateAdmin, createSession } from "@/lib/server/auth";
import { logger } from "@/lib/server/logger";

export const dynamic = "force-dynamic";

export const POST = handler("POST /api/admin/login", async (request) => {
  assertSameOrigin(request);
  const ip = getClientIp(request);
  enforceRateLimit(`login-ip:${ip}`, LIMITS.adminLoginPerIp);

  const body = await request.text();
  let input = null;
  try {
    input = body.length <= 2048 ? JSON.parse(body) : null;
  } catch {}
  const parsed = adminLoginSchema.safeParse(input);
  // Generic message for every failure so attackers can't tell which part was wrong.
  if (!parsed.success) throw new HttpError(401, "Invalid email or password.");
  const { email, password } = parsed.data;
  enforceRateLimit(`login-email:${email}`, LIMITS.adminLoginPerEmail);

  const admin = await authenticateAdmin(email, password);
  if (!admin) {
    logger.warn("Failed admin login", { ip });
    throw new HttpError(401, "Invalid email or password.");
  }

  resetRateLimit(`login-email:${email}`);
  await createSession(admin.id);
  return json({ ok: true });
});
