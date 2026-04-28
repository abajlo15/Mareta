import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  let { data, error } = await supabase
    .from("gallery_images")
    .select("id, image_url, position, created_at")
    .order("position", { ascending: true });

  if (error) {
    const fallback = await supabase
      .from("gallery_images")
      .select("id, image_url, created_at")
      .order("created_at", { ascending: false });
    data = (fallback.data ?? []).map((image) => ({
      ...image,
      position: 0,
    }));
    error = fallback.error;
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const body = await request.json();
  const imageUrl = typeof body?.imageUrl === "string" ? body.imageUrl.trim() : "";

  if (!imageUrl) {
    return NextResponse.json({ error: "URL slike je obavezan." }, { status: 400 });
  }

  const { data: lastImage, error: lastImageError } = await supabase
    .from("gallery_images")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const hasPositionColumn = !lastImageError;

  const nextPosition = (lastImage?.position ?? 0) + 1;

  let insertResult;
  if (hasPositionColumn) {
    insertResult = await supabase
      .from("gallery_images")
      .insert({ image_url: imageUrl, position: nextPosition })
      .select("id, image_url, position, created_at")
      .single();
  } else {
    insertResult = await supabase
      .from("gallery_images")
      .insert({ image_url: imageUrl })
      .select("id, image_url, created_at")
      .single();
  }

  const { data, error } = insertResult;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

type ReorderBody = {
  orderedIds?: string[];
};

export async function PUT(request: Request) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const body = (await request.json()) as ReorderBody;
  const orderedIds = Array.isArray(body.orderedIds) ? body.orderedIds : [];

  if (!orderedIds.length) {
    return NextResponse.json({ error: "Nedostaje redoslijed slika." }, { status: 400 });
  }

  const { error: positionCheckError } = await supabase
    .from("gallery_images")
    .select("position")
    .limit(1);
  if (positionCheckError) {
    return NextResponse.json(
      { error: "Redoslijed nije dostupan dok se ne primijeni migracija galerije." },
      { status: 400 }
    );
  }

  for (let index = 0; index < orderedIds.length; index += 1) {
    const id = orderedIds[index];
    const { error } = await supabase
      .from("gallery_images")
      .update({ position: index + 1001 })
      .eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  for (let index = 0; index < orderedIds.length; index += 1) {
    const id = orderedIds[index];
    const { error } = await supabase
      .from("gallery_images")
      .update({ position: index + 1 })
      .eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
