// Creates (or resets the password of) an admin user.
// Usage: set ADMIN_SEED_NAME, ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD in .env, then `npm run admin:create`.
// Remove ADMIN_SEED_PASSWORD from .env afterwards.
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { emailSchema, passwordSchema } from "../src/lib/server/validation.js";

const prisma = new PrismaClient();

async function main() {
  const name = (process.env.ADMIN_SEED_NAME || "Store Admin").trim().slice(0, 80);
  const email = emailSchema.safeParse(process.env.ADMIN_SEED_EMAIL || "");
  const password = passwordSchema.safeParse(process.env.ADMIN_SEED_PASSWORD || "");

  if (!email.success) throw new Error("ADMIN_SEED_EMAIL is missing or invalid.");
  if (!password.success) throw new Error(`ADMIN_SEED_PASSWORD is too weak: ${password.error.issues.map((i) => i.message).join(", ")}.`);

  const passwordHash = await bcrypt.hash(password.data, 12);
  const admin = await prisma.adminUser.upsert({
    where: { email: email.data },
    update: { passwordHash, isActive: true },
    create: { name, email: email.data, passwordHash, role: "OWNER" },
  });
  await prisma.adminSession.deleteMany({ where: { adminId: admin.id } });
  console.log(`✓ Admin ready: ${admin.email}. Remove ADMIN_SEED_PASSWORD from .env now.`);
}

main()
  .catch((err) => {
    console.error("Could not create admin:", err.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
