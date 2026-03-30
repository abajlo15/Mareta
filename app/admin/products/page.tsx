import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import AdminProductsForm from "./productsForm";
import AdminProductsList from "./productsList";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdmin();

  const supabase = await createSupabaseServerClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, description, price, category, stock, images")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <h2 className="text-xl sm:text-2xl font-semibold">Artikli</h2>

      <AdminProductsForm />

      <AdminProductsList products={products ?? []} />
    </div>
  );
}

