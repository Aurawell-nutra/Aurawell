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
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          placeholder="Enter your email"
          aria-invalid={state.status === "error" ? "true" : undefined}
          className="min-w-0 flex-1 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-white/60 focus:border-white/60 focus:outline-none"
        />
        {/* Honeypot for bots */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
        <button
          type="submit"
          disabled={state.status === "sending"}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-forest transition-colors hover:bg-cream disabled:opacity-60"
        >
          {state.status === "sending" ? "Subscribing…" : "Subscribe"} <ArrowRight className="size-4" aria-hidden />
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
