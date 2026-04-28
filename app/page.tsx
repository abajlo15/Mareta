'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import { fetchFeaturedProducts } from "@/lib/products";
import { DEFAULT_GALLERY_IMAGES, fetchGalleryImages } from "@/lib/gallery";
import type { Product } from "@/types/product";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [heroImages, setHeroImages] = useState<string[]>(DEFAULT_GALLERY_IMAGES);
  const [loading, setLoading] = useState(true);
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const [currentFeaturedSlide, setCurrentFeaturedSlide] = useState(0);
  const [featuredPerView, setFeaturedPerView] = useState(4);
  const [isFeaturedPaused, setIsFeaturedPaused] = useState(false);

  useEffect(() => {
    loadFeaturedProducts();
    loadHeroImages();
  }, []);

  useEffect(() => {
    if (!heroImages.length) return;
    if (isHeroPaused) return;

    const interval = window.setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 3500);

    return () => window.clearInterval(interval);
  }, [isHeroPaused, heroImages.length]);

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
      const products = await fetchFeaturedProducts();
      setFeaturedProducts(products);
      setCurrentFeaturedSlide(0);
    } catch (error) {
      console.error('Error loading featured products:', error);
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadHeroImages = async () => {
    const images = await fetchGalleryImages();
    setHeroImages(images);
    setCurrentHeroImage(0);
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
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-950 via-slate-900 to-dark-900" />
        <div className="absolute -z-10 -top-28 -left-24 h-72 w-72 rounded-full bg-primary-500/30 blur-3xl" />
        <div className="absolute -z-10 -bottom-24 -right-24 h-80 w-80 rounded-full bg-accent-500/25 blur-3xl" />
        <div className="absolute inset-0">
          {heroImages.map((imageSrc, index) => (
            <Image
              key={imageSrc}
              src={imageSrc}
              alt={`Mareta kolekcija ${index + 1}`}
              fill
              priority={index === 0}
              sizes="100vw"
              className={`object-cover transition-all duration-1000 ${
                index === currentHeroImage ? 'opacity-100 scale-100 group-hover:scale-105' : 'opacity-0 scale-100'
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-black/65 transition-colors duration-500 group-hover:from-black/55 group-hover:to-black/60" />
          <div className="absolute inset-0 [background:radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0)_34%),radial-gradient(circle_at_80%_85%,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_32%)]" />
          <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:36px_36px]" />
          <div className="pointer-events-none absolute inset-3 sm:inset-6">
            <span className="absolute left-0 top-0 h-6 w-6 sm:h-10 sm:w-10 border-l border-t sm:border-l-2 sm:border-t-2 border-white/40 sm:border-white/45" />
            <span className="absolute right-0 top-0 h-6 w-6 sm:h-10 sm:w-10 border-r border-t sm:border-r-2 sm:border-t-2 border-white/40 sm:border-white/45" />
            <span className="absolute left-0 bottom-0 h-6 w-6 sm:h-10 sm:w-10 border-l border-b sm:border-l-2 sm:border-b-2 border-white/40 sm:border-white/45" />
            <span className="absolute right-0 bottom-0 h-6 w-6 sm:h-10 sm:w-10 border-r border-b sm:border-r-2 sm:border-b-2 border-white/40 sm:border-white/45" />
          </div>
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 min-h-[65vh] sm:min-h-[72vh] lg:min-h-[82vh] flex items-center">
          <div className="relative w-full max-w-3xl text-left">
            <div className="mb-4 sm:mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white/85 backdrop-blur-sm">
              Nova sezona
            </div>
            <h1 className="relative text-3xl sm:text-5xl lg:text-6xl font-elegant font-bold mb-4 sm:mb-5 text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] leading-tight">
              Dobrodošli u Mareta
            </h1>
            <p className="relative text-base sm:text-xl lg:text-2xl text-white/90 mb-7 sm:mb-9 font-light max-w-2xl">
              Elegantne sunčane naočale za modernu ženu
            </p>
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <Link
                href="/products"
                className="relative inline-block bg-gradient-to-r from-primary-600 to-primary-700 text-white px-7 sm:px-10 py-3 sm:py-4 rounded-full hover:from-primary-500 hover:to-primary-600 transition-all duration-300 font-semibold shadow-elegant hover:shadow-lg transform hover:-translate-y-1 text-sm sm:text-base"
              >
                Otkrij kolekciju
              </Link>
              <Link
                href="/galerija"
                className="inline-block rounded-full border border-white/40 bg-white/10 px-5 sm:px-7 py-2.5 sm:py-3 text-white hover:bg-white/20 transition-colors duration-300 backdrop-blur-sm text-sm sm:text-base"
              >
                Pogledaj galeriju
              </Link>
            </div>
          </div>
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

