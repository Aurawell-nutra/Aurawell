import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  canTransitionOrder,
  checkoutSchema,
  customerSchema,
  imagePathSchema,
  orderUpdateSchema,
  productSchema,
  reviewSubmitSchema,
  reviewUpdateSchema,
} from "../../src/lib/server/validation.js";

const customer = {
  name: "Priya Sharma",
  email: "Priya@Example.com",
  phone: "98765 43210",
  addressLine1: "12 Lotus Residency, SG Highway",
  city: "Ahmedabad",
  state: "Gujarat",
  postalCode: "380015",
  country: "India",
};
const checkout = (overrides = {}) => ({
  customer,
  items: [{ productId: "clx1abc", quantity: 2 }],
  checkoutKey: "7f1b8c0e-3a55-4a57-9d1e-2c7a7d6b9f10",
  ...overrides,
});

const product = (overrides = {}) => ({
  name: "Gut Comfort",
  slug: "gut-comfort-gummy",
  shortDescription: "Probiotics and botanicals for digestive comfort.",
  description: "A longer description of the product that is long enough.",
  price: 599,
  compareAtPrice: 699,
  stockQuantity: 100,
  sku: "AW-GUT-30",
  mainImage: "/images/products/gut-comfort-gummy.webp",
  galleryImages: ["/images/banners/gut-comfort-gummy-banner.webp"],
  ingredients: [{ name: "Amla Extract", quantity: "50", unit: "mg" }],
  benefits: [{ icon: "leaf", label: "Natural Goodness" }],
  usageInstructions: "Take 1 gummy daily.",
  warnings: "Keep out of reach of children.",
  category: "Gut Wellness",
  ...overrides,
});

describe("checkout validation", () => {
  test("accepts a valid checkout and normalises email and phone", () => {
    const data = checkoutSchema.parse(checkout());
    assert.equal(data.customer.email, "priya@example.com");
    assert.equal(data.customer.phone, "+919876543210");
  });

  test("rejects an empty cart", () => {
    assert.equal(checkoutSchema.safeParse(checkout({ items: [] })).success, false);
  });

  for (const [field, value] of [
    ["email", "not-an-email"],
    ["phone", "12345"],
    ["phone", "5876543210"],
    ["addressLine1", ""],
    ["postalCode", "38001"],
    ["postalCode", "012345"],
    ["state", "Atlantis"],
    ["country", "Narnia"],
    ["name", "<script>alert(1)</script>"],
  ]) {
    test(`rejects invalid ${field}: ${JSON.stringify(value)}`, () => {
      assert.equal(customerSchema.safeParse({ ...customer, [field]: value }).success, false);
    });
  }

  test("rejects invalid product ids and quantities", () => {
    for (const items of [
      [{ productId: "../etc/passwd", quantity: 1 }],
      [{ productId: "abc", quantity: 0 }],
      [{ productId: "abc", quantity: 11 }],
      [{ productId: "abc", quantity: 1.5 }],
      [{ productId: "abc", quantity: "2" }],
      [{ productId: "abc", quantity: 1 }, { productId: "abc", quantity: 1 }],
    ]) {
      assert.equal(checkoutSchema.safeParse(checkout({ items })).success, false, JSON.stringify(items));
    }
  });

  test("rejects client-supplied prices and totals (manipulation attempts)", () => {
    assert.equal(checkoutSchema.safeParse(checkout({ items: [{ productId: "abc", quantity: 1, price: 1 }] })).success, false);
    assert.equal(checkoutSchema.safeParse({ ...checkout(), totalAmount: 100 }).success, false);
  });

  test("requires a UUID idempotency key", () => {
    assert.equal(checkoutSchema.safeParse(checkout({ checkoutKey: "abc" })).success, false);
  });
});

