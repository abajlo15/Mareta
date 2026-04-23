'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/types/product';
import FavoriteToggle from './FavoriteToggle';
import { calculateDiscountedPrice, hasDiscount, normalizeDiscountPercentage } from '@/lib/pricing';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0] 
    : '/placeholder.svg';
  const productHasDiscount = hasDiscount(product.discount_percentage);
  const discountedPrice = calculateDiscountedPrice(product.price, product.discount_percentage);
  const discountPercentage = normalizeDiscountPercentage(product.discount_percentage);

  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-white rounded-xl shadow-soft overflow-hidden hover:shadow-elegant transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
        <div className="relative w-full h-64 overflow-hidden">
          <FavoriteToggle productId={product.id} />
          {productHasDiscount && (
            <span className="absolute top-3 left-3 z-10 px-2 py-1 rounded-full bg-red-600 text-white text-xs font-bold shadow">
              AKCIJA -{discountPercentage}%
            </span>
          )}
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <div className="p-5 bg-gradient-to-b from-white to-gray-50">
          <h3 className="text-lg font-elegant font-semibold mb-2 line-clamp-2 text-dark-800">{product.name}</h3>
          {product.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <div>
              {productHasDiscount && (
                <p className="text-xs text-gray-500 line-through">{product.price.toFixed(2)} €</p>
              )}
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 text-transparent bg-clip-text">
                {(productHasDiscount ? discountedPrice : product.price).toFixed(2)} €
              </span>
              {productHasDiscount && (
                <p className="text-xs font-semibold text-red-600">Popust -{discountPercentage}%</p>
              )}
            </div>
            {product.stock === 0 && (
              <span className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-full font-medium">Nema na zalihi</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

