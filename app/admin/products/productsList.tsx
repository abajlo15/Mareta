'use client';

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Toast = {
  type: "success" | "error";
  message: string;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discount_percentage?: number;
  categories?: string[] | null;
  collections?: { id: string; name: string; slug: string }[];
  subcollection?: { name: string } | null;
  stock?: number;
  images?: string[] | null;
};

export default function AdminProductsList({ products }: { products: Product[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const handleDelete = async (id: string, name: string) => {
    const confirmed = window.confirm(`Jesi siguran/na da želiš obrisati artikal "${name}"?`);
    if (!confirmed) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setToast({
          type: "error",
          message: data?.error || "Brisanje nije uspjelo.",
        });
        return;
      }

      setToast({
        type: "success",
        message: "Artikal je uspješno obrisan.",
      });
      window.setTimeout(() => {
        startTransition(() => {
          router.refresh();
        });
      }, 700);
    } catch {
      setToast({
        type: "error",
        message: "Došlo je do greške pri brisanju artikla.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (!products.length) {
    return <p className="text-slate-500">Još nema artikala.</p>;
  }

  return (
    <>
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`rounded-lg px-4 py-3 text-sm font-medium shadow-lg border ${
              toast.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
      <div className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2 text-left">Slika</th>
            <th className="px-4 py-2 text-left">Naziv</th>
            <th className="px-4 py-2 text-left">Kolekcija</th>
            <th className="px-4 py-2 text-left">Podkolekcija</th>
            <th className="px-4 py-2 text-left">Opis</th>
            <th className="px-4 py-2 text-right">Zaliha</th>
            <th className="px-4 py-2 text-right">Cijena</th>
            <th className="px-4 py-2 text-right">Popust</th>
            <th className="px-4 py-2 text-left">Akcije</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t border-slate-100">
              <td className="px-4 py-2">
                {p.images?.[0] ? (
                  <img
                    src={p.images[0]}
                    alt=""
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              <td className="px-4 py-2">{p.name}</td>
              <td className="px-4 py-2 text-slate-600">
                {p.collections?.length
                  ? p.collections.map((collection) => collection.name).join(", ")
                  : "—"}
              </td>
              <td className="px-4 py-2 text-slate-600">
                {p.subcollection?.name || "-"}
              </td>
              <td className="px-4 py-2 text-slate-600">
                {p.description || "-"}
              </td>
              <td className="px-4 py-2 text-right">
                {p.stock ?? 0}
              </td>
              <td className="px-4 py-2 text-right">
                {p.price.toFixed(2)}&nbsp;€
              </td>
              <td className="px-4 py-2 text-right">
                {p.discount_percentage ? `-${p.discount_percentage}%` : "—"}
              </td>
              <td className="px-4 py-2">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Uredi
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id, p.name)}
                    disabled={isPending || deletingId === p.id}
                    className="text-red-600 hover:text-red-800 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {deletingId === p.id ? "Brisanje..." : "Obriši"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </>
  );
}


