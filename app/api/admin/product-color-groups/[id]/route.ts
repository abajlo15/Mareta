import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  colorGroupBodySchema,
  replaceColorGroupMembers,
  validateUniqueColorKeys,
} from "@/lib/productColorGroups";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: group, error } = await supabase
    .from("product_color_groups")
    .select(
      "id, name, created_at, members:product_color_group_members(product_id, label, color_key, position, product:products(id, name, images))"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!group) {
    return NextResponse.json({ error: "Grupa nije pronađena." }, { status: 404 });
  }

  const members = (group.members ?? [])
    .map(
      (member: {
        product_id: string;
        label: string;
        color_key: string | null;
        position: number;
        product: { id: string; name: string; images: string[] | null }[] | {
          id: string;
          name: string;
          images: string[] | null;
        } | null;
      }) => {
        const product = Array.isArray(member.product)
          ? (member.product[0] ?? null)
          : member.product;
        return {
          product_id: member.product_id,
          label: member.label,
          color_key: member.color_key,
          position: member.position,
          product_name: product?.name ?? "",
          product_image: product?.images?.[0] ?? null,
        };
      }
    )
    .sort((a, b) => a.position - b.position);

  return NextResponse.json({
    id: group.id,
    name: group.name,
    created_at: group.created_at,
    members,
  });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Nevaljan JSON." }, { status: 400 });
  }

  const parsed = colorGroupBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Nevaljani podaci." },
      { status: 400 }
    );
  }

  const colorKeyError = validateUniqueColorKeys(parsed.data.members);
  if (colorKeyError) {
    return NextResponse.json({ error: colorKeyError }, { status: 400 });
  }

  const { data: existing, error: existingError } = await supabase
    .from("product_color_groups")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (!existing) {
    return NextResponse.json({ error: "Grupa nije pronađena." }, { status: 404 });
  }

  const name =
    typeof parsed.data.name === "string" && parsed.data.name.trim()
      ? parsed.data.name.trim()
      : null;

  const { error: updateError } = await supabase
    .from("product_color_groups")
    .update({ name })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const { error: membersError } = await replaceColorGroupMembers(
    supabase,
    id,
    parsed.data.members
  );

  if (membersError) {
    return NextResponse.json({ error: membersError.message }, { status: 500 });
  }

  return NextResponse.json({ id });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("product_color_groups").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
