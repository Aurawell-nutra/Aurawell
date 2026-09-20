"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { cn } from "@/lib/utils";

export default function ShopCatalog({ products, categories }) {
  const searchParams = useSearchParams();
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        (!q || [p.name, p.subtitle, p.tagline, p.description].join(" ").toLowerCase().includes(q))
    );
  }, [products, category, query]);

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Filter by category" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={category === c}
              onClick={() => setCategory(c)}
              className={cn(
                "shrink-0 rounded-full border px-5 py-2 text-sm transition-colors",
                category === c ? "border-forest bg-forest text-white" : "border-line bg-white text-ink hover:border-forest"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <label className="relative block w-full lg:w-72">
          <span className="sr-only">Search products</span>
          <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search gummies"
            className="w-full rounded-full border border-line bg-white py-2.5 pr-10 pl-11 text-sm focus:border-forest focus:outline-none"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted hover:text-forest"
            >
              <X className="size-4" />
            </button>
          )}
        </label>
      </div>

      <p className="mt-6 text-sm text-muted" aria-live="polite">
        Showing {visible.length} of {products.length} products
      </p>

      {visible.length > 0 ? (
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} variant="shop" />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-line bg-white p-12 text-center">
          <p className="font-serif text-2xl text-forest">No gummies found</p>
          <p className="mt-2 text-sm text-muted">Try a different search or category.</p>
        </div>
      )}
    </>
  );
}
