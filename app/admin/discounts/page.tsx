import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import BulkDiscountForm from "./bulkDiscountForm";

const HIDDEN_CATEGORIES = new Set(["Muške naočale"]);

type ProductCategoriesRow = {
  id: string;
  name: string;
  categories: string[] | null;
  images: string[] | null;
  subcollection_id: string | null;
  subcollection?: { id: string; name: string }[] | { id: string; name: string } | null;
};

export default async function AdminDiscountsPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: productsRows } = await supabase
    .from("products")
    .select("id, name, categories, images, subcollection_id, subcollection:subcollections(id, name)")
    .order("name", { ascending: true });

  const categoriesSet = new Set<string>();
  const normalizedProducts = ((productsRows ?? []) as ProductCategoriesRow[]).map((product) => ({
    id: product.id,
    name: product.name,
    categories: (product.categories ?? []).filter(
      (category) => !HIDDEN_CATEGORIES.has(category.trim())
    ),
    image: product.images?.[0] ?? null,
    subcollectionId: product.subcollection_id,
    subcollection: Array.isArray(product.subcollection)
      ? (product.subcollection[0] ?? null)
      : (product.subcollection ?? null),
  }));

  normalizedProducts.forEach((row) => {
    if (!Array.isArray(row.categories)) {
      return;
    }
    row.categories.forEach((category) => {
      const normalized = category.trim();
      if (normalized) {
        categoriesSet.add(normalized);
      }
    });
  });

  const categories = [...categoriesSet].sort((a, b) => a.localeCompare(b, "hr"));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold">Grupni popust</h2>
        <p className="text-slate-600 mt-1">
          Ovdje možeš postaviti isti postotak popusta na sve artikle ili samo na odabranu kolekciju.
        </p>
      </div>

      <BulkDiscountForm categories={categories} products={normalizedProducts} />
    </div>
  );
}

