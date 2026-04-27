import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

type Params = { params: Promise<{ id: string }> };

async function requireAdminJson() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Niste prijavljeni." }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Nemate ovlasti za ovu akciju." }, { status: 403 });
  }
  return null;
}

export async function PATCH(request: Request, { params }: Params) {
  const authError = await requireAdminJson();
  if (authError) return authError;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const { id } = await params;

  const body = await request.json();
  const { status } = body as { status?: string };

  if (status !== "shipped" && status !== "pending") {
    return NextResponse.json(
      { error: "Nepodržan status narudžbe." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  const authError = await requireAdminJson();
  if (authError) return authError;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const { id } = await params;

  const { data, error } = await supabase
    .from("orders")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Narudžba nije pronađena." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}


