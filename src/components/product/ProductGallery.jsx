"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProductGallery({ product }) {
  const images = product.gallery.map((src, i) => ({
    src,
    alt: i === 0 ? `${product.name} — front of bottle` : `${product.name} — image ${i + 1}`,
    fit: i === 0 ? "object-contain" : "object-cover",
  }));
  const [active, setActive] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const openButton = useRef(null);
  const closeButton = useRef(null);

  const step = useCallback((dir) => setActive((i) => (i + dir + images.length) % images.length), [images.length]);

  const close = useCallback(() => {
    setFullscreen(false);
    openButton.current?.focus();
  }, []);

  // Keyboard controls + scroll lock while the viewer is open.
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeButton.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen, close, step]);

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row">
      <ul className="flex gap-3 sm:flex-col">
        {images.map((img, i) => (
          <li key={`${img.src}-${i}`}>
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              aria-pressed={active === i}
              className={cn(
                "relative block size-18 overflow-hidden rounded-2xl border-2 bg-white transition-colors sm:size-20",
                active === i ? "border-forest" : "border-line hover:border-sage-dark"
              )}
            >
              <Image src={img.src} alt="" fill sizes="80px" className="object-cover object-top" />
            </button>
          </li>
        ))}
      </ul>

      <div className={cn("group relative aspect-square flex-1 overflow-hidden rounded-[2rem] border border-line shadow-card", product.theme.bg)}>
        <Image
          key={images[active].src}
          src={images[active].src}
          alt={images[active].alt}
          fill
          priority
          sizes="(min-width: 1024px) 560px, 100vw"
          className={cn(images[active].fit, "object-center")}
        />
        <button
          ref={openButton}
          type="button"
          onClick={() => setFullscreen(true)}
          aria-label="View image fullscreen"
          className="absolute top-4 right-4 flex size-11 items-center justify-center rounded-full bg-white/90 text-forest shadow-card backdrop-blur transition hover:scale-105 hover:bg-white"
        >
          <Maximize2 className="size-5" />
        </button>
      </div>

      {fullscreen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${product.name} images`}
            className="fixed inset-0 z-[60] flex flex-col bg-ink/95 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && close()}
          >
            <div className="flex items-center justify-between px-4 py-3 text-white sm:px-6">
              <p className="text-sm">
                {product.name} <span className="text-white/60">· {active + 1} / {images.length}</span>
              </p>
              <button
                ref={closeButton}
                type="button"
                onClick={close}
                aria-label="Close fullscreen"
                className="flex size-11 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              >
                <X className="size-6" />
              </button>
            </div>

            <div className="relative flex-1" onClick={(e) => e.target === e.currentTarget && close()}>
              <Image key={`fs-${images[active].src}`} src={images[active].src} alt={images[active].alt} fill sizes="100vw" className="object-contain p-2 sm:p-8" />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Previous image"
                    className="absolute top-1/2 left-3 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 sm:left-6"
                  >
                    <ChevronLeft className="size-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Next image"
                    className="absolute top-1/2 right-3 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 sm:right-6"
                  >
                    <ChevronRight className="size-6" />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <ul className="flex justify-center gap-3 px-4 py-4">
                {images.map((img, i) => (
                  <li key={`fs-thumb-${i}`}>
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      aria-label={`Show image ${i + 1}`}
                      aria-pressed={active === i}
                      className={cn("relative block size-14 overflow-hidden rounded-xl border-2", active === i ? "border-white" : "border-white/20 opacity-60 hover:opacity-100")}
                    >
                      <Image src={img.src} alt="" fill sizes="56px" className="object-cover object-top" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
