// End-to-end API tests against a running server and a real (development/test) database.
//   1. Configure .env (DATABASE_URL, ADMIN_SESSION_SECRET, RAZORPAY_WEBHOOK_SECRET, NEXT_PUBLIC_APP_URL)
//   2. npm run dev  and  npm run dev:admin   (in other terminals)
//   3. npm run test:integration
// NEVER run against a production database: the tests create and delete their own records.
import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const BASE = (process.env.TEST_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
// The admin API is only served on the admin site (npm run dev:admin).
const ADMIN_BASE = (process.env.TEST_ADMIN_URL || process.env.ADMIN_APP_URL || "http://localhost:3001").replace(/\/$/, "");
const configured = Boolean(process.env.DATABASE_URL && process.env.ADMIN_SESSION_SECRET);
const skip = configured ? false : "Set DATABASE_URL and ADMIN_SESSION_SECRET in .env to run integration tests";

const prisma = configured ? new PrismaClient() : null;
const RUN = crypto.randomBytes(4).toString("hex");
const ADMIN = { email: `it-admin-${RUN}@example.com`, password: `Test-Password-${RUN}-A1` };
const created = { productIds: [], orderIds: [], adminId: null };

async function api(path, { method = "GET", body, cookie, csrf, origin, headers = {} } = {}) {
  const base = path.startsWith("/api/admin") ? ADMIN_BASE : BASE;
  if (origin === undefined) origin = base;
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      ...(body !== undefined && { "Content-Type": "application/json" }),
      ...(origin && { Origin: origin }),
      ...(cookie && { Cookie: cookie }),
      ...(csrf && { "x-csrf-token": csrf }),
      "x-forwarded-for": `10.${RUN.charCodeAt(0) % 250}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`,
      ...headers,
    },
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
    redirect: "manual",
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, headers: res.headers };
}

const productPayload = (overrides = {}) => ({
  name: `IT Gummy ${RUN} ${crypto.randomBytes(2).toString("hex")}`,
  slug: `it-gummy-${RUN}-${crypto.randomBytes(2).toString("hex")}`,
  shortDescription: "Integration test gummy description.",
  description: "Integration test product long description text.",
  price: 499,
  compareAtPrice: 599,
  stockQuantity: 5,
  sku: null,
  mainImage: "/images/products/gut-comfort-gummy.webp",
  galleryImages: [],
  ingredients: [{ name: "Test", quantity: "1", unit: "mg" }],
  benefits: [{ icon: "leaf", label: "Testing" }],
  usageInstructions: "Take 1 gummy daily.",
  warnings: "Keep out of reach of children.",
  category: "Test",
  isActive: true,
  ...overrides,
});

const customer = {
  name: "Test Customer",
  email: `buyer-${RUN}@example.com`,
  phone: "9876543210",
  addressLine1: "12 Test Street, Test Area",
  city: "Ahmedabad",
  state: "Gujarat",
  postalCode: "380015",
  country: "India",
};

let session = { cookie: null, csrf: null };

