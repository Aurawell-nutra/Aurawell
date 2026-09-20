// Cross-platform launcher for the store and admin sites.
//   node scripts/run.mjs dev store     → http://localhost:3000
//   node scripts/run.mjs dev admin     → http://localhost:3001
//   node scripts/run.mjs start admin   → production admin server on ADMIN_PORT (default 3001)
// Both sites run from the same codebase; src/middleware.js decides what each one serves.
import { spawn } from "node:child_process";

const [command = "dev", site = "store"] = process.argv.slice(2);
if (!["dev", "start"].includes(command) || !["store", "admin"].includes(site)) {
  console.error("Usage: node scripts/run.mjs <dev|start> <store|admin>");
  process.exit(1);
}

const isAdmin = site === "admin";
const port = isAdmin ? process.env.ADMIN_PORT || "3001" : process.env.PORT || "3000";

const env = {
  ...process.env,
  APP_MODE: site,
  // Two dev servers can't share one build folder; production start reuses the single build.
  ...(command === "dev" && isAdmin && { NEXT_DIST_DIR: ".next-admin" }),
};

const child = spawn("npx", ["next", command, "-p", port], { stdio: "inherit", env, shell: process.platform === "win32" });
child.on("exit", (code) => process.exit(code ?? 0));
