import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { normalizeImageDisplaySettings, settingsToRowFields } from "@/types/imageDisplay";

type Params = { params: Promise<{ id: string }> };

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export async function PATCH(request: Request, { params }: Params) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { id } = await params;

  const body = await request.json();
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const thumbnailUrl =
    typeof body?.thumbnailUrl === "string" && body.thumbnailUrl.trim()
      ? body.thumbnailUrl.trim()
      : null;
  const customSlug = typeof body?.slug === "string" ? body.slug.trim() : "";
  const slug = slugify(customSlug || name);
  const description =
    typeof body?.description === "string" && body.description.trim()
      ? body.description.trim()
      : null;

  if (!name) {
    return NextResponse.json({ error: "Naziv kolekcije je obavezan." }, { status: 400 });
  }
  if (!slug) {
    return NextResponse.json({ error: "Slug kolekcije nije valjan." }, { status: 400 });
  }
  const thumbnailSettings = normalizeImageDisplaySettings(body?.thumbnailSettings);
  const thumbnailFields = settingsToRowFields(thumbnailSettings);

  const { data, error } = await supabase
    .from("collections")
    .update({
      name,
      slug,
      thumbnail_url: thumbnailUrl,
      description,
      thumbnail_focal_x: thumbnailFields.focal_x,
      thumbnail_focal_y: thumbnailFields.focal_y,
      thumbnail_zoom: thumbnailFields.zoom,
    })
    .eq("id", id)
    .select("id, name, slug, thumbnail_url, description, thumbnail_focal_x, thumbnail_focal_y, thumbnail_zoom")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: Params) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { id } = await params;

  const { data: subcollections, error: subcollectionsError } = await supabase
    .from("subcollections")
    .select("id")
    .eq("collection_id", id);

  if (subcollectionsError) {
    return NextResponse.json({ error: subcollectionsError.message }, { status: 500 });
  }

  const subcollectionIds = (subcollections ?? []).map((row) => row.id);

  if (subcollectionIds.length > 0) {
    const { error: detachError } = await supabase
      .from("products")
      .update({ subcollection_id: null })
      .in("subcollection_id", subcollectionIds);

    if (detachError) {
      return NextResponse.json({ error: detachError.message }, { status: 500 });
    }

    const { error: deleteSubcollectionsError } = await supabase
      .from("subcollections")
      .delete()
      .eq("collection_id", id);

    if (deleteSubcollectionsError) {
      return NextResponse.json({ error: deleteSubcollectionsError.message }, { status: 500 });
    }
  }

  const { error } = await supabase.from("collections").delete().eq("id", id);

  if (error) {
    if (error.message.includes("subcollections_collection_id_fkey")) {
      return NextResponse.json(
        {
          error:
            "Kolekciju nije moguće obrisati jer još postoje povezane podkolekcije. Prvo ih obriši u Podkolekcije.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
