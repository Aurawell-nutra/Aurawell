import "server-only";
import { PrismaClient } from "@prisma/client";

// Reuse one PrismaClient across hot reloads in development.
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__aurawellPrisma ??
  new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.__aurawellPrisma = prisma;
