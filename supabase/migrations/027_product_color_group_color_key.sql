ALTER TABLE product_color_group_members
  ADD COLUMN IF NOT EXISTS color_key TEXT;
