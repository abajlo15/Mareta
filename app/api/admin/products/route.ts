import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price, discount_percentage, categories, subcollection_id, stock, is_polarized, images")
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
  const { name, description, price, discountPercentage, categories, subcollectionId, stock, isPolarized, images } = body as {
    name?: string;
    description?: string;
    price?: number;
    discountPercentage?: number;
    categories?: string[];
    subcollectionId?: string | null;
    stock?: number;
    isPolarized?: boolean;
    images?: string[];
  };

  if (!name || typeof price !== "number") {
    return NextResponse.json(
      { error: "Naziv i cijena su obavezni." },
      { status: 400 }
    );
  }
  if (!Array.isArray(categories) || categories.length === 0) {
    return NextResponse.json(
      { error: "Potrebno je odabrati barem jednu kolekciju." },
      { status: 400 }
    );
  }
  if (typeof subcollectionId !== "string" || !subcollectionId.trim()) {
    return NextResponse.json(
      { error: "Podkolekcija je obavezna." },
      { status: 400 }
    );
  }

  const stockValue = typeof stock === "number" ? Math.max(0, stock) : 0;
  const discountValue =
    typeof discountPercentage === "number"
      ? Math.min(100, Math.max(0, Math.round(discountPercentage)))
      : 0;

  const { error } = await supabase.from("products").insert({
    name,
    description,
    price,
    categories,
    subcollection_id: subcollectionId,
    stock: stockValue,
    is_polarized: typeof isPolarized === "boolean" ? isPolarized : false,
    discount_percentage: discountValue,
    images: Array.isArray(images) ? images : [],
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}


