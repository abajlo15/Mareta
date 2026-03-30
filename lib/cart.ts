import type { CartItem, Cart } from '@/types/cart';
import type { Product } from '@/types/product';

const CART_STORAGE_KEY = 'mareta_cart';

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
    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
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

  if (existingItemIndex >= 0) {
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    cart.items.push({ product, quantity });
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
    item.quantity = quantity;
  }
  saveCart(cart.items);
  return getCart();
}

export function clearCart(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CART_STORAGE_KEY);
  }
}

function saveCart(items: CartItem[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }
}

