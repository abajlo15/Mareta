'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Toast = {
  type: "success" | "error";
  message: string;
};

type Collection = {
  id: string;
  name: string;
};

type Subcollection = {
  id: string;
  name: string;
  collection_id: string;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discount_percentage?: number;
  categories?: string[] | null;
  collections?: { id: string; name: string; slug: string }[];
  collection_positions?: { collection_id: string; position: number }[];
  subcollection_id?: string | null;
  subcollection_position?: number | null;
  subcollection?: { name: string; collection_id?: string } | null;
  stock?: number;
  images?: string[] | null;
};

function getDisplayPosition(
  product: Product,
  collectionId: string,
  subcollectionId: string
): number {
  if (subcollectionId) {
    return product.subcollection_position ?? 999999;
  }
  return (
    product.collection_positions?.find((item) => item.collection_id === collectionId)?.position ??
    999999
  );
}

function sortByDisplayPosition(
  items: Product[],
  collectionId: string,
  subcollectionId: string
): Product[] {
  return [...items].sort((a, b) => {
    const posA = getDisplayPosition(a, collectionId, subcollectionId);
    const posB = getDisplayPosition(b, collectionId, subcollectionId);
    if (posA !== posB) return posA - posB;
    return a.name.localeCompare(b.name, "hr");
  });
}

export default function AdminProductsList({
  products,
  collections,
  subcollections,
}: {
  products: Product[];
  collections: Collection[];
  subcollections: Subcollection[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [collectionFilter, setCollectionFilter] = useState("");
  const [subcollectionFilter, setSubcollectionFilter] = useState("");
  const [orderedProducts, setOrderedProducts] = useState<Product[]>([]);
  const [savingOrder, setSavingOrder] = useState(false);

  const subcollectionsForCollection = collectionFilter
    ? subcollections.filter((item) => item.collection_id === collectionFilter)
    : [];

  const showSubcollectionFilter =
    Boolean(collectionFilter) && subcollectionsForCollection.length > 0;

  const canReorder =
    Boolean(collectionFilter) && (!showSubcollectionFilter || Boolean(subcollectionFilter));

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (collectionFilter) {
        const inCollection = product.collections?.some((c) => c.id === collectionFilter);
        if (!inCollection) return false;
      }
      if (subcollectionFilter) {
        return product.subcollection_id === subcollectionFilter;
      }
      return true;
    });
  }, [products, collectionFilter, subcollectionFilter]);

  const sortedFilteredProducts = useMemo(() => {
    if (!canReorder) return filteredProducts;
    return sortByDisplayPosition(
      filteredProducts,
      collectionFilter,
      subcollectionFilter
    );
  }, [filteredProducts, canReorder, collectionFilter, subcollectionFilter]);

  useEffect(() => {
    setOrderedProducts(sortedFilteredProducts);
  }, [sortedFilteredProducts]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const saveOrder = useCallback(
    async (nextProducts: Product[]) => {
      setSavingOrder(true);
      try {
        const response = await fetch("/api/admin/products/reorder", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            collectionId: collectionFilter,
            subcollectionId: subcollectionFilter || null,
            orderedProductIds: nextProducts.map((product) => product.id),
          }),
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null;
          setToast({
            type: "error",
            message: data?.error || "Spremanje redoslijeda nije uspjelo.",
          });
          setOrderedProducts(sortedFilteredProducts);
          return;
        }

        setToast({
          type: "success",
          message: "Redoslijed je spremljen.",
        });
      } catch {
        setToast({
          type: "error",
          message: "Došlo je do greške pri spremanju redoslijeda.",
        });
        setOrderedProducts(sortedFilteredProducts);
      } finally {
        setSavingOrder(false);
      }
    },
    [collectionFilter, subcollectionFilter, sortedFilteredProducts]
  );

  const moveProduct = (productId: string, direction: "up" | "down") => {
    setOrderedProducts((current) => {
      const index = current.findIndex((product) => product.id === productId);
      if (index === -1) return current;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.length) return current;

      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      void saveOrder(next);
      return next;
    });
  };

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

  const displayProducts = canReorder ? orderedProducts : filteredProducts;

  if (!products.length) {
    return <p className="text-slate-500">Još nema artikala.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <h3 className="text-lg font-semibold">Pregled artikala</h3>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="min-w-[220px] border border-slate-300 rounded px-3 py-2 text-sm"
            value={collectionFilter}
            onChange={(e) => {
              setCollectionFilter(e.target.value);
              setSubcollectionFilter("");
            }}
          >
            <option value="">Sve kolekcije</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
          {showSubcollectionFilter && (
            <select
              className="min-w-[220px] border border-slate-300 rounded px-3 py-2 text-sm"
              value={subcollectionFilter}
              onChange={(e) => setSubcollectionFilter(e.target.value)}
            >
              <option value="">Sve podkolekcije</option>
              {subcollectionsForCollection.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {canReorder && (
        <p className="text-xs text-slate-500">
          Prvi proizvod u tablici prikazuje se prvi korisnicima. Koristi Gore/Dole za promjenu
          redoslijeda.
          {savingOrder && <span className="ml-2 text-slate-600">Spremanje redoslijeda...</span>}
        </p>
      )}

      {!displayProducts.length ? (
        <p className="text-slate-500">Nema artikala za odabrane filtere.</p>
      ) : (
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
                  {canReorder && <th className="px-4 py-2 text-left">Redoslijed</th>}
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
                {displayProducts.map((p, index) => (
                  <tr key={p.id} className="border-t border-slate-100">
                    {canReorder && (
                      <td className="px-4 py-2">
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => moveProduct(p.id, "up")}
                            disabled={savingOrder || index === 0}
                            className="px-2 py-1 rounded border border-slate-300 text-xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label={`Pomakni ${p.name} gore`}
                          >
                            Gore
                          </button>
                          <button
                            type="button"
                            onClick={() => moveProduct(p.id, "down")}
                            disabled={savingOrder || index === displayProducts.length - 1}
                            className="px-2 py-1 rounded border border-slate-300 text-xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label={`Pomakni ${p.name} dolje`}
                          >
                            Dolje
                          </button>
                        </div>
                      </td>
                    )}
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
                          disabled={isPending || deletingId === p.id || savingOrder}
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
      )}
    </div>
  );
}
