import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { fieldErrors } from "./validation.js";
import { rateLimit } from "./rate-limit.js";
import { ConfigError, env } from "./env.js";
import { logger } from "./logger.js";

export class HttpError extends Error {
  constructor(status, message, extra) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

export function json(data, init) {
  return NextResponse.json(data, { ...init, headers: { "Cache-Control": "no-store", ...init?.headers } });
}

/** Consistent error shape: { error: string, fields?: {} }. Internal details are only logged. */
export function errorResponse(err, context = "request") {
  if (err instanceof HttpError) {
    return json({ error: err.message, ...err.extra }, { status: err.status, headers: err.status === 429 ? { "Retry-After": String(err.extra?.retryAfter ?? 60) } : undefined });
  }
  if (err instanceof ZodError) {
    return json({ error: "Please check the highlighted fields.", fields: fieldErrors(err) }, { status: 400 });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    const target = [].concat(err.meta?.target ?? []).join(", ");
    return json({ error: "A record with this value already exists.", fields: target ? { [target.split(", ")[0]]: "Already in use" } : undefined }, { status: 409 });
  }
  if (err instanceof ConfigError) {
    logger.error(`${context}: configuration error`, { message: err.message });
    return json({ error: "This feature is not configured yet." }, { status: 503 });
  }
  logger.error(`${context}: unexpected error`, { error: err });
  return json({ error: "Something went wrong. Please try again." }, { status: 500 });
}

/** Wraps a route handler with consistent error handling. */
export function handler(context, fn) {
  return async (request, ctx) => {
    try {
      return await fn(request, ctx);
    } catch (err) {
      return errorResponse(err, context);
    }
  };
}

export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return (forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown").trim().slice(0, 64);
}

export function enforceRateLimit(key, [limit, windowMs]) {
  const result = rateLimit(key, limit, windowMs);
  if (!result.ok) throw new HttpError(429, "Too many requests. Please try again later.", { retryAfter: result.retryAfter });
}

/**
 * CSRF defence for state-changing requests: the Origin (or Referer) must match this site.
 * Browsers always send Origin on cross-site POST/PATCH/DELETE.
 */
export function assertSameOrigin(request) {
  const origin = request.headers.get("origin") || request.headers.get("referer");
  if (!origin) throw new HttpError(403, "Forbidden");
  let host;
  try {
    host = new URL(origin).host;
  } catch {
    throw new HttpError(403, "Forbidden");
  }
  const allowed = new Set([request.headers.get("host"), new URL(env.appUrl).host, new URL(env.adminUrl).host].filter(Boolean));
  if (!allowed.has(host)) throw new HttpError(403, "Forbidden");
}

const MAX_JSON_BYTES = 64 * 1024;

/** Parses a JSON body with a size limit and validates it with a Zod schema. */
export async function readJson(request, schema, maxBytes = MAX_JSON_BYTES) {
  const type = request.headers.get("content-type") || "";
  if (!type.includes("application/json")) throw new HttpError(415, "Unsupported content type");
  const text = await request.text();
  if (Buffer.byteLength(text) > maxBytes) throw new HttpError(413, "Request too large");
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    throw new HttpError(400, "Invalid JSON");
  }
  return schema.parse(body);
}
