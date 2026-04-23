export const FREE_SHIPPING_THRESHOLD = 70;
export const SHIPPING_FEE = 5;

export function normalizeDiscountPercentage(discountPercentage?: number | null): number {
  if (typeof discountPercentage !== "number" || Number.isNaN(discountPercentage)) return 0;
  return Math.min(100, Math.max(0, discountPercentage));
}

export function calculateDiscountedPrice(price: number, discountPercentage?: number | null): number {
  const normalizedDiscount = normalizeDiscountPercentage(discountPercentage);
  const discounted = price * (1 - normalizedDiscount / 100);
  return Math.round(discounted * 100) / 100;
}

export function hasDiscount(discountPercentage?: number | null): boolean {
  return normalizeDiscountPercentage(discountPercentage) > 0;
}

export function calculateShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

export function calculateOrderTotal(subtotal: number): number {
  return subtotal + calculateShipping(subtotal);
}