describe("Aurawell API", { skip }, () => {
  before(async () => {
    const health = await fetch(`${BASE}/api/products`).catch(() => null);
    assert.ok(health, `Store is not reachable at ${BASE}. Start it with "npm run dev".`);
    const adminHealth = await fetch(`${ADMIN_BASE}/api/admin/me`).catch(() => null);
    assert.ok(adminHealth, `Admin site is not reachable at ${ADMIN_BASE}. Start it with "npm run dev:admin".`);
    const admin = await prisma.adminUser.create({
      data: { name: "Integration Test", email: ADMIN.email, passwordHash: await bcrypt.hash(ADMIN.password, 10), role: "ADMIN" },
    });
    created.adminId = admin.id;
  });

  after(async () => {
    if (!prisma) return;
    await prisma.order.deleteMany({ where: { id: { in: created.orderIds } } });
    await prisma.review.deleteMany({ where: { productId: { in: created.productIds } } });
    await prisma.orderItem.deleteMany({ where: { productId: { in: created.productIds } } });
    await prisma.product.deleteMany({ where: { id: { in: created.productIds } } });
    if (created.adminId) await prisma.adminUser.delete({ where: { id: created.adminId } }).catch(() => {});
    await prisma.$disconnect();
  });

  describe("admin authentication", () => {
    test("the store domain does not expose the admin panel or admin API", async () => {
      assert.equal((await fetch(`${BASE}/admin/login`)).status, 404);
      assert.equal((await fetch(`${BASE}/api/admin/me`)).status, 404);
    });

    test("admin APIs reject unauthenticated requests", async () => {
      assert.equal((await api("/api/admin/products")).status, 401);
      assert.equal((await api("/api/admin/orders")).status, 401);
      assert.equal((await api("/api/admin/reviews")).status, 401);
    });

    test("invalid login returns a generic 401", async () => {
      const res = await api("/api/admin/login", { method: "POST", body: { email: ADMIN.email, password: "wrong-password" } });
      assert.equal(res.status, 401);
      assert.equal(res.data.error, "Invalid email or password.");
      const unknown = await api("/api/admin/login", { method: "POST", body: { email: `nobody-${RUN}@example.com`, password: "x" } });
      assert.equal(unknown.data.error, "Invalid email or password.");
    });

    test("brute-force attempts on one account are rate limited", async () => {
      const email = `brute-${RUN}@example.com`;
      const statuses = [];
      for (let i = 0; i < 7; i++) statuses.push((await api("/api/admin/login", { method: "POST", body: { email, password: `guess${i}` } })).status);
      assert.ok(statuses.includes(429), `expected a 429, got ${statuses}`);
    });

    test("login rejects cross-origin requests", async () => {
      const res = await api("/api/admin/login", { method: "POST", body: ADMIN, origin: "https://evil.example" });
      assert.equal(res.status, 403);
    });

    test("valid login sets a secure session cookie", async () => {
      const res = await api("/api/admin/login", { method: "POST", body: ADMIN });
      assert.equal(res.status, 200);
      const setCookie = res.headers.get("set-cookie") || "";
      assert.match(setCookie, /aw_admin_session=/);
      assert.match(setCookie, /HttpOnly/i);
      assert.match(setCookie, /SameSite=Strict/i);
      session.cookie = setCookie.split(";")[0];
      const latest = await prisma.adminSession.findFirst({ where: { adminId: created.adminId }, orderBy: { createdAt: "desc" } });
      session.csrf = latest.csrfToken;
      assert.equal((await api("/api/admin/me", { cookie: session.cookie })).status, 200);
    });

    test("state-changing admin requests require the CSRF token", async () => {
      const res = await api("/api/admin/products", { method: "POST", body: productPayload(), cookie: session.cookie });
      assert.equal(res.status, 403);
    });
  });

  describe("product management", () => {
    let product;

    test("creates a valid product", async () => {
      const res = await api("/api/admin/products", { method: "POST", body: productPayload(), cookie: session.cookie, csrf: session.csrf });
      assert.equal(res.status, 201, JSON.stringify(res.data));
      product = res.data.product;
      created.productIds.push(product.id);
      assert.equal(product.price, 499);
    });

    test("rejects empty name, invalid price, negative stock and bad compare-at price", async () => {
      for (const overrides of [{ name: "" }, { price: 0 }, { price: -5 }, { stockQuantity: -1 }, { compareAtPrice: 100 }]) {
        const res = await api("/api/admin/products", { method: "POST", body: productPayload(overrides), cookie: session.cookie, csrf: session.csrf });
        assert.equal(res.status, 400, JSON.stringify(overrides));
      }
    });

    test("rejects a duplicate slug", async () => {
      const res = await api("/api/admin/products", { method: "POST", body: productPayload({ slug: product.slug }), cookie: session.cookie, csrf: session.csrf });
      assert.equal(res.status, 409);
    });

    test("updates a product", async () => {
      const { id, createdAt, updatedAt, ...rest } = product;
      void createdAt;
      void updatedAt;
      const res = await api(`/api/admin/products/${id}`, {
        method: "PATCH",
        body: { ...productPayload(), ...pick(rest), name: product.name, slug: product.slug, price: 549, compareAtPrice: 599 },
        cookie: session.cookie,
        csrf: session.csrf,
      });
      assert.equal(res.status, 200, JSON.stringify(res.data));
      assert.equal(res.data.product.price, 549);
      product = res.data.product;
    });

    test("inactive products cannot be checked out", async () => {
      const inactive = await createProduct({ isActive: false });
      const res = await api("/api/checkout/validate", { method: "POST", body: { items: [{ productId: inactive.id, quantity: 1 }] } });
      assert.equal(res.status, 409);
      assert.equal(res.data.problems[0].reason, "unavailable");
      assert.equal((await api(`/api/products/${inactive.slug}`)).status, 404);
    });
  });

  describe("checkout", () => {
    test("rejects an empty cart", async () => {
      assert.equal((await api("/api/checkout/validate", { method: "POST", body: { items: [] } })).status, 400);
    });

    test("rejects unknown product ids and invalid quantities", async () => {
      const unknown = await api("/api/checkout/validate", { method: "POST", body: { items: [{ productId: "doesnotexist123", quantity: 1 }] } });
      assert.equal(unknown.status, 409);
      const bad = await api("/api/checkout/validate", { method: "POST", body: { items: [{ productId: "abc", quantity: 99 }] } });
      assert.equal(bad.status, 400);
    });

    test("rejects manipulated prices and totals", async () => {
      const p = await createProduct();
      const res = await api("/api/orders/create", {
        method: "POST",
        body: { customer, items: [{ productId: p.id, quantity: 1, price: 1 }], checkoutKey: crypto.randomUUID(), totalAmount: 100 },
      });
      assert.equal(res.status, 400);
    });

    test("uses database prices, not client values", async () => {
      const p = await createProduct({ price: 499 });
      const res = await api("/api/checkout/validate", { method: "POST", body: { items: [{ productId: p.id, quantity: 2 }] } });
      assert.equal(res.status, 200);
      assert.equal(res.data.subtotal, 99800);
      assert.equal(res.data.totalAmount, 99800);
    });

    test("rejects out-of-stock products", async () => {
      const p = await createProduct({ stockQuantity: 0 });
      const res = await api("/api/checkout/validate", { method: "POST", body: { items: [{ productId: p.id, quantity: 1 }] } });
      assert.equal(res.status, 409);
      assert.equal(res.data.problems[0].reason, "out_of_stock");
    });

    test("rejects invalid customer details", async () => {
      const p = await createProduct();
      for (const bad of [{ email: "nope" }, { phone: "123" }, { addressLine1: "" }, { postalCode: "1234" }]) {
        const res = await api("/api/orders/create", {
          method: "POST",
          body: { customer: { ...customer, ...bad }, items: [{ productId: p.id, quantity: 1 }], checkoutKey: crypto.randomUUID() },
        });
        assert.equal(res.status, 400, JSON.stringify(bad));
      }
    });

    test("rejects requests without a same-site Origin", async () => {
      const res = await api("/api/checkout/validate", { method: "POST", body: { items: [] }, origin: null });
      assert.equal(res.status, 403);
    });
  });

  describe("payments", () => {
    test("payment verification rejects an invalid signature", async () => {
      const res = await api("/api/payment/verify", {
        method: "POST",
        body: { orderNumber: "AW260101ABCDEF", razorpay_order_id: "order_TEST123456", razorpay_payment_id: "pay_TEST123456", razorpay_signature: "0".repeat(64) },
      });
      assert.ok([400, 503].includes(res.status), String(res.status)); // 503 when Razorpay keys aren't configured
    });

    test("webhook rejects an invalid signature", { skip: !process.env.RAZORPAY_WEBHOOK_SECRET && "RAZORPAY_WEBHOOK_SECRET not set" }, async () => {
      const res = await api("/api/payment/webhook", { method: "POST", body: { event: "payment.captured" }, origin: null, headers: { "x-razorpay-signature": "bad" } });
      assert.equal(res.status, 400);
    });

    test("webhook marks an order paid once, deducts stock once, and ignores retries and wrong amounts", { skip: !process.env.RAZORPAY_WEBHOOK_SECRET && "RAZORPAY_WEBHOOK_SECRET not set" }, async () => {
      const p = await createProduct({ stockQuantity: 5, price: 499 });
      const order = await createPendingOrder(p, 2);

      const sendWebhook = (eventId, amount) => {
        const body = JSON.stringify({
          event: "payment.captured",
          payload: { payment: { entity: { id: `pay_IT${RUN}${eventId}`, order_id: order.razorpayOrderId, amount } } },
        });
        const signature = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET).update(body).digest("hex");
        return api("/api/payment/webhook", { method: "POST", body, origin: null, headers: { "x-razorpay-signature": signature, "x-razorpay-event-id": `evt_${RUN}_${eventId}` } });
      };

      // Wrong amount → not paid.
      assert.equal((await sendWebhook("wrong", 100)).status, 200);
      assert.equal((await prisma.order.findUnique({ where: { id: order.id } })).paymentStatus, "PENDING");

      // Correct payment → paid, stock deducted.
      assert.equal((await sendWebhook("ok", order.totalAmount)).status, 200);
      // Duplicate delivery of the same event and a different event for the same payment.
      assert.equal((await sendWebhook("ok", order.totalAmount)).data.duplicate, true);
      assert.equal((await sendWebhook("retry", order.totalAmount)).status, 200);

      const paid = await prisma.order.findUnique({ where: { id: order.id } });
      assert.equal(paid.paymentStatus, "PAID");
      assert.equal((await prisma.product.findUnique({ where: { id: p.id } })).stockQuantity, 3);
      await prisma.webhookEvent.deleteMany({ where: { id: { startsWith: `evt_${RUN}_` } } });
    });

    test("order lookup requires the matching email", async () => {
      const p = await createProduct();
      const order = await createPendingOrder(p, 1);
      assert.equal((await api("/api/orders/lookup", { method: "POST", body: { orderNumber: order.orderNumber, email: "someone@else.com" } })).status, 404);
      const ok = await api("/api/orders/lookup", { method: "POST", body: { orderNumber: order.orderNumber, email: customer.email } });
      assert.equal(ok.status, 200);
      assert.equal(ok.data.order.notes, undefined);
      assert.equal(ok.data.order.razorpaySignature, undefined);
    });

    test("admins cannot ship an unpaid order", async () => {
      const p = await createProduct();
      const order = await createPendingOrder(p, 1);
      const res = await api(`/api/admin/orders/${order.id}`, { method: "PATCH", body: { orderStatus: "SHIPPED" }, cookie: session.cookie, csrf: session.csrf });
      assert.equal(res.status, 400);
      const invalid = await api(`/api/admin/orders/${order.id}`, { method: "PATCH", body: { orderStatus: "LOST" }, cookie: session.cookie, csrf: session.csrf });
      assert.equal(invalid.status, 400);
    });
  });

  describe("reviews", () => {
    let product;
    before(async () => {
      product = await createProduct();
    });

    const review = (overrides = {}) => ({ customerName: "Review Tester", customerEmail: `rev-${RUN}-${Math.random()}@example.com`, rating: 5, comment: "Really enjoyable and easy to take.", ...overrides });
    const publicReviews = async () => (await api(`/api/products/${product.slug}/reviews`)).data.reviews;

    test("rejects invalid ratings, empty and overlong reviews", async () => {
      for (const bad of [{ rating: 0 }, { rating: 6 }, { comment: "" }, { comment: "x".repeat(1001) }]) {
        assert.equal((await api(`/api/products/${product.slug}/reviews`, { method: "POST", body: review(bad) })).status, 400, JSON.stringify(bad).slice(0, 40));
      }
    });

    test("new reviews are pending and not public; approval publishes; rejection hides; delete removes", async () => {
      const email = `flow-${RUN}@example.com`;
      assert.equal((await api(`/api/products/${product.slug}/reviews`, { method: "POST", body: review({ customerEmail: email }) })).status, 201);
      assert.equal((await publicReviews()).length, 0);

      const stored = await prisma.review.findFirst({ where: { productId: product.id, customerEmail: email } });
      assert.equal(stored.status, "PENDING");

      assert.equal((await api(`/api/admin/reviews/${stored.id}`, { method: "PATCH", body: { status: "APPROVED" }, cookie: session.cookie, csrf: session.csrf })).status, 200);
      const visible = await publicReviews();
      assert.equal(visible.length, 1);
      assert.equal(visible[0].customerEmail, undefined, "email must never be public");

      assert.equal((await api(`/api/admin/reviews/${stored.id}`, { method: "PATCH", body: { status: "REJECTED" }, cookie: session.cookie, csrf: session.csrf })).status, 200);
      assert.equal((await publicReviews()).length, 0);

      assert.equal((await api(`/api/admin/reviews/${stored.id}`, { method: "DELETE", cookie: session.cookie, csrf: session.csrf })).status, 200);
      assert.equal(await prisma.review.count({ where: { id: stored.id } }), 0);
    });

    test("repeat reviews from the same email are blocked", async () => {
      const email = `repeat-${RUN}@example.com`;
      assert.equal((await api(`/api/products/${product.slug}/reviews`, { method: "POST", body: review({ customerEmail: email }) })).status, 201);
      assert.equal((await api(`/api/products/${product.slug}/reviews`, { method: "POST", body: review({ customerEmail: email }) })).status, 409);
    });
  });

  describe("session lifecycle", () => {
    test("logout invalidates the session", async () => {
      assert.equal((await api("/api/admin/logout", { method: "POST", cookie: session.cookie })).status, 200);
      assert.equal((await api("/api/admin/me", { cookie: session.cookie })).status, 401);
    });

    test("expired sessions are rejected", async () => {
      const res = await api("/api/admin/login", { method: "POST", body: ADMIN });
      const cookie = (res.headers.get("set-cookie") || "").split(";")[0];
      await prisma.adminSession.updateMany({ where: { adminId: created.adminId }, data: { expiresAt: new Date(Date.now() - 1000) } });
      assert.equal((await api("/api/admin/me", { cookie })).status, 401);
    });
  });
});

