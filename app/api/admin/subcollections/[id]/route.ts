import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { id } = await params;

  const body = await request.json();
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Naziv podkolekcije je obavezan." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("subcollections")
    .update({ name })
    .eq("id", id)
    .select("id, name")
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

  const { error } = await supabase
    .from("subcollections")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
