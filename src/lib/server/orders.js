import "server-only";
import crypto from "node:crypto";
import { prisma } from "./db.js";
import { HttpError } from "./http.js";
import { getRazorpay } from "./razorpay.js";
import { calculateTotals, CURRENCY } from "../pricing-rules.js";
import { sendOrderEmails } from "./email.js";
import { logger } from "./logger.js";

const ORDER_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // no 0/O/1/I for readability

function generateOrderNumber() {
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, ""); // YYMMDD
  const bytes = crypto.randomBytes(6);
  const suffix = Array.from(bytes, (b) => ORDER_ALPHABET[b % ORDER_ALPHABET.length]).join("");
  return `AW${date}${suffix}`;
}

const orderWithItems = { items: true };

/**
 * Builds priced order lines from the database. Only productId + quantity come from the client;
 * names, prices, images and availability are always read from the database.
 */
async function priceCart(items) {
  const products = await prisma.product.findMany({ where: { id: { in: items.map((i) => i.productId) } } });
  const byId = new Map(products.map((p) => [p.id, p]));

  const problems = [];
  const lines = items.map(({ productId, quantity }) => {
    const p = byId.get(productId);
    if (!p || !p.isActive) {
      problems.push({ productId, reason: "unavailable" });
      return null;
    }
    if (p.stockQuantity < quantity) {
      problems.push({ productId, reason: p.stockQuantity === 0 ? "out_of_stock" : "insufficient_stock", available: p.stockQuantity, name: p.name });
      return null;
    }
    return {
      productId: p.id,
      productName: p.name,
      productSku: p.sku,
      productImage: p.mainImage,
      quantity,
      unitPrice: p.price,
      totalPrice: p.price * quantity,
    };
  });

  if (problems.length) {
    throw new HttpError(409, "Some items in your cart are no longer available in the requested quantity.", { problems });
  }
  return lines;
}

/** Validates the cart and returns server-calculated totals (used by the checkout review step). */
export async function quoteCart(items) {
  const lines = await priceCart(items);
  return { lines, ...calculateTotals(lines) };
}

function publicCheckoutPayload(order) {
  return {
    orderNumber: order.orderNumber,
    razorpayOrderId: order.razorpayOrderId,
    amount: order.totalAmount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID, // public key id only — never the secret
    customer: { name: order.customerName, email: order.customerEmail, contact: order.customerPhone },
  };
}

/**
 * Creates (or, for a repeated request with the same checkoutKey, returns) a PENDING order
 * and its Razorpay order. Stock is validated here but only deducted after payment succeeds.
 */
export async function createCheckout({ customer, items, checkoutKey }) {
  const existing = await prisma.order.findUnique({ where: { checkoutKey } });
  if (existing) {
    // A repeated or retried checkout reuses the same Razorpay order while it is still payable.
    const payable = ["PENDING", "FAILED"].includes(existing.paymentStatus) && existing.orderStatus !== "CANCELLED";
    if (payable && existing.razorpayOrderId) return publicCheckoutPayload(existing);
    throw new HttpError(409, "This checkout has already been completed. Please refresh the page.");
  }

  const lines = await priceCart(items);
  const totals = calculateTotals(lines);
  if (totals.totalAmount < 100) throw new HttpError(400, "Order total is too low");

  let order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      checkoutKey,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      addressLine1: customer.addressLine1,
      addressLine2: customer.addressLine2 ?? null,
      city: customer.city,
      state: customer.state,
      postalCode: customer.postalCode,
      country: customer.country,
      ...totals,
      currency: CURRENCY,
      items: { create: lines },
    },
  });

  try {
    const rzpOrder = await getRazorpay().orders.create({
      amount: order.totalAmount,
      currency: order.currency,
      receipt: order.orderNumber,
      notes: { orderNumber: order.orderNumber },
    });
    order = await prisma.order.update({ where: { id: order.id }, data: { razorpayOrderId: rzpOrder.id } });
  } catch (err) {
    await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "FAILED", orderStatus: "CANCELLED", notes: "Payment gateway order could not be created." } });
    throw err;
  }

  return publicCheckoutPayload(order);
}

