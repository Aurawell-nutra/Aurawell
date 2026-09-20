import "server-only";
import { z } from "zod";
import { prisma } from "./db.js";
import { HttpError } from "./http.js";
import { canTransitionOrder, ORDER_STATUSES, PAYMENT_STATUSES } from "./validation.js";

const PAGE_SIZE = 20;

const filterSchema = z.object({
  q: z.string().trim().max(100).optional().catch(undefined),
  payment: z.enum(PAYMENT_STATUSES).optional().catch(undefined),
  status: z.enum(ORDER_STATUSES).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(10000).optional().catch(1),
});

export function parseOrderFilters(params) {
  return filterSchema.parse(params ?? {});
}

export async function listAdminOrders({ q, payment, status, page = 1 }) {
  const where = {
    ...(payment && { paymentStatus: payment }),
    ...(status && { orderStatus: status }),
    ...(q && {
      OR: [
        { orderNumber: { contains: q, mode: "insensitive" } },
        { customerName: { contains: q, mode: "insensitive" } },
        { customerEmail: { contains: q, mode: "insensitive" } },
      ],
    }),
  };
  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true, orderNumber: true, customerName: true, customerEmail: true, totalAmount: true,
        paymentStatus: true, orderStatus: true, createdAt: true, _count: { select: { items: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);
  return { orders, total, page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/** Fields an admin may see. Razorpay signatures are deliberately excluded. */
export async function getAdminOrder(id) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) return null;
  const { razorpaySignature, checkoutKey, ...safe } = order;
  void razorpaySignature;
  void checkoutKey;
  return safe;
}

export async function updateAdminOrder(id, { orderStatus, paymentStatus, notes }) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw new HttpError(404, "Order not found");

    const data = {};
    if (orderStatus && orderStatus !== order.orderStatus) {
      if (!canTransitionOrder(order.orderStatus, orderStatus, order.paymentStatus)) {
        throw new HttpError(400, `An order can't move from ${order.orderStatus} to ${orderStatus}.`);
      }
      data.orderStatus = orderStatus;

      // Cancelling a paid order returns its items to stock (once).
      if (orderStatus === "CANCELLED" && order.stockDeducted) {
        for (const item of order.items) {
          if (item.productId) await tx.product.updateMany({ where: { id: item.productId }, data: { stockQuantity: { increment: item.quantity } } });
        }
        data.stockDeducted = false;
      }
    }
    if (paymentStatus === "REFUNDED") {
      if (order.paymentStatus !== "PAID") throw new HttpError(400, "Only paid orders can be marked as refunded.");
      data.paymentStatus = "REFUNDED";
    }
    if (notes !== undefined) data.notes = notes;

    await tx.order.update({ where: { id }, data });
  });
}
