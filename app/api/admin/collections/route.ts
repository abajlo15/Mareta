import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { normalizeImageDisplaySettings, settingsToRowFields } from "@/types/imageDisplay";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export async function GET() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("collections")
    .select("id, name, slug, thumbnail_url, description, thumbnail_focal_x, thumbnail_focal_y, thumbnail_zoom")
    .order("name", { ascending: true });

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
    .insert({
      name,
      slug,
      thumbnail_url: thumbnailUrl,
      description,
      thumbnail_focal_x: thumbnailFields.focal_x,
      thumbnail_focal_y: thumbnailFields.focal_y,
      thumbnail_zoom: thumbnailFields.zoom,
    })
    .select("id, name, slug, thumbnail_url, description, thumbnail_focal_x, thumbnail_focal_y, thumbnail_zoom")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
