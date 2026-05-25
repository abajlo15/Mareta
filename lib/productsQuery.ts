import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ADMIN_PRODUCT_RELATIONS_BASE,
  ADMIN_PRODUCT_RELATIONS_NO_POSITION,
  ADMIN_PRODUCT_RELATIONS_WITH_POSITIONS,
  PRODUCT_RELATIONS_SELECT,
  PRODUCT_RELATIONS_SELECT_NO_COLLECTION_POSITION,
  PRODUCT_RELATIONS_WITH_SUBCOLLECTION_POSITIONS,
} from "@/lib/productSelect";

const PUBLIC_SELECT_VARIANTS = [
  `*, ${PRODUCT_RELATIONS_WITH_SUBCOLLECTION_POSITIONS}`,
  `*, ${PRODUCT_RELATIONS_SELECT}`,
  `*, ${PRODUCT_RELATIONS_SELECT_NO_COLLECTION_POSITION}`,
] as const;

const ADMIN_COLUMNS =
  "id, name, description, price, discount_percentage, categories, subcollection_id, stock, is_polarized, images";

const ADMIN_SELECT_VARIANTS = [
  `${ADMIN_COLUMNS}, ${ADMIN_PRODUCT_RELATIONS_WITH_POSITIONS}`,
  `${ADMIN_COLUMNS}, ${ADMIN_PRODUCT_RELATIONS_BASE}`,
  `${ADMIN_COLUMNS}, ${ADMIN_PRODUCT_RELATIONS_NO_POSITION}`,
] as const;

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

  return {
    ...product,
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
  applyFilters?: (
    query: ReturnType<SupabaseClient["from"]>
  ) => ReturnType<SupabaseClient["from"]>
) {
  let lastError: { code?: string; message?: string } | null = null;

  for (const select of PUBLIC_SELECT_VARIANTS) {
    let query = supabase.from("products").select(select);
    if (applyFilters) {
      query = applyFilters(query) as typeof query;
    }

    const { data, error } = await query;
    if (!error) {
      return {
        data: (data ?? []).map((product) => normalizeProductRow(product as ProductRow)),
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

export async function queryAdminProducts(supabase: SupabaseClient) {
  let lastError: { code?: string; message?: string } | null = null;

  for (const select of ADMIN_SELECT_VARIANTS) {
    const { data, error } = await supabase
      .from("products")
      .select(select)
      .order("created_at", { ascending: false });

    if (!error) {
      return {
        data: (data ?? []).map((product) => {
          const normalized = normalizeProductRow(product as ProductRow);
          const subcollection = normalized.subcollection as
            | { name: string; thumbnail_url: string | null; collection_id: string }
            | { name: string; thumbnail_url: string | null; collection_id: string }[]
            | null
            | undefined;

          return {
            ...normalized,
            subcollection: Array.isArray(subcollection)
              ? (subcollection[0] ?? null)
              : (subcollection ?? null),
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
