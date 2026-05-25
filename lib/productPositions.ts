import type { createSupabaseServerClient } from "@/lib/supabaseServer";

type Supabase = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export async function getNextCollectionPosition(
  supabase: Supabase,
  collectionId: string
): Promise<number> {
  const { data } = await supabase
    .from("product_collections")
    .select("position")
    .eq("collection_id", collectionId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data?.position ?? 0) + 1;
}

export async function getNextSubcollectionPosition(
  supabase: Supabase,
  subcollectionId: string
): Promise<number> {
  const { data } = await supabase
    .from("subcollection_product_positions")
    .select("position")
    .eq("subcollection_id", subcollectionId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data?.position ?? 0) + 1;
}
