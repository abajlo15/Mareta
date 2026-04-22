import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price, categories, subcollection_id, stock, images")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const body = await request.json();
  const { name, description, price, categories, subcollectionId, stock, images } = body as {
    name?: string;
    description?: string;
    price?: number;
    categories?: string[];
    subcollectionId?: string | null;
    stock?: number;
    images?: string[];
  };

  if (!name || typeof price !== "number") {
    return NextResponse.json(
      { error: "Naziv i cijena su obavezni." },
      { status: 400 }
    );
  }

  const stockValue = typeof stock === "number" ? Math.max(0, stock) : 0;

  const { error } = await supabase.from("products").insert({
    name,
    description,
    price,
    categories: Array.isArray(categories) ? categories : [],
    subcollection_id: subcollectionId || null,
    stock: stockValue,
    images: Array.isArray(images) ? images : [],
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}


