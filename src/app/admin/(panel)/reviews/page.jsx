import { Search } from "lucide-react";
import { prisma } from "@/lib/server/db";
import { listAdminReviews, parseReviewFilters } from "@/lib/server/admin-reviews";
import { getAdminBase } from "@/lib/server/admin-base";
import { REVIEW_STATUSES } from "@/lib/server/validation";
import { inputClass } from "@/components/ui/FormField";
import ReviewActions from "@/components/admin/ReviewActions";
import { AdminPageHeader, Card, Pagination, StatusBadge, adminButton, dateTime } from "@/components/admin/ui";

export const metadata = { title: "Reviews" };

export default async function AdminReviewsPage({ searchParams }) {
  const base = await getAdminBase();
  const filters = parseReviewFilters(await searchParams);
  const [{ reviews, total, page, pageCount }, products] = await Promise.all([
    listAdminReviews(filters),
    prisma.product.findMany({ select: { id: true, name: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  const buildHref = (p) => {
    const params = new URLSearchParams(Object.entries({ ...filters, page: p }).filter(([, v]) => v !== undefined && v !== ""));
    return `${base}/reviews?${params}`;
  };

  return (
    <>
      <AdminPageHeader title="Reviews" description={`${total} review${total === 1 ? "" : "s"} · only approved reviews appear on the store`} />

      <Card className="mb-6">
        <form className="grid gap-3 md:grid-cols-[1fr_170px_200px_auto]" role="search">
          <label className="relative">
            <span className="sr-only">Search reviews</span>
            <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <input name="q" defaultValue={filters.q ?? ""} placeholder="Name, email or text" maxLength={100} className={`${inputClass} pl-11`} />
          </label>
          <select name="status" defaultValue={filters.status ?? ""} aria-label="Review status" className={inputClass}>
            <option value="">All statuses</option>
            {REVIEW_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select name="product" defaultValue={filters.product ?? ""} aria-label="Product" className={inputClass}>
            <option value="">All products</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button type="submit" className={adminButton.primary}>Filter</button>
        </form>
      </Card>

      {reviews.length === 0 ? (
        <Card><p className="text-center text-sm text-muted">No reviews match these filters.</p></Card>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">
                      {r.customerName} <span className="text-gold" aria-label={`${r.rating} stars`}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                    </p>
                    <p className="text-xs text-muted">
                      {r.customerEmail ?? "No email"} · {r.product.name} · {dateTime.format(r.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <StatusBadge status={r.status} />
                    {r.isFeatured && <StatusBadge status="CONFIRMED" label="FEATURED" />}
                  </div>
                </div>
                {r.title && <p className="mt-3 font-medium">{r.title}</p>}
                {/* Rendered as text — React escapes any HTML in user content. */}
                <p className="mt-2 text-sm whitespace-pre-line text-ink/90">{r.comment}</p>
                <ReviewActions reviewId={r.id} status={r.status} isFeatured={r.isFeatured} />
              </Card>
            </li>
          ))}
        </ul>
      )}
      <Pagination page={page} pageCount={pageCount} buildHref={buildHref} />
    </>
  );
}
