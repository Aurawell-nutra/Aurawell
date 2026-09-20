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
      <ul className="container-page flex h-9 items-center justify-center gap-8 pr-10 text-[0.7rem] tracking-wide md:justify-between md:pr-12">
        {announcements.map((text, i) => {
          const Icon = icons[i];
          return (
            <li key={text} className={i === 0 ? "flex items-center gap-2" : "hidden items-center gap-2 md:flex"}>
              <Icon className="size-3.5 text-sage-dark" aria-hidden />
              {text}
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        aria-label="Close announcement"
        onClick={() => setVisible(false)}
        className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:right-4"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