/**
 * Marks an order PAID exactly once and deducts stock in the same transaction.
 * Safe to call repeatedly (checkout callback + webhook retries): only the first call changes anything.
 * @returns {{ order, firstTime: boolean }}
 */
export async function markOrderPaid({ razorpayOrderId, razorpayPaymentId, razorpaySignature, amount }) {
  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { razorpayOrderId }, include: orderWithItems });
    if (!order) throw new HttpError(404, "Order not found");

    if (order.paymentStatus === "PAID") {
      if (order.razorpayPaymentId && order.razorpayPaymentId !== razorpayPaymentId) {
        logger.warn("Second payment received for an already-paid order", { orderNumber: order.orderNumber });
      }
      return { order, firstTime: false };
    }
    if (order.paymentStatus === "REFUNDED") return { order, firstTime: false };
    if (amount !== order.totalAmount) throw new HttpError(400, "Payment amount does not match the order total");

    // Conditional update: only one concurrent caller can move PENDING/FAILED → PAID.
    const claimed = await tx.order.updateMany({
      where: { id: order.id, paymentStatus: { in: ["PENDING", "FAILED"] } },
      data: {
        paymentStatus: "PAID",
        orderStatus: "CONFIRMED",
        razorpayPaymentId,
        razorpaySignature: razorpaySignature ?? null,
        paidAt: new Date(),
      },
    });
    if (claimed.count === 0) return { order: await tx.order.findUnique({ where: { id: order.id }, include: orderWithItems }), firstTime: false };

    // Deduct stock with a guard so it can never go negative.
    const shortages = [];
    for (const item of order.items) {
      if (!item.productId) continue;
      const updated = await tx.product.updateMany({
        where: { id: item.productId, stockQuantity: { gte: item.quantity } },
        data: { stockQuantity: { decrement: item.quantity } },
      });
      if (updated.count === 0) shortages.push(item.productName);
    }

    const notes = shortages.length
      ? `${order.notes ? `${order.notes}\n` : ""}STOCK CONFLICT: payment received but stock was insufficient for ${shortages.join(", ")}. Review and refund if needed.`
      : order.notes;

    const paid = await tx.order.update({
      where: { id: order.id },
      data: { stockDeducted: true, notes },
      include: orderWithItems,
    });
    return { order: paid, firstTime: true };
  });

  if (result.firstTime) {
    // The order is already saved as paid — an email failure must not undo that.
    const status = await sendOrderEmails(result.order).catch((err) => {
      logger.error("Order email failed", { orderNumber: result.order.orderNumber, error: err });
      return "FAILED";
    });
    await prisma.order.update({ where: { id: result.order.id }, data: { emailStatus: status } }).catch(() => {});
  }
  return result;
}

export async function markOrderPaymentFailed(razorpayOrderId) {
  await prisma.order.updateMany({ where: { razorpayOrderId, paymentStatus: "PENDING" }, data: { paymentStatus: "FAILED" } });
}

/** Safe, customer-facing view of an order (no internal notes or payment signatures). */
export function toPublicOrder(order) {
  return {
    orderNumber: order.orderNumber,
    createdAt: order.createdAt.toISOString(),
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    customerName: order.customerName,
    city: order.city,
    state: order.state,
    subtotal: order.subtotal,
    shippingAmount: order.shippingAmount,
    discountAmount: order.discountAmount,
    taxAmount: order.taxAmount,
    totalAmount: order.totalAmount,
    currency: order.currency,
    items: order.items.map((i) => ({ name: i.productName, image: i.productImage, quantity: i.quantity, unitPrice: i.unitPrice, totalPrice: i.totalPrice })),
  };
}

export async function findOrderForCustomer(orderNumber, email) {
  const order = await prisma.order.findUnique({ where: { orderNumber }, include: orderWithItems });
  // Same response whether the order doesn't exist or the email doesn't match — avoids order enumeration.
  if (!order || order.customerEmail !== email) return null;
  return order;
}
