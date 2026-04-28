import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const MAX_FEATURED_PRODUCTS = 15;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type FeaturedBody = {
  productIds?: string[];
};

export async function GET() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("featured_products")
    .select("position, product:products(*)")
    .order("position", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const products = (data ?? [])
    .map((item) => {
      const product = Array.isArray(item.product) ? item.product[0] : item.product;
      if (!product) return null;
      return { ...product, featured_position: item.position };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return NextResponse.json({
    productIds: products.map((product) => product.id),
    products,
  });
}

export async function PUT(request: Request) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const body = (await request.json()) as FeaturedBody;
  const productIds = Array.isArray(body.productIds) ? body.productIds : [];
  const uniqueIds = [...new Set(productIds)];

  if (uniqueIds.length !== productIds.length) {
    return NextResponse.json({ error: "Lista sadrži duplikate." }, { status: 400 });
  }

  if (uniqueIds.length > MAX_FEATURED_PRODUCTS) {
    return NextResponse.json(
      { error: `Maksimalno ${MAX_FEATURED_PRODUCTS} proizvoda može biti istaknuto.` },
      { status: 400 }
    );
  }

  const hasInvalidId = uniqueIds.some((id) => !UUID_REGEX.test(id));
  if (hasInvalidId) {
    return NextResponse.json({ error: "Neispravan ID proizvoda." }, { status: 400 });
  }

  if (uniqueIds.length) {
    const { data: existingProducts, error: productsError } = await supabase
      .from("products")
      .select("id")
      .in("id", uniqueIds);

    if (productsError) {
      return NextResponse.json({ error: productsError.message }, { status: 500 });
    }

    if ((existingProducts ?? []).length !== uniqueIds.length) {
      return NextResponse.json(
        { error: "Jedan ili više odabranih proizvoda ne postoji." },
        { status: 400 }
      );
    }
  }

  const { error: deleteError } = await supabase
    .from("featured_products")
    .delete()
    .gte("position", 1);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  if (!uniqueIds.length) {
    return NextResponse.json({ ok: true, updatedCount: 0 });
  }

  const rows = uniqueIds.map((productId, index) => ({
    product_id: productId,
    position: index + 1,
  }));

  const { error: insertError } = await supabase.from("featured_products").insert(rows);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, updatedCount: uniqueIds.length });
}
