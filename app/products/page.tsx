'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import ProductGrid from '@/components/ProductGrid';
import SearchBar from '@/components/SearchBar';
import Filters from '@/components/Filters';
import { fetchProducts, fetchSubcollections } from '@/lib/products';
import type { Product } from '@/types/product';

type CollectionChoice = 'muska' | 'zenska' | null;

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subcollectionId, setSubcollectionId] = useState('');
  const [subcollections, setSubcollections] = useState<
    { id: string; name: string; thumbnail_url: string | null }[]
  >([]);
  const [polarized, setPolarized] = useState<boolean | null>(null);
  const selectedCollectionParam = searchParams.get('kolekcija');
  const selectedCollection: CollectionChoice =
    selectedCollectionParam === 'muska' || selectedCollectionParam === 'zenska'
      ? selectedCollectionParam
      : null;
  const selectedSubcollection = subcollections.find((item) => item.id === subcollectionId) ?? null;

  useEffect(() => {
    loadProducts();
  }, [selectedCollection]);

  useEffect(() => {
    setSubcollectionId('');
  }, [selectedCollection]);

  useEffect(() => {
    applyFilters();
  }, [products, search, subcollectionId, polarized, selectedCollection]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const genderParam = selectedCollection === 'muska' ? 'male' : selectedCollection === 'zenska' ? 'female' : undefined;
      const [data, allSubcollections] = await Promise.all([
        fetchProducts(),
        fetchSubcollections(genderParam),
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
        if (selectedCollection === 'muska') {
          return p.audience === 'male' || p.audience === 'both';
        }
        return p.audience === 'female' || p.audience === 'both';
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
            className="group relative overflow-hidden rounded-xl border border-gray-300 shadow-sm hover:border-primary-400 hover:shadow-md transition-all text-left min-h-[280px] sm:min-h-[320px]"
          >
            <Image
              src="/muškaKolekcija.jpeg"
              alt="Muška kolekcija"
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/30 to-black/20" />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <h2 className="text-xl font-semibold text-white mb-1">Muška kolekcija</h2>
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push('/products?kolekcija=zenska')}
            className="group relative overflow-hidden rounded-xl border border-gray-300 shadow-sm hover:border-primary-400 hover:shadow-md transition-all text-left min-h-[280px] sm:min-h-[320px]"
          >
            <Image
              src="/zenskaKolekcija.jpeg"
              alt="Ženska kolekcija"
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/30 to-black/20" />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <h2 className="text-xl font-semibold text-white mb-1">Ženska kolekcija</h2>
            </div>
          </button>
        </div>
        </div>
      </div>
    );
  }

  if (!subcollectionId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex flex-col items-center gap-3 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold bg-gradient-to-r from-primary-600 via-accent-500 to-primary-700 text-transparent bg-clip-text">
              {selectedCollection === 'muska' ? 'Muška kolekcija' : 'Ženska kolekcija'}
            </h1>
            <button
              type="button"
              onClick={() => router.push('/products')}
              className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:border-primary-400 hover:text-primary-700 transition-colors"
            >
              Promijeni kolekciju
            </button>
          </div>

          <p className="text-gray-600 mb-6">Odaberi podkolekciju.</p>

          {subcollections.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {subcollections.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSubcollectionId(item.id)}
                  className="group relative overflow-hidden rounded-xl border border-gray-300 shadow-sm hover:border-primary-400 hover:shadow-md transition-all text-left min-h-[220px] sm:min-h-[260px]"
                >
                  <Image
                    src={item.thumbnail_url || '/placeholder.svg'}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/30 to-black/20" />
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <h2 className="text-xl font-semibold text-white mb-1">{item.name}</h2>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-600">Trenutno nema podkolekcija za ovu kolekciju.</p>
              <button
                type="button"
                onClick={() => router.push('/products')}
                className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:border-primary-400 hover:text-primary-700 transition-colors"
              >
                Vrati se na odabir kolekcije
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold bg-gradient-to-r from-primary-600 via-accent-500 to-primary-700 text-transparent bg-clip-text">
            {selectedCollection === 'muska' ? 'Muška kolekcija' : 'Ženska kolekcija'}
          </h1>
          <p className="text-gray-600 mt-1">
            Podkolekcija: <span className="font-medium">{selectedSubcollection?.name ?? '-'}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSubcollectionId('');
              setSearch('');
              setPolarized(null);
            }}
            className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:border-primary-400 hover:text-primary-700 transition-colors"
          >
            Promijeni podkolekciju
          </button>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <Filters
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

