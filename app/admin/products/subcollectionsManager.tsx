"use client";

import { useState } from "react";

type Subcollection = {
  id: string;
  name: string;
};

export default function AdminSubcollectionsManager({
  initialSubcollections,
}: {
  initialSubcollections: Subcollection[];
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/admin/subcollections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "Greška pri kreiranju podkolekcije.");
      return;
    }

    setName("");
    window.location.reload();
  }

  async function handleUpdate(id: string) {
    setError(null);
    setActionLoadingId(id);

    const res = await fetch(`/api/admin/subcollections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingName }),
    });

    setActionLoadingId(null);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "Greška pri uređivanju podkolekcije.");
      return;
    }

    setEditingId(null);
    setEditingName("");
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
    <div className="space-y-3 max-w-md border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
      <h3 className="text-lg font-semibold">Podkolekcije</h3>
      <p className="text-sm text-slate-600">
        Kreiraj podkolekcije koje ćeš zatim moći birati na proizvodu.
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          className="flex-1 border border-slate-300 rounded px-3 py-2"
          placeholder="Naziv podkolekcije"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Spremanje..." : "Dodaj"}
        </button>
      </form>

      <div className="text-sm text-slate-700 space-y-2">
        {initialSubcollections.length ? (
          initialSubcollections.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              {editingId === item.id ? (
                <>
                  <input
                    className="flex-1 border border-slate-300 rounded px-2 py-1"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdate(item.id)}
                    disabled={actionLoadingId === item.id}
                    className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    Spremi
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setEditingName("");
                    }}
                    className="px-2 py-1 rounded bg-slate-200 text-slate-800 hover:bg-slate-300"
                  >
                    Odustani
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 px-2 py-1 rounded bg-slate-100">{item.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(item.id);
                      setEditingName(item.name);
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
          <p className="text-slate-500">Još nema podkolekcija.</p>
        )}
      </div>
    </div>
  );
}
