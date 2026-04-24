import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

type BulkDiscountBody = {
  discountPercentage?: number;
  productIds?: string[];
};

export async function PATCH(request: Request) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const body = (await request.json()) as BulkDiscountBody;
  const discountPercentage = body.discountPercentage;
  const productIds = Array.isArray(body.productIds) ? body.productIds : [];

  if (typeof discountPercentage !== "number" || Number.isNaN(discountPercentage)) {
    return NextResponse.json(
      { error: "Postotak popusta je obavezan." },
      { status: 400 }
    );
  }

  const discountValue = Math.min(100, Math.max(0, Math.round(discountPercentage)));

  if (!productIds.length) {
    return NextResponse.json(
      { error: "Odaberi barem jedan artikal." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("products")
    .update({ discount_percentage: discountValue })
    .in("id", productIds)
    .select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, updatedCount: data?.length ?? 0 });
}

