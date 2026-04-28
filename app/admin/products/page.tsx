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
  discount_percentage?: number;
  categories?: string[] | null;
  subcollection_id?: string | null;
  subcollection?:
    | { name: string; gender: "male" | "female"; thumbnail_url: string | null }[]
    | { name: string; gender: "male" | "female"; thumbnail_url: string | null }
    | null;
  stock?: number;
  is_polarized?: boolean;
  images?: string[] | null;
  product_collections?: {
    collection:
      | { id: string; name: string; slug: string; thumbnail_url: string | null }[]
      | { id: string; name: string; slug: string; thumbnail_url: string | null }
      | null;
  }[] | null;
};

export default async function AdminProductsPage() {
  await requireAdmin();

  const supabase = await createSupabaseServerClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, description, price, discount_percentage, categories, subcollection_id, subcollection:subcollections(name, gender, thumbnail_url), stock, is_polarized, images, product_collections(collection:collections(id, name, slug, thumbnail_url))")
    .order("created_at", { ascending: false });
  const { data: subcollections } = await supabase
    .from("subcollections")
    .select("id, name, gender, thumbnail_url")
    .order("name", { ascending: true });
  const { data: collections } = await supabase
    .from("collections")
    .select("id, name, slug, thumbnail_url")
    .order("name", { ascending: true });

  const normalizedProducts = ((products ?? []) as ProductRow[]).map((product) => ({
    ...product,
    subcollection: Array.isArray(product.subcollection)
      ? (product.subcollection[0] ?? null)
      : (product.subcollection ?? null),
    collections: (product.product_collections ?? [])
      .map((item) => {
        const collection = Array.isArray(item.collection) ? item.collection[0] : item.collection;
        return collection ?? null;
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item)),
  }));

  return (
    <div className="space-y-8">
      <h2 className="text-xl sm:text-2xl font-semibold">Artikli</h2>

      <AdminSubcollectionsManager initialSubcollections={subcollections ?? []} />

      <AdminProductsForm subcollections={subcollections ?? []} collections={collections ?? []} />

      <AdminProductsList products={normalizedProducts} />
    </div>
  );
}

