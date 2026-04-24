"use client";

import { useState } from "react";

type BulkDiscountFormProps = {
  categories: string[];
  products: Array<{
    id: string;
    name: string;
    categories: string[];
    image: string | null;
    subcollectionId: string | null;
    subcollection: { id: string; name: string } | null;
  }>;
};

export default function BulkDiscountForm({ categories, products }: BulkDiscountFormProps) {
  const [category, setCategory] = useState("");
  const [subcollectionId, setSubcollectionId] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [discountPercentage, setDiscountPercentage] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const productsInCategory = category
    ? products.filter((product) => product.categories.includes(category))
    : [];

  const subcollections = productsInCategory.reduce<Array<{ id: string; name: string }>>((acc, product) => {
    if (!product.subcollection) {
      return acc;
    }
    if (acc.some((item) => item.id === product.subcollection!.id)) {
      return acc;
    }
    acc.push(product.subcollection);
    return acc;
  }, []);

  const filteredProducts = subcollectionId
    ? productsInCategory.filter((product) => product.subcollectionId === subcollectionId)
    : [];

  const toggleProduct = (productId: string) => {
    setSelectedProductIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  };

  const toggleAllVisibleProducts = () => {
    const visibleIds = filteredProducts.map((product) => product.id);
    const allSelected = visibleIds.every((id) => selectedProductIds.includes(id));
    if (allSelected) {
      setSelectedProductIds((current) => current.filter((id) => !visibleIds.includes(id)));
      return;
    }
    setSelectedProductIds((current) => [...new Set([...current, ...visibleIds])]);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const parsedDiscount = Number(discountPercentage);
    if (Number.isNaN(parsedDiscount) || parsedDiscount < 0 || parsedDiscount > 100) {
      setMessage({ type: "error", text: "Popust mora biti broj od 0 do 100." });
      return;
    }

    if (!category) {
      setMessage({ type: "error", text: "Odaberi kolekciju." });
      return;
    }

    if (!subcollectionId) {
      setMessage({ type: "error", text: "Odaberi podkolekciju." });
      return;
    }

    if (!selectedProductIds.length) {
      setMessage({ type: "error", text: "Odaberi barem jedan artikal." });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/products/bulk-discount", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: selectedProductIds,
          discountPercentage: parsedDiscount,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { error?: string; updatedCount?: number }
        | null;

      if (!response.ok) {
        setMessage({
          type: "error",
          text: data?.error || "Došlo je do greške pri spremanju popusta.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: `Popust je ažuriran za ${data?.updatedCount ?? 0} artikala.`,
      });
    } catch {
      setMessage({
        type: "error",
        text: "Došlo je do greške pri spremanju popusta.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-white p-6 shadow-soft border border-slate-200">
      <div>
        <h3 className="text-lg font-semibold">Postavi grupni popust</h3>
        <p className="text-sm text-slate-600 mt-1">
          Redoslijed: odaberi kolekciju, zatim podkolekciju, označi artikle i postavi popust.
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Kolekcija</label>
        <select
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
            setSubcollectionId("");
            setSelectedProductIds([]);
          }}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Odaberi kolekciju</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Podkolekcija</label>
        <select
          value={subcollectionId}
          onChange={(event) => {
            setSubcollectionId(event.target.value);
            setSelectedProductIds([]);
          }}
          disabled={!category}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-slate-100 disabled:text-slate-500"
        >
          <option value="">Odaberi podkolekciju</option>
          {subcollections.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-700">Artikli</label>
          {!!filteredProducts.length && (
            <button
              type="button"
              onClick={toggleAllVisibleProducts}
              className="text-xs text-blue-700 hover:text-blue-900"
            >
              Označi/Odznači sve
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto rounded-md border border-slate-300 bg-white p-3">
          {!category && <p className="text-sm text-slate-500">Prvo odaberi kolekciju.</p>}
          {category && !subcollectionId && (
            <p className="text-sm text-slate-500">Odaberi podkolekciju za prikaz artikala.</p>
          )}
          {category && subcollectionId && !filteredProducts.length && (
            <p className="text-sm text-slate-500">Nema artikala u odabranoj podkolekciji.</p>
          )}
          {!!filteredProducts.length && (
            <div className="grid grid-cols-6 sm:grid-cols-7 lg:grid-cols-8 gap-1.5">
              {filteredProducts.map((product) => {
                const isSelected = selectedProductIds.includes(product.id);
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => toggleProduct(product.id)}
                    className={`rounded-md border p-1 text-left transition min-h-28 ${
                      isSelected
                        ? "border-blue-600 ring-2 ring-blue-200 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="relative w-full h-16 rounded overflow-hidden bg-slate-100">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                          Nema slike
                        </div>
                      )}
                    </div>
                    <div className="mt-1.5 flex items-start gap-1.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleProduct(product.id)}
                        onClick={(event) => event.stopPropagation()}
                      />
                      <span className="text-xs text-slate-700 leading-tight break-words">
                        {product.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Popust (%)</label>
        <input
          type="number"
          min={0}
          max={100}
          step={1}
          value={discountPercentage}
          onChange={(event) => setDiscountPercentage(event.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {message && (
        <p
          className={`text-sm ${
            message.type === "success" ? "text-emerald-700" : "text-red-700"
          }`}
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Spremanje..." : "Spremi grupni popust"}
      </button>
    </form>
  );
}

