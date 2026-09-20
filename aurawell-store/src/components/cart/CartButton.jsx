"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";

export default function CartButton({ className }) {
  const { count } = useCart();
  return (
    <Link href="/cart" aria-label={`Cart, ${count} items`} className={`${className} relative`}>
      <ShoppingBag className="size-5" strokeWidth={1.75} />
      <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-forest text-[0.6rem] text-white">
        {count}
      </span>
    </Link>
  );
}
