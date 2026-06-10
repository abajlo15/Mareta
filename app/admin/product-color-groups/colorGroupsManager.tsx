"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ColorSelect from "@/components/ColorSelect";
import ColorSwatch from "@/components/ColorSwatch";
import { getProductColor, matchProductColorFromLabel } from "@/lib/productColors";

type ProductOption = {
  id: string;
  name: string;
  image: string | null;
};

type GroupMember = {
  product_id: string;
  label: string;
  color_key: string | null;
  position: number;
  product_name: string;
  product_image: string | null;
};

type ColorGroup = {
  id: string;
  name: string | null;
  created_at: string;
  members: GroupMember[];
};

type ColorGroupsManagerProps = {
  groups: ColorGroup[];
  products: ProductOption[];
};

function memberDisplayLabel(member: GroupMember): string {
  return getProductColor(member.color_key ?? undefined)?.name ?? member.label;
}

export default function ColorGroupsManager({
  groups: initialGroups,
  products,
}: ColorGroupsManagerProps) {
  const router = useRouter();
  const [groups, setGroups] = useState(initialGroups);

  useEffect(() => {
    setGroups(initialGroups);
  }, [initialGroups]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [colorKeys, setColorKeys] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) => product.name.toLowerCase().includes(term));
  }, [products, search]);

  const resetForm = () => {
    setEditingId(null);
    setGroupName("");
    setSearch("");
    setSelectedIds([]);
    setColorKeys({});
    setMessage(null);
  };

  const startCreate = () => {
    resetForm();
  };

  const startEdit = (group: ColorGroup) => {
    setEditingId(group.id);
    setGroupName(group.name ?? "");
    setSearch("");
    const ids = group.members.map((m) => m.product_id);
    setSelectedIds(ids);
    const nextColorKeys: Record<string, string> = {};
    for (const member of group.members) {
      if (member.color_key) {
        nextColorKeys[member.product_id] = member.color_key;
      } else {
        const matched = matchProductColorFromLabel(member.label);
        if (matched) {
          nextColorKeys[member.product_id] = matched.key;
        }
      }
    }
    setColorKeys(nextColorKeys);
    setMessage(null);
  };

  const toggleProduct = (productId: string) => {
    setSelectedIds((current) => {
      if (current.includes(productId)) {
        const next = current.filter((id) => id !== productId);
        setColorKeys((prev) => {
          const copy = { ...prev };
          delete copy[productId];
          return copy;
        });
        return next;
      }
      return [...current, productId];
    });
  };

  const updateColorKey = (productId: string, colorKey: string) => {
    setColorKeys((prev) => ({ ...prev, [productId]: colorKey }));
  };

  const usedColorKeys = useMemo(
    () => Object.values(colorKeys).filter(Boolean),
    [colorKeys]
  );

  const validateForm = (): string | null => {
    if (selectedIds.length < 2) {
      return "Odaberi barem 2 proizvoda u grupi.";
    }
    if (selectedIds.some((productId) => !colorKeys[productId]?.trim())) {
      return "Svaki odabrani proizvod mora imati odabranu boju.";
    }
    const keys = selectedIds.map((productId) => colorKeys[productId].trim().toLowerCase());
    if (new Set(keys).size !== keys.length) {
      return "Svaka boja u grupi mora biti jedinstvena.";
    }
    return null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const validationError = validateForm();
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    const members = selectedIds.map((productId) => ({
      productId,
      colorKey: colorKeys[productId].trim(),
    }));

    setIsSubmitting(true);
    try {
      const url = editingId
        ? `/api/admin/product-color-groups/${editingId}`
        : "/api/admin/product-color-groups";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: groupName.trim() || null,
          members,
        }),
      });

      const data = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setMessage({
          type: "error",
          text: data?.error || "Spremanje grupe nije uspjelo.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: editingId ? "Grupa je ažurirana." : "Grupa je kreirana.",
      });
      resetForm();
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Došlo je do greške pri spremanju." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (groupId: string, label: string) => {
    const confirmed = window.confirm(
      `Jesi siguran/na da želiš obrisati grupu "${label}"?`
    );
    if (!confirmed) return;

    setDeletingId(groupId);
    try {
      const response = await fetch(`/api/admin/product-color-groups/${groupId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setMessage({
          type: "error",
          text: data?.error || "Brisanje grupe nije uspjelo.",
        });
        return;
      }
      setGroups((current) => current.filter((g) => g.id !== groupId));
      if (editingId === groupId) {
        resetForm();
      }
      setMessage({ type: "success", text: "Grupa je obrisana." });
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Došlo je do greške pri brisanju." });
    } finally {
      setDeletingId(null);
    }
  };

  const selectedProducts = selectedIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is ProductOption => Boolean(p));

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Postojeće grupe</h3>
          <button
            type="button"
            onClick={startCreate}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Nova grupa
          </button>
        </div>

        {!groups.length ? (
          <p className="text-slate-500 text-sm">Još nema grupa boja.</p>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <div
                key={group.id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">
                      {group.name || "Grupa bez naziva"}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {group.members.map((member) => (
                        <span
                          key={member.product_id}
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
                        >
                          <ColorSwatch
                            colorKey={member.color_key}
                            hex={getProductColor(member.color_key ?? undefined)?.hex}
                          />
                          {memberDisplayLabel(member)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => startEdit(group)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Uredi
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          group.id,
                          group.name ||
                            group.members.map((m) => memberDisplayLabel(m)).join(", ")
                        )
                      }
                      disabled={deletingId === group.id}
                      className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-60"
                    >
                      {deletingId === group.id ? "Brisanje..." : "Obriši"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl bg-white p-6 shadow-soft border border-slate-200"
      >
        <div>
          <h3 className="text-lg font-semibold">
            {editingId ? "Uredi grupu boja" : "Nova grupa boja"}
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Odaberi proizvode različitih boja i za svaki odaberi boju koja se prikazuje u
            padajućem izborniku na stranici proizvoda.
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Naziv grupe (opcionalno)
          </label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="npr. Lora serija"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Pretraži proizvode</label>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtriraj po nazivu..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Proizvodi u grupi</label>
          <div className="max-h-80 overflow-y-auto rounded-md border border-slate-300 bg-white p-3">
            {!filteredProducts.length ? (
              <p className="text-sm text-slate-500">Nema proizvoda za prikaz.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {filteredProducts.map((product) => {
                  const isSelected = selectedIds.includes(product.id);
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => toggleProduct(product.id)}
                      className={`rounded-md border p-2 text-left transition ${
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
                          onClick={(e) => e.stopPropagation()}
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

        {selectedProducts.length > 0 && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Boje u izborniku ({selectedProducts.length} odabrano)
            </label>
            {selectedProducts.map((product) => (
              <div key={product.id} className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm text-slate-600 sm:w-1/3 break-words">
                  {product.name}
                </span>
                <ColorSelect
                  value={colorKeys[product.id] ?? ""}
                  onChange={(colorKey) => updateColorKey(product.id, colorKey)}
                  usedKeys={usedColorKeys}
                  className="flex-1"
                />
              </div>
            ))}
          </div>
        )}

        {message && (
          <p
            className={`text-sm ${
              message.type === "success" ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {message.text}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Spremanje..." : editingId ? "Spremi promjene" : "Spremi grupu"}
          </button>
          {(editingId || selectedIds.length > 0 || groupName) && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Odustani
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
