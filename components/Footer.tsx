'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="bg-dark-900 text-white border-t border-primary-600/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* O nama */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/logo.jpg"
                alt="Mareta logo"
                width={34}
                height={34}
                className="rounded-full object-cover"
              />
              <h3 className="text-xl font-elegant font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-primary-500 text-transparent bg-clip-text">
                Mareta
              </h3>
            </div>
            <p className="text-gray-300 mb-4">
              Elegantne sunčane naočale za modernu ženu. Kvaliteta i stil u svakom komadu.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://www.instagram.com/mareta_hr/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                title="Instagram"
                className="text-gray-300 hover:text-primary-400 transition-colors duration-200"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5Zm5.25-2a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Brzi linkovi */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-100">Brzi linkovi</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-primary-400 transition">
                  Početna
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-300 hover:text-primary-400 transition">
                  Proizvodi
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-gray-300 hover:text-primary-400 transition">
                  Košarica
                </Link>
              </li>
              <li>
                <Link href="/o-nama" className="text-gray-300 hover:text-primary-400 transition">
                  O nama
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="text-gray-300 hover:text-primary-400 transition">
                  Kontaktiraj nas
                </Link>
              </li>
            </ul>
          </div>

          {/* Prazna kolona za buduće linkove */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-100">Informacije</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/o-nama" className="hover:text-primary-400 transition">
                  O nama
                </Link>
              </li>
              <li>
                <Link href="/zamjena-robe" className="hover:text-primary-400 transition">
                  Zamjena robe
                </Link>
              </li>
              <li>
                <Link href="/besplatan-povrat" className="hover:text-primary-400 transition">
                  Besplatan povrat
                </Link>
              </li>
              <li>
                <Link href="/reklamacije" className="hover:text-primary-400 transition">
                  Reklamacije
                </Link>
              </li>
              <li>
                <Link href="/politika-privatnosti" className="hover:text-primary-400 transition">
                  Politika privatnosti
                </Link>
              </li>
              {/* Dodaj više linkova po potrebi */}
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-100">Kontakt</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/kontakt" className="hover:text-primary-400 transition">
                  Kontaktiraj nas
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Mareta. Sva prava pridržana.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
