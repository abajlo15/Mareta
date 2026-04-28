import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("featured_products")
    .select("position, product:products(*, subcollection:subcollections(id, name, gender, thumbnail_url))")
    .order("position", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const products = (data ?? [])
    .map((item) => {
      const product = Array.isArray(item.product) ? item.product[0] : item.product;
      return product ?? null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return NextResponse.json(products);
}
