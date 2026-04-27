import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const AUDIENCES = ["male", "female", "both"] as const;
type Audience = (typeof AUDIENCES)[number];

const isValidAudience = (value: unknown): value is Audience =>
  typeof value === "string" && AUDIENCES.includes(value as Audience);

export async function GET() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price, discount_percentage, categories, audience, subcollection_id, stock, is_polarized, images")
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
  const { name, description, price, discountPercentage, categories, audience, subcollectionId, stock, isPolarized, images } = body as {
    name?: string;
    description?: string;
    price?: number;
    discountPercentage?: number;
    categories?: string[];
    audience?: Audience;
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
  if (!isValidAudience(audience)) {
    return NextResponse.json({ error: "Odaberi valjanu kolekciju." }, { status: 400 });
  }
  if (typeof subcollectionId !== "string" || !subcollectionId.trim()) {
    return NextResponse.json(
      { error: "Podkolekcija je obavezna." },
      { status: 400 }
    );
  }

  const { data: selectedSubcollection, error: subcollectionError } = await supabase
    .from("subcollections")
    .select("id, gender")
    .eq("id", subcollectionId)
    .single();

  if (subcollectionError || !selectedSubcollection) {
    return NextResponse.json({ error: "Odabrana podkolekcija ne postoji." }, { status: 400 });
  }

  if (
    audience !== "both" &&
    selectedSubcollection.gender !== audience
  ) {
    return NextResponse.json(
      { error: "Odabrana podkolekcija ne pripada odabranoj kolekciji." },
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
    categories: Array.isArray(categories) ? categories : [],
    audience,
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


