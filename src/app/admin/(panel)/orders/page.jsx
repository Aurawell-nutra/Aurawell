import Link from "next/link";
import { Search } from "lucide-react";
import { listAdminOrders, parseOrderFilters } from "@/lib/server/admin-orders";
import { getAdminBase } from "@/lib/server/admin-base";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/server/validation";
import { formatPaise } from "@/lib/pricing-rules";
import { inputClass } from "@/components/ui/FormField";
import { AdminPageHeader, Card, Pagination, StatusBadge, adminButton, dateTime } from "@/components/admin/ui";

export const metadata = { title: "Orders" };

export default async function AdminOrdersPage({ searchParams }) {
  const base = await getAdminBase();
  const filters = parseOrderFilters(await searchParams);
  const { orders, total, page, pageCount } = await listAdminOrders(filters);

  const buildHref = (p) => {
    const params = new URLSearchParams(Object.entries({ ...filters, page: p }).filter(([, v]) => v !== undefined && v !== ""));
    return `${base}/orders?${params}`;
  };

  return (
    <>
      <AdminPageHeader title="Orders" description={`${total} order${total === 1 ? "" : "s"}`} />

      <Card className="mb-6">
        <form className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto]" role="search">
          <label className="relative">
            <span className="sr-only">Search orders</span>
            <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <input name="q" defaultValue={filters.q ?? ""} placeholder="Order number, name or email" maxLength={100} className={`${inputClass} pl-11`} />
          </label>
          <select name="payment" defaultValue={filters.payment ?? ""} aria-label="Payment status" className={inputClass}>
            <option value="">All payments</option>
            {PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select name="status" defaultValue={filters.status ?? ""} aria-label="Order status" className={inputClass}>
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button type="submit" className={adminButton.primary}>Filter</button>
        </form>
      </Card>

      <Card className="p-0 sm:p-0">
        {orders.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No orders match these filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-line text-xs tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-3 py-3 font-medium">Customer</th>
                  <th className="px-3 py-3 font-medium">Date</th>
                  <th className="px-3 py-3 font-medium">Payment</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-line first:border-0 hover:bg-ivory">
                    <td className="px-5 py-3">
                      <Link href={`${base}/orders/${o.id}`} className="font-medium text-forest hover:underline">{o.orderNumber}</Link>
                      <p className="text-xs text-muted">{o._count.items} item{o._count.items === 1 ? "" : "s"}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p>{o.customerName}</p>
                      <p className="text-xs text-muted">{o.customerEmail}</p>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted">{dateTime.format(o.createdAt)}</td>
                    <td className="px-3 py-3"><StatusBadge status={o.paymentStatus} /></td>
                    <td className="px-3 py-3"><StatusBadge status={o.orderStatus} /></td>
                    <td className="px-5 py-3 text-right font-medium">{formatPaise(o.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Pagination page={page} pageCount={pageCount} buildHref={buildHref} />
    </>
  );
}
