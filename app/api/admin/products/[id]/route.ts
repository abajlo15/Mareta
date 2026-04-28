import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Nedozvoljeno." }, { status: 403 });
    }

    const supabase = await createSupabaseServerClient();
    const { id } = await params;

    const body = await request.json();
    const { name, description, price, discountPercentage, categories, collectionIds, subcollectionId, stock, isPolarized, images } = body as {
      name?: string;
      description?: string | null;
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
    if (typeof subcollectionId !== "string" || !subcollectionId.trim()) {
      return NextResponse.json(
        { error: "Podkolekcija je obavezna." },
        { status: 400 }
      );
    }

    const { data: selectedSubcollection, error: subcollectionError } = await supabase
      .from("subcollections")
      .select("id")
      .eq("id", subcollectionId)
      .single();

    if (subcollectionError || !selectedSubcollection) {
      return NextResponse.json({ error: "Odabrana podkolekcija ne postoji." }, { status: 400 });
    }

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

    const stockValue = typeof stock === "number" ? Math.max(0, stock) : 0;
    const discountValue =
      typeof discountPercentage === "number"
        ? Math.min(100, Math.max(0, Math.round(discountPercentage)))
        : 0;

    const { error } = await supabase
      .from("products")
      .update({
        name,
        description: description ?? null,
        price,
        categories: Array.isArray(categories) ? categories : [],
        subcollection_id: subcollectionId,
        stock: stockValue,
        is_polarized: typeof isPolarized === "boolean" ? isPolarized : false,
        discount_percentage: discountValue,
        images: Array.isArray(images) ? images : [],
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { error: deleteLinksError } = await supabase
      .from("product_collections")
      .delete()
      .eq("product_id", id);
    if (deleteLinksError) {
      return NextResponse.json({ error: deleteLinksError.message }, { status: 500 });
    }

    const { error: insertLinksError } = await supabase.from("product_collections").insert(
      uniqueCollectionIds.map((collectionId) => ({
        product_id: id,
        collection_id: collectionId,
      }))
    );
    if (insertLinksError) {
      return NextResponse.json({ error: insertLinksError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Greška pri ažuriranju." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Nedozvoljeno." }, { status: 403 });
    }

    const supabase = await createSupabaseServerClient();
    const { id } = await params;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Greška pri brisanju artikla." },
      { status: 500 }
    );
  }
}