describe("product validation", () => {
  test("accepts a valid product and converts rupees to paise", () => {
    const data = productSchema.parse(product());
    assert.equal(data.price, 59900);
    assert.equal(data.compareAtPrice, 69900);
  });

  test("rejects an empty name", () => {
    assert.equal(productSchema.safeParse(product({ name: "" })).success, false);
  });

  test("rejects invalid prices", () => {
    for (const price of [0, -10, "abc", 12.345]) {
      assert.equal(productSchema.safeParse(product({ price })).success, false, String(price));
    }
  });

  test("rejects a compare-at price lower than the price", () => {
    assert.equal(productSchema.safeParse(product({ price: 599, compareAtPrice: 499 })).success, false);
  });

  test("rejects negative or fractional stock", () => {
    assert.equal(productSchema.safeParse(product({ stockQuantity: -1 })).success, false);
    assert.equal(productSchema.safeParse(product({ stockQuantity: 1.5 })).success, false);
  });

  test("rejects invalid slugs", () => {
    for (const slug of ["Gut Comfort", "gut_comfort", "-gut", "../x"]) {
      assert.equal(productSchema.safeParse(product({ slug })).success, false, slug);
    }
  });

  test("rejects unknown fields", () => {
    assert.equal(productSchema.safeParse(product({ isAdmin: true })).success, false);
  });
});

describe("image path validation", () => {
  test("accepts local image paths", () => {
    for (const p of ["/images/products/gut.webp", "/images/banners/a-b_c.png", "/api/media/0123456789abcdef0123456789abcdef.jpg"]) {
      assert.equal(imagePathSchema.safeParse(p).success, true, p);
    }
  });

  test("rejects unsafe or external paths", () => {
    for (const p of [
      "https://evil.example/x.png",
      "//evil.example/x.png",
      "/images/../../etc/passwd",
      "/images/products/x.svg",
      "/images/products/x.php",
      "javascript:alert(1)",
      "/api/media/../../.env",
      "/images/products/x.webp?x=1",
    ]) {
      assert.equal(imagePathSchema.safeParse(p).success, false, p);
    }
  });
});

describe("review validation", () => {
  const review = { customerName: "Neha", customerEmail: "neha@example.com", rating: 5, comment: "Lovely taste, easy to take daily." };

  test("accepts a valid review", () => {
    assert.equal(reviewSubmitSchema.safeParse(review).success, true);
  });

  test("rejects invalid ratings", () => {
    for (const rating of [0, 6, 4.5, "5"]) assert.equal(reviewSubmitSchema.safeParse({ ...review, rating }).success, false, String(rating));
  });

  test("rejects empty and excessively long comments", () => {
    assert.equal(reviewSubmitSchema.safeParse({ ...review, comment: "" }).success, false);
    assert.equal(reviewSubmitSchema.safeParse({ ...review, comment: "a".repeat(1001) }).success, false);
  });

  test("rejects HTML in review text", () => {
    assert.equal(reviewSubmitSchema.safeParse({ ...review, comment: "<img src=x onerror=alert(1)> great" }).success, false);
  });

  test("rejects a filled honeypot", () => {
    assert.equal(reviewSubmitSchema.safeParse({ ...review, website: "http://spam" }).success, false);
  });

  test("admin review update accepts only known statuses", () => {
    assert.equal(reviewUpdateSchema.safeParse({ status: "APPROVED" }).success, true);
    assert.equal(reviewUpdateSchema.safeParse({ status: "PUBLISHED" }).success, false);
    assert.equal(reviewUpdateSchema.safeParse({}).success, false);
  });
});

describe("order status rules", () => {
  test("allows the normal fulfilment path for paid orders", () => {
    assert.ok(canTransitionOrder("CONFIRMED", "PROCESSING", "PAID"));
    assert.ok(canTransitionOrder("PROCESSING", "SHIPPED", "PAID"));
    assert.ok(canTransitionOrder("SHIPPED", "DELIVERED", "PAID"));
  });

  test("blocks invalid transitions", () => {
    assert.equal(canTransitionOrder("DELIVERED", "PENDING", "PAID"), false);
    assert.equal(canTransitionOrder("CANCELLED", "SHIPPED", "PAID"), false);
    assert.equal(canTransitionOrder("CONFIRMED", "DELIVERED", "PAID"), false);
  });

  test("unpaid orders can only be cancelled", () => {
    assert.equal(canTransitionOrder("PENDING", "CONFIRMED", "PENDING"), false);
    assert.ok(canTransitionOrder("PENDING", "CANCELLED", "PENDING"));
  });

  test("admin cannot set arbitrary payment statuses", () => {
    assert.equal(orderUpdateSchema.safeParse({ paymentStatus: "PAID" }).success, false);
    assert.equal(orderUpdateSchema.safeParse({ paymentStatus: "REFUNDED" }).success, true);
  });
});
