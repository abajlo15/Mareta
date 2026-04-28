CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_collections (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (product_id, collection_id)
);

CREATE INDEX IF NOT EXISTS idx_product_collections_collection_id ON product_collections(collection_id);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Collections are viewable by everyone" ON collections;
CREATE POLICY "Collections are viewable by everyone"
  ON collections FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create collections" ON collections;
CREATE POLICY "Authenticated users can create collections"
  ON collections FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update collections" ON collections;
CREATE POLICY "Authenticated users can update collections"
  ON collections FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete collections" ON collections;
CREATE POLICY "Authenticated users can delete collections"
  ON collections FOR DELETE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Product collections are viewable by everyone" ON product_collections;
CREATE POLICY "Product collections are viewable by everyone"
  ON product_collections FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create product collections" ON product_collections;
CREATE POLICY "Authenticated users can create product collections"
  ON product_collections FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete product collections" ON product_collections;
CREATE POLICY "Authenticated users can delete product collections"
  ON product_collections FOR DELETE
  TO authenticated
  USING (true);

INSERT INTO collections (name, slug, gender)
VALUES
  ('Muška kolekcija', 'muska', 'male'),
  ('Ženska kolekcija', 'zenska', 'female')
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  gender = EXCLUDED.gender;

INSERT INTO product_collections (product_id, collection_id)
SELECT p.id, c.id
FROM products p
JOIN collections c ON c.slug = 'muska'
WHERE p.audience IN ('male', 'both')
ON CONFLICT (product_id, collection_id) DO NOTHING;

INSERT INTO product_collections (product_id, collection_id)
SELECT p.id, c.id
FROM products p
JOIN collections c ON c.slug = 'zenska'
WHERE p.audience IN ('female', 'both')
ON CONFLICT (product_id, collection_id) DO NOTHING;

DROP INDEX IF EXISTS idx_products_audience;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_audience_check;
ALTER TABLE products DROP COLUMN IF EXISTS audience;
