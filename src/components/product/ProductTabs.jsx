"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const tabs = ["About", "Ingredients", "How to Use", "Caution", "FAQs"];

export default function ProductTabs({ product }) {
  const [active, setActive] = useState("About");

  return (
    <div>
      <div role="tablist" aria-label="Product information" className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            id={`tab-${tab}`}
            aria-selected={active === tab}
            aria-controls="product-tabpanel"
            onClick={() => setActive(tab)}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-5 py-3 text-sm transition-colors",
              active === tab ? "border-forest font-medium text-forest" : "border-transparent text-muted hover:text-forest"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div id="product-tabpanel" role="tabpanel" aria-labelledby={`tab-${active}`} className="pt-8">
        {active === "About" && (
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl">About This Product</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">{product.about}</p>
            </div>
            <div className={cn("grid grid-cols-2 items-center overflow-hidden rounded-[2rem] px-6 pt-6", product.theme.bg)}>
              <Image
                src={product.heroImage}
                alt={`${product.name} bottle`}
                width={320}
                height={546}
                sizes="220px"
                className="mx-auto h-auto w-full max-w-52 drop-shadow-xl"
              />
              <p className={cn("-rotate-6 pb-6 font-script text-4xl leading-[0.95] sm:text-5xl", product.theme.accent)}>
                {product.script.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </div>
          </div>
        )}

        {active === "Ingredients" && (
          <div className="max-w-2xl">
            <h2 className="text-3xl">Key Ingredients</h2>
            <p className="mt-2 text-sm text-muted">Per gummy (approx. 3.5 g) · Servings per container: {product.count}</p>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-sage text-forest">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-medium">Contents</th>
                    <th scope="col" className="px-5 py-3 font-medium">Qty</th>
                    <th scope="col" className="px-5 py-3 font-medium">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {product.ingredients.map(([name, qty, unit]) => (
                    <tr key={name} className="border-t border-line">
                      <td className="px-5 py-3 text-ink">{name}</td>
                      <td className="px-5 py-3 text-muted">{qty}</td>
                      <td className="px-5 py-3 text-muted">{unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {active === "How to Use" && (
          <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-muted sm:text-base">
            <h2 className="text-3xl">How to Use</h2>
            <p>{product.suggestedUse}</p>
            <p>
              <span className="font-medium text-ink">Storage: </span>
              {product.storage}
            </p>
          </div>
        )}

        {active === "Caution" && (
          <div className="max-w-2xl">
            <h2 className="text-3xl">Caution</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">{product.caution}</p>
          </div>
        )}

        {active === "FAQs" && (
          <div className="max-w-2xl">
            <h2 className="text-3xl">Frequently Asked Questions</h2>
            <div className="mt-6 divide-y divide-line rounded-2xl border border-line bg-white">
              {product.faqs.map((faq) => (
                <details key={faq.q} className="group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-ink">
                    {faq.q}
                    <span className="text-forest transition-transform group-open:rotate-45" aria-hidden>+</span>
                  </summary>
                  <p className="mt-3 text-sm text-muted">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
