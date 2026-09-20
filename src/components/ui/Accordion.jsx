"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Accessible accordion with a smooth height animation (CSS grid rows 0fr → 1fr). */
export default function Accordion({ items, defaultOpen = 0 }) {
  const [open, setOpen] = useState(defaultOpen);
  const baseId = useId();

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${baseId}-panel-${i}`;
        const buttonId = `${baseId}-button-${i}`;
        return (
          <div
            key={item.q}
            className={cn("rounded-2xl border bg-white shadow-card transition-colors duration-300", isOpen ? "border-sage-dark" : "border-line")}
          >
            <h2 className="font-sans text-sm sm:text-base">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-medium text-ink"
              >
                {item.q}
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full transition-all duration-300",
                    isOpen ? "rotate-180 bg-forest text-white" : "bg-sage text-forest"
                  )}
                >
                  <ChevronDown className="size-4" aria-hidden />
                </span>
              </button>
            </h2>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out motion-reduce:transition-none",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
              inert={!isOpen}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-sm leading-relaxed text-muted">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
