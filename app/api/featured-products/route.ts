import { NextResponse } from "next/server";
import { FEATURED_PRODUCTS_SELECT } from "@/lib/productSelect";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { attachSizeOptions } from "@/lib/shirtSizes";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("featured_products")
    .select(FEATURED_PRODUCTS_SELECT)
    .order("position", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const products = (data ?? [])
    .map((item) => {
      const product = Array.isArray(item.product) ? item.product[0] : item.product;
      if (!product) return null;
      const withSizes = attachSizeOptions({
        ...product,
        is_shirt: Boolean(product.is_shirt),
        product_sizes: product.product_sizes as { size: string; stock: number }[] | undefined,
      });
      return { ...withSizes, is_shirt: withSizes.is_shirt ?? false };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return NextResponse.json(products);
}
