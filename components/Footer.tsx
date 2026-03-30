'use client';

import Link from "next/link";
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
            <h3 className="text-xl font-elegant font-bold mb-4 bg-gradient-to-r from-primary-400 via-accent-400 to-primary-500 text-transparent bg-clip-text">
              Mareta
            </h3>
            <p className="text-gray-300 mb-4">
              Elegantne sunčane naočale za modernu ženu. Kvaliteta i stil u svakom komadu.
            </p>
            <div className="flex space-x-4">
              {/* Placeholder za društvene mreže - možeš dodati linkove kasnije */}
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
