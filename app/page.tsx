'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import { fetchProducts } from "@/lib/products";
import type { Product } from "@/types/product";

const heroImages = Array.from({ length: 10 }, (_, index) => `/slika${index + 1}.jpeg`);
const FEATURED_LIMIT = 12;

function shuffleProducts(products: Product[]) {
  const shuffled = [...products];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const [currentFeaturedSlide, setCurrentFeaturedSlide] = useState(0);
  const [featuredPerView, setFeaturedPerView] = useState(4);
  const [isFeaturedPaused, setIsFeaturedPaused] = useState(false);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  useEffect(() => {
    if (isHeroPaused) return;

    const interval = window.setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 3500);

    return () => window.clearInterval(interval);
  }, [isHeroPaused]);

  useEffect(() => {
    const updatePerView = () => {
      if (window.innerWidth >= 1280) {
        setFeaturedPerView(4);
      } else if (window.innerWidth >= 1024) {
        setFeaturedPerView(3);
      } else if (window.innerWidth >= 640) {
        setFeaturedPerView(2);
      } else {
        setFeaturedPerView(1);
      }
    };

    updatePerView();
    window.addEventListener('resize', updatePerView);
    return () => window.removeEventListener('resize', updatePerView);
  }, []);

  const maxFeaturedSlide = Math.max(0, featuredProducts.length - featuredPerView);
  const totalFeaturedSlides = maxFeaturedSlide + 1;

  useEffect(() => {
    if (currentFeaturedSlide > maxFeaturedSlide) {
      setCurrentFeaturedSlide(maxFeaturedSlide);
    }
  }, [currentFeaturedSlide, maxFeaturedSlide]);

  useEffect(() => {
    if (isFeaturedPaused || maxFeaturedSlide === 0) return;

    const interval = window.setInterval(() => {
      setCurrentFeaturedSlide((prev) => (prev >= maxFeaturedSlide ? 0 : prev + 1));
    }, 3000);

    return () => window.clearInterval(interval);
  }, [isFeaturedPaused, maxFeaturedSlide]);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      const products = await fetchProducts();
      const randomizedProducts = shuffleProducts(products);
      setFeaturedProducts(randomizedProducts.slice(0, FEATURED_LIMIT));
      setCurrentFeaturedSlide(0);
    } catch (error) {
      console.error('Error loading featured products:', error);
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNextFeatured = () => {
    setCurrentFeaturedSlide((prev) => (prev >= maxFeaturedSlide ? 0 : prev + 1));
  };

  const handlePrevFeatured = () => {
    setCurrentFeaturedSlide((prev) => (prev <= 0 ? maxFeaturedSlide : prev - 1));
  };

  return (
    <main className="min-h-screen bg-gradient-soft">
      {/* Hero Section */}
      <section
        className="group relative overflow-hidden min-h-[65vh] sm:min-h-[72vh] lg:min-h-[82vh]"
        onMouseEnter={() => setIsHeroPaused(true)}
        onMouseLeave={() => setIsHeroPaused(false)}
      >
        <div className="absolute inset-0">
          {heroImages.map((imageSrc, index) => (
            <Image
              key={imageSrc}
              src={imageSrc}
              alt={`Mareta kolekcija ${index + 1}`}
              fill
              priority={index === 0}
              sizes="100vw"
              style={{
                objectPosition:
                  imageSrc === '/slika4.jpeg'
                    ? 'center 30%'
                    : imageSrc === '/slika10.jpeg'
                      ? 'center 30%'
                      : imageSrc === '/slika7.jpeg' || imageSrc === '/slika8.jpeg'
                      ? 'center 26%'
                      : 'center center',
              }}
              className={`object-cover transition-all duration-1000 ${
                index === currentHeroImage ? 'opacity-100 scale-100 group-hover:scale-105' : 'opacity-0 scale-100'
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-dark-900/28 transition-colors duration-500 group-hover:bg-dark-900/22" />
        </div>
        <div className="relative container mx-auto px-4 py-12 sm:py-16 lg:py-24 text-center min-h-[65vh] sm:min-h-[72vh] lg:min-h-[82vh] flex flex-col items-center justify-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-elegant font-bold mb-6 bg-gradient-to-r from-primary-600 via-accent-500 to-primary-700 text-transparent bg-clip-text">
            Dobrodošli u Mareta
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-white mb-10 font-light">
            Elegantne sunčane naočale za modernu ženu
          </p>
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
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 via-accent-500/10 to-dark-900/20"></div>
          <div className="relative container mx-auto px-4 py-20">
            <div className="text-center">
              <p className="text-lg text-gray-600">Učitavanje proizvoda...</p>
            </div>
          </div>
        </section>
      ) : featuredProducts.length > 0 ? (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 via-accent-500/10 to-dark-900/20"></div>
          <div className="relative container mx-auto px-4 py-20">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-elegant font-bold mb-12 text-center bg-gradient-to-r from-primary-600 via-accent-500 to-primary-700 text-transparent bg-clip-text">
              Istaknuti proizvodi
            </h2>
            <div
              className="relative"
              onMouseEnter={() => setIsFeaturedPaused(true)}
              onMouseLeave={() => setIsFeaturedPaused(false)}
            >
              <button
                type="button"
                aria-label="Prethodni proizvodi"
                onClick={handlePrevFeatured}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 text-dark-800 shadow hover:bg-white transition-colors"
              >
                <span aria-hidden="true">&#8249;</span>
              </button>
              <button
                type="button"
                aria-label="Sljedeći proizvodi"
                onClick={handleNextFeatured}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 text-dark-800 shadow hover:bg-white transition-colors"
              >
                <span aria-hidden="true">&#8250;</span>
              </button>

              <div className="overflow-hidden px-14">
                <div
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{
                    transform: `translateX(-${currentFeaturedSlide * (100 / featuredPerView)}%)`,
                  }}
                >
                  {featuredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex-shrink-0 px-2"
                      style={{ width: `${100 / featuredPerView}%` }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {totalFeaturedSlides > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                {Array.from({ length: totalFeaturedSlides }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Idi na slide ${index + 1}`}
                    onClick={() => setCurrentFeaturedSlide(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      currentFeaturedSlide === index
                        ? 'w-7 bg-primary-600'
                        : 'w-2.5 bg-primary-300 hover:bg-primary-500'
                    }`}
                  />
                ))}
              </div>
            )}
            <div className="text-center mt-12">
              <Link
                href="/products"
                className="inline-block bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-3 rounded-full hover:from-primary-500 hover:to-primary-600 transition-all duration-300 font-semibold shadow-elegant"
              >
                Vidi sve proizvode
              </Link>
            </div>
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

