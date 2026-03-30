'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CartItem from '@/components/CartItem';
import { getCart, updateCartItemQuantity, removeFromCart, clearCart } from '@/lib/cart';
import type { Cart } from '@/types/cart';

export default function CartPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [cart, setCart] = useState<Cart>({ items: [], total: 0, itemCount: 0 });

  useEffect(() => {
    setCart(getCart());
  }, []);

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    const updatedCart = updateCartItemQuantity(productId, quantity);
    setCart(updatedCart);
  };

  const handleRemove = (productId: string) => {
    const updatedCart = removeFromCart(productId);
    setCart(updatedCart);
  };

  const handleCheckout = () => {
    startTransition(() => {
      router.push('/checkout');
    });
  };

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4">Vaša košarica je prazna</h1>
          <Link
            href="/products"
            className="inline-block bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg hover:from-primary-500 hover:to-primary-600 transition-all duration-200 font-semibold shadow-elegant"
          >
            Pregledaj proizvode
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 sm:mb-8">Košarica</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <CartItem
              key={item.product.id}
              item={item}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemove}
            />
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Sažetak</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Ukupno stavki:</span>
                <span>{cart.itemCount}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>Ukupno:</span>
                <span>{cart.total.toFixed(2)} €</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isPending}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-lg hover:from-primary-500 hover:to-primary-600 transition-all duration-200 font-semibold shadow-elegant disabled:opacity-70 disabled:cursor-wait"
            >
              {isPending ? 'Učitavanje...' : 'Nastavi na checkout'}
            </button>
            <button
              onClick={() => {
                clearCart();
                setCart({ items: [], total: 0, itemCount: 0 });
              }}
              className="w-full mt-2 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
            >
              Isprazni košaricu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

