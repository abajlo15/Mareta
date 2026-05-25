import { requireAdmin } from "@/lib/auth";
import { queryAdminProducts } from "@/lib/productsQuery";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import AdminProductsForm from "./productsForm";
import AdminProductsList from "./productsList";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdmin();

  const supabase = await createSupabaseServerClient();
  const { data: products } = await queryAdminProducts(supabase);
  const { data: collections } = await supabase
    .from("collections")
    .select("id, name, slug, thumbnail_url")
    .order("name", { ascending: true });
  const { data: subcollections } = await supabase
    .from("subcollections")
    .select("id, name, thumbnail_url, collection_id")
    .order("name", { ascending: true });

  return (
    <div className="space-y-8">
      <h2 className="text-xl sm:text-2xl font-semibold">Artikli</h2>

      <AdminProductsForm
        collections={collections ?? []}
        subcollections={subcollections ?? []}
      />

      <AdminProductsList
        products={products ?? []}
        collections={collections ?? []}
        subcollections={subcollections ?? []}
      />
    </div>
  );
}

