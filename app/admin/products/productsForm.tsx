"use client";

import { useRef, useState } from "react";
import AdminImageThumb from "@/components/admin/AdminImageThumb";
import ImageRepositionModal from "@/components/admin/ImageRepositionModal";
import {
  DEFAULT_IMAGE_DISPLAY_SETTINGS,
  getImageSettings,
  type ImageDisplaySettings,
  type ImageSettingsMap,
} from "@/types/imageDisplay";

type Collection = {
  id: string;
  name: string;
  slug: string;
  thumbnail_url: string | null;
};

type Subcollection = {
  id: string;
  name: string;
  collection_id: string;
};

export default function AdminProductsForm({
  collections,
  subcollections,
}: {
  collections: Collection[];
  subcollections: Subcollection[];
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("");
  const [collectionIds, setCollectionIds] = useState<string[]>([]);
  const [subcollectionId, setSubcollectionId] = useState("");
  const [categoriesInput, setCategoriesInput] = useState("");
  const [stock, setStock] = useState<string>("0");
  const [discountPercentage, setDiscountPercentage] = useState<string>("0");
  const [isPolarized, setIsPolarized] = useState<boolean>(false);
  const [images, setImages] = useState<string[]>([]);
  const [imageSettings, setImageSettings] = useState<ImageSettingsMap>({});
  const [repositionUrl, setRepositionUrl] = useState<string | null>(null);

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
      if (urls.length > 0) {
        setRepositionUrl(urls[urls.length - 1]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri uploadu fotografija.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImage(index: number) {
    setImages((prev) => {
      const removed = prev[index];
      if (removed) {
        setImageSettings((settings) => {
          const next = { ...settings };
          delete next[removed];
          return next;
        });
      }
      return prev.filter((_, i) => i !== index);
    });
  }

  function saveImageSettings(url: string, settings: ImageDisplaySettings) {
    setImageSettings((prev) => ({ ...prev, [url]: settings }));
  }

  const collectionNameById = new Map(collections.map((c) => [c.id, c.name]));
  const showCollectionPrefix = collectionIds.length > 1;

  const availableSubcollections = subcollections.filter((item) =>
    collectionIds.includes(item.collection_id)
  );

  const toggleCollection = (collectionId: string) => {
    setCollectionIds((current) => {
      const next = current.includes(collectionId)
        ? current.filter((id) => id !== collectionId)
        : [...current, collectionId];

      if (
        subcollectionId &&
        !subcollections.some(
          (item) => item.id === subcollectionId && next.includes(item.collection_id)
        )
      ) {
        setSubcollectionId("");
      }

      return next;
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!collectionIds.length) {
      setError("Odaberi barem jednu kolekciju.");
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
        imageSettings,
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
    setSubcollectionId("");
    setCategoriesInput("");
    setStock("0");
    setDiscountPercentage("0");
    setIsPolarized(false);
    setImages([]);
    setImageSettings({});

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
        <label className="block text-sm font-medium mb-1">Podkolekcija</label>
        <select
          value={subcollectionId}
          onChange={(e) => setSubcollectionId(e.target.value)}
          disabled={!collectionIds.length}
          className="w-full border border-slate-300 rounded px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-500"
        >
          <option value="">Bez podkolekcije</option>
          {availableSubcollections.map((item) => {
            const collectionName = collectionNameById.get(item.collection_id);
            const label =
              showCollectionPrefix && collectionName
                ? `${collectionName} — ${item.name}`
                : item.name;
            return (
              <option key={item.id} value={item.id}>
                {label}
              </option>
            );
          })}
        </select>
        {collectionIds.length > 0 && !availableSubcollections.length && (
          <p className="text-sm text-slate-500 mt-1">Nema podkolekcija za odabrane kolekcije.</p>
        )}
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
              <AdminImageThumb
                key={url}
                url={url}
                settings={getImageSettings(imageSettings, url)}
                onReposition={() => setRepositionUrl(url)}
                onRemove={() => removeImage(i)}
              />
            ))}
          </div>
        )}
      </div>

      <ImageRepositionModal
        open={!!repositionUrl}
        imageUrl={repositionUrl ?? ""}
        preset="productCard"
        initialSettings={
          repositionUrl
            ? getImageSettings(imageSettings, repositionUrl)
            : DEFAULT_IMAGE_DISPLAY_SETTINGS
        }
        onClose={() => setRepositionUrl(null)}
        onSave={(settings) => {
          if (repositionUrl) saveImageSettings(repositionUrl, settings);
        }}
      />

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


