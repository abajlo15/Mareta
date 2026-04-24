'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import UserMenu from './UserMenu';
import { getFavoriteProductIds, subscribeToFavoritesUpdate } from '@/lib/favorites';
import { getCart, subscribeToCartUpdate } from '@/lib/cart';
import { useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const refresh = () => setFavoritesCount(getFavoriteProductIds().length);
    refresh();
    return subscribeToFavoritesUpdate(refresh);
  }, []);

  useEffect(() => {
    const refresh = () => setCartCount(getCart().itemCount);
    refresh();
    return subscribeToCartUpdate(refresh);
  }, []);

  if (
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/reset-lozinka') ||
    pathname?.startsWith('/zaboravljena-lozinka')
  ) {
    return null;
  }

  return (
    <nav className="bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 shadow-elegant border-b border-primary-600/20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16 md:h-20">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl md:text-2xl font-elegant font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-accent-500 to-primary-600 hover:from-primary-400 hover:via-accent-400 transition-all duration-300"
          >
            <Image
              src="/logo.jpg"
              alt="Mareta logo"
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <span>Mareta</span>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-gray-200 hover:text-white"
            aria-label="Meni"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <div
            className={`absolute top-16 left-0 right-0 md:relative md:top-auto md:left-auto bg-dark-800 md:bg-transparent border-b md:border-b-0 border-dark-700 z-20 md:flex items-center md:space-x-6 py-4 md:py-0 ${
              menuOpen ? 'block' : 'hidden md:flex'
            }`}
          >
            <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-center md:gap-6 gap-3">
              <Link
                href="/products"
                className="text-gray-200 hover:text-primary-400 transition-colors duration-200 font-medium py-2 md:py-0"
                onClick={() => setMenuOpen(false)}
              >
                Proizvodi
              </Link>
              <Link
                href="/o-nama"
                className="text-gray-200 hover:text-primary-400 transition-colors duration-200 font-medium py-2 md:py-0"
                onClick={() => setMenuOpen(false)}
              >
                O nama
              </Link>
              <Link
                href="/kontakt"
                className="text-gray-200 hover:text-primary-400 transition-colors duration-200 font-medium py-2 md:py-0"
                onClick={() => setMenuOpen(false)}
              >
                Kontakt
              </Link>
              <Link
                href="/galerija"
                className="text-gray-200 hover:text-primary-400 transition-colors duration-200 font-medium py-2 md:py-0"
                onClick={() => setMenuOpen(false)}
              >
                Galerija
              </Link>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="order-2 md:order-1 flex items-center justify-center md:justify-start gap-4">
                  <Link
                    href="/favorites"
                    aria-label="Favoriti"
                    title="Favoriti"
                    className="relative text-gray-200 hover:text-primary-400 transition-colors duration-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg className="w-7 h-7 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
                      />
                    </svg>
                    {favoritesCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] leading-4 min-w-4 h-4 px-1 rounded-full text-center">
                        {favoritesCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/cart"
                    aria-label="Košarica"
                    title="Košarica"
                    className="relative text-gray-200 hover:text-primary-400 transition-colors duration-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg className="w-7 h-7 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 5h12m-9 0a1 1 0 102 0m6 0a1 1 0 102 0"
                      />
                    </svg>
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] leading-4 min-w-4 h-4 px-1 rounded-full text-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="https://www.instagram.com/mareta_hr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    title="Instagram"
                    className="text-gray-200 hover:text-primary-400 transition-colors duration-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg className="w-7 h-7 md:w-6 md:h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5Zm5.25-2a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z" />
                    </svg>
                  </Link>
                </div>
                <div className="order-1 md:order-2">
                  <UserMenu onNavigate={() => setMenuOpen(false)} mobile />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

