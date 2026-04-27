import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

type Params = { params: Promise<{ id: string }> };
const GENDERS = ["male", "female"] as const;
type Gender = (typeof GENDERS)[number];

const isValidGender = (value: unknown): value is Gender =>
  typeof value === "string" && GENDERS.includes(value as Gender);

export async function PATCH(request: Request, { params }: Params) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { id } = await params;

  const body = await request.json();
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const gender = body?.gender;
  const thumbnailUrl =
    typeof body?.thumbnailUrl === "string" && body.thumbnailUrl.trim()
      ? body.thumbnailUrl.trim()
      : null;

  if (!name) {
    return NextResponse.json({ error: "Naziv podkolekcije je obavezan." }, { status: 400 });
  }
  if (!isValidGender(gender)) {
    return NextResponse.json({ error: "Odaberi valjanu grupu podkolekcije." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("subcollections")
    .update({ name, gender, thumbnail_url: thumbnailUrl })
    .eq("id", id)
    .select("id, name, gender, thumbnail_url")
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

  // Ensure legacy FK setups do not block subcollection deletion.
  const { error: detachError } = await supabase
    .from("products")
    .update({ subcollection_id: null })
    .eq("subcollection_id", id);

  if (detachError) {
    return NextResponse.json({ error: detachError.message }, { status: 500 });
  }

  const { data: deletedRow, error } = await supabase
    .from("subcollections")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!deletedRow) {
    return NextResponse.json(
      { error: "Podkolekcija nije obrisana (nije pronađena ili nemaš dozvolu)." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}
