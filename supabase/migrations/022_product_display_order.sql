ALTER TABLE product_collections
ADD COLUMN IF NOT EXISTS position INTEGER;

CREATE TABLE IF NOT EXISTS subcollection_product_positions (
  subcollection_id UUID NOT NULL REFERENCES subcollections(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  PRIMARY KEY (subcollection_id, product_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_subcollection_product_positions_order
  ON subcollection_product_positions (subcollection_id, position);

CREATE INDEX IF NOT EXISTS idx_subcollection_product_positions_product_id
  ON subcollection_product_positions (product_id);

WITH ranked AS (
  SELECT
    pc.product_id,
    pc.collection_id,
    ROW_NUMBER() OVER (
      PARTITION BY pc.collection_id
      ORDER BY p.created_at DESC, p.id ASC
    ) AS new_position
  FROM product_collections pc
  JOIN products p ON p.id = pc.product_id
)
UPDATE product_collections pc
SET position = ranked.new_position
FROM ranked
WHERE pc.product_id = ranked.product_id
  AND pc.collection_id = ranked.collection_id
  AND pc.position IS NULL;

INSERT INTO subcollection_product_positions (subcollection_id, product_id, position)
SELECT
  p.subcollection_id,
  p.id,
  ROW_NUMBER() OVER (
    PARTITION BY p.subcollection_id
    ORDER BY p.created_at DESC, p.id ASC
  ) AS new_position
FROM products p
WHERE p.subcollection_id IS NOT NULL
ON CONFLICT (subcollection_id, product_id) DO NOTHING;

ALTER TABLE product_collections
ALTER COLUMN position SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_collections_collection_position
  ON product_collections (collection_id, position);

ALTER TABLE subcollection_product_positions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Product collections can be updated by authenticated users" ON product_collections;
CREATE POLICY "Product collections can be updated by authenticated users"
  ON product_collections FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Subcollection product positions are viewable by everyone" ON subcollection_product_positions;
CREATE POLICY "Subcollection product positions are viewable by everyone"
  ON subcollection_product_positions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create subcollection product positions" ON subcollection_product_positions;
CREATE POLICY "Authenticated users can create subcollection product positions"
  ON subcollection_product_positions FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update subcollection product positions" ON subcollection_product_positions;
CREATE POLICY "Authenticated users can update subcollection product positions"
  ON subcollection_product_positions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete subcollection product positions" ON subcollection_product_positions;
CREATE POLICY "Authenticated users can delete subcollection product positions"
  ON subcollection_product_positions FOR DELETE
  TO authenticated
  USING (true);
