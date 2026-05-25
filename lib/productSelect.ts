/** PostgREST FK hints — required after migration 022 (multiple paths products ↔ subcollections). */
export const PRODUCTS_SUBCOLLECTION_FK = "products_subcollection_id_fkey";
export const SUBCOLLECTION_POSITIONS_PRODUCT_FK =
  "subcollection_product_positions_product_id_fkey";

const subcollectionEmbed = (fields: string) =>
  `subcollection:subcollections!${PRODUCTS_SUBCOLLECTION_FK}(${fields})`;

const subcollectionPositionsEmbed = "subcollection_product_positions!subcollection_product_positions_product_id_fkey(position)";

const productCollectionsEmbed = (withPosition: boolean) =>
  withPosition
    ? "product_collections(position, collection:collections(id, name, slug, thumbnail_url))"
    : "product_collections(collection:collections(id, name, slug, thumbnail_url))";

export const PRODUCT_RELATIONS_SELECT = `${subcollectionEmbed(
  "id, name, thumbnail_url, collection_id"
)}, ${productCollectionsEmbed(true)}`;

export const PRODUCT_RELATIONS_SELECT_NO_COLLECTION_POSITION = `${subcollectionEmbed(
  "id, name, thumbnail_url, collection_id"
)}, ${productCollectionsEmbed(false)}`;

export const PRODUCT_RELATIONS_WITH_SUBCOLLECTION_POSITIONS = `${PRODUCT_RELATIONS_SELECT}, ${subcollectionPositionsEmbed}`;

export const ADMIN_PRODUCT_RELATIONS_WITH_POSITIONS = `${subcollectionEmbed(
  "name, thumbnail_url, collection_id"
)}, ${productCollectionsEmbed(true)}, ${subcollectionPositionsEmbed}`;

export const ADMIN_PRODUCT_RELATIONS_BASE = `${subcollectionEmbed(
  "name, thumbnail_url, collection_id"
)}, ${productCollectionsEmbed(true)}`;

export const ADMIN_PRODUCT_RELATIONS_NO_POSITION = `${subcollectionEmbed(
  "name, thumbnail_url, collection_id"
)}, ${productCollectionsEmbed(false)}`;

export const SUBCOLLECTION_EMBED_MINIMAL = subcollectionEmbed("id, name");

/** Literal select strings for Supabase type inference (no template interpolation in .select()). */
export const DISCOUNTS_PRODUCTS_SELECT =
  "id, name, categories, images, subcollection_id, subcollection:subcollections!products_subcollection_id_fkey(id, name)" as const;

export const PRODUCT_DETAIL_SELECT =
  "*, subcollection:subcollections!products_subcollection_id_fkey(id, name, thumbnail_url, collection_id), product_collections(collection:collections(id, name, slug, thumbnail_url))" as const;

export const FEATURED_PRODUCTS_SELECT =
  "position, product:products(*, subcollection:subcollections!products_subcollection_id_fkey(id, name, thumbnail_url, collection_id), product_collections(collection:collections(id, name, slug, thumbnail_url)))" as const;

export const ADMIN_PRODUCTS_SELECT_WITH_POSITIONS =
  "id, name, description, price, discount_percentage, categories, subcollection_id, stock, is_polarized, images, subcollection:subcollections!products_subcollection_id_fkey(name, thumbnail_url, collection_id), product_collections(position, collection:collections(id, name, slug, thumbnail_url)), subcollection_product_positions!subcollection_product_positions_product_id_fkey(position)" as const;

export const ADMIN_PRODUCTS_SELECT_BASE =
  "id, name, description, price, discount_percentage, categories, subcollection_id, stock, is_polarized, images, subcollection:subcollections!products_subcollection_id_fkey(name, thumbnail_url, collection_id), product_collections(position, collection:collections(id, name, slug, thumbnail_url))" as const;

export const ADMIN_PRODUCTS_SELECT_NO_POSITION =
  "id, name, description, price, discount_percentage, categories, subcollection_id, stock, is_polarized, images, subcollection:subcollections!products_subcollection_id_fkey(name, thumbnail_url, collection_id), product_collections(collection:collections(id, name, slug, thumbnail_url))" as const;
