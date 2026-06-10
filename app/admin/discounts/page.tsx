import { requireAdmin } from "@/lib/auth";
import { DISCOUNTS_PRODUCTS_SELECT } from "@/lib/productSelect";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import BulkDiscountForm from "./bulkDiscountForm";

type ProductRow = {
  id: string;
  name: string;
  images: string[] | null;
};

export default async function AdminDiscountsPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: productsRows } = await supabase
    .from("products")
    .select(DISCOUNTS_PRODUCTS_SELECT)
    .order("name", { ascending: true });

  const products = ((productsRows ?? []) as ProductRow[]).map((product) => ({
    id: product.id,
    name: product.name,
    image: product.images?.[0] ?? null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold">Grupni popust</h2>
        <p className="text-slate-600 mt-1">
          Odaberi artikle i postavi isti postotak popusta na sve odabrane.
        </p>
      </div>

      <BulkDiscountForm products={products} />
    </div>
  );
}
