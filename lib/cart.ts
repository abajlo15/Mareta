import type { CartItem, Cart } from '@/types/cart';
import type { Product } from '@/types/product';
import { calculateDiscountedPrice } from './pricing';

const CART_STORAGE_KEY = 'mareta_cart';
const CART_UPDATED_EVENT = 'cartUpdated';

function normalizeStock(stock: number): number {
  return Math.max(0, Number.isFinite(stock) ? stock : 0);
}

export function getCart(): Cart {
  if (typeof window === 'undefined') {
    return { items: [], total: 0, itemCount: 0 };
  }

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) {
      return { items: [], total: 0, itemCount: 0 };
    }

    const items: CartItem[] = JSON.parse(stored);
    const total = items.reduce(
      (sum, item) =>
        sum + calculateDiscountedPrice(item.product.price, item.product.discount_percentage) * item.quantity,
      0
    );
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return { items, total, itemCount };
  } catch {
    return { items: [], total: 0, itemCount: 0 };
  }
}

export function addToCart(product: Product, quantity: number = 1): Cart {
  const cart = getCart();
  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.id === product.id
  );
  const maxStock = normalizeStock(product.stock);
  const requestedQuantity = Math.max(1, Math.floor(quantity));

  if (maxStock === 0) {
    return cart;
  }

  if (existingItemIndex >= 0) {
    const nextQuantity = cart.items[existingItemIndex].quantity + requestedQuantity;
    cart.items[existingItemIndex].quantity = Math.min(nextQuantity, maxStock);
  } else {
    cart.items.push({ product, quantity: Math.min(requestedQuantity, maxStock) });
  }

  saveCart(cart.items);
  return getCart();
}

export function removeFromCart(productId: string): Cart {
  const cart = getCart();
  cart.items = cart.items.filter((item) => item.product.id !== productId);
  saveCart(cart.items);
  return getCart();
}

export function updateCartItemQuantity(productId: string, quantity: number): Cart {
  if (quantity <= 0) {
    return removeFromCart(productId);
  }

  const cart = getCart();
  const item = cart.items.find((item) => item.product.id === productId);
  if (item) {
    const maxStock = normalizeStock(item.product.stock);
    if (maxStock === 0) {
      return removeFromCart(productId);
    }
    item.quantity = Math.min(Math.max(1, Math.floor(quantity)), maxStock);
  }
  saveCart(cart.items);
  return getCart();
}

export function clearCart(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CART_STORAGE_KEY);
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  }
}

function saveCart(items: CartItem[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  }
}

export function subscribeToCartUpdate(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const onStorage = (event: StorageEvent) => {
    if (event.key === CART_STORAGE_KEY) callback();
  };

  window.addEventListener('storage', onStorage);
  window.addEventListener(CART_UPDATED_EVENT, callback);

  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(CART_UPDATED_EVENT, callback);
  };
}

