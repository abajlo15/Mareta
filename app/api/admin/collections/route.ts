import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

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
    .select("id, name, slug, thumbnail_url")
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

  if (!name) {
    return NextResponse.json({ error: "Naziv kolekcije je obavezan." }, { status: 400 });
  }
  if (!slug) {
    return NextResponse.json({ error: "Slug kolekcije nije valjan." }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("collections")
    .insert({
      name,
      slug,
      thumbnail_url: thumbnailUrl,
    })
    .select("id, name, slug, thumbnail_url")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
