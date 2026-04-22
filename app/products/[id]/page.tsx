'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { fetchProduct } from '@/lib/products';
import { addToCart } from '@/lib/cart';
import type { Product } from '@/types/product';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (params.id) {
      loadProduct(params.id as string);
    }
  }, [params.id]);

  const loadProduct = async (id: string) => {
    try {
      setLoading(true);
      const data = await fetchProduct(id);
      if (data) {
        setProduct(data);
      } else {
        setProduct(null);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product && !isPending) {
      addToCart(product, quantity);
      startTransition(() => {
        router.push('/cart');
      });
    }
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

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-lg text-red-600">Proizvod nije pronađen</p>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : ['/placeholder.svg'];
  const mainImage = images[selectedImageIndex] || images[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="relative w-full h-96 mb-4">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative w-full h-24 border-2 rounded ${
                    selectedImageIndex === index
                      ? 'border-blue-600'
                      : 'border-gray-300'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover rounded"
                    sizes="96px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 break-words">{product.name}</h1>
          {product.categories?.length && (
            <p className="text-gray-600 mb-4">Kolekcija: {product.categories.join(", ")}</p>
          )}
          <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 text-transparent bg-clip-text mb-4">
            {product.price.toFixed(2)} €
          </p>
          {product.description && (
            <p className="text-gray-700 mb-6">{product.description}</p>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Količina</label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border border-gray-300 rounded hover:bg-gray-100"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max={product.stock}
                className="w-20 text-center border border-gray-300 rounded"
              />
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-10 h-10 border border-gray-300 rounded hover:bg-gray-100"
              >
                +
              </button>
            </div>
            {product.stock === 0 && (
              <p className="text-sm text-red-600 mt-2">Nema na zalihi</p>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isPending}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-lg hover:from-primary-500 hover:to-primary-600 transition-all duration-200 font-semibold shadow-elegant disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Dodavanje...' : product.stock > 0 ? 'Dodaj u košaricu' : 'Nema na zalihi'}
          </button>
        </div>
      </div>
    </div>
  );
}