function pick(p) {
  const keys = ["shortDescription", "description", "stockQuantity", "mainImage", "galleryImages", "ingredients", "benefits", "usageInstructions", "warnings", "category", "isActive"];
  return Object.fromEntries(keys.map((k) => [k, p[k]]));
}

async function createProduct(overrides = {}) {
  const data = productPayload(overrides);
  const product = await prisma.product.create({
    data: { ...data, price: Math.round(data.price * 100), compareAtPrice: data.compareAtPrice ? Math.round(data.compareAtPrice * 100) : null },
  });
  created.productIds.push(product.id);
  return product;
}

async function createPendingOrder(product, quantity) {
  const subtotal = product.price * quantity;
  const shipping = subtotal >= 59900 ? 0 : 4900;
  const order = await prisma.order.create({
    data: {
      orderNumber: `AW${RUN.toUpperCase()}${crypto.randomBytes(3).toString("hex").toUpperCase()}`.replace(/[^0-9A-Z]/g, "A").slice(0, 20),
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: "+919876543210",
      addressLine1: customer.addressLine1,
      city: customer.city,
      state: customer.state,
      postalCode: customer.postalCode,
      country: customer.country,
      subtotal,
      shippingAmount: shipping,
      totalAmount: subtotal + shipping,
      razorpayOrderId: `order_IT${RUN}${crypto.randomBytes(3).toString("hex")}`,
      items: { create: [{ productId: product.id, productName: product.name, productImage: product.mainImage, quantity, unitPrice: product.price, totalPrice: subtotal }] },
    },
  });
  created.orderIds.push(order.id);
  return order;
}
