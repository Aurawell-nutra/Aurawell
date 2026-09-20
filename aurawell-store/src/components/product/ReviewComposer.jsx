"use client";

import { useState } from "react";
import { PenLine, X } from "lucide-react";
import ReviewForm from "@/components/product/ReviewForm";

/** "Write a Review" button that expands the review form inside the summary card. */
export default function ReviewComposer({ slug, productName }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6 border-t border-line pt-6">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-forest py-3.5 text-sm font-medium text-white transition-colors hover:bg-forest-dark"
        >
          <PenLine className="size-4" aria-hidden /> Write a Review
        </button>
      ) : (
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xl">Write a Review</h3>
            <button type="button" aria-label="Close review form" onClick={() => setOpen(false)} className="flex size-8 items-center justify-center rounded-full text-muted hover:bg-cream">
              <X className="size-4" />
            </button>
          </div>
          <ReviewForm slug={slug} productName={productName} />
        </div>
      )}
    </div>
  );
}
