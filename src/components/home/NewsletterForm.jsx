"use client";

import { useState } from "react";
import { ArrowRight, MailCheck } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

export default function NewsletterForm() {
  const [state, setState] = useState({ status: "idle", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState({ status: "sending", message: "" });
    try {
      const data = await apiFetch("/api/newsletter/subscribe", {
        method: "POST",
        body: { email: form.get("email"), website: form.get("website") || undefined },
      });
      setState({ status: "sent", message: data.message });
    } catch (err) {
      setState({ status: "error", message: err.fields?.email ?? err.message });
    }
  };

  if (state.status === "sent") {
    return (
      <p role="status" className="mx-auto mt-6 flex max-w-md items-start gap-3 rounded-2xl bg-white/10 px-5 py-4 text-left text-sm lg:mx-0">
        <MailCheck className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden />
        {state.message}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-6 max-w-md lg:mx-0">
      <div className="relative flex items-center rounded-full border border-white/25 bg-white/10 p-1 pl-3 transition-colors focus-within:border-white/60 sm:p-1.5 sm:pl-5">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          size={1}
          maxLength={254}
          autoComplete="email"
          placeholder="Enter your email"
          aria-invalid={state.status === "error" ? "true" : undefined}
          className="min-w-0 flex-1 bg-transparent py-2 text-sm text-white placeholder:text-white/60 focus:outline-none"
        />
        {/* Honeypot for bots */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
        <button
          type="submit"
          disabled={state.status === "sending"}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-forest shadow-sm transition-colors hover:bg-cream disabled:opacity-60 sm:px-6 sm:py-2.5 sm:text-sm"
        >
          {state.status === "sending" ? "Subscribing…" : "Subscribe"} <ArrowRight className="size-3.5 sm:size-4" aria-hidden />
        </button>
      </div>
      {state.status === "error" && (
        <p role="alert" className="mt-2 text-sm text-peach">
          {state.message}
        </p>
      )}
      <p className="mt-3 text-xs text-white/50">We&apos;ll email you a confirmation link. Unsubscribe anytime.</p>
    </form>
  );
}
