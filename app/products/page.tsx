'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductGrid from '@/components/ProductGrid';
import SearchBar from '@/components/SearchBar';
import Filters from '@/components/Filters';
import { fetchProducts, fetchSubcollections } from '@/lib/products';
import type { Product } from '@/types/product';

type CollectionChoice = 'muska' | 'zenska' | null;

const normalizeCategoryLabel = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const includesAnyKeyword = (categories: string[], keywords: string[]) =>
  categories.some((category) => keywords.some((keyword) => category.includes(keyword)));

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subcollectionId, setSubcollectionId] = useState('');
  const [subcollections, setSubcollections] = useState<{ id: string; name: string }[]>([]);
  const [polarized, setPolarized] = useState<boolean | null>(null);
  const selectedCollectionParam = searchParams.get('kolekcija');
  const selectedCollection: CollectionChoice =
    selectedCollectionParam === 'muska' || selectedCollectionParam === 'zenska'
      ? selectedCollectionParam
      : null;

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, search, subcollectionId, polarized, selectedCollection]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const [data, allSubcollections] = await Promise.all([
        fetchProducts(),
        fetchSubcollections(),
      ]);
      setProducts(data);
      setFilteredProducts(data);
      setSubcollections(allSubcollections);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    if (selectedCollection) {
      filtered = filtered.filter((p) => {
        const normalizedCategories = (p.categories ?? []).map(normalizeCategoryLabel);
        const hasUnisex = includesAnyKeyword(normalizedCategories, ['unisex', 'uni sex', 'oboje']);
        const hasTarget =
          selectedCollection === 'muska'
            ? includesAnyKeyword(normalizedCategories, ['musk'])
            : includesAnyKeyword(normalizedCategories, ['zensk']);

        return hasTarget || hasUnisex;
      });
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          (p.description && p.description.toLowerCase().includes(searchLower))
      );
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

  if (!selectedCollection) {
    return (
      <div className="container mx-auto px-4 py-10 sm:py-14 min-h-[70vh] flex items-center justify-center">
        <div className="w-full max-w-3xl text-center">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary-600 via-accent-500 to-primary-700 text-transparent bg-clip-text">
          Odaberi kolekciju
        </h1>
        <p className="text-gray-600 mb-6 sm:mb-8">Odabirom kolekcije prikazat ćemo ti odgovarajuće proizvode.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => router.push('/products?kolekcija=muska')}
            className="rounded-xl border border-gray-300 bg-white p-8 sm:p-10 shadow-sm hover:border-primary-400 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-3">
              <svg className="w-8 h-8 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="9" cy="15" r="5" strokeWidth="2" />
                <path strokeWidth="2" strokeLinecap="round" d="M13 11L20 4M16 4h4v4" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900">Muška kolekcija</h2>
            </div>
            <p className="text-sm text-gray-600">Prikaz: Muška + Unisex</p>
          </button>

          <button
            type="button"
            onClick={() => router.push('/products?kolekcija=zenska')}
            className="rounded-xl border border-gray-300 bg-white p-8 sm:p-10 shadow-sm hover:border-primary-400 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-3">
              <svg className="w-8 h-8 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="8" r="5" strokeWidth="2" />
                <path strokeWidth="2" strokeLinecap="round" d="M12 13v7M9 17h6" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900">Ženska kolekcija</h2>
            </div>
            <p className="text-sm text-gray-600">Prikaz: Ženska + Unisex</p>
          </button>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold bg-gradient-to-r from-primary-600 via-accent-500 to-primary-700 text-transparent bg-clip-text">
          {selectedCollection === 'muska' ? 'Muška kolekcija' : 'Ženska kolekcija'}
        </h1>
        <button
          type="button"
          onClick={() => {
            router.push('/products');
            setSearch('');
            setSubcollectionId('');
            setPolarized(null);
          }}
          className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:border-primary-400 hover:text-primary-700 transition-colors"
        >
          Promijeni kolekciju
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <Filters
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

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <p className="text-lg">Učitavanje proizvoda...</p>
          </div>
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}

