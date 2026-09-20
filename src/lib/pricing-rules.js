// Pricing rules shared by the server (authoritative) and the cart UI (display only).
// All amounts are in paise.

export const CURRENCY = "INR";
export const FREE_SHIPPING_THRESHOLD = 59900; // ₹599
export const SHIPPING_FEE = 4900; // ₹49
export const MAX_QUANTITY_PER_ITEM = 10;
export const MAX_ITEMS_PER_ORDER = 20;

export function calculateShipping(subtotal) {
  return subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

/**
 * Calculates order totals from server-trusted unit prices.
 * Prices on the storefront are inclusive of GST, so taxAmount is 0 and is kept for reporting.
 * @param {{ unitPrice: number, quantity: number }[]} lines
 */
export function calculateTotals(lines) {
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const discountAmount = 0;
  const shippingAmount = calculateShipping(subtotal);
  const taxAmount = 0;
  const totalAmount = subtotal - discountAmount + shippingAmount + taxAmount;
  return { subtotal, discountAmount, shippingAmount, taxAmount, totalAmount };
}

export function formatPaise(paise, currency = CURRENCY) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: paise % 100 === 0 ? 0 : 2,
  }).format(paise / 100);
}
