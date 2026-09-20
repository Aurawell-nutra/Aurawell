import { test, describe } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { verifyPaymentSignature, verifyWebhookSignature, safeEqualString } from "../../src/lib/server/signatures.js";
import { calculateTotals, calculateShipping, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "../../src/lib/pricing-rules.js";
import { rateLimit } from "../../src/lib/server/rate-limit.js";
import { detectImageType, validateImageUpload, MAX_UPLOAD_BYTES } from "../../src/lib/server/upload-validation.js";

const SECRET = "test_secret_key";
const sign = (payload, secret = SECRET) => crypto.createHmac("sha256", secret).update(payload).digest("hex");

describe("Razorpay payment signature", () => {
  const orderId = "order_ABC123def456";
  const paymentId = "pay_XYZ789ghi012";
  const signature = sign(`${orderId}|${paymentId}`);

  test("accepts a valid signature", () => {
    assert.equal(verifyPaymentSignature({ orderId, paymentId, signature, secret: SECRET }), true);
  });

  test("rejects an invalid signature", () => {
    assert.equal(verifyPaymentSignature({ orderId, paymentId, signature: "0".repeat(64), secret: SECRET }), false);
    assert.equal(verifyPaymentSignature({ orderId, paymentId, signature: "not-hex", secret: SECRET }), false);
  });

  test("rejects a signature for a different Razorpay order id", () => {
    assert.equal(verifyPaymentSignature({ orderId: "order_OTHER000000", paymentId, signature, secret: SECRET }), false);
  });

  test("rejects a signature made with a different secret", () => {
    assert.equal(verifyPaymentSignature({ orderId, paymentId, signature: sign(`${orderId}|${paymentId}`, "other"), secret: SECRET }), false);
  });

  test("rejects when the secret is missing", () => {
    assert.equal(verifyPaymentSignature({ orderId, paymentId, signature, secret: "" }), false);
  });
});

describe("Razorpay webhook signature", () => {
  const body = JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { id: "pay_1", amount: 59900 } } } });

  test("accepts a valid webhook signature", () => {
    assert.equal(verifyWebhookSignature({ rawBody: body, signature: sign(body), secret: SECRET }), true);
  });

  test("rejects a tampered body", () => {
    const tampered = body.replace("59900", "100");
    assert.equal(verifyWebhookSignature({ rawBody: tampered, signature: sign(body), secret: SECRET }), false);
  });

  test("rejects a missing signature", () => {
    assert.equal(verifyWebhookSignature({ rawBody: body, signature: null, secret: SECRET }), false);
  });
});

describe("server-side pricing", () => {
  test("calculates totals from trusted unit prices", () => {
    const totals = calculateTotals([
      { unitPrice: 59900, quantity: 2 },
      { unitPrice: 49900, quantity: 1 },
    ]);
    assert.deepEqual(totals, { subtotal: 169700, discountAmount: 0, shippingAmount: 0, taxAmount: 0, totalAmount: 169700 });
  });

  test("adds shipping below the free-shipping threshold", () => {
    assert.equal(calculateShipping(FREE_SHIPPING_THRESHOLD - 1), SHIPPING_FEE);
    assert.equal(calculateShipping(FREE_SHIPPING_THRESHOLD), 0);
    assert.equal(calculateShipping(0), 0);
    assert.equal(calculateTotals([{ unitPrice: 30000, quantity: 1 }]).totalAmount, 30000 + SHIPPING_FEE);
  });
});

describe("rate limiting", () => {
  test("blocks after the limit and resets after the window", () => {
    const key = `test:${Math.random()}`;
    const now = 1_000_000;
    for (let i = 0; i < 5; i++) assert.equal(rateLimit(key, 5, 60_000, now).ok, true);
    const blocked = rateLimit(key, 5, 60_000, now + 1);
    assert.equal(blocked.ok, false);
    assert.ok(blocked.retryAfter > 0);
    assert.equal(rateLimit(key, 5, 60_000, now + 60_001).ok, true);
  });

  test("simulated brute-force login attempts are throttled", () => {
    const key = `login:${Math.random()}`;
    const results = Array.from({ length: 20 }, () => rateLimit(key, 5, 15 * 60_000).ok);
    assert.equal(results.filter(Boolean).length, 5);
  });
});

describe("upload validation", () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
  const jpg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]);
  const webp = new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8 ");

  test("detects real image types from magic bytes", () => {
    assert.equal(detectImageType(png), "png");
    assert.equal(detectImageType(jpg), "jpg");
    assert.equal(detectImageType(webp), "webp");
    assert.equal(detectImageType(new TextEncoder().encode("<?php system($_GET['c']); ?>")), null);
  });

  test("accepts a valid image and generates a safe random filename", () => {
    const result = validateImageUpload({ bytes: png, declaredType: "image/png", originalName: "../../evil name.png" });
    assert.equal(result.ok, true);
    assert.match(result.filename, /^[a-f0-9]{32}\.png$/);
  });

  test("rejects disguised, oversized and disallowed files", () => {
    const php = new TextEncoder().encode("<?php echo 1; ?>");
    assert.equal(validateImageUpload({ bytes: php, declaredType: "image/png", originalName: "shell.png" }).ok, false);
    assert.equal(validateImageUpload({ bytes: png, declaredType: "image/png", originalName: "image.php" }).ok, false);
    assert.equal(validateImageUpload({ bytes: png, declaredType: "image/svg+xml", originalName: "x.svg" }).ok, false);
    assert.equal(validateImageUpload({ bytes: jpg, declaredType: "image/png", originalName: "x.png" }).ok, false);
    assert.equal(validateImageUpload({ bytes: new Uint8Array(MAX_UPLOAD_BYTES + 1), declaredType: "image/png", originalName: "x.png" }).ok, false);
  });
});

test("constant-time string comparison", () => {
  assert.equal(safeEqualString("abc", "abc"), true);
  assert.equal(safeEqualString("abc", "abd"), false);
  assert.equal(safeEqualString("abc", "abcd"), false);
  assert.equal(safeEqualString(null, "abc"), false);
});
