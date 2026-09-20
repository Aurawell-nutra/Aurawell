"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Home, Package, Truck } from "lucide-react";
import Botanical from "@/components/ui/Botanical";
import FormField from "@/components/ui/FormField";
import { apiFetch } from "@/lib/api-client";
import { formatPaise } from "@/lib/pricing-rules";
import { cn } from "@/lib/utils";

const TIMELINE = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
const LABELS = { PENDING: "Awaiting payment", CONFIRMED: "Confirmed", PROCESSING: "Processing", SHIPPED: "Shipped", DELIVERED: "Delivered", CANCELLED: "Cancelled" };
const dateFormat = new Intl.DateTimeFormat("en-IN", { dateStyle: "long" });

export default function TrackOrderForm() {
  const [state, setState] = useState({ status: "idle", order: null, error: "", fields: {} });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState({ status: "loading", order: null, error: "", fields: {} });
    try {
      const { order } = await apiFetch("/api/orders/lookup", {
        method: "POST",
        body: { orderNumber: String(form.get("orderNumber")).trim().toUpperCase(), email: form.get("email") },
      });
      setState({ status: "done", order, error: "", fields: {} });
    } catch (err) {
      setState({ status: "error", order: null, error: err.message, fields: err.fields });
    }
  };

  const { order } = state;
  const reached = order ? TIMELINE.indexOf(order.orderStatus) : -1;

  return (
    <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={handleSubmit} className="h-fit rounded-[2rem] border border-line bg-white p-6 shadow-card sm:p-8">
        <span className="flex size-12 items-center justify-center rounded-full bg-sage text-forest">
          <Package className="size-5" strokeWidth={1.5} aria-hidden />
        </span>
        <div className="mt-5 grid gap-4">
          <FormField label="Order Number" name="orderNumber" required placeholder="AW…" maxLength={22} autoComplete="off" error={state.fields.orderNumber} />
          <FormField label="Email Address" name="email" type="email" required maxLength={254} autoComplete="email" error={state.fields.email} />
        </div>
        {state.status === "error" && (
          <p role="alert" className="mt-4 text-sm text-crimson">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={state.status === "loading"}
          className="mt-6 w-full rounded-full bg-forest py-3.5 text-sm font-medium text-white transition-colors hover:bg-forest-dark disabled:opacity-60"
        >
          {state.status === "loading" ? "Checking…" : "Track Order"}
        </button>
      </form>

      {order ? (
        <div className="rounded-[2rem] border border-line bg-white p-6 shadow-card sm:p-8" aria-live="polite">
          <p className="text-xs text-muted">Order #{order.orderNumber}</p>
          <h2 className="mt-1 text-3xl">{LABELS[order.orderStatus]}</h2>
          <p className="mt-1 text-sm text-muted">Placed on {dateFormat.format(new Date(order.createdAt))}</p>

          {order.orderStatus !== "CANCELLED" && order.paymentStatus === "PAID" && (
            <ol className="mt-6 grid grid-cols-4 gap-2">
              {TIMELINE.map((s, i) => (
                <li key={s} className="flex flex-col items-center gap-2 text-center">
                  <span className={cn("flex size-8 items-center justify-center rounded-full text-xs", i <= reached ? "bg-leaf text-white" : "bg-cream text-muted")}>
                    {i <= reached ? <Check className="size-4" /> : i + 1}
                  </span>
                  <span className="text-[0.7rem] text-ink">{LABELS[s]}</span>
                </li>
              ))}
            </ol>
          )}

          <ul className="mt-6 space-y-3 border-t border-line pt-5">
            {order.items.map((item) => (
              <li key={item.name} className="flex items-center gap-3 text-sm">
                <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-cream">
                  <Image src={item.image} alt="" fill sizes="48px" className="object-cover object-top" />
                </span>
                <span className="flex-1">
                  {item.name} <span className="text-muted">× {item.quantity}</span>
                </span>
                <span>{formatPaise(item.totalPrice)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between border-t border-line pt-3 text-sm font-semibold">
            <span>Total</span>
            <span className="text-forest">{formatPaise(order.totalAmount)}</span>
          </p>
          <p className="mt-2 text-xs text-muted">
            Payment: {order.paymentStatus.toLowerCase()} · Delivering to {order.city}, {order.state}
          </p>
        </div>
      ) : (
        <div className="relative isolate hidden overflow-hidden rounded-[2rem] bg-gradient-to-br from-forest to-forest-dark p-8 text-center shadow-soft lg:flex lg:flex-col lg:items-center lg:justify-center">
          <div className="pointer-events-none absolute inset-3 -z-10 rounded-[1.6rem] border border-gold/25" aria-hidden />
          <div className="pointer-events-none absolute -top-20 -right-20 -z-10 size-60 rounded-full bg-leaf/30 blur-3xl" aria-hidden />
          <Botanical name="corner" className="top-0 right-0 w-28 -scale-y-100 opacity-25" />
          <Botanical name="fern" className="bottom-0 left-0 w-16 opacity-20" />

          <p className="flex items-center gap-3 text-[0.7rem] tracking-[0.3em] text-gold uppercase">
            <span className="h-px w-6 bg-gold/60" aria-hidden /> Aaurawell Nutra <span className="h-px w-6 bg-gold/60" aria-hidden />
          </p>
          <p className="mt-4 font-script text-5xl leading-[0.95] text-cream">
            Your wellness
            <br />
            <span className="text-gold">is on its way</span>
          </p>
          <p className="mt-4 max-w-xs text-sm text-white/70">Your order number is in your confirmation email.</p>

          <ol className="mt-8 grid w-full max-w-sm grid-cols-4 gap-2">
            {[
              [Check, "Confirmed"],
              [Package, "Packed"],
              [Truck, "Shipped"],
              [Home, "Delivered"],
            ].map(([Icon, label]) => (
              <li key={label} className="flex flex-col items-center gap-2">
                <span className="flex size-10 items-center justify-center rounded-full border border-gold/40 bg-white/5 text-gold">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="text-[0.7rem] text-white/80">{label}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
