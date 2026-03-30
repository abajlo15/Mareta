'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserMenu from './UserMenu';

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 shadow-elegant border-b border-primary-600/20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16 md:h-20">
          <Link href="/" className="text-xl md:text-2xl font-elegant font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-accent-500 to-primary-600 hover:from-primary-400 hover:via-accent-400 transition-all duration-300">
            Mareta
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
                href="/cart"
                className="text-gray-200 hover:text-primary-400 transition-colors duration-200 font-medium py-2 md:py-0"
                onClick={() => setMenuOpen(false)}
              >
                Košarica
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
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

