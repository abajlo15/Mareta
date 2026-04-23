'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductGrid from '@/components/ProductGrid';
import { fetchProducts } from '@/lib/products';
import { getFavoriteProductIds, subscribeToFavoritesUpdate } from '@/lib/favorites';
import type { Product } from '@/types/product';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const ids = getFavoriteProductIds();
      if (ids.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      const products = await fetchProducts();
      setFavorites(products.filter((product) => ids.includes(product.id)));
      setLoading(false);
    };

    load();
    return subscribeToFavoritesUpdate(load);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg">Učitavanje favorita...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold mb-6 sm:mb-8 bg-gradient-to-r from-primary-600 via-accent-500 to-primary-700 text-transparent bg-clip-text">
        Favoriti
      </h1>

      {favorites.length > 0 ? (
        <ProductGrid products={favorites} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Još nema proizvoda u favoritima.</p>
          <Link
            href="/products"
            className="inline-block bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg hover:from-primary-500 hover:to-primary-600 transition-all duration-200 font-semibold shadow-elegant"
          >
            Pregledaj proizvode
          </Link>
        </div>
      )}
    </div>
  );
}
