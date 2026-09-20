import "server-only";
import { headers } from "next/headers";

/**
 * The admin panel is reachable two ways:
 *   • on its own host (admin.example.com, localhost:3001) — clean URLs: /products
 *   • on the store host as a path            — prefixed URLs: /admin/products
 *
 * This returns the prefix to put in front of every admin link for the current request.
 */
export async function getAdminBase() {
  if (process.env.APP_MODE === "admin") return "";

  const host = ((await headers()).get("host") || "").toLowerCase();
  const adminHosts = (process.env.ADMIN_HOSTS || "localhost:3001,admin.localhost:3000")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);

  return adminHosts.includes(host) ? "" : "/admin";
}
