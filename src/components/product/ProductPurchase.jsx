"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { useCart } from "@/components/cart/CartProvider";
import { cn } from "@/lib/utils";

export default function ProductPurchase({ product }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const router = useRouter();

  const soldOut = product.inStock === false;
  const maxQuantity = Math.max(1, Math.min(10, product.stockQuantity ?? 10));

  const buyNow = () => {
    addItem(product, quantity);
    router.push("/checkout");
  };

  return (
    <div className="mt-8">
      {soldOut && <p className="mb-4 rounded-2xl bg-rose px-4 py-3 text-sm text-crimson">This product is currently out of stock.</p>}
      {!soldOut && product.stockQuantity <= 10 && (
        <p className="mb-4 text-sm font-medium text-tangerine">Only {product.stockQuantity} left in stock</p>
      )}
      <p className="text-sm font-medium text-ink">Quantity</p>
      <div className="mt-2 inline-flex items-center rounded-full border border-line bg-white">
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="flex size-10 items-center justify-center rounded-full text-forest hover:bg-sage disabled:opacity-40"
          disabled={quantity <= 1}
        >
          <Minus className="size-4" />
        </button>
        <span className="w-10 text-center text-sm font-medium" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
          className="flex size-10 items-center justify-center rounded-full text-forest hover:bg-sage disabled:opacity-40"
          disabled={quantity >= maxQuantity}
        >
          <Plus className="size-4" />
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <AddToCartButton product={product} quantity={quantity} className={cn("py-3.5 text-sm", product.theme.button)} />
        <button
          type="button"
          onClick={buyNow}
          disabled={soldOut}
          className={cn(
            "rounded-full border-2 bg-white py-3 text-sm font-medium transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50",
            product.theme.outline
          )}
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
