// Seeds the catalogue from src/data/products.js (idempotent — safe to run repeatedly).
// Existing products are matched by slug; stock and admin edits are not overwritten.
import { PrismaClient } from "@prisma/client";
import { products } from "../src/data/products.js";

const prisma = new PrismaClient();

const THEME_BY_BG = { "bg-blush": "blush", "bg-sage": "sage", "bg-peach": "peach", "bg-rose": "rose" };
const SKU = {
  "pms-care-gummy": "AW-PMS-30",
  "gut-comfort-gummy": "AW-GUT-30",
  "daily-nutra-gummy": "AW-DAILY-30",
  "iron-glow-gummy": "AW-IRON-30",
};

async function main() {
  for (const [index, p] of products.entries()) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug }, select: { id: true } });
    if (existing) {
      console.log(`• ${p.name} already exists — skipped`);
      continue;
    }
    await prisma.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        shortDescription: p.description,
        description: p.about,
        price: Math.round(p.price * 100),
        compareAtPrice: p.mrp ? Math.round(p.mrp * 100) : null,
        stockQuantity: 100,
        sku: SKU[p.slug] ?? null,
        mainImage: p.image,
        heroImage: p.heroImage,
        galleryImages: [p.banner],
        ingredients: p.ingredients.map(([name, quantity, unit]) => ({ name, quantity, unit })),
        benefits: p.benefits,
        usageInstructions: p.suggestedUse,
        warnings: p.caution,
        storageInfo: p.storage,
        category: p.category,
        subtitle: p.subtitle,
        tagline: p.tagline,
        flavour: p.flavour,
        servingCount: p.count,
        theme: THEME_BY_BG[p.theme.bg] ?? "sage",
        scriptLines: p.script,
        isActive: true,
        isFeatured: true,
        sortOrder: index,
      },
    });
    console.log(`✓ Created ${p.name}`);
  }
}

main()
  .catch((err) => {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
