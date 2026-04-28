'use client';

import Image from 'next/image';
import type { CartItem as CartItemType } from '@/types/cart';
import { calculateDiscountedPrice, hasDiscount, normalizeDiscountPercentage } from '@/lib/pricing';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const imageUrl = item.product.images && item.product.images.length > 0 
    ? item.product.images[0] 
    : '/placeholder.svg';
  const itemHasDiscount = hasDiscount(item.product.discount_percentage);
  const itemUnitPrice = calculateDiscountedPrice(
    item.product.price,
    item.product.discount_percentage
  );
  const discountPercentage = normalizeDiscountPercentage(item.product.discount_percentage);
  const hasReachedStockLimit = item.quantity >= item.product.stock;

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
        {itemHasDiscount && (
          <p className="text-gray-500 text-xs line-through">{item.product.price.toFixed(2)} €</p>
        )}
        <p className="text-gray-600 text-sm">{itemUnitPrice.toFixed(2)} €</p>
        {itemHasDiscount && (
          <p className="text-xs text-red-600 font-semibold">Popust -{discountPercentage}%</p>
        )}
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
          disabled={hasReachedStockLimit}
          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>
      {hasReachedStockLimit && (
        <p className="text-xs text-amber-700">Dosegnuta maksimalna dostupna količina.</p>
      )}
      <div className="text-right">
        <p className="font-semibold text-lg">
          {(itemUnitPrice * item.quantity).toFixed(2)} €
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

