"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { calculateShipping, MAX_QUANTITY_PER_ITEM } from "@/lib/pricing-rules";

const CartContext = createContext(null);
const STORAGE_KEY = "aurawell-cart-v2";

/**
 * Guest cart stored in localStorage as { productId, slug, name, price, image, count, quantity }.
 * Prices here are for display only — the server re-prices every item at checkout.
 */
export default function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(saved)) {
        setItems(saved.filter((i) => i && typeof i.productId === "string" && Number.isInteger(i.quantity) && i.quantity > 0));
      }
      localStorage.removeItem("aurawell-cart"); // pre-backend cart format
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const addItem = useCallback((product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) => (i.productId === product.id ? { ...i, quantity: Math.min(i.quantity + quantity, MAX_QUANTITY_PER_ITEM) } : i));
      }
      const { id, slug, name, price, image, count } = product;
      return [...prev, { productId: id, slug, name, price, image, count, quantity: Math.min(quantity, MAX_QUANTITY_PER_ITEM) }];
    });
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    setItems((prev) =>
      quantity < 1
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, quantity: Math.min(quantity, MAX_QUANTITY_PER_ITEM) } : i))
    );
  }, []);

  const removeItem = useCallback((productId) => setItems((prev) => prev.filter((i) => i.productId !== productId)), []);
  const clearCart = useCallback(() => setItems([]), []);

  /** Replaces display data with server-confirmed prices/names after a checkout quote. */
  const syncWithServer = useCallback((lines) => {
    const byId = new Map(lines.map((l) => [l.productId, l]));
    setItems((prev) =>
      prev.map((i) => {
        const line = byId.get(i.productId);
        return line ? { ...i, name: line.productName, price: line.unitPrice / 100, image: line.productImage } : i;
      })
    );
  }, []);

  const value = useMemo(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
    const shipping = calculateShipping(Math.round(subtotal * 100)) / 100;
    return { items, ready, count, subtotal, shipping, total: subtotal + shipping, addItem, updateQuantity, removeItem, clearCart, syncWithServer };
  }, [items, ready, addItem, updateQuantity, removeItem, clearCart, syncWithServer]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
