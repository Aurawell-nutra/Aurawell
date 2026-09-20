"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import FormField from "@/components/ui/FormField";
import { apiFetch } from "@/lib/api-client";

export default function ContactForm() {
  const [state, setState] = useState({ status: "idle", error: "", fields: {} });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState({ status: "sending", error: "", fields: {} });
    try {
      await apiFetch("/api/contact", {
        method: "POST",
        body: {
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone") || undefined,
          subject: form.get("subject"),
          message: form.get("message"),
          website: form.get("website") || undefined,
        },
      });
      setState({ status: "sent", error: "", fields: {} });
    } catch (err) {
      setState({ status: "error", error: err.message, fields: err.fields });
    }
  };

  if (state.status === "sent") {
    return (
      <div role="status" className="mt-8 flex flex-col items-center rounded-3xl bg-sage/60 p-10 text-center">
        <CheckCircle2 className="size-12 text-leaf" aria-hidden />
        <p className="mt-4 font-serif text-2xl text-forest">Thank you for reaching out!</p>
        <p className="mt-2 text-sm text-muted">Our team will get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
      <FormField label="Name" name="name" required maxLength={80} autoComplete="name" placeholder="Your name" error={state.fields.name} />
      <FormField label="Email Address" name="email" type="email" required maxLength={254} autoComplete="email" placeholder="you@example.com" error={state.fields.email} />
      <FormField label="Phone Number" name="phone" type="tel" maxLength={20} autoComplete="tel" placeholder="+91" error={state.fields.phone} />
      <FormField label="Subject" name="subject" required maxLength={120} placeholder="How can we help?" error={state.fields.subject} />
      <FormField label="Message" name="message" as="textarea" required minLength={10} maxLength={2000} placeholder="Write your message" className="sm:col-span-2" error={state.fields.message} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {state.status === "error" && (
        <p role="alert" className="text-sm text-crimson sm:col-span-2">
          {state.error}
        </p>
      )}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={state.status === "sending"}
          className="inline-flex items-center gap-2 rounded-full bg-forest px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-forest-dark disabled:opacity-60"
        >
          {state.status === "sending" ? "Sending…" : "Send Message"} <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>
    </form>
  );
}
