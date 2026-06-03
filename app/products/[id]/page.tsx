'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ColorVariantSelect from '@/components/ColorVariantSelect';
import PositionedCoverImage from '@/components/PositionedCoverImage';
import { getImageSettings } from '@/types/imageDisplay';
import { fetchProduct } from '@/lib/products';
import { addToCart } from '@/lib/cart';
import type { Product } from '@/types/product';
import { calculateDiscountedPrice, hasDiscount, normalizeDiscountPercentage } from '@/lib/pricing';
import { getProductStock, hasAnyStock, type ShirtSize } from '@/lib/shirtSizes';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<ShirtSize | ''>('');
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
    if (!product || isPending) return;
    if (product.is_shirt && !selectedSize) return;
    addToCart(product, quantity, product.is_shirt ? (selectedSize as ShirtSize) : null);
    startTransition(() => {
      router.push('/cart');
    });
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
  const visibleCategories = (product.categories ?? []).filter(
    (category) => category.trim() !== "Muške naočale"
  );
  const mainImage = images[selectedImageIndex] || images[0];
  const mainImageSettings = getImageSettings(product.image_settings, mainImage);
  const hasMultipleImages = images.length > 1;
  const productHasDiscount = hasDiscount(product.discount_percentage);
  const discountedPrice = calculateDiscountedPrice(product.price, product.discount_percentage);
  const discountPercentage = normalizeDiscountPercentage(product.discount_percentage);
  const availableSizeOptions = (product.size_options ?? []).filter((option) => option.stock > 0);
  const selectedSizeStock = product.is_shirt && selectedSize
    ? getProductStock(product, selectedSize)
    : getProductStock(product);
  const inStock = hasAnyStock(product);
  const canAddToCart =
    inStock &&
    (!product.is_shirt || (selectedSize !== '' && selectedSizeStock > 0));
  const showPreviousImage = () => {
    if (!hasMultipleImages) {
      return;
    }
    setSelectedImageIndex((currentIndex) =>
      currentIndex === 0 ? images.length - 1 : currentIndex - 1
    );
  };
  const showNextImage = () => {
    if (!hasMultipleImages) {
      return;
    }
    setSelectedImageIndex((currentIndex) =>
      currentIndex === images.length - 1 ? 0 : currentIndex + 1
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="relative w-full h-96 mb-4">
            {productHasDiscount && (
              <span className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-red-600 text-white text-sm font-bold shadow">
                AKCIJA -{discountPercentage}%
              </span>
            )}
            {hasMultipleImages && (
              <>
                <span className="absolute bottom-3 right-3 z-10 rounded-full bg-black/65 px-3 py-1 text-sm font-medium text-white">
                  {selectedImageIndex + 1} / {images.length}
                </span>
                <button
                  type="button"
                  onClick={showPreviousImage}
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-2xl font-bold text-gray-800 shadow hover:bg-white"
                  aria-label="Prikaži prethodnu sliku"
                >
                  &#8249;
                </button>
                <button
                  type="button"
                  onClick={showNextImage}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-2xl font-bold text-gray-800 shadow hover:bg-white"
                  aria-label="Prikaži sljedeću sliku"
                >
                  &#8250;
                </button>
              </>
            )}
            <PositionedCoverImage
              src={mainImage}
              alt={product.name}
              settings={mainImageSettings}
              preset="productCard"
              className="rounded-lg"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 break-words">{product.name}</h1>
          <ColorVariantSelect
            currentProductId={product.id}
            variants={product.color_variants}
          />
          {visibleCategories.length > 0 && (
            <p className="text-gray-600 mb-4">Kolekcija: {visibleCategories.join(", ")}</p>
          )}
          <div className="mb-4">
            {productHasDiscount && (
              <p className="text-base text-gray-500 line-through">{product.price.toFixed(2)} €</p>
            )}
            <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 text-transparent bg-clip-text">
              {(productHasDiscount ? discountedPrice : product.price).toFixed(2)} €
            </p>
            {productHasDiscount && (
              <p className="text-sm font-semibold text-red-600">Popust -{discountPercentage}%</p>
            )}
          </div>
          {product.description && (
            <p className="text-gray-700 mb-6">{product.description}</p>
          )}

          {product.is_shirt && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Veličina</label>
              <select
                value={selectedSize}
                onChange={(e) => {
                  const nextSize = e.target.value as ShirtSize | '';
                  setSelectedSize(nextSize);
                  setQuantity(1);
                }}
                className="w-full border border-gray-300 rounded px-3 py-2"
                disabled={availableSizeOptions.length === 0}
              >
                <option value="">Odaberi veličinu</option>
                {availableSizeOptions.map((option) => (
                  <option key={option.size} value={option.size}>
                    {option.size}
                  </option>
                ))}
              </select>
              {availableSizeOptions.length === 0 && (
                <p className="text-sm text-red-600 mt-2">Nema dostupnih veličina.</p>
              )}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Količina</label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={!canAddToCart}
                className="w-10 h-10 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Math.min(selectedSizeStock, Math.max(1, parseInt(e.target.value, 10) || 1))
                  )
                }
                min="1"
                max={selectedSizeStock}
                disabled={!canAddToCart}
                className="w-20 text-center border border-gray-300 rounded disabled:bg-gray-100"
              />
              <button
                type="button"
                onClick={() => setQuantity(Math.min(selectedSizeStock, quantity + 1))}
                disabled={!canAddToCart}
                className="w-10 h-10 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                +
              </button>
            </div>
            {!inStock && (
              <p className="text-sm text-red-600 mt-2">Nema na zalihi</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!canAddToCart || isPending}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-lg hover:from-primary-500 hover:to-primary-600 transition-all duration-200 font-semibold shadow-elegant disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Dodavanje...' : canAddToCart ? 'Dodaj u košaricu' : 'Nema na zalihi'}
          </button>
        </div>
      </div>
    </div>
  );
}

