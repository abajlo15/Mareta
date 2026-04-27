import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const GENDERS = ["male", "female"] as const;
type Gender = (typeof GENDERS)[number];

const isValidGender = (value: unknown): value is Gender =>
  typeof value === "string" && GENDERS.includes(value as Gender);

export async function GET(request: NextRequest) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const genderParam = request.nextUrl.searchParams.get("gender");

  let query = supabase
    .from("subcollections")
    .select("id, name, gender, thumbnail_url")
    .order("name", { ascending: true });

  if (isValidGender(genderParam)) {
    query = query.eq("gender", genderParam);
  }

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
    .insert({ name, gender, thumbnail_url: thumbnailUrl })
    .select("id, name, gender, thumbnail_url")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
