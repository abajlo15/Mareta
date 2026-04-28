import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import FeaturedProductsForm from "./featuredProductsForm";

type ProductRow = {
  id: string;
  name: string;
  images: string[] | null;
};

type FeaturedRow = {
  product_id: string;
  position: number;
};

export default async function AdminFeaturedProductsPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: productsRows } = await supabase
    .from("products")
    .select("id, name, images")
    .order("name", { ascending: true });

  const { data: featuredRows } = await supabase
    .from("featured_products")
    .select("product_id, position")
    .order("position", { ascending: true });

  const products = ((productsRows ?? []) as ProductRow[]).map((product) => ({
    id: product.id,
    name: product.name,
    image: product.images?.[0] ?? null,
  }));

  const initialSelectedProductIds = ((featuredRows ?? []) as FeaturedRow[]).map((item) => item.product_id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold">Istaknuti proizvodi</h2>
        <p className="text-slate-600 mt-1">
          Odaberi do 15 proizvoda koji će se prikazivati na početnoj stranici.
        </p>
      </div>

      <FeaturedProductsForm
        products={products}
        initialSelectedProductIds={initialSelectedProductIds}
      />
    </div>
  );
}
