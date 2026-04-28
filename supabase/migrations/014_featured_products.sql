CREATE TABLE IF NOT EXISTS featured_products (
  product_id UUID PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  position INTEGER NOT NULL UNIQUE CHECK (position BETWEEN 1 AND 15),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_featured_products_position ON featured_products(position);

ALTER TABLE featured_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Featured products are viewable by everyone" ON featured_products;
CREATE POLICY "Featured products are viewable by everyone"
  ON featured_products FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create featured products" ON featured_products;
CREATE POLICY "Authenticated users can create featured products"
  ON featured_products FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete featured products" ON featured_products;
CREATE POLICY "Authenticated users can delete featured products"
  ON featured_products FOR DELETE
  TO authenticated
  USING (true);
