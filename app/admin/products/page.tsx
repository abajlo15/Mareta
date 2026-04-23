import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import AdminProductsForm from "./productsForm";
import AdminProductsList from "./productsList";
import AdminSubcollectionsManager from "./subcollectionsManager";

export const dynamic = "force-dynamic";

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  categories?: string[] | null;
  subcollection_id?: string | null;
  subcollection?: { name: string }[] | { name: string } | null;
  stock?: number;
  is_polarized?: boolean;
  images?: string[] | null;
};

export default async function AdminProductsPage() {
  await requireAdmin();

  const supabase = await createSupabaseServerClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, description, price, categories, subcollection_id, subcollection:subcollections(name), stock, is_polarized, images")
    .order("created_at", { ascending: false });
  const { data: subcollections } = await supabase
    .from("subcollections")
    .select("id, name")
    .order("name", { ascending: true });

  const normalizedProducts = ((products ?? []) as ProductRow[]).map((product) => ({
    ...product,
    subcollection: Array.isArray(product.subcollection)
      ? (product.subcollection[0] ?? null)
      : (product.subcollection ?? null),
  }));

  return (
    <div className="space-y-8">
      <h2 className="text-xl sm:text-2xl font-semibold">Artikli</h2>

      <AdminSubcollectionsManager initialSubcollections={subcollections ?? []} />

      <AdminProductsForm subcollections={subcollections ?? []} />

      <AdminProductsList products={normalizedProducts} />
    </div>
  );
}

