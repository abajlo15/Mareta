"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  categories?: string[] | null;
  subcollection_id?: string | null;
  stock?: number;
  images?: string[] | null;
};

type Subcollection = {
  id: string;
  name: string;
};

export default function AdminProductEditForm({
  product,
  subcollections,
}: {
  product: Product;
  subcollections: Subcollection[];
}) {
  const router = useRouter();
  const COLLECTIONS = ["Muška kolekcija", "Ženska kolekcija"];

  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? "");
  const [price, setPrice] = useState<string>(String(product.price));
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    product.categories ?? []
  );
  const [subcollectionId, setSubcollectionId] = useState<string>(product.subcollection_id ?? "");
  const [stock, setStock] = useState<string>(String(product.stock ?? 0));
  const [images, setImages] = useState<string[]>(product.images ?? []);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(product.name);
    setDescription(product.description ?? "");
    setPrice(String(product.price));
    setSelectedCollections(product.categories ?? []);
    setSubcollectionId(product.subcollection_id ?? "");
    setStock(String(product.stock ?? 0));
    setImages(product.images ?? []);
  }, [product]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    setError(null);

    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error((data as { error?: string }).error ?? "Greška pri uploadu");
        }

        const { url } = await res.json();
        urls.push(url);
      }
      setImages((prev) => [...prev, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri uploadu fotografija.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function toggleCollection(collection: string) {
    setSelectedCollections((prev) =>
      prev.includes(collection)
        ? prev.filter((item) => item !== collection)
        : [...prev, collection]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description: description || null,
        price: parseFloat(price),
        categories: selectedCollections,
        subcollectionId: subcollectionId || null,
        stock: Math.max(0, parseInt(stock, 10) || 0),
        images,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "Greška pri ažuriranju artikla.");
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-md border border-slate-200 rounded-lg p-4 bg-white shadow-sm"
    >
      <h3 className="text-lg font-semibold">Uredi artikl</h3>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <input
        className="w-full border border-slate-300 rounded px-3 py-2"
        placeholder="Naziv artikla"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <textarea
        className="w-full border border-slate-300 rounded px-3 py-2"
        placeholder="Opis (nije obavezno)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        className="w-full border border-slate-300 rounded px-3 py-2"
        type="number"
        step="0.01"
        min="0"
        placeholder="Cijena (npr. 19.99)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />

      <input
        className="w-full border border-slate-300 rounded px-3 py-2"
        type="number"
        min="0"
        placeholder="Količina (zaliha)"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
      />

      <div>
        <p className="block text-sm font-medium mb-2">Kolekcije</p>
        <div className="space-y-2">
          {COLLECTIONS.map((collection) => (
            <label key={collection} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedCollections.includes(collection)}
                onChange={() => toggleCollection(collection)}
              />
              <span>{collection}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Podkolekcija</label>
        <select
          className="w-full border border-slate-300 rounded px-3 py-2"
          value={subcollectionId}
          onChange={(e) => setSubcollectionId(e.target.value)}
        >
          <option value="">— Bez podkolekcije —</option>
          {subcollections.map((subcollection) => (
            <option key={subcollection.id} value={subcollection.id}>
              {subcollection.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Fotografije</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleFileChange}
          disabled={uploading}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-slate-100 file:text-slate-700 file:cursor-pointer"
        />
        {uploading && <p className="text-sm text-slate-500 mt-1">Učitavanje...</p>}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {images.map((url, i) => (
              <div key={url} className="relative">
                <img
                  src={url}
                  alt=""
                  className="w-16 h-16 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        disabled={loading}
        type="submit"
        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Spremanje..." : "Spremi promjene"}
      </button>
    </form>
  );
}
