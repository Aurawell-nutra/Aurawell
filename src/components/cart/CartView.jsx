"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import OrderSummary from "@/components/cart/OrderSummary";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

export default function CartView() {
  const { items, ready, updateQuantity, removeItem } = useCart();

  if (!ready) return <div className="h-64 animate-pulse rounded-[2rem] bg-cream" aria-busy="true" />;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-[2rem] border border-line bg-white p-12 text-center shadow-card">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-sage text-forest">
          <ShoppingBag className="size-7" strokeWidth={1.5} aria-hidden />
        </span>
        <h2 className="mt-5 text-3xl">Your cart is empty</h2>
        <p className="mt-2 text-sm text-muted">Find a gummy that fits your wellness routine.</p>
        <Button href="/shop" className="mt-6">
          Shop Our Gummies <ArrowRight className="size-4" aria-hidden />
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      <div className="rounded-[2rem] border border-line bg-white p-4 shadow-card sm:p-8">
        <div className="hidden grid-cols-[2fr_1fr_1fr_1fr] border-b border-line pb-3 text-xs tracking-wide text-muted uppercase sm:grid">
          <span>Product</span>
          <span>Price</span>
          <span>Quantity</span>
          <span className="text-right">Total</span>
        </div>

        <ul className="divide-y divide-line">
          {items.map((item) => (
            <li key={item.productId} className="grid grid-cols-[auto_1fr] items-center gap-4 py-5 sm:grid-cols-[2fr_1fr_1fr_1fr]">
              <div className="flex items-center gap-4">
                <Link href={`/shop/${item.slug}`} className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-cream">
                  <Image src={item.image} alt={item.name} fill sizes="80px" className="object-contain p-1" />
                </Link>
                <div className="hidden sm:block">
                  <Link href={`/shop/${item.slug}`} className="font-medium text-ink hover:text-forest">
                    {item.name}
                  </Link>
                  <p className="text-xs text-muted">{item.count} Gummies</p>
                </div>
              </div>

              <div className="space-y-2 sm:contents">
                <div className="sm:hidden">
                  <p className="font-medium text-ink">{item.name}</p>
                  <p className="text-xs text-muted">{formatPrice(item.price)} each</p>
                </div>
                <span className="hidden text-sm sm:block">{formatPrice(item.price)}</span>

                <div className="flex items-center justify-between gap-3 sm:justify-start">
                  <div className="inline-flex items-center rounded-full border border-line">
                    <button
                      type="button"
                      aria-label={`Decrease ${item.name} quantity`}
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="flex size-8 items-center justify-center rounded-full text-forest hover:bg-sage"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-7 text-center text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Increase ${item.name} quantity`}
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="flex size-8 items-center justify-center rounded-full text-forest hover:bg-sage"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <span className="font-medium sm:hidden">{formatPrice(item.price * item.quantity)}</span>
                </div>

                <div className="hidden items-center justify-end gap-3 sm:flex">
                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => removeItem(item.productId)}
                    className="text-muted hover:text-crimson"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <button type="button" onClick={() => removeItem(item.productId)} className="text-xs text-muted underline sm:hidden">
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>

        <Link href="/shop" className="mt-4 inline-block text-sm text-forest hover:underline">
          ← Continue Shopping
        </Link>
      </div>

      <div className="lg:sticky lg:top-28 lg:h-fit">
        <OrderSummary>
          <Button href="/checkout" className="mt-6 w-full py-3.5">
            Proceed to Checkout <ArrowRight className="size-4" aria-hidden />
          </Button>
        </OrderSummary>
      </div>
    </div>
  );
}
