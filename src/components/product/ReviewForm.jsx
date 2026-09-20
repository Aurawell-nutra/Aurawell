"use client";

import { useState } from "react";
import { CheckCircle2, Star } from "lucide-react";
import FormField from "@/components/ui/FormField";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export default function ReviewForm({ slug, productName }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [state, setState] = useState({ status: "idle", message: "", fields: {} });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (!rating) {
      setState({ status: "error", message: "Please choose a star rating.", fields: {} });
      return;
    }
    setState({ status: "sending", message: "", fields: {} });
    try {
      const data = await apiFetch(`/api/products/${slug}/reviews`, {
        method: "POST",
        body: {
          customerName: form.get("customerName"),
          customerEmail: form.get("customerEmail"),
          rating,
          title: form.get("title") || undefined,
          comment: form.get("comment"),
          website: form.get("website") || undefined,
        },
      });
      setState({ status: "sent", message: data.message, fields: {} });
    } catch (err) {
      setState({ status: "error", message: err.message, fields: err.fields });
    }
  };

  if (state.status === "sent") {
    return (
      <div role="status" className="mt-4 flex flex-col items-center rounded-3xl bg-sage/60 p-6 text-center">
        <CheckCircle2 className="size-12 text-leaf" aria-hidden />
        <p className="mt-4 font-serif text-2xl text-forest">Thank you!</p>
        <p className="mt-2 text-sm text-muted">{state.message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="mt-1 text-sm text-muted">Share your experience with {productName}.</p>

      <fieldset className="mt-5">
        <legend className="mb-1.5 text-sm font-medium text-ink">Your rating</legend>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              aria-pressed={rating === n}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              className="rounded p-0.5 text-gold"
            >
              <Star className={cn("size-7", n <= (hover || rating) && "fill-current")} />
            </button>
          ))}
        </div>
        {state.fields.rating && <p className="mt-1 text-xs text-crimson">{state.fields.rating}</p>}
      </fieldset>

      <div className="mt-4 grid gap-4">
        <FormField label="Name" name="customerName" required maxLength={60} autoComplete="name" error={state.fields.customerName} />
        <FormField
          label="Email (kept private)"
          name="customerEmail"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          error={state.fields.customerEmail}
        />
        <FormField label="Title (optional)" name="title" maxLength={100} error={state.fields.title} />
        <FormField label="Review" name="comment" as="textarea" required minLength={10} maxLength={1000} error={state.fields.comment} />
        {/* Honeypot for bots — hidden from people and assistive tech. */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      </div>

      {state.status === "error" && (
        <p role="alert" className="mt-4 text-sm text-crimson">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={state.status === "sending"}
        className="mt-6 w-full rounded-full bg-forest py-3.5 text-sm font-medium text-white transition-colors hover:bg-forest-dark disabled:opacity-60"
      >
        {state.status === "sending" ? "Submitting…" : "Submit Review"}
      </button>
      <p className="mt-3 text-center text-xs text-muted">Reviews are published after moderation.</p>
    </form>
  );
}
