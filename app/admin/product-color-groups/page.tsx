import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import ColorGroupsManager from "./colorGroupsManager";

export const dynamic = "force-dynamic";

type GroupRow = {
  id: string;
  name: string | null;
  created_at: string;
  members: {
    product_id: string;
    label: string;
    position: number;
    product: { id: string; name: string; images: string[] | null }[] | {
      id: string;
      name: string;
      images: string[] | null;
    } | null;
  }[];
};

export default async function AdminProductColorGroupsPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: groupsRows } = await supabase
    .from("product_color_groups")
    .select(
      "id, name, created_at, members:product_color_group_members(product_id, label, position, product:products(id, name, images))"
    )
    .order("created_at", { ascending: false });

  const { data: productsRows } = await supabase
    .from("products")
    .select("id, name, images")
    .order("name", { ascending: true });

  const groups = ((groupsRows ?? []) as GroupRow[]).map((group) => ({
    id: group.id,
    name: group.name,
    created_at: group.created_at,
    members: (group.members ?? [])
      .map((member) => {
        const product = Array.isArray(member.product)
          ? (member.product[0] ?? null)
          : member.product;
        return {
          product_id: member.product_id,
          label: member.label,
          position: member.position,
          product_name: product?.name ?? "",
          product_image: product?.images?.[0] ?? null,
        };
      })
      .sort((a, b) => a.position - b.position),
  }));

  const products = (productsRows ?? []).map((product) => ({
    id: product.id,
    name: product.name,
    image: product.images?.[0] ?? null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold">Varijante boja</h2>
        <p className="text-sm text-slate-600 mt-1">
          Poveži proizvode različitih boja u grupu. Kupci će na stranici proizvoda moći birati
          boju iz padajućeg izbornika.
        </p>
      </div>

      <ColorGroupsManager groups={groups} products={products} />
    </div>
  );
}
