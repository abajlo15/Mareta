import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price, discount_percentage, categories, subcollection_id, stock, is_polarized, images")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const body = await request.json();
  const { name, description, price, discountPercentage, categories, collectionIds, subcollectionId, stock, isPolarized, images } = body as {
    name?: string;
    description?: string;
    price?: number;
    discountPercentage?: number;
    categories?: string[];
    collectionIds?: string[];
    subcollectionId?: string | null;
    stock?: number;
    isPolarized?: boolean;
    images?: string[];
  };

  if (!name || typeof price !== "number") {
    return NextResponse.json(
      { error: "Naziv i cijena su obavezni." },
      { status: 400 }
    );
  }
  const uniqueCollectionIds = Array.isArray(collectionIds) ? [...new Set(collectionIds)] : [];
  if (!uniqueCollectionIds.length) {
    return NextResponse.json({ error: "Odaberi barem jednu kolekciju." }, { status: 400 });
  }
  const normalizedSubcollectionId =
    typeof subcollectionId === "string" && subcollectionId.trim() ? subcollectionId.trim() : null;

  const { data: selectedCollections, error: selectedCollectionsError } = await supabase
    .from("collections")
    .select("id")
    .in("id", uniqueCollectionIds);

  if (selectedCollectionsError) {
    return NextResponse.json({ error: selectedCollectionsError.message }, { status: 500 });
  }
  if ((selectedCollections ?? []).length !== uniqueCollectionIds.length) {
    return NextResponse.json({ error: "Odabrana kolekcija ne postoji." }, { status: 400 });
  }
  if (normalizedSubcollectionId) {
    const { data: selectedSubcollection, error: subcollectionError } = await supabase
      .from("subcollections")
      .select("id, collection_id")
      .eq("id", normalizedSubcollectionId)
      .single();

    if (subcollectionError || !selectedSubcollection) {
      return NextResponse.json({ error: "Odabrana podkolekcija ne postoji." }, { status: 400 });
    }
    if (!uniqueCollectionIds.includes(selectedSubcollection.collection_id)) {
      return NextResponse.json(
        { error: "Odabrana podkolekcija ne pripada nijednoj od odabranih kolekcija." },
        { status: 400 }
      );
    }
  }

  const stockValue = typeof stock === "number" ? Math.max(0, stock) : 0;
  const discountValue =
    typeof discountPercentage === "number"
      ? Math.min(100, Math.max(0, Math.round(discountPercentage)))
      : 0;

  const { data: insertedProduct, error } = await supabase.from("products").insert({
    name,
    description,
    price,
    categories: Array.isArray(categories) ? categories : [],
    subcollection_id: normalizedSubcollectionId,
    stock: stockValue,
    is_polarized: typeof isPolarized === "boolean" ? isPolarized : false,
    discount_percentage: discountValue,
    images: Array.isArray(images) ? images : [],
  }).select("id").single();

  if (error || !insertedProduct) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { error: collectionsLinkError } = await supabase.from("product_collections").insert(
    uniqueCollectionIds.map((collectionId) => ({
      product_id: insertedProduct.id,
      collection_id: collectionId,
    }))
  );

  if (collectionsLinkError) {
    return NextResponse.json({ error: collectionsLinkError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}


