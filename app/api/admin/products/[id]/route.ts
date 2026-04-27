import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

type Params = { params: Promise<{ id: string }> };
const AUDIENCES = ["male", "female", "both"] as const;
type Audience = (typeof AUDIENCES)[number];

const isValidAudience = (value: unknown): value is Audience =>
  typeof value === "string" && AUDIENCES.includes(value as Audience);

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Nedozvoljeno." }, { status: 403 });
    }

    const supabase = await createSupabaseServerClient();
    const { id } = await params;

    const body = await request.json();
    const { name, description, price, discountPercentage, categories, audience, subcollectionId, stock, isPolarized, images } = body as {
      name?: string;
      description?: string | null;
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

    if (audience !== "both" && selectedSubcollection.gender !== audience) {
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

    const { error } = await supabase
      .from("products")
      .update({
        name,
        description: description ?? null,
        price,
        categories: Array.isArray(categories) ? categories : [],
        audience,
        subcollection_id: subcollectionId,
        stock: stockValue,
        is_polarized: typeof isPolarized === "boolean" ? isPolarized : false,
        discount_percentage: discountValue,
        images: Array.isArray(images) ? images : [],
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Greška pri ažuriranju." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Nedozvoljeno." }, { status: 403 });
    }

    const supabase = await createSupabaseServerClient();
    const { id } = await params;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Greška pri brisanju artikla." },
      { status: 500 }
    );
  }
}
