"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

export default function TestimonialCarousel({ testimonials }) {
  const trackRef = useRef(null);

  const scroll = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector("li");
    track.scrollBy({ left: direction * (card ? card.offsetWidth + 24 : 300), behavior: "smooth" });
  };

  const arrow =
    "hidden size-11 shrink-0 items-center justify-center rounded-full border border-line bg-white text-forest shadow-card transition-colors hover:bg-forest hover:text-white md:flex";

  return (
    <div className="mt-12 flex items-center gap-4">
      <button type="button" aria-label="Previous reviews" onClick={() => scroll(-1)} className={arrow}>
        <ChevronLeft className="size-5" />
      </button>

      <ul
        ref={trackRef}
        className="no-scrollbar flex flex-1 snap-x snap-mandatory gap-6 overflow-x-auto scroll-pl-4 pb-4 pl-4 pr-4 md:pl-0 md:pr-0"
      >
        {testimonials.map((t) => (
          <li
            key={t.id}
            className="flex w-[92%] shrink-0 snap-start flex-col rounded-3xl border border-line bg-white p-6 shadow-card sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-0.5 text-gold" aria-label={`${t.rating} out of 5 stars`}>
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" aria-hidden />
                ))}
              </div>
              <Quote className="size-6 text-sage-dark" aria-hidden />
            </div>
            <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink">&ldquo;{t.quote}&rdquo;</blockquote>
            <div className="mt-6 flex items-center gap-3 border-t border-line pt-4">
              <span className="flex size-10 items-center justify-center rounded-full bg-sage font-serif text-forest">
                {t.name.charAt(0)}
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{t.name}</p>
                <p className="text-xs text-muted">{t.product}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <button type="button" aria-label="Next reviews" onClick={() => scroll(1)} className={arrow}>
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
