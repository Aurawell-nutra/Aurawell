import "server-only";
import { prisma } from "./db.js";
import { env } from "./env.js";
import { logger } from "./logger.js";
import { escapeHtml, getTransporter, layout } from "./email.js";
import { randomToken, sha256Hex } from "./signatures.js";
import { formatPaise } from "../pricing-rules.js";

const CONFIRM_TTL_MS = 48 * 60 * 60 * 1000; // confirmation links last 48 hours
const RESEND_COOLDOWN_MS = 10 * 60 * 1000; // don't re-send a confirmation email more than every 10 minutes

const confirmUrl = (token) => `${env.appUrl}/newsletter/confirm?token=${encodeURIComponent(token)}`;
const unsubscribeUrl = (token) => `${env.appUrl}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;

/** Headers that give mail apps a one-click "Unsubscribe" button (RFC 8058). */
function listUnsubscribeHeaders(token) {
  return {
    "List-Unsubscribe": `<${env.appUrl}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

function unsubscribeFooter(token) {
  return `<p style="font-size:12px;color:#5f6b62;margin-top:28px;border-top:1px solid #e9e1d4;padding-top:16px">
    You're receiving this because you subscribed to Aaurawell Nutra updates.
    <a href="${unsubscribeUrl(token)}" style="color:#0e4a34">Unsubscribe</a> at any time.</p>`;
}

async function sendConfirmation(email, token, unsubscribeToken) {
  const transport = getTransporter();
  if (!transport) {
    logger.warn("SMTP not configured — newsletter confirmation not sent");
    return false;
  }
  const link = confirmUrl(token);
  await transport.sendMail({
    from: env.smtp.from,
    to: email,
    subject: "Please confirm your Aaurawell Nutra subscription",
    text: `Confirm your subscription to Aaurawell Nutra updates: ${link}\n\nIf you didn't sign up, you can ignore this email.`,
    headers: listUnsubscribeHeaders(unsubscribeToken),
    html: layout(
      "Confirm your subscription",
      `<p style="font-size:14px;line-height:1.6">Thanks for joining the Aaurawell community! Please confirm your email to receive wellness tips, new launches and exclusive offers.</p>
       <p style="margin:28px 0"><a href="${link}" style="background:#0f4a2e;color:#fff;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:14px;display:inline-block">Confirm subscription</a></p>
       <p style="font-size:12px;color:#5f6b62">This link expires in 48 hours. If you didn't sign up, simply ignore this email.</p>`
    ),
  });
  return true;
}

/**
 * Starts (or restarts) a double opt-in subscription. Always resolves the same way for the caller,
 * so the form never reveals whether an email is already subscribed.
 */
export async function subscribe(email) {
  const existing = await prisma.subscriber.findUnique({ where: { email } });
  if (existing?.status === "ACTIVE") return;
  if (existing?.lastConfirmSentAt && Date.now() - existing.lastConfirmSentAt.getTime() < RESEND_COOLDOWN_MS) return;

  const token = randomToken(32);
  const data = {
    status: "PENDING",
    confirmTokenHash: sha256Hex(token),
    confirmExpiresAt: new Date(Date.now() + CONFIRM_TTL_MS),
    lastConfirmSentAt: new Date(),
    unsubscribedAt: null,
  };
  const subscriber = existing
    ? await prisma.subscriber.update({ where: { id: existing.id }, data })
    : await prisma.subscriber.create({ data: { email, unsubscribeToken: randomToken(32), ...data } });

  try {
    await sendConfirmation(email, token, subscriber.unsubscribeToken);
  } catch (err) {
    logger.error("Newsletter confirmation email failed", { error: err });
  }
}

/** @returns {"confirmed" | "already" | "invalid"} */
export async function confirmSubscription(token) {
  if (typeof token !== "string" || token.length < 20 || token.length > 100) return "invalid";
  const subscriber = await prisma.subscriber.findUnique({ where: { confirmTokenHash: sha256Hex(token) } });
  if (!subscriber) return "invalid";
  if (subscriber.status === "ACTIVE") return "already";
  if (!subscriber.confirmExpiresAt || subscriber.confirmExpiresAt < new Date()) return "invalid";

  await prisma.subscriber.update({
    where: { id: subscriber.id },
    data: { status: "ACTIVE", confirmedAt: new Date(), confirmTokenHash: null, confirmExpiresAt: null },
  });
  return "confirmed";
}

