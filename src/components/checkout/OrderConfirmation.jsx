"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatPaise } from "@/lib/pricing-rules";

export default function OrderConfirmation() {
  const orderNumber = useSearchParams().get("order");
  const [order, setOrder] = useState(null);

  // The verified order returned by /api/payment/verify is kept only for this browser tab.
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem("aurawell-last-order") || "null");
      if (saved?.orderNumber === orderNumber) setOrder(saved);
    } catch {}
  }, [orderNumber]);

  return (
    <div className="mx-auto max-w-lg rounded-[2rem] border border-line bg-white p-8 text-center shadow-soft sm:p-12">
      <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-leaf text-white shadow-card">
        <Check className="size-10" strokeWidth={2.5} aria-hidden />
      </span>
      <h1 className="mt-6 text-4xl font-semibold">Order Confirmed!</h1>
      <p className="mt-3 text-sm text-muted">Thank you for choosing Aaurawell Nutra. Your payment was successful.</p>

      {orderNumber && /^AW[0-9A-Z]{6,20}$/.test(orderNumber) && (
        <p className="mt-6 inline-block rounded-full bg-sage px-5 py-2 text-sm font-medium text-forest">Order ID: #{orderNumber}</p>
      )}

      {order && (
        <div className="mt-6 rounded-2xl border border-line p-4 text-left">
          <ul className="space-y-3">
            {order.items.map((item) => (
              <li key={item.name} className="flex items-center gap-3 text-sm">
                <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-cream">
                  <Image src={item.image} alt="" fill sizes="48px" className="object-contain p-1" />
                </span>
                <span className="flex-1">
                  {item.name} <span className="text-muted">× {item.quantity}</span>
                </span>
                <span>{formatPaise(item.totalPrice)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between border-t border-line pt-3 text-sm font-semibold">
            <span>Total paid</span>
            <span className="text-forest">{formatPaise(order.totalAmount)}</span>
          </p>
        </div>
      )}

      <p className="mt-6 text-sm leading-relaxed text-muted">
        A confirmation email is on its way. We&apos;ll keep you updated as your order is packed and shipped.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        <Button href="/track-order">
          Track My Order <ArrowRight className="size-4" aria-hidden />
        </Button>
        <Button href="/shop" variant="outline">
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}
