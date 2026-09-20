"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";

export default function CartButton({ className }) {
  const { count } = useCart();
  return (
    <Link href="/cart" aria-label={`Cart, ${count} items`} className={`${className} relative`}>
      <ShoppingBag className="size-[18px] md:size-5" strokeWidth={1.75} />
      <span className="absolute -top-0.5 -right-0.5 flex min-w-4 h-4 px-1 items-center justify-center rounded-full bg-forest text-[0.58rem] font-semibold leading-none text-white ring-1.5 ring-cream">
        {count}
      </span>
    </Link>
  );
}
