CREATE TABLE IF NOT EXISTS product_color_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_color_group_members (
  group_id UUID NOT NULL REFERENCES product_color_groups(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  position INTEGER NOT NULL,
  PRIMARY KEY (group_id, product_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_color_group_members_product_id
  ON product_color_group_members (product_id);

CREATE INDEX IF NOT EXISTS idx_product_color_group_members_group_id
  ON product_color_group_members (group_id);

ALTER TABLE product_color_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_color_group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Product color groups are viewable by everyone" ON product_color_groups;
CREATE POLICY "Product color groups are viewable by everyone"
  ON product_color_groups FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create product color groups" ON product_color_groups;
CREATE POLICY "Authenticated users can create product color groups"
  ON product_color_groups FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update product color groups" ON product_color_groups;
CREATE POLICY "Authenticated users can update product color groups"
  ON product_color_groups FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete product color groups" ON product_color_groups;
CREATE POLICY "Authenticated users can delete product color groups"
  ON product_color_groups FOR DELETE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Product color group members are viewable by everyone" ON product_color_group_members;
CREATE POLICY "Product color group members are viewable by everyone"
  ON product_color_group_members FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create product color group members" ON product_color_group_members;
CREATE POLICY "Authenticated users can create product color group members"
  ON product_color_group_members FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update product color group members" ON product_color_group_members;
CREATE POLICY "Authenticated users can update product color group members"
  ON product_color_group_members FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete product color group members" ON product_color_group_members;
CREATE POLICY "Authenticated users can delete product color group members"
  ON product_color_group_members FOR DELETE
  TO authenticated
  USING (true);
