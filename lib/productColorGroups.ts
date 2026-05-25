import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

export type ColorVariant = {
  product_id: string;
  label: string;
};

export const colorGroupMemberSchema = z.object({
  productId: z.string().uuid(),
  label: z.string().trim().min(1, "Oznaka je obavezna."),
});

export const colorGroupBodySchema = z.object({
  name: z.string().trim().optional().nullable(),
  members: z.array(colorGroupMemberSchema).min(2, "Grupa mora imati barem 2 proizvoda."),
});

export type ColorGroupMemberInput = z.infer<typeof colorGroupMemberSchema>;
export type ColorGroupBody = z.infer<typeof colorGroupBodySchema>;

export function validateUniqueLabels(members: ColorGroupMemberInput[]): string | null {
  const labels = members.map((m) => m.label.trim().toLowerCase());
  const unique = new Set(labels);
  if (unique.size !== labels.length) {
    return "Oznake unutar grupe moraju biti jedinstvene.";
  }
  const productIds = members.map((m) => m.productId);
  if (new Set(productIds).size !== productIds.length) {
    return "Svaki proizvod smije biti u grupi samo jednom.";
  }
  return null;
}

export async function fetchColorVariantsForProduct(
  supabase: SupabaseClient,
  productId: string
): Promise<ColorVariant[] | undefined> {
  const { data: membership, error: membershipError } = await supabase
    .from("product_color_group_members")
    .select("group_id")
    .eq("product_id", productId)
    .maybeSingle();

  if (membershipError || !membership?.group_id) {
    return undefined;
  }

  const { data: members, error: membersError } = await supabase
    .from("product_color_group_members")
    .select("product_id, label")
    .eq("group_id", membership.group_id)
    .order("position", { ascending: true });

  if (membersError || !members || members.length < 2) {
    return undefined;
  }

  return members.map((m) => ({
    product_id: m.product_id,
    label: m.label,
  }));
}

export async function replaceColorGroupMembers(
  supabase: SupabaseClient,
  groupId: string,
  members: ColorGroupMemberInput[]
) {
  const productIds = members.map((m) => m.productId);

  const { error: removeFromOtherGroupsError } = await supabase
    .from("product_color_group_members")
    .delete()
    .in("product_id", productIds)
    .neq("group_id", groupId);

  if (removeFromOtherGroupsError) {
    return { error: removeFromOtherGroupsError };
  }

  const { error: deleteError } = await supabase
    .from("product_color_group_members")
    .delete()
    .eq("group_id", groupId);

  if (deleteError) {
    return { error: deleteError };
  }

  const rows = members.map((member, index) => ({
    group_id: groupId,
    product_id: member.productId,
    label: member.label.trim(),
    position: index + 1,
  }));

  const { error: insertError } = await supabase
    .from("product_color_group_members")
    .insert(rows);

  if (insertError) {
    return { error: insertError };
  }

  return { error: null };
}
