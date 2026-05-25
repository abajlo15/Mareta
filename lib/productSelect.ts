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
