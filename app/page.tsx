'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import { fetchProducts } from "@/lib/products";
import type { Product } from "@/types/product";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      const products = await fetchProducts();
      setFeaturedProducts(products.slice(0, 8));
    } catch (error) {
      console.error('Error loading featured products:', error);
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-soft">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 via-accent-500/10 to-dark-900/20"></div>
        <div className="relative container mx-auto px-4 py-12 sm:py-16 lg:py-24 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-elegant font-bold mb-6 bg-gradient-to-r from-primary-600 via-accent-500 to-primary-700 text-transparent bg-clip-text">
            Dobrodošli u Mareta
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-dark-700 mb-10 font-light">Elegantne sunčane naočale za modernu ženu</p>
          <Link
            href="/products"
            className="inline-block bg-gradient-to-r from-primary-600 to-primary-700 text-white px-10 py-4 rounded-full hover:from-primary-500 hover:to-primary-600 transition-all duration-300 font-semibold shadow-elegant hover:shadow-lg transform hover:-translate-y-1"
          >
            Otkrij kolekciju
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      {loading ? (
        <section className="container mx-auto px-4 py-20">
          <div className="text-center">
            <p className="text-lg text-gray-600">Učitavanje proizvoda...</p>
          </div>
        </section>
      ) : featuredProducts.length > 0 ? (
        <section className="container mx-auto px-4 py-20">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold mb-12 text-center bg-gradient-to-r from-primary-600 via-accent-500 to-primary-700 text-transparent bg-clip-text">
            Istaknuti proizvodi
          </h2>
          <ProductGrid products={featuredProducts} />
          <div className="text-center mt-12">
            <Link
              href="/products"
              className="inline-block bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-3 rounded-full hover:from-primary-500 hover:to-primary-600 transition-all duration-300 font-semibold shadow-elegant"
            >
              Vidi sve proizvode
            </Link>
          </div>
        </section>
      ) : (
        <section className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold mb-6 text-center bg-gradient-to-r from-primary-600 via-accent-500 to-primary-700 text-transparent bg-clip-text">
              Dobrodošli
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Proizvodi će biti dostupni uskoro.
            </p>
            <Link
              href="/products"
              className="inline-block bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-3 rounded-full hover:from-primary-500 hover:to-primary-600 transition-all duration-300 font-semibold shadow-elegant"
            >
              Pregledaj proizvode
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}

