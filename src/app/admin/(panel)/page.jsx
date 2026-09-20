import Link from "next/link";
import { AlertTriangle, IndianRupee, MessageSquareQuote, Package, ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/server/db";
import { getAdminBase } from "@/lib/server/admin-base";
import { formatPaise } from "@/lib/pricing-rules";
import { AdminPageHeader, Card, StatusBadge, dateTime } from "@/components/admin/ui";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const base = await getAdminBase();
  const [totalOrders, paidOrders, pendingOrders, revenue, totalProducts, activeProducts, lowStock, pendingReviews, recentOrders, recentReviews] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { paymentStatus: "PAID" } }),
      prisma.order.count({ where: { paymentStatus: "PENDING" } }),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: "PAID" } }),
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.findMany({ where: { isActive: true, stockQuantity: { lte: 10 } }, select: { id: true, name: true, stockQuantity: true }, take: 5 }),
      prisma.review.count({ where: { status: "PENDING" } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, orderNumber: true, customerName: true, totalAmount: true, paymentStatus: true, orderStatus: true, createdAt: true },
      }),
      prisma.review.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, customerName: true, rating: true, comment: true, status: true, product: { select: { name: true } } },
      }),
    ]);

  const stats = [
    { label: "Total revenue", value: formatPaise(revenue._sum.totalAmount ?? 0), note: "From paid orders", icon: IndianRupee },
    { label: "Total orders", value: totalOrders, note: `${paidOrders} paid · ${pendingOrders} pending payment`, icon: ShoppingBag },
    { label: "Products", value: totalProducts, note: `${activeProducts} active`, icon: Package },
    { label: "Pending reviews", value: pendingReviews, note: "Awaiting moderation", icon: MessageSquareQuote, href: `${base}/reviews?status=PENDING` },
  ];

  return (
    <>
      <AdminPageHeader title="Dashboard" description="An overview of your store." />

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, note, icon: Icon, href }) => {
          const body = (
            <Card className="h-full">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted">{label}</p>
                <span className="flex size-9 items-center justify-center rounded-full bg-sage text-forest">
                  <Icon className="size-4" aria-hidden />
                </span>
              </div>
              <p className="mt-3 font-serif text-3xl font-semibold text-forest">{value}</p>
              <p className="mt-1 text-xs text-muted">{note}</p>
            </Card>
          );
          return <li key={label}>{href ? <Link href={href}>{body}</Link> : body}</li>;
        })}
      </ul>

      {lowStock.length > 0 && (
        <Card className="mt-6 border-tangerine/30 bg-peach/40">
          <p className="flex items-center gap-2 text-sm font-medium text-tangerine">
            <AlertTriangle className="size-4" aria-hidden /> Low stock
          </p>
          <ul className="mt-2 flex flex-wrap gap-2 text-sm">
            {lowStock.map((p) => (
              <li key={p.id}>
                <Link href={`${base}/products/${p.id}/edit`} className="rounded-full bg-white px-3 py-1 hover:underline">
                  {p.name}: {p.stockQuantity} left
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-xl">Recent orders</h2>
            <Link href={`${base}/orders`} className="text-sm text-forest hover:underline">View all</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="mt-6 text-sm text-muted">No orders yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-t border-line">
                      <td className="py-3 pr-3">
                        <Link href={`${base}/orders/${o.id}`} className="font-medium text-forest hover:underline">{o.orderNumber}</Link>
                        <p className="text-xs text-muted">{o.customerName}</p>
                      </td>
                      <td className="py-3 pr-3 text-xs text-muted">{dateTime.format(o.createdAt)}</td>
                      <td className="py-3 pr-3"><StatusBadge status={o.paymentStatus} /></td>
                      <td className="py-3 text-right font-medium">{formatPaise(o.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-xl">Recent reviews</h2>
            <Link href={`${base}/reviews`} className="text-sm text-forest hover:underline">View all</Link>
          </div>
          {recentReviews.length === 0 ? (
            <p className="mt-6 text-sm text-muted">No reviews yet.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {recentReviews.map((r) => (
                <li key={r.id} className="border-t border-line pt-4 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{r.customerName} · {"★".repeat(r.rating)}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-muted">{r.comment}</p>
                  <p className="mt-1 text-xs text-muted">{r.product.name}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
