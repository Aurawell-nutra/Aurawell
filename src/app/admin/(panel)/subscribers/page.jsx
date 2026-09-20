import { z } from "zod";
import { Search } from "lucide-react";
import { prisma } from "@/lib/server/db";
import { inputClass } from "@/components/ui/FormField";
import SubscriberActions from "@/components/admin/SubscriberActions";
import { AdminPageHeader, Card, Pagination, StatusBadge, adminButton, dateTime } from "@/components/admin/ui";

export const metadata = { title: "Subscribers" };

const PAGE_SIZE = 25;
const filterSchema = z.object({
  q: z.string().trim().max(100).optional().catch(undefined),
  status: z.enum(["PENDING", "ACTIVE", "UNSUBSCRIBED"]).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(10000).optional().catch(1),
});

export default async function AdminSubscribersPage({ searchParams }) {
  const { q, status, page = 1 } = filterSchema.parse((await searchParams) ?? {});
  const where = { ...(status && { status }), ...(q && { email: { contains: q, mode: "insensitive" } }) };

  const [subscribers, total, counts] = await Promise.all([
    prisma.subscriber.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, email: true, status: true, createdAt: true, confirmedAt: true },
    }),
    prisma.subscriber.count({ where }),
    prisma.subscriber.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const count = (s) => counts.find((c) => c.status === s)?._count._all ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const buildHref = (p) => `/subscribers?${new URLSearchParams(Object.entries({ q, status, page: p }).filter(([, v]) => v !== undefined && v !== ""))}`;

  return (
    <>
      <AdminPageHeader
        title="Subscribers"
        description="Confirmed subscribers automatically receive an email when a new product goes live."
      />

      <ul className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          ["ACTIVE", "Confirmed", "Receive new product emails"],
          ["PENDING", "Awaiting confirmation", "Haven't clicked the email link yet"],
          ["UNSUBSCRIBED", "Unsubscribed", "Will not be emailed"],
        ].map(([key, label, note]) => (
          <li key={key}>
            <Card>
              <p className="text-sm text-muted">{label}</p>
              <p className="mt-2 font-serif text-3xl font-semibold text-forest">{count(key)}</p>
              <p className="mt-1 text-xs text-muted">{note}</p>
            </Card>
          </li>
        ))}
      </ul>

      <Card className="mb-6">
        <form className="grid gap-3 md:grid-cols-[1fr_200px_auto]" role="search">
          <label className="relative">
            <span className="sr-only">Search subscribers</span>
            <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <input name="q" defaultValue={q ?? ""} placeholder="Search by email" maxLength={100} className={`${inputClass} pl-11`} />
          </label>
          <select name="status" defaultValue={status ?? ""} aria-label="Status" className={inputClass}>
            <option value="">All statuses</option>
            <option value="ACTIVE">Confirmed</option>
            <option value="PENDING">Pending</option>
            <option value="UNSUBSCRIBED">Unsubscribed</option>
          </select>
          <button type="submit" className={adminButton.primary}>Filter</button>
        </form>
      </Card>

      <Card className="p-0 sm:p-0">
        {subscribers.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No subscribers yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-line text-xs tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Signed up</th>
                  <th className="px-3 py-3 font-medium">Confirmed</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s.id} className="border-t border-line first:border-0">
                    <td className="px-5 py-3 break-all">{s.email}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={s.status === "ACTIVE" ? "APPROVED" : s.status === "UNSUBSCRIBED" ? "INACTIVE" : "PENDING"} label={s.status === "ACTIVE" ? "CONFIRMED" : s.status} />
                    </td>
                    <td className="px-3 py-3 text-xs text-muted">{dateTime.format(s.createdAt)}</td>
                    <td className="px-3 py-3 text-xs text-muted">{s.confirmedAt ? dateTime.format(s.confirmedAt) : "—"}</td>
                    <td className="px-5 py-3 text-right">
                      <SubscriberActions id={s.id} email={s.email} />
                    </td>
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
