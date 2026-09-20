import { z } from "zod";
import { handler, json, getClientIp, enforceRateLimit, assertSameOrigin, readJson } from "@/lib/server/http";
import { LIMITS } from "@/lib/server/rate-limit";
import { emailSchema } from "@/lib/server/validation";
import { subscribe } from "@/lib/server/newsletter";

export const dynamic = "force-dynamic";

const schema = z.object({ email: emailSchema, website: z.string().max(200).optional() }).strict();

const MESSAGE = "Almost there! Check your inbox and click the link to confirm your subscription.";

export const POST = handler("POST /api/newsletter/subscribe", async (request) => {
  assertSameOrigin(request);
  enforceRateLimit(`newsletter:${getClientIp(request)}`, LIMITS.newsletterPerIp);
  const { email, website } = await readJson(request, schema, 1024);
  // Same response for bots (honeypot), new, pending and existing subscribers — no email enumeration.
  if (!website) await subscribe(email);
  return json({ ok: true, message: MESSAGE });
});
