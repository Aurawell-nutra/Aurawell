import { NextResponse } from "next/server";

/**
 * Splits one Next.js app into two sites by host:
 *   • Admin site  — ADMIN_HOSTS (e.g. admin.aaurawell.com, localhost:3001) or APP_MODE=admin
 *   • Store site  — everything else
 *
 * On the admin site, clean URLs (/products) are rewritten to the internal /admin/* routes and
 * every storefront page and public API is unreachable. On the store site, /admin and
 * /api/admin return 404, so the admin panel is never exposed on the public domain.
 */

const NOT_FOUND = "/__not-found";

// Paths the admin site may serve as-is.
const ADMIN_PASSTHROUGH = [/^\/_next\//, /^\/images\//, /^\/api\/admin(\/|$)/, /^\/api\/media\//, /^\/favicon\.ico$/, /^\/icon\.svg/];

// The admin site must never be cached by shared caches or indexed by search engines.
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

function isAdminRequest(request) {
  if (process.env.APP_MODE === "admin") return true;
  if (process.env.APP_MODE === "store") return false;
  const host = (request.headers.get("host") || "").toLowerCase();
  return adminHosts().includes(host);
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const admin = isAdminRequest(request);

  if (admin) {
    if (/^\/(_next|images)\//.test(pathname)) return NextResponse.next();
    if (ADMIN_PASSTHROUGH.some((re) => re.test(pathname))) return withAdminHeaders(NextResponse.next());

    // Old /admin/... links → canonical clean URL on the admin host.
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      const url = request.nextUrl.clone();
      url.pathname = pathname.slice("/admin".length) || "/";
      return NextResponse.redirect(url);
    }

    // Everything else (including storefront pages and public APIs) maps into /admin/*,
    // where unknown paths simply 404.
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/admin" : `/admin${pathname}`;
    return withAdminHeaders(NextResponse.rewrite(url));
  }

  // Store host: hide the admin panel and admin APIs completely.
  if (pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/api/admin" || pathname.startsWith("/api/admin/")) {
    const url = request.nextUrl.clone();
    url.pathname = NOT_FOUND;
    return NextResponse.rewrite(url, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs", // read ADMIN_HOSTS / APP_MODE at runtime, not build time
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
