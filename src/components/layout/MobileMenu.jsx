"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X, Truck } from "lucide-react";
import Logo from "@/components/ui/Logo";

export default function MobileMenu({ links }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
        className="inline-flex size-10 items-center justify-center rounded-full text-forest hover:bg-sage"
      >
        <Menu className="size-5" strokeWidth={1.75} />
      </button>

      {/* Portal to <body>: the sticky header's backdrop-blur would otherwise
          trap these fixed elements inside the header's box. */}
      {mounted &&
        createPortal(
          <div className="lg:hidden">
      <div
        className={`fixed inset-0 z-50 bg-ink/40 transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      <aside
        id="mobile-menu"
        aria-label="Mobile navigation"
        inert={!open}
        className={`fixed inset-y-0 right-0 z-50 flex w-[85%] max-w-xs flex-col bg-cream shadow-soft transition-transform duration-300 ${
          open ? "visible translate-x-0" : "invisible translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line p-4">
          <Logo />
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="inline-flex size-10 items-center justify-center rounded-full text-forest hover:bg-sage"
          >
            <X className="size-5" />
          </button>
        </div>

        <ul className="flex flex-col p-4">
          {links.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 font-serif text-xl text-forest hover:bg-sage"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-auto border-t border-line p-4">
          <Link
            href="/track-order"
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-forest py-3 text-sm text-forest"
          >
            <Truck className="size-4" /> Track Your Order
          </Link>
        </div>
      </aside>
          </div>,
          document.body
        )}
    </div>
  );
}
