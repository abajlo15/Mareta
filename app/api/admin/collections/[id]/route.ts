import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

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

  if (!name) {
    return NextResponse.json({ error: "Naziv kolekcije je obavezan." }, { status: 400 });
  }
  if (!slug) {
    return NextResponse.json({ error: "Slug kolekcije nije valjan." }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("collections")
    .update({ name, slug, thumbnail_url: thumbnailUrl })
    .eq("id", id)
    .select("id, name, slug, thumbnail_url")
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

  const { error } = await supabase.from("collections").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
