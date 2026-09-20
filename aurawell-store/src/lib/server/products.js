import "server-only";
import { prisma } from "./db.js";

// Literal Tailwind classes per theme so each product keeps its label colour in the UI.
const THEMES = {
  blush: { bg: "bg-blush", accent: "text-berry", button: "bg-berry hover:bg-berry/90", outline: "border-berry text-berry", tint: "from-blush" },
  sage: { bg: "bg-sage", accent: "text-leaf", button: "bg-forest hover:bg-forest-dark", outline: "border-forest text-forest", tint: "from-sage" },
  peach: { bg: "bg-peach", accent: "text-tangerine", button: "bg-tangerine hover:bg-tangerine/90", outline: "border-tangerine text-tangerine", tint: "from-peach" },
  rose: { bg: "bg-rose", accent: "text-crimson", button: "bg-crimson hover:bg-crimson/90", outline: "border-crimson text-crimson", tint: "from-rose" },
};

// Custom colours use CSS variables set on the product wrapper (see themeFor).
const CUSTOM_THEME = {
  bg: "bg-[var(--brand-soft)]",
  accent: "text-[var(--brand)]",
  button: "bg-[var(--brand)] hover:brightness-95",
  outline: "border-[var(--brand)] text-[var(--brand)]",
  tint: "from-[var(--brand-soft)]",
};

/** Mixes a #RRGGBB colour with white (amount 0–1 of white) for the soft background. */
function lighten(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c) => Math.round(c + (255 - c) * amount).toString(16).padStart(2, "0");
  return `#${mix((n >> 16) & 255)}${mix((n >> 8) & 255)}${mix(n & 255)}`;
}

function themeFor(value) {
  if (/^#[0-9a-fA-F]{6}$/.test(value ?? "")) {
    return { ...CUSTOM_THEME, style: { "--brand": value, "--brand-soft": lighten(value, 0.88) } };
  }
  return THEMES[value] ?? THEMES.sage;
}

const COMMON_FAQS = [
  { q: "How many gummies should I take in a day?", a: "Take 1 gummy daily, or as directed by a healthcare professional." },
  { q: "Are these gummies gelatin free?", a: "Yes. Aaurawell gummies are gelatin free, with no artificial colours or flavours." },
  { q: "How many gummies are in a bottle?", a: "Each bottle contains 30 gummies — a one-month supply at one gummy a day." },
];

/** Shapes a database product for the storefront components. Prices are converted to rupees for display. */
export function toStorefrontProduct(p, ratingStats) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    subtitle: p.subtitle ?? p.category,
    tagline: p.tagline ?? "",
    description: p.shortDescription,
    about: p.description,
    script: p.scriptLines,
    price: p.price / 100,
    mrp: p.compareAtPrice ? p.compareAtPrice / 100 : null,
    count: p.servingCount,
    flavour: p.flavour ?? "",
    rating: ratingStats?.average ?? null,
    reviews: ratingStats?.count ?? 0,
    benefits: Array.isArray(p.benefits) ? p.benefits : [],
    ingredients: Array.isArray(p.ingredients) ? p.ingredients.map((i) => [i.name, i.quantity, i.unit]) : [],
    image: p.mainImage,
    heroImage: p.heroImage ?? p.mainImage,
    banner: p.galleryImages[0] ?? p.mainImage,
    gallery: [p.mainImage, ...p.galleryImages],
    theme: themeFor(p.theme),
    suggestedUse: p.usageInstructions,
    caution: p.warnings,
    storage: p.storageInfo ?? "",
    faqs: COMMON_FAQS,
    inStock: p.stockQuantity > 0,
    stockQuantity: p.stockQuantity,
  };
}

async function ratingStatsFor(productIds) {
  if (productIds.length === 0) return new Map();
  const rows = await prisma.review.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds }, status: "APPROVED" },
    _avg: { rating: true },
    _count: { _all: true },
  });
  return new Map(rows.map((r) => [r.productId, { average: Math.round(r._avg.rating * 10) / 10, count: r._count._all }]));
}

export async function listActiveProducts() {
  const products = await prisma.product.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  const stats = await ratingStatsFor(products.map((p) => p.id));
  return products.map((p) => toStorefrontProduct(p, stats.get(p.id)));
}

export async function getActiveProductBySlug(slug) {
  if (typeof slug !== "string" || !/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  const product = await prisma.product.findFirst({ where: { slug, isActive: true } });
  if (!product) return null;
  const stats = await ratingStatsFor([product.id]);
  return toStorefrontProduct(product, stats.get(product.id));
}
