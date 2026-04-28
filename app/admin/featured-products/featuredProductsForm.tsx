"use client";

import { useMemo, useState } from "react";

const MAX_FEATURED_PRODUCTS = 15;

type FeaturedProductsFormProps = {
  products: Array<{
    id: string;
    name: string;
    image: string | null;
  }>;
  initialSelectedProductIds: string[];
};

export default function FeaturedProductsForm({
  products,
  initialSelectedProductIds,
}: FeaturedProductsFormProps) {
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(initialSelectedProductIds);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const selectedCount = selectedProductIds.length;
  const isLimitReached = selectedCount >= MAX_FEATURED_PRODUCTS;
  const selectedSet = useMemo(() => new Set(selectedProductIds), [selectedProductIds]);

  const toggleProduct = (productId: string) => {
    setMessage(null);
    setSelectedProductIds((current) => {
      if (current.includes(productId)) {
        return current.filter((id) => id !== productId);
      }
      if (current.length >= MAX_FEATURED_PRODUCTS) {
        return current;
      }
      return [...current, productId];
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/products/featured", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: selectedProductIds }),
      });

      const data = (await response.json().catch(() => null)) as
        | { error?: string; updatedCount?: number }
        | null;

      if (!response.ok) {
        setMessage({
          type: "error",
          text: data?.error || "Došlo je do greške pri spremanju istaknutih proizvoda.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: `Istaknuti proizvodi su spremljeni (${data?.updatedCount ?? 0}).`,
      });
    } catch {
      setMessage({
        type: "error",
        text: "Došlo je do greške pri spremanju istaknutih proizvoda.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-white p-6 shadow-soft border border-slate-200">
      <div>
        <h3 className="text-lg font-semibold">Odaberi istaknute proizvode</h3>
        <p className="text-sm text-slate-600 mt-1">
          Klikom odaberi proizvode koji će se prikazivati na početnoj stranici.
        </p>
        <p className="text-sm mt-2 text-slate-700">
          Odabrano: <span className="font-semibold">{selectedCount}</span>/{MAX_FEATURED_PRODUCTS}
        </p>
      </div>

      <div className="max-h-[36rem] overflow-y-auto rounded-md border border-slate-300 bg-white p-3">
        {!products.length && <p className="text-sm text-slate-500">Trenutno nema proizvoda.</p>}
        {!!products.length && (
          <div className="grid grid-cols-6 sm:grid-cols-7 lg:grid-cols-8 gap-1.5">
            {products.map((product) => {
              const isSelected = selectedSet.has(product.id);
              const isDisabled = !isSelected && isLimitReached;
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => toggleProduct(product.id)}
                  disabled={isDisabled}
                  className={`rounded-md border p-1 text-left transition min-h-28 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isSelected
                      ? "border-blue-600 ring-2 ring-blue-200 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="relative w-full h-16 rounded overflow-hidden bg-slate-100">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
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
                      disabled={isDisabled}
                      onChange={() => toggleProduct(product.id)}
                      onClick={(event) => event.stopPropagation()}
                    />
                    <span className="text-xs text-slate-700 leading-tight break-words">{product.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {message && (
        <p className={`text-sm ${message.type === "success" ? "text-emerald-700" : "text-red-700"}`}>
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Spremanje..." : "Spremi istaknute proizvode"}
      </button>
    </form>
  );
}
