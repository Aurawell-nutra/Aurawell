import "server-only";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./db.js";
import { env } from "./env.js";
import { HttpError } from "./http.js";
import { hmacSha256Hex, randomToken, safeEqualString } from "./signatures.js";

export const SESSION_COOKIE = "aw_admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
const BCRYPT_ROUNDS = 12;

// Compared against when the email doesn't exist, so login timing doesn't reveal valid emails.
const DUMMY_HASH = bcrypt.hashSync("aurawell-timing-equaliser", BCRYPT_ROUNDS);

// The stored hash is keyed with ADMIN_SESSION_SECRET, so a leaked database alone can't forge sessions.
const hashToken = (token) => hmacSha256Hex(env.sessionSecret, token);

export async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash || DUMMY_HASH);
}

export async function authenticateAdmin(email, password) {
  const admin = await prisma.adminUser.findUnique({ where: { email } });
  const valid = await verifyPassword(password, admin?.passwordHash);
  if (!admin || !valid || !admin.isActive) return null;
  return admin;
}

export async function createSession(adminId) {
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.$transaction([
    prisma.adminSession.deleteMany({ where: { adminId, expiresAt: { lt: new Date() } } }),
    prisma.adminSession.create({ data: { tokenHash: hashToken(token), csrfToken: randomToken(24), adminId, expiresAt } }),
    prisma.adminUser.update({ where: { id: adminId }, data: { lastLoginAt: new Date() } }),
  ]);

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });
}

/** Returns { admin, session } for a valid, unexpired session of an active admin, else null. */
export async function getCurrentAdmin() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { admin: { select: { id: true, name: true, email: true, role: true, isActive: true } } },
  });
  if (!session || session.expiresAt < new Date() || !session.admin.isActive) return null;

  const { admin, ...rest } = session;
  return { admin, session: rest };
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await prisma.adminSession.deleteMany({ where: { tokenHash: hashToken(token) } });
  store.delete(SESSION_COOKIE);
}

/** For admin server components/pages: redirects to the login page when not signed in. */
export async function requireAdminPage() {
  const current = await getCurrentAdmin();
  if (!current) redirect("/login");
  return current;
}

/**
 * For admin API route handlers. Checks the session and, for state-changing methods,
 * the per-session CSRF token sent in the `x-csrf-token` header.
 */
export async function requireAdminApi(request) {
  const current = await getCurrentAdmin();
  if (!current) throw new HttpError(401, "Unauthorized");
  if (!["GET", "HEAD"].includes(request.method)) {
    const header = request.headers.get("x-csrf-token");
    if (!safeEqualString(header, current.session.csrfToken)) throw new HttpError(403, "Forbidden");
  }
  return current;
}
