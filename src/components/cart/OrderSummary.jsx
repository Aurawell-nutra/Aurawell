"use client";

import Image from "next/image";
import { Truck } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/pricing-rules";
import { formatPrice } from "@/lib/utils";

/** Pass `quote` (server totals in paise) to show confirmed amounts instead of the cart estimate. */
export default function OrderSummary({ showItems = false, quote, children }) {
  const cart = useCart();
  const items = quote
    ? quote.lines.map((l) => ({ key: l.productId, name: l.productName, image: l.productImage, quantity: l.quantity, lineTotal: l.totalPrice / 100 }))
    : cart.items.map((i) => ({ key: i.productId, name: i.name, image: i.image, quantity: i.quantity, lineTotal: i.price * i.quantity }));
  const subtotal = quote ? quote.subtotal / 100 : cart.subtotal;
  const shipping = quote ? quote.shippingAmount / 100 : cart.shipping;
  const total = quote ? quote.totalAmount / 100 : cart.total;
  const remaining = FREE_SHIPPING_THRESHOLD / 100 - subtotal;

  return (
    <div className="rounded-[2rem] border border-line bg-white p-6 shadow-card sm:p-8">
      <h2 className="text-2xl">Order Summary</h2>

      {showItems && (
        <ul className="mt-6 space-y-4 border-b border-line pb-6">
          {items.map((item) => (
            <li key={item.key} className="flex items-center gap-3">
              <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-cream">
                <Image src={item.image} alt="" fill sizes="56px" className="object-contain p-1" />
                <span className="absolute -top-0 -right-0 flex size-5 items-center justify-center rounded-bl-lg bg-forest text-[0.65rem] text-white">
                  {item.quantity}
                </span>
              </span>
              <span className="flex-1 text-sm text-ink">{item.name}</span>
              <span className="text-sm font-medium">{formatPrice(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Shipping</dt>
          <dd className={shipping === 0 ? "font-medium text-leaf" : ""}>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-4 text-base font-semibold">
          <dt>Total</dt>
          <dd className="font-serif text-2xl text-forest">{formatPrice(total)}</dd>
        </div>
      </dl>

      {!quote && subtotal > 0 && (
        <p className="mt-3 text-xs text-muted">Final prices are confirmed at checkout.</p>
      )}

      {subtotal > 0 && remaining > 0 && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-sage/60 px-4 py-3 text-xs text-forest">
          <Truck className="size-4 shrink-0" aria-hidden />
          Add {formatPrice(remaining)} more for free shipping
        </p>
      )}

      {children}
    </div>
  );
}
