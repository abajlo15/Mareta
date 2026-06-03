-- Shirt products: flag on products, per-size stock, size on order line items

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_shirt BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS product_sizes (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (product_id, size),
  CONSTRAINT product_sizes_size_check CHECK (size IN ('XS', 'S', 'M', 'L', 'XL'))
);

CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id ON product_sizes(product_id);

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS size TEXT NULL;

ALTER TABLE order_items
  DROP CONSTRAINT IF EXISTS order_items_size_check;

ALTER TABLE order_items
  ADD CONSTRAINT order_items_size_check CHECK (
    size IS NULL OR size IN ('XS', 'S', 'M', 'L', 'XL')
  );

ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Product sizes are viewable by everyone" ON product_sizes;
CREATE POLICY "Product sizes are viewable by everyone"
  ON product_sizes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create product sizes" ON product_sizes;
CREATE POLICY "Authenticated users can create product sizes"
  ON product_sizes FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update product sizes" ON product_sizes;
CREATE POLICY "Authenticated users can update product sizes"
  ON product_sizes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete product sizes" ON product_sizes;
CREATE POLICY "Authenticated users can delete product sizes"
  ON product_sizes FOR DELETE
  TO authenticated
  USING (true);
