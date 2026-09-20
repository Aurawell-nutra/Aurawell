"use client";

import { useState } from "react";
import { Truck, ShieldCheck, Leaf, X } from "lucide-react";

const icons = [Truck, ShieldCheck, Leaf];

// Shown on every page load; closing hides it until the page is reloaded.
export default function AnnouncementBar({ announcements }) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative bg-forest text-white">
      <ul className="container-page flex h-8 sm:h-9 items-center justify-center gap-6 pr-8 text-[0.68rem] tracking-wide sm:text-[0.7rem] sm:pr-10 md:justify-between md:gap-8 md:pr-12">
        {announcements.map((text, i) => {
          const Icon = icons[i];
          return (
            <li key={text} className={i === 0 ? "flex items-center gap-1.5 truncate max-w-[80vw] sm:max-w-none" : "hidden items-center gap-2 md:flex"}>
              <Icon className="size-3 text-sage-dark sm:size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{text}</span>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        aria-label="Close announcement"
        onClick={() => setVisible(false)}
        className="absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:right-3 sm:size-7"
      >
        <X className="size-3.5 sm:size-4" />
      </button>
    </div>
  );
}
