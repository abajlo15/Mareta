import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { normalizeImageDisplaySettings, settingsToRowFields } from "@/types/imageDisplay";

export async function GET(request: NextRequest) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("subcollections")
    .select("id, name, thumbnail_url, collection_id, thumbnail_focal_x, thumbnail_focal_y, thumbnail_zoom")
    .order("name", { ascending: true });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const body = await request.json();
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const collectionId = typeof body?.collectionId === "string" ? body.collectionId.trim() : "";
  const thumbnailUrl =
    typeof body?.thumbnailUrl === "string" && body.thumbnailUrl.trim()
      ? body.thumbnailUrl.trim()
      : null;

  if (!name) {
    return NextResponse.json({ error: "Naziv podkolekcije je obavezan." }, { status: 400 });
  }
  if (!collectionId) {
    return NextResponse.json({ error: "Odaberi valjanu kolekciju." }, { status: 400 });
  }

  const { data: selectedCollection, error: selectedCollectionError } = await supabase
    .from("collections")
    .select("id")
    .eq("id", collectionId)
    .single();
  if (selectedCollectionError || !selectedCollection) {
    return NextResponse.json({ error: "Odabrana kolekcija ne postoji." }, { status: 400 });
  }

  const thumbnailSettings = normalizeImageDisplaySettings(body?.thumbnailSettings);
  const thumbnailFields = settingsToRowFields(thumbnailSettings);

  const { data, error } = await supabase
    .from("subcollections")
    .insert({
      name,
      collection_id: collectionId,
      thumbnail_url: thumbnailUrl,
      thumbnail_focal_x: thumbnailFields.focal_x,
      thumbnail_focal_y: thumbnailFields.focal_y,
      thumbnail_zoom: thumbnailFields.zoom,
    })
    .select("id, name, thumbnail_url, collection_id, thumbnail_focal_x, thumbnail_focal_y, thumbnail_zoom")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
