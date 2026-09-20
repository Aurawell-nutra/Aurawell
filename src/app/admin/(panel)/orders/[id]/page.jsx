import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAdminOrder } from "@/lib/server/admin-orders";
import { idSchema, ORDER_TRANSITIONS } from "@/lib/server/validation";
import { formatPaise } from "@/lib/pricing-rules";
import OrderActions from "@/components/admin/OrderActions";
import { AdminPageHeader, Card, StatusBadge, dateTime } from "@/components/admin/ui";

export const metadata = { title: "Order Details" };

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right break-all">{children}</dd>
    </div>
  );
}

export default async function AdminOrderPage({ params }) {
  const parsed = idSchema.safeParse((await params).id);
  if (!parsed.success) notFound();
  const order = await getAdminOrder(parsed.data);
  if (!order) notFound();

  return (
    <>
      <Link href="/orders" className="mb-4 inline-flex items-center gap-1.5 text-sm text-forest hover:underline">
        <ArrowLeft className="size-4" aria-hidden /> All orders
      </Link>
      <AdminPageHeader
        title={`Order ${order.orderNumber}`}
        description={`Placed ${dateTime.format(order.createdAt)}`}
        action={
          <div className="flex gap-2">
            <StatusBadge status={order.paymentStatus} />
            <StatusBadge status={order.orderStatus} />
          </div>
        }
      />

      {order.notes?.includes("STOCK CONFLICT") && (
        <p role="alert" className="mb-6 rounded-2xl bg-rose px-4 py-3 text-sm text-crimson">
          Stock conflict on this order — see internal notes before fulfilling.
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Card>
            <h2 className="text-xl">Items</h2>
            <ul className="mt-4 divide-y divide-line">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 py-3 text-sm">
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-cream">
                    <Image src={item.productImage} alt="" fill sizes="56px" className="object-cover object-top" />
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-xs text-muted">
                      {item.productSku ? `Code ${item.productSku}` : "No product code"} · {formatPaise(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium">{formatPaise(item.totalPrice)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 border-t border-line pt-3">
              <Row label="Subtotal">{formatPaise(order.subtotal)}</Row>
              {order.discountAmount > 0 && <Row label="Discount">−{formatPaise(order.discountAmount)}</Row>}
              <Row label="Shipping">{order.shippingAmount ? formatPaise(order.shippingAmount) : "Free"}</Row>
              {order.taxAmount > 0 && <Row label="Tax">{formatPaise(order.taxAmount)}</Row>}
              <div className="mt-2 flex justify-between border-t border-line pt-3 font-semibold">
                <span>Total</span>
                <span className="text-forest">{formatPaise(order.totalAmount)}</span>
              </div>
            </dl>
          </Card>

          <OrderActions
            orderId={order.id}
            orderStatus={order.orderStatus}
            paymentStatus={order.paymentStatus}
            allowedStatuses={ORDER_TRANSITIONS[order.orderStatus].filter((s) => order.paymentStatus === "PAID" || s === "CANCELLED")}
            notes={order.notes ?? ""}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-xl">Customer</h2>
            <dl className="mt-3">
              <Row label="Name">{order.customerName}</Row>
              <Row label="Email"><a href={`mailto:${order.customerEmail}`} className="text-forest hover:underline">{order.customerEmail}</a></Row>
              <Row label="Phone"><a href={`tel:${order.customerPhone}`} className="text-forest hover:underline">{order.customerPhone}</a></Row>
            </dl>
            <h3 className="mt-5 font-sans text-sm font-semibold text-ink">Delivery address</h3>
            <address className="mt-1 text-sm leading-relaxed text-muted not-italic">
              {order.addressLine1}
              {order.addressLine2 && <><br />{order.addressLine2}</>}
              <br />
              {order.city}, {order.state} {order.postalCode}
              <br />
              {order.country}
            </address>
          </Card>

          <Card>
            <h2 className="text-xl">Payment</h2>
            <dl className="mt-3">
              <Row label="Status"><StatusBadge status={order.paymentStatus} /></Row>
              <Row label="Paid at">{order.paidAt ? dateTime.format(order.paidAt) : "—"}</Row>
              <Row label="Razorpay order">{order.razorpayOrderId ?? "—"}</Row>
              <Row label="Razorpay payment">{order.razorpayPaymentId ?? "—"}</Row>
              <Row label="Stock deducted">{order.stockDeducted ? "Yes" : "No"}</Row>
              <Row label="Emails"><StatusBadge status={order.emailStatus} /></Row>
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
