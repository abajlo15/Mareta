"use client";

import { useRef, useState } from "react";

type Subcollection = {
  id: string;
  name: string;
  thumbnail_url: string | null;
  collection_id: string;
};

type Collection = {
  id: string;
  name: string;
};

export default function AdminSubcollectionsManager({
  initialSubcollections,
  collections,
}: {
  initialSubcollections: Subcollection[];
  collections: Collection[];
}) {
  const [name, setName] = useState("");
  const [collectionId, setCollectionId] = useState<string>(collections[0]?.id ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingCollectionId, setEditingCollectionId] = useState("");
  const [editingThumbnailUrl, setEditingThumbnailUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadingEdit, setUploadingEdit] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [listCollectionFilter, setListCollectionFilter] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const collectionNameById = collections.reduce<Record<string, string>>((acc, item) => {
    acc[item.id] = item.name;
    return acc;
  }, {});
  const visibleSubcollections =
    listCollectionFilter === "all"
      ? initialSubcollections
      : initialSubcollections.filter((item) => item.collection_id === listCollectionFilter);

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error((data as { error?: string }).error ?? "Greška pri uploadu slike.");
    }

    const { url } = (await res.json()) as { url: string };
    return url;
  }

  async function handleCreateImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      setThumbnailUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri uploadu slike.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleEditImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingEdit(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      setEditingThumbnailUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri uploadu slike.");
    } finally {
      setUploadingEdit(false);
      e.target.value = "";
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!collectionId) {
      setError("Odaberi nad-kolekciju.");
      return;
    }
    setLoading(true);

    const res = await fetch("/api/admin/subcollections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        collectionId,
        thumbnailUrl: thumbnailUrl || null,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "Greška pri kreiranju podkolekcije.");
      return;
    }

    setName("");
    setCollectionId(collections[0]?.id ?? "");
    setThumbnailUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    window.location.reload();
  }

  async function handleUpdate(id: string) {
    setError(null);
    if (!editingCollectionId) {
      setError("Odaberi nad-kolekciju.");
      return;
    }
    setActionLoadingId(id);

    const res = await fetch(`/api/admin/subcollections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editingName,
        collectionId: editingCollectionId,
        thumbnailUrl: editingThumbnailUrl || null,
      }),
    });

    setActionLoadingId(null);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "Greška pri uređivanju podkolekcije.");
      return;
    }

    setEditingId(null);
    setEditingName("");
    setEditingCollectionId("");
    setEditingThumbnailUrl("");
    if (editFileInputRef.current) {
      editFileInputRef.current.value = "";
    }
    window.location.reload();
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Jesi siguran da želiš obrisati podkolekciju?");
    if (!confirmed) return;

    setError(null);
    setActionLoadingId(id);

    const res = await fetch(`/api/admin/subcollections/${id}`, {
      method: "DELETE",
    });

    setActionLoadingId(null);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "Greška pri brisanju podkolekcije.");
      return;
    }

    window.location.reload();
  }

  return (
    <div className="space-y-3 max-w-2xl border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
      <h3 className="text-lg font-semibold">Podkolekcije</h3>
      <p className="text-sm text-slate-600">
        Kreiraj podkolekcije koje ćeš zatim moći birati na proizvodu.
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <form onSubmit={handleCreate} className="space-y-3 border border-slate-200 rounded p-3">
        <input
          className="w-full border border-slate-300 rounded px-3 py-2"
          placeholder="Naziv podkolekcije"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <select
          className="w-full border border-slate-300 rounded px-3 py-2"
          value={collectionId}
          onChange={(e) => setCollectionId(e.target.value)}
          required
        >
          <option value="">— Odaberi kolekciju —</option>
          {collections.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.name}
            </option>
          ))}
        </select>
        <div>
          <label className="block text-sm font-medium mb-1">Thumbnail</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleCreateImageChange}
            disabled={uploading}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-slate-100 file:text-slate-700 file:cursor-pointer"
          />
          {uploading && <p className="text-sm text-slate-500 mt-1">Upload slike...</p>}
          {thumbnailUrl && <img src={thumbnailUrl} alt="" className="mt-2 w-16 h-16 object-cover rounded border" />}
        </div>
        <button
          type="submit"
          disabled={loading || uploading}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Spremanje..." : "Dodaj"}
        </button>
      </form>

      <div className="space-y-2 text-sm text-slate-700">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <h4 className="font-semibold">Sve podkolekcije</h4>
          <select
            className="min-w-[220px] border border-slate-300 rounded px-3 py-2 text-sm"
            value={listCollectionFilter}
            onChange={(e) => setListCollectionFilter(e.target.value)}
          >
            <option value="all">Sve kolekcije</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
        </div>
        {visibleSubcollections.length ? (
          visibleSubcollections.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              {editingId === item.id ? (
                <>
                  <img
                    src={editingThumbnailUrl || "/placeholder.svg"}
                    alt=""
                    className="w-10 h-10 rounded object-cover border"
                  />
                  <div className="flex-1 space-y-1">
                  <input
                    className="w-full border border-slate-300 rounded px-2 py-1"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    required
                  />
                    <select
                      className="w-full border border-slate-300 rounded px-2 py-1"
                      value={editingCollectionId}
                      onChange={(e) => setEditingCollectionId(e.target.value)}
                      required
                    >
                      <option value="">— Odaberi kolekciju —</option>
                      {collections.map((collection) => (
                        <option key={collection.id} value={collection.id}>
                          {collection.name}
                        </option>
                      ))}
                    </select>
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleEditImageChange}
                      disabled={uploadingEdit}
                      className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-slate-100 file:text-slate-700 file:cursor-pointer"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpdate(item.id)}
                    disabled={actionLoadingId === item.id || uploadingEdit}
                    className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    Spremi
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setEditingName("");
                      setEditingCollectionId("");
                      setEditingThumbnailUrl("");
                    }}
                    className="px-2 py-1 rounded bg-slate-200 text-slate-800 hover:bg-slate-300"
                  >
                    Odustani
                  </button>
                </>
              ) : (
                <>
                  <img
                    src={item.thumbnail_url || "/placeholder.svg"}
                    alt=""
                    className="w-10 h-10 rounded object-cover border"
                  />
                  <div className="flex-1 px-2 py-1 rounded bg-slate-100">
                    <p>{item.name}</p>
                    <p className="text-xs text-slate-500">
                      Kolekcija: {collectionNameById[item.collection_id] ?? "Nepoznata kolekcija"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(item.id);
                      setEditingName(item.name);
                      setEditingCollectionId(item.collection_id);
                      setEditingThumbnailUrl(item.thumbnail_url ?? "");
                    }}
                    className="px-2 py-1 rounded bg-amber-500 text-white hover:bg-amber-600"
                  >
                    Uredi
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={actionLoadingId === item.id}
                    className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    Obriši
                  </button>
                </>
              )}
            </div>
          ))
        ) : (
          <p className="text-slate-500">Nema podkolekcija za odabranu kolekciju.</p>
        )}
      </div>
    </div>
  );
}
