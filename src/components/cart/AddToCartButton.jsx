"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { cn } from "@/lib/utils";

export default function AddToCartButton({ product, quantity = 1, className, children }) {
  const soldOut = product.inStock === false;
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={soldOut}
      className={cn(
        "disabled:cursor-not-allowed disabled:opacity-50",
        "inline-flex items-center justify-center gap-2 rounded-full font-medium text-white transition-colors",
        className
      )}
    >
      {added ? <Check className="size-4" aria-hidden /> : <ShoppingBag className="size-4" aria-hidden />}
      <span aria-live="polite">{soldOut ? "Out of Stock" : added ? "Added" : children ?? "Add to Cart"}</span>
    </button>
  );
}
