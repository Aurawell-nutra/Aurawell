import { z } from "zod";
import nodemailer from "nodemailer";
import { handler, json, getClientIp, enforceRateLimit, assertSameOrigin, readJson, HttpError } from "@/lib/server/http";
import { LIMITS } from "@/lib/server/rate-limit";
import { emailSchema } from "@/lib/server/validation";
import { env } from "@/lib/server/env";
import { logger } from "@/lib/server/logger";

export const dynamic = "force-dynamic";

const schema = z
  .object({
    name: z.string().trim().min(2).max(80).regex(/^[^<>\u0000-\u001f]*$/),
    email: emailSchema,
    phone: z.string().trim().max(20).regex(/^[0-9+\s()-]*$/).optional(),
    subject: z.string().trim().min(2).max(120).regex(/^[^<>\u0000-\u001f]*$/),
    message: z.string().trim().min(10).max(2000),
    website: z.string().max(0).optional(), // honeypot
  })
  .strict();

export const POST = handler("POST /api/contact", async (request) => {
  assertSameOrigin(request);
  enforceRateLimit(`contact:${getClientIp(request)}`, LIMITS.contactPerIp);
  const data = await readJson(request, schema, 8 * 1024);
  if (data.website) return json({ ok: true });

  const smtp = env.smtp;
  if (!smtp.host || !smtp.from || !smtp.adminEmail) throw new HttpError(503, "Our contact form is temporarily unavailable. Please email us directly.");

  const transport = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: smtp.user ? { user: smtp.user, pass: smtp.password } : undefined,
  });
  try {
    // Plain-text email only, so user input is never rendered as HTML.
    await transport.sendMail({
      from: smtp.from,
      to: smtp.adminEmail,
      replyTo: data.email,
      subject: `Contact form: ${data.subject}`,
      text: `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || "-"}\n\n${data.message}`,
    });
  } catch (err) {
    logger.error("Contact email failed", { error: err });
    throw new HttpError(502, "We couldn't send your message right now. Please try again or email us directly.");
  }
  return json({ ok: true });
});
