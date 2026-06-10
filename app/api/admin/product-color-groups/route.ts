import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  colorGroupBodySchema,
  replaceColorGroupMembers,
  validateUniqueColorKeys,
} from "@/lib/productColorGroups";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: groups, error: groupsError } = await supabase
    .from("product_color_groups")
    .select(
      "id, name, created_at, members:product_color_group_members(product_id, label, color_key, position, product:products(id, name, images))"
    )
    .order("created_at", { ascending: false });

  if (groupsError) {
    return NextResponse.json({ error: groupsError.message }, { status: 500 });
  }

  const normalized = (groups ?? []).map((group) => {
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

    return {
      id: group.id,
      name: group.name,
      created_at: group.created_at,
      members,
    };
  });

  return NextResponse.json(normalized);
}

export async function POST(request: Request) {
  await requireAdmin();
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

  const name =
    typeof parsed.data.name === "string" && parsed.data.name.trim()
      ? parsed.data.name.trim()
      : null;

  const { data: group, error: groupError } = await supabase
    .from("product_color_groups")
    .insert({ name })
    .select("id")
    .single();

  if (groupError || !group) {
    return NextResponse.json(
      { error: groupError?.message ?? "Grupa nije kreirana." },
      { status: 500 }
    );
  }

  const { error: membersError } = await replaceColorGroupMembers(
    supabase,
    group.id,
    parsed.data.members
  );

  if (membersError) {
    await supabase.from("product_color_groups").delete().eq("id", group.id);
    return NextResponse.json({ error: membersError.message }, { status: 500 });
  }

  return NextResponse.json({ id: group.id }, { status: 201 });
}
