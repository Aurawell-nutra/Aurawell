// Zod schemas for every request body the server accepts.
// Objects are `.strict()` so unexpected fields (e.g. a client-sent price or total) are rejected.
import { z } from "zod";
import { MAX_ITEMS_PER_ORDER, MAX_QUANTITY_PER_ITEM } from "../pricing-rules.js";
import { INDIAN_STATES, SUPPORTED_COUNTRIES } from "../constants.js";

const trimmed = (min, max) => z.string().trim().min(min).max(max);
const optionalTrimmed = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

// Rejects control characters and angle brackets in plain-text fields.
const safeText = (min, max) => trimmed(min, max).regex(/^[^<>\u0000-\u001f\u007f]*$/, "Contains invalid characters");
const safeMultiline = (min, max) => trimmed(min, max).regex(/^[^<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]*$/, "Contains invalid characters");

export const idSchema = z.string().trim().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/);
export const slugSchema = z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens");
export const emailSchema = z.string().trim().toLowerCase().max(254).email();

// Indian mobile numbers: optional +91 / 91 / 0 prefix, then 10 digits starting 6–9.
export const phoneSchema = z
  .string()
  .trim()
  .max(20)
  .transform((v) => v.replace(/[\s()-]/g, ""))
  .refine((v) => /^(?:\+?91|0)?[6-9]\d{9}$/.test(v), "Enter a valid 10-digit mobile number")
  .transform((v) => `+91${v.slice(-10)}`);
export { INDIAN_STATES, SUPPORTED_COUNTRIES };