/** @returns {boolean} whether a subscriber matched the token */
export async function unsubscribe(token) {
  if (typeof token !== "string" || token.length < 20 || token.length > 100) return false;
  const result = await prisma.subscriber.updateMany({
    where: { unsubscribeToken: token },
    data: { status: "UNSUBSCRIBED", unsubscribedAt: new Date(), confirmTokenHash: null, confirmExpiresAt: null },
  });
  return result.count > 0;
}

function productEmail(product, unsubscribeToken) {
  const url = `${env.appUrl}/shop/${product.slug}`;
  const image = `${env.appUrl}${product.mainImage}`;
  return {
    subject: `New at Aaurawell: ${product.name}`,
    text: `${product.name} is here!\n\n${product.shortDescription}\n\nPrice: ${formatPaise(product.price)}\nShop now: ${url}\n\nUnsubscribe: ${unsubscribeUrl(unsubscribeToken)}`,
    headers: listUnsubscribeHeaders(unsubscribeToken),
    html: layout(
      "Something new just arrived ✨",
      `<p style="font-size:14px;line-height:1.6">We're excited to introduce our newest gummy.</p>
       <div style="text-align:center;margin:24px 0;background:#fbf7f1;border-radius:16px;padding:20px">
         <img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" width="220" style="max-width:220px;height:auto;border-radius:12px">
         <h2 style="font-family:Georgia,serif;color:#0e4a34;font-size:22px;margin:16px 0 4px">${escapeHtml(product.name)}</h2>
         ${product.subtitle ? `<p style="margin:0;color:#5f6b62;font-size:13px">${escapeHtml(product.subtitle)}</p>` : ""}
         <p style="font-size:14px;line-height:1.6;margin:12px 0">${escapeHtml(product.shortDescription)}</p>
         <p style="font-size:20px;font-family:Georgia,serif;color:#0e4a34;margin:8px 0">${formatPaise(product.price)}</p>
         <a href="${url}" style="background:#0f4a2e;color:#fff;text-decoration:none;padding:13px 26px;border-radius:999px;font-size:14px;display:inline-block;margin-top:8px">Shop now</a>
       </div>
       ${unsubscribeFooter(unsubscribeToken)}`
    ),
  };
}

/**
 * Emails every ACTIVE subscriber about a newly live product — exactly once per product.
 * `announcedAt` is claimed atomically before sending, so double saves or concurrent requests
 * can't send duplicates. Runs in the background; failures are logged per recipient.
 */
export async function announceProductIfNew(productId) {
  const claimed = await prisma.product.updateMany({
    where: { id: productId, isActive: true, announcedAt: null },
    data: { announcedAt: new Date() },
  });
  if (claimed.count === 0) return;

  const transport = getTransporter();
  if (!transport) {
    logger.warn("SMTP not configured — new product announcement skipped", { productId });
    return;
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  let cursor;
  let sent = 0;
  let failed = 0;

  // Page through subscribers and send sequentially in small batches to respect SMTP limits.
  for (;;) {
    const batch = await prisma.subscriber.findMany({
      where: { status: "ACTIVE" },
      orderBy: { id: "asc" },
      take: 50,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      select: { id: true, email: true, unsubscribeToken: true },
    });
    if (batch.length === 0) break;

    for (const s of batch) {
      try {
        await transport.sendMail({ from: env.smtp.from, to: s.email, ...productEmail(product, s.unsubscribeToken) });
        sent += 1;
      } catch (err) {
        failed += 1;
        logger.error("New product email failed", { productId, error: err });
      }
    }
    cursor = batch.at(-1).id;
  }
  logger.info("New product announcement finished", { productId, sent, failed });
}
