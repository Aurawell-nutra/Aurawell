import { BadgeCheck, Star } from "lucide-react";
import ReviewComposer from "@/components/product/ReviewComposer";
import Botanical from "@/components/ui/Botanical";
import { cn } from "@/lib/utils";

function Stars({ rating, className, size = "size-4" }) {
  return (
    <span className={cn("flex text-gold", className)} role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn(size, i < rating ? "fill-current" : "text-gold/30")} aria-hidden />
      ))}
    </span>
  );
}

const dateFormat = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" });

// Review text is rendered as plain React text nodes — never as HTML.
export default function ProductReviews({ product, reviews }) {
  const distribution = [5, 4, 3, 2, 1].map((star) => ({ star, count: reviews.filter((r) => r.rating === star).length }));
  const max = Math.max(1, ...distribution.map((d) => d.count));

  return (
    <section id="reviews" className="relative isolate scroll-mt-24 overflow-hidden bg-ivory pb-16 sm:pb-20">
      <Botanical name="olive" className="right-0 bottom-0 w-40 -scale-x-100 opacity-30 sm:w-56" />
      <div className="container-page">
        <div className="mb-8 text-center lg:text-left">
          <p className="text-xs font-medium tracking-[0.2em] text-leaf uppercase">Real People. Real Wellness.</p>
          <h2 className="mt-2 text-3xl sm:text-4xl">Customer Reviews</h2>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[340px_1fr] lg:gap-8">
          <aside className="rounded-[2rem] border border-line bg-white p-6 shadow-card lg:sticky lg:top-28">
            {product.reviews > 0 ? (
              <>
                <div className="flex items-center gap-4">
                  <span className="font-serif text-5xl font-semibold text-forest">{product.rating}</span>
                  <div>
                    <Stars rating={Math.round(product.rating)} size="size-5" />
                    <p className="mt-1 text-xs text-muted">Based on {product.reviews} reviews</p>
                  </div>
                </div>
                <ul className="mt-5 space-y-2" aria-label="Rating breakdown">
                  {distribution.map(({ star, count }) => (
                    <li key={star} className="flex items-center gap-3 text-xs text-muted">
                      <span className="flex w-8 items-center gap-0.5">
                        {star} <Star className="size-3 fill-gold text-gold" aria-hidden />
                      </span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-cream-dark">
                        <span className="block h-full rounded-full bg-gold" style={{ width: `${(count / max) * 100}%` }} />
                      </span>
                      <span className="w-5 text-right">{count}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-muted">No reviews yet. Be the first to share your experience with {product.name}.</p>
            )}

            <ReviewComposer slug={product.slug} productName={product.name} />
          </aside>

          {reviews.length === 0 ? (
            <div className="flex min-h-48 items-center justify-center rounded-[2rem] border border-dashed border-line bg-white p-8 text-center">
              <p className="font-serif text-2xl text-forest">Your review could be the first one here.</p>
            </div>
          ) : (
            <ul className="columns-1 gap-5 sm:columns-2 [&>li]:mb-5">
              {reviews.map((r) => (
                <li key={r.id} className="break-inside-avoid rounded-3xl border border-line bg-white p-6 shadow-card transition-shadow hover:shadow-soft">
                  <div className="flex items-center justify-between gap-3">
                    <Stars rating={r.rating} />
                    <time dateTime={r.createdAt} className="text-xs text-muted">
                      {dateFormat.format(new Date(r.createdAt))}
                    </time>
                  </div>
                  {r.title && <p className="mt-3 font-serif text-lg leading-snug text-forest">{r.title}</p>}
                  <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-ink/85">{r.quote}</p>
                  <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                    <span className="flex size-9 items-center justify-center rounded-full bg-sage font-serif text-forest">{r.name.charAt(0)}</span>
                    <p className="text-sm font-medium text-ink">{r.name}</p>
                    <span className="ml-auto flex items-center gap-1 text-[0.7rem] text-leaf">
                      <BadgeCheck className="size-3.5" aria-hidden /> Approved
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
