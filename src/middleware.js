import { NextResponse } from "next/server";

/**
 * The admin panel can be reached two ways:
 *
 *   1. On its own host — ADMIN_HOSTS (e.g. admin.aaurawell.com, localhost:3001)
 *      or a process started with APP_MODE=admin. Clean URLs: /products, /orders…
 *   2. On the store host under /admin — always available, so there is a working
 *      admin URL even before a separate admin domain is set up (useful on Vercel).
 *      Set ADMIN_PATH=off to turn this off once the admin domain works.
 *
 * Either way the panel still requires a login, and its pages are never indexed.
 */

// Paths the admin site may serve as-is.
const ADMIN_PASSTHROUGH = [/^\/_next\//, /^\/images\//, /^\/api\/admin(\/|$)/, /^\/api\/media\//, /^\/favicon\.ico$/, /^\/icon\.svg/];

function withAdminHeaders(response) {
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

function adminHosts() {
  return (process.env.ADMIN_HOSTS || "localhost:3001,admin.localhost:3000")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminHost(request) {
  if (process.env.APP_MODE === "admin") return true;
  if (process.env.APP_MODE === "store") return false;
  return adminHosts().includes((request.headers.get("host") || "").toLowerCase());
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // --- Admin host: serve the panel at the root -------------------------------
  if (isAdminHost(request)) {
    if (/^\/(_next|images)\//.test(pathname)) return NextResponse.next();
    if (ADMIN_PASSTHROUGH.some((re) => re.test(pathname))) return withAdminHeaders(NextResponse.next());

    // /admin/... → the same page without the prefix
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      const url = request.nextUrl.clone();
      url.pathname = pathname.slice("/admin".length) || "/";
      return NextResponse.redirect(url);
    }

    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/admin" : `/admin${pathname}`;
    return withAdminHeaders(NextResponse.rewrite(url));
  }

  // --- Store host ------------------------------------------------------------
  const adminPathEnabled = process.env.ADMIN_PATH !== "off";
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminApi = pathname === "/api/admin" || pathname.startsWith("/api/admin/");

  if (isAdminPath || isAdminApi) {
    if (!adminPathEnabled) {
      const url = request.nextUrl.clone();
      url.pathname = "/__not-found";
      return NextResponse.rewrite(url, { status: 404 });
    }
    return withAdminHeaders(NextResponse.next());
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs", // read ADMIN_HOSTS / APP_MODE / ADMIN_PATH at runtime, not build time
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
