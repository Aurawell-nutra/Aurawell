import Link from "next/link";
import { cn } from "@/lib/utils";

export function AdminPageHeader({ title, description, action }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ className, children }) {
  return <div className={cn("rounded-3xl border border-line bg-white p-5 shadow-card sm:p-6", className)}>{children}</div>;
}

const badgeTones = {
  PENDING: "bg-peach text-tangerine",
  PAID: "bg-sage text-leaf",
  FAILED: "bg-rose text-crimson",
  REFUNDED: "bg-cream-dark text-muted",
  CONFIRMED: "bg-sage text-leaf",
  PROCESSING: "bg-blush text-berry",
  SHIPPED: "bg-sage text-forest",
  DELIVERED: "bg-forest text-white",
  CANCELLED: "bg-rose text-crimson",
  APPROVED: "bg-sage text-leaf",
  REJECTED: "bg-rose text-crimson",
  ACTIVE: "bg-sage text-leaf",
  INACTIVE: "bg-cream-dark text-muted",
  SENT: "bg-sage text-leaf",
  NOT_SENT: "bg-cream-dark text-muted",
};

export function StatusBadge({ status, label }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[0.7rem] font-medium tracking-wide whitespace-nowrap", badgeTones[status] ?? "bg-cream text-ink")}>
      {label ?? status.replaceAll("_", " ")}
    </span>
  );
}

export function Pagination({ page, pageCount, buildHref }) {
  if (pageCount <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-3 text-sm">
      {page > 1 ? <Link href={buildHref(page - 1)} className="rounded-full border border-line bg-white px-4 py-2 hover:border-forest">Previous</Link> : <span />}
      <span className="text-muted">
        Page {page} of {pageCount}
      </span>
      {page < pageCount && <Link href={buildHref(page + 1)} className="rounded-full border border-line bg-white px-4 py-2 hover:border-forest">Next</Link>}
    </nav>
  );
}

export const adminButton = {
  primary: "inline-flex items-center justify-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-forest-dark disabled:opacity-60",
  outline: "inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm text-ink transition-colors hover:border-forest disabled:opacity-60",
  danger: "inline-flex items-center justify-center gap-2 rounded-full border border-crimson/30 bg-white px-5 py-2.5 text-sm text-crimson transition-colors hover:bg-rose disabled:opacity-60",
};

export const dateTime = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