export const customerSchema = z
  .object({
    name: safeText(2, 80).regex(/^[\p{L} .'-]+$/u, "Enter a valid name"),
    email: emailSchema,
    phone: phoneSchema,
    addressLine1: safeText(5, 160),
    addressLine2: optionalTrimmed(160).refine((v) => !v || /^[^<>\u0000-\u001f\u007f]*$/.test(v), "Contains invalid characters"),
    city: safeText(2, 60).regex(/^[\p{L} .'-]+$/u, "Enter a valid city"),
    state: z.enum(INDIAN_STATES),
    postalCode: z.string().trim().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code"),
    country: z.enum(SUPPORTED_COUNTRIES),
  })
  .strict();

export const cartLineSchema = z
  .object({
    productId: idSchema,
    quantity: z.number().int().min(1).max(MAX_QUANTITY_PER_ITEM),
  })
  .strict();

export const checkoutSchema = z
  .object({
    customer: customerSchema,
    items: z
      .array(cartLineSchema)
      .min(1, "Your cart is empty")
      .max(MAX_ITEMS_PER_ORDER)
      .refine((items) => new Set(items.map((i) => i.productId)).size === items.length, "Duplicate products in cart"),
    checkoutKey: z.string().uuid(),
  })
  .strict();

export const paymentVerifySchema = z
  .object({
    orderNumber: z.string().trim().regex(/^AW[0-9A-Z]{6,20}$/),
    razorpay_order_id: z.string().trim().regex(/^order_[A-Za-z0-9]{6,40}$/),
    razorpay_payment_id: z.string().trim().regex(/^pay_[A-Za-z0-9]{6,40}$/),
    razorpay_signature: z.string().trim().regex(/^[a-f0-9]{64}$/),
  })
  .strict();

export const paymentFailedSchema = z
  .object({
    orderNumber: z.string().trim().regex(/^AW[0-9A-Z]{6,20}$/),
    razorpay_order_id: z.string().trim().regex(/^order_[A-Za-z0-9]{6,40}$/),
  })
  .strict();

export const orderLookupSchema = z
  .object({
    orderNumber: z.string().trim().toUpperCase().regex(/^AW[0-9A-Z]{6,20}$/, "Enter a valid order number"),
    email: emailSchema,
  })
  .strict();

export const reviewSubmitSchema = z
  .object({
    customerName: safeText(2, 60),
    customerEmail: emailSchema,
    rating: z.number().int().min(1).max(5),
    title: optionalTrimmed(100).refine((v) => !v || /^[^<>\u0000-\u001f\u007f]*$/.test(v), "Contains invalid characters"),
    comment: safeMultiline(10, 1000),
    website: z.string().max(0).optional(), // honeypot — must stay empty
  })
  .strict();

// Local image paths only: bundled assets under /images, or admin uploads served by /api/media.
export const IMAGE_PATH_REGEX = /^(?:\/images\/(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.(?:webp|png|jpe?g)|\/api\/media\/[a-f0-9]{32}\.(?:webp|png|jpg))$/;
export const imagePathSchema = z.string().trim().max(200).regex(IMAGE_PATH_REGEX, "Use a local image path");

export const PRODUCT_THEMES = ["blush", "sage", "peach", "rose"];
export const BENEFIT_ICONS = ["heart", "flower", "smile", "leaf", "apple", "activity", "shield", "zap", "droplet", "sparkles"];

// Admin form sends prices in rupees; the schema converts them to paise.
const rupees = z.coerce
  .number()
  .finite()
  .positive("Must be greater than 0")
  .max(1000000)
  .refine((v) => Number.isInteger(Math.round(v * 100)) && Math.abs(v * 100 - Math.round(v * 100)) < 1e-6, "Max 2 decimal places")
  .transform((v) => Math.round(v * 100));

export const productSchema = z
  .object({
    name: safeText(2, 100),
    slug: slugSchema,
    shortDescription: safeText(10, 200),
    description: safeMultiline(20, 3000),
    price: rupees,
    compareAtPrice: z.union([rupees, z.literal("").transform(() => null), z.null()]).optional().transform((v) => v ?? null),
    stockQuantity: z.coerce.number().int("Must be a whole number").min(0, "Stock cannot be negative").max(1000000),
    sku: z
      .union([z.string().trim().max(40).regex(/^[A-Z0-9-]*$/, "Use uppercase letters, numbers and hyphens"), z.null()])
      .optional()
      .transform((v) => (v ? v : null)),
    mainImage: imagePathSchema,
    heroImage: z.union([imagePathSchema, z.literal(""), z.null()]).optional().transform((v) => v || null),
    galleryImages: z.array(imagePathSchema).max(8).default([]),
    ingredients: z
      .array(z.object({ name: safeText(1, 80), quantity: safeText(1, 20), unit: safeText(1, 20) }).strict())
      .max(40)
      .default([]),
    benefits: z.array(z.object({ icon: z.enum(BENEFIT_ICONS), label: safeText(2, 40) }).strict()).max(8).default([]),
    usageInstructions: safeMultiline(5, 1000),
    warnings: safeMultiline(5, 2000),
    storageInfo: z.union([safeMultiline(0, 500), z.null()]).optional().transform((v) => v || null),
    category: safeText(2, 60),
    subtitle: z.union([safeText(0, 80), z.null()]).optional().transform((v) => v || null),
    tagline: z.union([safeText(0, 120), z.null()]).optional().transform((v) => v || null),
    flavour: z.union([safeText(0, 60), z.null()]).optional().transform((v) => v || null),
    servingCount: z.coerce.number().int().min(1).max(1000).default(30),
    // A preset name, or a custom brand colour as #RRGGBB.
    theme: z.union([z.enum(PRODUCT_THEMES), z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Choose a valid colour")]).default("sage"),
    scriptLines: z.array(safeText(1, 30)).max(3).default([]),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    sortOrder: z.coerce.number().int().min(0).max(10000).default(0),
  })
  .strict()
  .refine((p) => p.compareAtPrice == null || p.compareAtPrice >= p.price, {
    message: "Compare-at price cannot be lower than the selling price",
    path: ["compareAtPrice"],
  });

export const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
export const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"];
export const REVIEW_STATUSES = ["PENDING", "APPROVED", "REJECTED"];

export const orderUpdateSchema = z
  .object({
    orderStatus: z.enum(ORDER_STATUSES).optional(),
    paymentStatus: z.literal("REFUNDED").optional(), // admins may only mark a paid order as refunded
    notes: z.union([safeMultiline(0, 2000), z.null()]).optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, "Nothing to update");

export const reviewUpdateSchema = z
  .object({
    status: z.enum(REVIEW_STATUSES).optional(),
    isFeatured: z.boolean().optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, "Nothing to update");

export const adminLoginSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1).max(200),
  })
  .strict();

export const passwordSchema = z
  .string()
  .min(12, "Use at least 12 characters")
  .max(200)
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[0-9]/, "Include a number");

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1).max(200),
    newPassword: passwordSchema,
  })
  .strict();

// Order status transitions an admin is allowed to make.
export const ORDER_TRANSITIONS = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function canTransitionOrder(from, to, paymentStatus) {
  if (from === to) return true;
  if (!ORDER_TRANSITIONS[from]?.includes(to)) return false;
  // Unpaid orders can only be cancelled — never shipped.
  if (paymentStatus !== "PAID" && to !== "CANCELLED") return false;
  return true;
}

/** Flattens a ZodError into { field: message } for forms, without leaking internals. */
export function fieldErrors(error) {
  const out = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
