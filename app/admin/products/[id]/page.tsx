import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { notFound } from "next/navigation";
import Link from "next/link";
import AdminProductEditForm from "../productsEditForm";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function AdminProductEditPage({ params }: Params) {
  await requireAdmin();

  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("id, name, description, price, discount_percentage, categories, subcollection_id, stock, is_polarized, images, product_collections(collection_id)")
    .eq("id", id)
    .single();
  const { data: collections } = await supabase
    .from("collections")
    .select("id, name, slug, thumbnail_url")
    .order("name", { ascending: true });

  if (error || !product) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="text-slate-600 hover:text-slate-900"
        >
          ← Natrag na artikle
        </Link>
      </div>
      <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold break-words">Uredi artikl: {product.name}</h2>
      <AdminProductEditForm
        product={{
          ...product,
          collection_ids: (product.product_collections ?? []).map((item) => item.collection_id),
        }}
        collections={collections ?? []}
      />
    </div>
  );
}
