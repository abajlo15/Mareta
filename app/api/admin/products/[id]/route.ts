import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const supabase = await createSupabaseServerClient();
    const { id } = await params;

    const body = await request.json();
    const { name, description, price, discountPercentage, categories, subcollectionId, stock, isPolarized, images } = body as {
      name?: string;
      description?: string | null;
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
        subcollection_id: subcollectionId || null,
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
