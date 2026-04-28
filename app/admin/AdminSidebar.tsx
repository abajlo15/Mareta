"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import AdminLogoutButton from "./AdminLogoutButton";

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-slate-900 text-white rounded-lg shadow-lg"
        aria-label="Admin meni"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-20"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-20 w-64 bg-slate-900 text-white flex flex-col p-6 space-y-6 transform transition-transform duration-200 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          <Link
            href="/admin"
            className="text-2xl font-bold tracking-tight flex items-center gap-2 hover:text-slate-200"
            onClick={() => setOpen(false)}
          >
            <Image
              src="/logo.jpg"
              alt="Mareta logo"
              width={34}
              height={34}
              className="rounded-full object-cover"
            />
            <span>Mareta Admin</span>
          </Link>
          <p className="text-sm text-slate-300 mt-1">
            Upravljanje artiklima i narudžbama
          </p>
        </div>

        <nav className="space-y-2">
          <a
            href="/admin/products"
            className="block rounded px-3 py-2 hover:bg-slate-800"
            onClick={() => setOpen(false)}
          >
            Artikli
          </a>
          <a
            href="/admin/orders"
            className="block rounded px-3 py-2 hover:bg-slate-800"
            onClick={() => setOpen(false)}
          >
            Narudžbe
          </a>
          <a
            href="/admin/discounts"
            className="block rounded px-3 py-2 hover:bg-slate-800"
            onClick={() => setOpen(false)}
          >
            Grupni popust
          </a>
          <a
            href="/admin/collections"
            className="block rounded px-3 py-2 hover:bg-slate-800"
            onClick={() => setOpen(false)}
          >
            Kolekcije
          </a>
          <a
            href="/admin/featured-products"
            className="block rounded px-3 py-2 hover:bg-slate-800"
            onClick={() => setOpen(false)}
          >
            Istaknuti proizvodi
          </a>
          <a
            href="/admin/gallery"
            className="block rounded px-3 py-2 hover:bg-slate-800"
            onClick={() => setOpen(false)}
          >
            Galerija i hero
          </a>
          <Link
            href="/"
            className="block rounded px-3 py-2 hover:bg-slate-800"
            onClick={() => setOpen(false)}
          >
            Vrati se na dućan
          </Link>
        </nav>

        <AdminLogoutButton />
      </aside>
    </>
  );
}
