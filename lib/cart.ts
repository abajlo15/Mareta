import type { CartItem, Cart } from '@/types/cart';
import type { Product } from '@/types/product';
import { calculateDiscountedPrice } from './pricing';
import { getProductStock, type ShirtSize } from './shirtSizes';

const CART_STORAGE_KEY = 'mareta_cart';
const CART_UPDATED_EVENT = 'cartUpdated';

export type CartLineKey = string;

export function getCartLineKey(productId: string, size?: ShirtSize | null): CartLineKey {
  return size ? `${productId}::${size}` : productId;
}

export function getCartItemLineKey(item: CartItem): CartLineKey {
  return getCartLineKey(item.product.id, item.selected_size ?? null);
}

function normalizeStock(stock: number): number {
  return Math.max(0, Number.isFinite(stock) ? stock : 0);
}

function sanitizeCartItems(items: CartItem[]): CartItem[] {
  return items.filter((item) => {
    if (!item?.product?.id) return false;
    if (item.product.is_shirt) {
      return Boolean(item.selected_size);
    }
    return true;
  });
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

    const rawItems: CartItem[] = JSON.parse(stored);
    const items = sanitizeCartItems(
      rawItems.map((item) => ({
        ...item,
        product: {
          ...item.product,
          is_shirt: item.product.is_shirt ?? false,
        },
      }))
    );
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

export function addToCart(
  product: Product,
  quantity: number = 1,
  size?: ShirtSize | null
): Cart {
  const cart = getCart();

  if (product.is_shirt) {
    if (!size) {
      return cart;
    }
  } else if (size) {
    return cart;
  }

  const lineKey = getCartLineKey(product.id, size ?? null);
  const existingItemIndex = cart.items.findIndex(
    (item) => getCartItemLineKey(item) === lineKey
  );
  const maxStock = normalizeStock(getProductStock(product, size ?? null));
  const requestedQuantity = Math.max(1, Math.floor(quantity));

  if (maxStock === 0) {
    return cart;
  }

  if (existingItemIndex >= 0) {
    const nextQuantity = cart.items[existingItemIndex].quantity + requestedQuantity;
    cart.items[existingItemIndex].quantity = Math.min(nextQuantity, maxStock);
  } else {
    cart.items.push({
      product: { ...product, is_shirt: product.is_shirt ?? false },
      quantity: Math.min(requestedQuantity, maxStock),
      selected_size: product.is_shirt ? size ?? null : null,
    });
  }

  saveCart(cart.items);
  return getCart();
}

export function removeFromCart(lineKey: CartLineKey): Cart {
  const cart = getCart();
  cart.items = cart.items.filter((item) => getCartItemLineKey(item) !== lineKey);
  saveCart(cart.items);
  return getCart();
}

export function updateCartItemQuantity(lineKey: CartLineKey, quantity: number): Cart {
  if (quantity <= 0) {
    return removeFromCart(lineKey);
  }

  const cart = getCart();
  const item = cart.items.find((entry) => getCartItemLineKey(entry) === lineKey);
  if (item) {
    const maxStock = normalizeStock(
      getProductStock(item.product, item.selected_size ?? null)
    );
    if (maxStock === 0) {
      return removeFromCart(lineKey);
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
    const sanitized = sanitizeCartItems(items);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(sanitized));
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
