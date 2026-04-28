"use client";

import { useRef, useState } from "react";

type Collection = {
  id: string;
  name: string;
  slug: string;
  thumbnail_url: string | null;
};

export default function CollectionsManager({ initialCollections }: { initialCollections: Collection[] }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingSlug, setEditingSlug] = useState("");
  const [editingThumbnailUrl, setEditingThumbnailUrl] = useState("");
  const [uploadingEdit, setUploadingEdit] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const createFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(data?.error || "Greška pri uploadu slike.");
    }
    const data = (await response.json()) as { url: string };
    return data.url;
  }

  async function handleCreateImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
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
      event.target.value = "";
    }
  }

  async function handleEditImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
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
      event.target.value = "";
    }
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const response = await fetch("/api/admin/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, thumbnailUrl: thumbnailUrl || null }),
    });
    setLoading(false);
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error || "Greška pri kreiranju kolekcije.");
      return;
    }
    setName("");
    setSlug("");
    setThumbnailUrl("");
    if (createFileInputRef.current) createFileInputRef.current.value = "";
    window.location.reload();
  }

  async function handleUpdate(id: string) {
    setError(null);
    setActionLoadingId(id);
    const response = await fetch(`/api/admin/collections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editingName,
        slug: editingSlug,
        thumbnailUrl: editingThumbnailUrl || null,
      }),
    });
    setActionLoadingId(null);
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error || "Greška pri uređivanju kolekcije.");
      return;
    }
    setEditingId(null);
    if (editFileInputRef.current) editFileInputRef.current.value = "";
    window.location.reload();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Jesi siguran da želiš obrisati kolekciju?")) return;
    setError(null);
    setActionLoadingId(id);
    const response = await fetch(`/api/admin/collections/${id}`, { method: "DELETE" });
    setActionLoadingId(null);
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error || "Greška pri brisanju kolekcije.");
      return;
    }
    window.location.reload();
  }

  return (
    <div className="space-y-3 max-w-3xl border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
      <h3 className="text-lg font-semibold">Kolekcije</h3>
      <p className="text-sm text-slate-600">Dodaj ili uredi kolekcije koje se prikazuju na stranici proizvoda.</p>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <form onSubmit={handleCreate} className="space-y-3 border border-slate-200 rounded p-3">
        <input className="w-full border border-slate-300 rounded px-3 py-2" placeholder="Naziv kolekcije" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="w-full border border-slate-300 rounded px-3 py-2" placeholder="Slug (npr. premium-zenska)" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <div>
          <label className="block text-sm font-medium mb-1">Thumbnail</label>
          <input ref={createFileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleCreateImageChange} disabled={uploading} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-slate-100 file:text-slate-700 file:cursor-pointer" />
          {uploading && <p className="text-sm text-slate-500 mt-1">Upload slike...</p>}
          {thumbnailUrl && <img src={thumbnailUrl} alt="" className="mt-2 w-16 h-16 object-cover rounded border" />}
        </div>
        <button type="submit" disabled={loading || uploading} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
          {loading ? "Spremanje..." : "Dodaj kolekciju"}
        </button>
      </form>

      <div className="space-y-2">
        {initialCollections.map((item) => (
          <div key={item.id} className="flex items-center gap-2 border border-slate-200 rounded p-2">
            {editingId === item.id ? (
              <>
                <img src={editingThumbnailUrl || "/placeholder.svg"} alt="" className="w-10 h-10 rounded object-cover border" />
                <div className="flex-1 space-y-1">
                  <input className="w-full border border-slate-300 rounded px-2 py-1" value={editingName} onChange={(e) => setEditingName(e.target.value)} />
                  <input className="w-full border border-slate-300 rounded px-2 py-1" value={editingSlug} onChange={(e) => setEditingSlug(e.target.value)} />
                  <input ref={editFileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleEditImageChange} disabled={uploadingEdit} className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-slate-100 file:text-slate-700 file:cursor-pointer" />
                </div>
                <button type="button" onClick={() => handleUpdate(item.id)} disabled={actionLoadingId === item.id || uploadingEdit} className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">Spremi</button>
                <button type="button" onClick={() => setEditingId(null)} className="px-2 py-1 rounded bg-slate-200 text-slate-800 hover:bg-slate-300">Odustani</button>
              </>
            ) : (
              <>
                <img src={item.thumbnail_url || "/placeholder.svg"} alt="" className="w-10 h-10 rounded object-cover border" />
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.slug}</p>
                </div>
                <button type="button" onClick={() => { setEditingId(item.id); setEditingName(item.name); setEditingSlug(item.slug); setEditingThumbnailUrl(item.thumbnail_url ?? ""); }} className="px-2 py-1 rounded bg-amber-500 text-white hover:bg-amber-600">Uredi</button>
                <button type="button" onClick={() => handleDelete(item.id)} disabled={actionLoadingId === item.id} className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60">Obriši</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
