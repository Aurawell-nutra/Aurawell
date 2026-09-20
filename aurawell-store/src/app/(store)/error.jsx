"use client";

import { RotateCcw } from "lucide-react";
import Botanical from "@/components/ui/Botanical";

// Shown when a storefront page fails to load (e.g. the database is temporarily unreachable).
// Error details stay in the server logs.
export default function StoreError({ reset }) {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-cream via-ivory to-sage/60 py-24 text-center">
      <Botanical name="corner" className="top-0 right-0 w-40 -scale-y-100 opacity-70" />
      <div className="container-page relative">
        <p className="font-script text-6xl text-leaf">Oh no!</p>
        <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">Something went wrong</h1>
        <p className="mt-3 text-muted">We couldn&apos;t load this page. Please try again in a moment.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-medium text-white hover:bg-forest-dark"
        >
          <RotateCcw className="size-4" aria-hidden /> Try again
        </button>
      </div>
    </section>
  );
}
