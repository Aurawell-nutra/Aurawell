"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const INTERVAL_MS = 3500;
const TRANSITION_MS = 700;

/**
 * Shows one product bottle at a time, sliding right → left forever.
 * The first slide is duplicated at the end so the loop never jumps visibly:
 * after sliding onto the clone, the transition is switched off and the track
 * snaps back to the real first slide.
 */
export default function HeroCarousel({ products }) {
  const slides = [...products, products[0]];
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(true);
  const paused = useRef(false);

  useEffect(() => {
    if (products.length < 2) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const tick = setInterval(() => {
      if (!paused.current) setIndex((i) => i + 1);
    }, reduced ? INTERVAL_MS * 2 : INTERVAL_MS);
    return () => clearInterval(tick);
  }, [products.length]);

  // Reached the clone → silently reset to the real first slide.
  useEffect(() => {
    if (index !== slides.length - 1) return;
    const timer = setTimeout(() => {
      setAnimating(false);
      setIndex(0);
    }, TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [index, slides.length]);

  useEffect(() => {
    if (animating) return;
    const raf = requestAnimationFrame(() => setAnimating(true));
    return () => cancelAnimationFrame(raf);
  }, [animating]);

  const active = index % products.length;

  return (
    <div
      className="relative"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      onFocusCapture={() => (paused.current = true)}
      onBlurCapture={() => (paused.current = false)}
    >
      <div className="overflow-hidden" aria-roledescription="carousel" aria-label="Our gummies">
        <div
          className="flex"
          style={{
            transform: `translate3d(-${index * 100}%, 0, 0)`,
            transition: animating ? `transform ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)` : "none",
          }}
        >
          {slides.map((product, i) => (
            <div key={`${product.id}-${i}`} className="w-full shrink-0 px-4" aria-hidden={i !== index}>
              <Link href={`/shop/${product.slug}`} tabIndex={i === index ? 0 : -1} className="block">
                <Image
                  src={product.heroImage}
                  alt={product.name}
                  width={640}
                  height={775}
                  priority={i === 0}
                  sizes="(min-width: 1024px) 420px, 70vw"
                  className="mx-auto h-auto w-full max-w-[18rem] drop-shadow-2xl sm:max-w-[22rem]"
                />
              </Link>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-2 text-center text-sm font-medium text-forest" aria-live="polite">
        {products[active].name}
      </p>

      <ul className="mt-4 flex justify-center gap-2">
        {products.map((product, i) => (
          <li key={product.id}>
            <button
              type="button"
              aria-label={`Show ${product.name}`}
              aria-current={i === active}
              onClick={() => setIndex(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === active ? "w-7 bg-forest" : "w-2 bg-forest/30 hover:bg-forest/60"
              )}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
