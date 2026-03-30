'use client';

import Image from 'next/image';
import type { CartItem as CartItemType } from '@/types/cart';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const imageUrl = item.product.images && item.product.images.length > 0 
    ? item.product.images[0] 
    : '/placeholder.svg';

  return (
    <div className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-soft border border-gray-100">
      <div className="relative w-24 h-24 flex-shrink-0">
        <Image
          src={imageUrl}
          alt={item.product.name}
          fill
          className="object-cover rounded"
          sizes="96px"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-lg">{item.product.name}</h3>
        <p className="text-gray-600 text-sm">{item.product.price.toFixed(2)} €</p>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
        >
          -
        </button>
        <span className="w-12 text-center">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
        >
          +
        </button>
      </div>
      <div className="text-right">
        <p className="font-semibold text-lg">
          {(item.product.price * item.quantity).toFixed(2)} €
        </p>
        <button
          onClick={() => onRemove(item.product.id)}
          className="text-red-600 text-sm hover:text-red-800 mt-1"
        >
          Ukloni
        </button>
      </div>
    </div>
  );
}

