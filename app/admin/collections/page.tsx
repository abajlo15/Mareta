import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import CollectionsManager from "./collectionsManager";

export default async function AdminCollectionsPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: collections } = await supabase
    .from("collections")
    .select("id, name, slug, thumbnail_url")
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold">Kolekcije</h2>
        <p className="text-slate-600 mt-1">
          Upravljaj kolekcijama i odaberi thumbnail koji se prikazuje kupcima.
        </p>
      </div>
      <CollectionsManager initialCollections={collections ?? []} />
    </div>
  );
}
