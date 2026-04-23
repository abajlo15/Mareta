'use client';

import { useState, useEffect } from 'react';
import ProductGrid from '@/components/ProductGrid';
import SearchBar from '@/components/SearchBar';
import Filters from '@/components/Filters';
import { fetchProducts, fetchSubcollections } from '@/lib/products';
import type { Product } from '@/types/product';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [subcollectionId, setSubcollectionId] = useState('');
  const [subcollections, setSubcollections] = useState<{ id: string; name: string }[]>([]);
  const [polarized, setPolarized] = useState<boolean | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, search, category, subcollectionId, polarized]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const [data, allSubcollections] = await Promise.all([
        fetchProducts(),
        fetchSubcollections(),
      ]);
      setProducts(data);
      setFilteredProducts(data);
      
      // Extract unique collections from array values
      const uniqueCategories = Array.from(
        new Set(data.flatMap((p) => p.categories ?? []))
      );
      setCategories(uniqueCategories);
      setSubcollections(allSubcollections);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          (p.description && p.description.toLowerCase().includes(searchLower))
      );
    }

    if (category) {
      filtered = filtered.filter((p) => (p.categories ?? []).includes(category));
    }

    if (subcollectionId) {
      filtered = filtered.filter((p) => p.subcollection_id === subcollectionId);
    }

    if (polarized !== null) {
      filtered = filtered.filter((p) => p.is_polarized === polarized);
    }

    setFilteredProducts(filtered);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-lg">Učitavanje proizvoda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold mb-6 sm:mb-8 bg-gradient-to-r from-primary-600 via-accent-500 to-primary-700 text-transparent bg-clip-text">Proizvodi</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <Filters
            category={category}
            onCategoryChange={setCategory}
            categories={categories}
            subcollectionId={subcollectionId}
            onSubcollectionChange={setSubcollectionId}
            subcollections={subcollections}
            polarized={polarized}
            onPolarizedChange={setPolarized}
          />
        </div>

        <div className="lg:col-span-3">
          <div className="mb-6">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <ProductGrid products={filteredProducts} />
        </div>
      </div>
    </div>
  );
}

