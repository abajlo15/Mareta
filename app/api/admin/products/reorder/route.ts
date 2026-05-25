import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

type ReorderBody = {
  collectionId?: string;
  subcollectionId?: string | null;
  orderedProductIds?: string[];
};

async function updatePositions(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  table: "product_collections" | "subcollection_product_positions",
  filter: { column: string; value: string },
  orderedProductIds: string[]
) {
  for (let index = 0; index < orderedProductIds.length; index += 1) {
    const productId = orderedProductIds[index];
    const position = index + 1001;

    if (table === "product_collections") {
      const { error } = await supabase
        .from("product_collections")
        .update({ position })
        .eq("product_id", productId)
        .eq("collection_id", filter.value);
      if (error) return error;
      continue;
    }

    const { error } = await supabase
      .from("subcollection_product_positions")
      .upsert(
        { subcollection_id: filter.value, product_id: productId, position },
        { onConflict: "subcollection_id,product_id" }
      );
    if (error) return error;
  }

  for (let index = 0; index < orderedProductIds.length; index += 1) {
    const productId = orderedProductIds[index];
    const position = index + 1;

    if (table === "product_collections") {
      const { error } = await supabase
        .from("product_collections")
        .update({ position })
        .eq("product_id", productId)
        .eq("collection_id", filter.value);
      if (error) return error;
      continue;
    }

    const { error } = await supabase
      .from("subcollection_product_positions")
      .upsert(
        { subcollection_id: filter.value, product_id: productId, position },
        { onConflict: "subcollection_id,product_id" }
      );
    if (error) return error;
  }

  return null;
}

export async function PUT(request: Request) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const body = (await request.json()) as ReorderBody;
  const collectionId = typeof body.collectionId === "string" ? body.collectionId.trim() : "";
  const subcollectionId =
    typeof body.subcollectionId === "string" && body.subcollectionId.trim()
      ? body.subcollectionId.trim()
      : null;
  const orderedProductIds = Array.isArray(body.orderedProductIds)
    ? body.orderedProductIds.filter((id): id is string => typeof id === "string" && id.length > 0)
    : [];

  if (!collectionId) {
    return NextResponse.json({ error: "Nedostaje kolekcija." }, { status: 400 });
  }
  if (!orderedProductIds.length) {
    return NextResponse.json({ error: "Nedostaje redoslijed proizvoda." }, { status: 400 });
  }

  if (subcollectionId) {
    const { data: subcollection, error: subcollectionError } = await supabase
      .from("subcollections")
      .select("id, collection_id")
      .eq("id", subcollectionId)
      .single();

    if (subcollectionError || !subcollection) {
      return NextResponse.json({ error: "Podkolekcija ne postoji." }, { status: 400 });
    }
    if (subcollection.collection_id !== collectionId) {
      return NextResponse.json(
        { error: "Podkolekcija ne pripada odabranoj kolekciji." },
        { status: 400 }
      );
    }

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id")
      .eq("subcollection_id", subcollectionId)
      .in("id", orderedProductIds);

    if (productsError) {
      return NextResponse.json({ error: productsError.message }, { status: 500 });
    }
    if ((products ?? []).length !== orderedProductIds.length) {
      return NextResponse.json(
        { error: "Redoslijed sadrži proizvode izvan odabrane podkolekcije." },
        { status: 400 }
      );
    }

    const updateError = await updatePositions(
      supabase,
      "subcollection_product_positions",
      { column: "subcollection_id", value: subcollectionId },
      orderedProductIds
    );
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  const { data: subcollectionsInCollection, error: subcollectionsError } = await supabase
    .from("subcollections")
    .select("id")
    .eq("collection_id", collectionId)
    .limit(1);

  if (subcollectionsError) {
    return NextResponse.json({ error: subcollectionsError.message }, { status: 500 });
  }
  if ((subcollectionsInCollection ?? []).length > 0) {
    return NextResponse.json(
      { error: "Za kolekciju s podkolekcijama odaberi podkolekciju." },
      { status: 400 }
    );
  }

  const { data: links, error: linksError } = await supabase
    .from("product_collections")
    .select("product_id")
    .eq("collection_id", collectionId)
    .in("product_id", orderedProductIds);

  if (linksError) {
    return NextResponse.json({ error: linksError.message }, { status: 500 });
  }
  if ((links ?? []).length !== orderedProductIds.length) {
    return NextResponse.json(
      { error: "Redoslijed sadrži proizvode izvan odabrane kolekcije." },
      { status: 400 }
    );
  }

  const updateError = await updatePositions(
    supabase,
    "product_collections",
    { column: "collection_id", value: collectionId },
    orderedProductIds
  );
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
