import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ADMIN_PRODUCTS_SELECT_BASE,
  ADMIN_PRODUCTS_SELECT_NO_POSITION,
  ADMIN_PRODUCTS_SELECT_WITH_POSITIONS,
} from "@/lib/productSelect";

const PUBLIC_SELECT_VARIANTS = [
  "*, subcollection:subcollections!products_subcollection_id_fkey(id, name, thumbnail_url, collection_id), product_collections(position, collection:collections(id, name, slug, thumbnail_url)), subcollection_product_positions!subcollection_product_positions_product_id_fkey(position)",
  "*, subcollection:subcollections!products_subcollection_id_fkey(id, name, thumbnail_url, collection_id), product_collections(position, collection:collections(id, name, slug, thumbnail_url))",
  "*, subcollection:subcollections!products_subcollection_id_fkey(id, name, thumbnail_url, collection_id), product_collections(collection:collections(id, name, slug, thumbnail_url))",
] as const;

const ADMIN_SELECT_VARIANTS = [
  ADMIN_PRODUCTS_SELECT_WITH_POSITIONS,
  ADMIN_PRODUCTS_SELECT_BASE,
  ADMIN_PRODUCTS_SELECT_NO_POSITION,
] as const;

export type AdminProductListItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discount_percentage?: number;
  categories?: string[] | null;
  collections?: { id: string; name: string; slug: string }[];
  collection_positions?: { collection_id: string; position: number }[];
  subcollection_id?: string | null;
  subcollection_position?: number | null;
  subcollection?: { name: string; collection_id?: string } | null;
  stock?: number;
  images?: string[] | null;
};

function isSchemaMismatchError(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  if (error.code === "PGRST200" || error.code === "42703") return true;
  const message = error.message ?? "";
  return (
    message.includes("subcollection_product_positions") ||
    message.includes("Could not find a relationship") ||
    message.includes("more than one relationship") ||
    (message.includes("column") && message.includes("position"))
  );
}

type ProductRow = Record<string, unknown>;

export function normalizeProductRow(product: ProductRow) {
  const subcollectionPositions = product.subcollection_product_positions as
    | { position: number }[]
    | { position: number }
    | null
    | undefined;
  const subcollectionPosition = Array.isArray(subcollectionPositions)
    ? (subcollectionPositions[0]?.position ?? null)
    : (subcollectionPositions?.position ?? null);

  const productCollections = (product.product_collections ?? []) as {
    position?: number;
    collection: unknown[] | unknown | null;
  }[];

  const imageSettings =
    product.image_settings && typeof product.image_settings === "object"
      ? product.image_settings
      : {};

  return {
    ...product,
    image_settings: imageSettings,
    collections: productCollections
      .map((item) => {
        const collection = Array.isArray(item.collection)
          ? (item.collection[0] ?? null)
          : item.collection;
        return collection ?? null;
      })
      .filter(Boolean),
    collection_positions: productCollections
      .map((item) => {
        const collection = Array.isArray(item.collection)
          ? (item.collection[0] ?? null)
          : item.collection;
        if (!collection || typeof collection !== "object" || !("id" in collection)) {
          return null;
        }
        return {
          collection_id: (collection as { id: string }).id,
          position: item.position ?? 999999,
        };
      })
      .filter(
        (item): item is { collection_id: string; position: number } => item !== null
      ),
    subcollection_position: subcollectionPosition,
  };
}

export async function queryPublicProducts(
  supabase: SupabaseClient,
  filters?: { search?: string | null; category?: string | null }
) {
  let lastError: { code?: string; message?: string } | null = null;

  for (const select of PUBLIC_SELECT_VARIANTS) {
    let query = supabase.from("products").select(select as string);
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }
    if (filters?.category) {
      query = query.contains("categories", [filters.category]);
    }

    const { data, error } = await query;
    if (!error) {
      return {
        data: (data ?? []).map((product) =>
          normalizeProductRow(product as unknown as ProductRow)
        ),
        error: null,
      };
    }

    lastError = error;
    if (!isSchemaMismatchError(error)) {
      return { data: null, error };
    }
  }

  return { data: null, error: lastError };
}

export async function queryAdminProducts(supabase: SupabaseClient): Promise<{
  data: AdminProductListItem[] | null;
  error: { code?: string; message?: string } | null;
}> {
  let lastError: { code?: string; message?: string } | null = null;

  for (const select of ADMIN_SELECT_VARIANTS) {
    const { data, error } = await supabase
      .from("products")
      .select(select as string)
      .order("created_at", { ascending: false });

    if (!error) {
      return {
        data: (data ?? []).map((product): AdminProductListItem => {
          const row = product as unknown as ProductRow & {
            id: string;
            name: string;
            description: string | null;
            price: number;
            discount_percentage?: number;
            categories?: string[] | null;
            subcollection_id?: string | null;
            stock?: number;
            images?: string[] | null;
            subcollection?: AdminProductListItem["subcollection"];
          };
          const normalized = normalizeProductRow(row);
          const subcollectionRaw = row.subcollection as
            | { name: string; thumbnail_url: string | null; collection_id: string }
            | { name: string; thumbnail_url: string | null; collection_id: string }[]
            | null
            | undefined;

          return {
            id: row.id,
            name: row.name,
            description: row.description,
            price: row.price,
            discount_percentage: row.discount_percentage,
            categories: row.categories,
            subcollection_id: row.subcollection_id,
            stock: row.stock,
            images: row.images,
            collections: normalized.collections as AdminProductListItem["collections"],
            collection_positions: normalized.collection_positions,
            subcollection_position: normalized.subcollection_position,
            subcollection: Array.isArray(subcollectionRaw)
              ? (subcollectionRaw[0] ?? null)
              : (subcollectionRaw ?? null),
          };
        }),
        error: null,
      };
    }

    lastError = error;
    if (!isSchemaMismatchError(error)) {
      return { data: null, error };
    }
  }

  return { data: null, error: lastError };
}
