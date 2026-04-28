import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import AdminSubcollectionsManager from "../products/subcollectionsManager";

export const dynamic = "force-dynamic";

export default async function AdminSubcollectionsPage() {
  await requireAdmin();

  const supabase = await createSupabaseServerClient();
  const { data: subcollections } = await supabase
    .from("subcollections")
    .select("id, name, thumbnail_url, collection_id")
    .order("name", { ascending: true });
  const { data: collections } = await supabase
    .from("collections")
    .select("id, name")
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold">Podkolekcije</h2>
        <p className="text-slate-600 mt-1">
          Upravljaj podkolekcijama i poveži ih s kolekcijama.
        </p>
      </div>
      <AdminSubcollectionsManager
        initialSubcollections={subcollections ?? []}
        collections={collections ?? []}
      />
    </div>
  );
}
