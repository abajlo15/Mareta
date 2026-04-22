CREATE TABLE IF NOT EXISTS subcollections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE subcollections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Subcollections are viewable by everyone" ON subcollections;
CREATE POLICY "Subcollections are viewable by everyone"
  ON subcollections FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create subcollections" ON subcollections;
CREATE POLICY "Authenticated users can create subcollections"
  ON subcollections FOR INSERT
  TO authenticated
  WITH CHECK (true);

ALTER TABLE products
ADD COLUMN IF NOT EXISTS subcollection_id UUID REFERENCES subcollections(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_products_subcollection_id ON products(subcollection_id);
