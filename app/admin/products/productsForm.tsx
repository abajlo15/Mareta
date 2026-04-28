"use client";

import { useState, useRef } from "react";

type Subcollection = {
  id: string;
  name: string;
  gender: "male" | "female";
  thumbnail_url: string | null;
};

type Collection = {
  id: string;
  name: string;
  slug: string;
  thumbnail_url: string | null;
};

export default function AdminProductsForm({
  subcollections,
  collections,
}: {
  subcollections: Subcollection[];
  collections: Collection[];
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("");
  const [collectionIds, setCollectionIds] = useState<string[]>([]);
  const [categoriesInput, setCategoriesInput] = useState("");
  const [subcollectionId, setSubcollectionId] = useState<string>("");
  const [stock, setStock] = useState<string>("0");
  const [discountPercentage, setDiscountPercentage] = useState<string>("0");
  const [isPolarized, setIsPolarized] = useState<boolean>(false);
  const [images, setImages] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const toggleCollection = (collectionId: string) => {
    setCollectionIds((current) =>
      current.includes(collectionId)
        ? current.filter((id) => id !== collectionId)
        : [...current, collectionId]
    );
    setSubcollectionId("");
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!collectionIds.length) {
      setError("Odaberi barem jednu kolekciju.");
      return;
    }
    if (!subcollectionId) {
      setError("Podkolekcija je obavezna.");
      return;
    }
    setLoading(true);

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        price: parseFloat(price),
        discountPercentage: Math.max(0, Math.min(100, parseInt(discountPercentage, 10) || 0)),
        collectionIds,
        categories: categoriesInput
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        subcollectionId: subcollectionId || null,
        stock: Math.max(0, parseInt(stock, 10) || 0),
        isPolarized,
        images,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "Greška pri spremanju artikla.");
      return;
    }

    setName("");
    setDescription("");
    setPrice("");
    setCollectionIds([]);
    setCategoriesInput("");
    setSubcollectionId("");
    setStock("0");
    setDiscountPercentage("0");
    setIsPolarized(false);
    setImages([]);

    window.location.reload();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-md border border-slate-200 rounded-lg p-4 bg-white shadow-sm"
    >
      <h3 className="text-lg font-semibold">Dodaj / uredi artikl</h3>

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

      <div>
        <label className="block text-sm font-medium mb-1">Cijena</label>
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
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Količina</label>
        <input
          className="w-full border border-slate-300 rounded px-3 py-2"
          type="number"
          min="0"
          placeholder="Količina (zaliha)"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Popust</label>
        <input
          className="w-full border border-slate-300 rounded px-3 py-2"
          type="number"
          min="0"
          max="100"
          placeholder="Popust u % (0-100)"
          value={discountPercentage}
          onChange={(e) => setDiscountPercentage(e.target.value)}
        />
      </div>

      <div>
        <p className="block text-sm font-medium mb-2">Polarizirano</p>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPolarized === true}
              onChange={() => setIsPolarized(true)}
            />
            <span>DA</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPolarized === false}
              onChange={() => setIsPolarized(false)}
            />
            <span>NE</span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <p className="block text-sm font-medium">Kolekcije</p>
        <div className="space-y-2">
          {collections.map((collection) => (
            <label key={collection.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={collectionIds.includes(collection.id)}
                onChange={() => toggleCollection(collection.id)}
              />
              <span>{collection.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tagovi (categories)</label>
        <input
          className="w-full border border-slate-300 rounded px-3 py-2"
          placeholder="npr. premium, novo"
          value={categoriesInput}
          onChange={(e) => setCategoriesInput(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Podkolekcija</label>
        <select
          className="w-full border border-slate-300 rounded px-3 py-2"
          value={subcollectionId}
          onChange={(e) => setSubcollectionId(e.target.value)}
          required
        >
          <option value="">— Odaberi podkolekciju —</option>
          {subcollections.map((subcollection) => (
            <option key={subcollection.id} value={subcollection.id}>
              {subcollection.name} {subcollection.gender === "male" ? "(Muška)" : "(Ženska)"}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-500 mt-1">
          Podkolekcija je neovisna o odabiru kolekcija.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Fotografije (opcionalno)</label>
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
        {loading ? "Spremanje..." : "Spremi artikl"}
      </button>
    </form>
  );
}


