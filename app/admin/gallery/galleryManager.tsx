"use client";

import { useRef, useState } from "react";

type GalleryImage = {
  id: string;
  image_url: string;
  position?: number;
};

export default function GalleryManager({ initialImages }: { initialImages: GalleryImage[] }) {
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) return;

    setUploading(true);
    setError(null);

    try {
      for (let i = 0; i < files.length; i += 1) {
        const formData = new FormData();
        formData.append("file", files[i]);

        const uploadResponse = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const uploadData = (await uploadResponse.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(uploadData?.error || "Greška pri uploadu slike.");
        }

        const uploadData = (await uploadResponse.json()) as { url: string };

        const saveResponse = await fetch("/api/admin/gallery-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: uploadData.url }),
        });

        if (!saveResponse.ok) {
          const saveData = (await saveResponse.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(saveData?.error || "Greška pri spremanju slike u galeriju.");
        }

        const savedImage = (await saveResponse.json()) as GalleryImage;
        setImages((current) => [...current, savedImage]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri dodavanju slike.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Jesi siguran da želiš obrisati ovu sliku?");
    if (!confirmed) return;

    setDeletingId(id);
    setError(null);
    const response = await fetch(`/api/admin/gallery-images/${id}`, {
      method: "DELETE",
    });
    setDeletingId(null);

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error || "Greška pri brisanju slike.");
      return;
    }

    setImages((current) => {
      const next = current.filter((image) => image.id !== id);
      void saveOrder(next);
      return next;
    });
  }

  async function saveOrder(nextImages: GalleryImage[]) {
    setSavingOrder(true);
    const response = await fetch("/api/admin/gallery-images", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: nextImages.map((image) => image.id) }),
    });
    setSavingOrder(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error || "Greška pri spremanju redoslijeda.");
      return;
    }
  }

  function moveImage(fromId: string, toId: string) {
    if (fromId === toId) return;
    setImages((current) => {
      const fromIndex = current.findIndex((image) => image.id === fromId);
      const toIndex = current.findIndex((image) => image.id === toId);
      if (fromIndex === -1 || toIndex === -1) return current;

      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      void saveOrder(next);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <label className="block text-sm font-medium mb-2">Dodaj slike u galeriju/hero</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleUpload}
          disabled={uploading}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-slate-100 file:text-slate-700 file:cursor-pointer"
        />
        {uploading && <p className="text-sm text-slate-500 mt-2">Upload u tijeku...</p>}
      </div>

      {savingOrder && <p className="text-sm text-slate-500">Spremanje redoslijeda...</p>}
      <p className="text-xs text-slate-500">Povuci i ispusti sliku za promjenu redoslijeda.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            draggable
            onDragStart={() => setDraggedId(image.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (draggedId) {
                moveImage(draggedId, image.id);
              }
              setDraggedId(null);
            }}
            onDragEnd={() => setDraggedId(null)}
            className={`rounded-lg border bg-white p-2 ${
              draggedId === image.id ? "border-blue-400" : "border-slate-200"
            }`}
          >
            <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
              <span>Povuci za redoslijed</span>
              <span aria-hidden="true" className="font-semibold tracking-wider">:::</span>
            </div>
            <img src={image.image_url} alt="" className="w-full h-40 object-cover rounded-md" />
            <button
              type="button"
              onClick={() => handleDelete(image.id)}
              disabled={deletingId === image.id}
              className="mt-2 w-full rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-60"
            >
              {deletingId === image.id ? "Brisanje..." : "Obriši"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
