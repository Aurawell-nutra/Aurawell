import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Botanical from "@/components/ui/Botanical";
import { cn } from "@/lib/utils";

/** Soft page banner with breadcrumbs, used at the top of inner pages. */
export default function PageHeader({ title, subtitle, eyebrow, breadcrumbs = [], className, children }) {
  return (
    <section className={cn("relative isolate overflow-hidden bg-gradient-to-br from-cream via-ivory to-sage/60", className)}>
      <Botanical name="corner" className="top-0 right-0 w-28 -scale-y-100 opacity-80 sm:w-40 lg:w-48" />
      <Botanical name="fern" className="bottom-0 left-0 hidden w-20 opacity-50 sm:block lg:w-24" />

      <div className="container-page relative py-10 text-center sm:py-14">
        {breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-4 flex justify-center">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
              <li>
                <Link href="/" className="hover:text-forest">
                  Home
                </Link>
              </li>
              {breadcrumbs.map((crumb) => (
                <li key={crumb.label} className="flex items-center gap-1.5">
                  <ChevronRight className="size-3" aria-hidden />
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-forest">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-forest" aria-current="page">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {eyebrow && <p className="mb-3 text-xs font-medium tracking-[0.2em] text-leaf uppercase">{eyebrow}</p>}
        <h1 className="text-4xl leading-tight font-semibold sm:text-5xl">{title}</h1>
        {subtitle && <p className="mx-auto mt-3 max-w-xl text-sm text-muted sm:text-base">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
