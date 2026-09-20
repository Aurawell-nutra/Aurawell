import { handler, json, getClientIp, enforceRateLimit, HttpError } from "@/lib/server/http";
import { LIMITS } from "@/lib/server/rate-limit";
import { unsubscribe } from "@/lib/server/newsletter";

export const dynamic = "force-dynamic";

/**
 * Unsubscribe by token. Used by the unsubscribe page and by mail apps' one-click
 * "Unsubscribe" button (RFC 8058 List-Unsubscribe-Post), which POSTs from outside the site —
 * so there is no origin check. The unguessable token is the authorisation.
 */
export const POST = handler("POST /api/newsletter/unsubscribe", async (request) => {
  enforceRateLimit(`unsubscribe:${getClientIp(request)}`, LIMITS.unsubscribePerIp);
  let token = new URL(request.url).searchParams.get("token");
  if (!token && (request.headers.get("content-type") || "").includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    token = typeof body.token === "string" ? body.token : null;
  }
  if (!(await unsubscribe(token))) throw new HttpError(404, "This unsubscribe link is invalid.");
  return json({ ok: true });
});
