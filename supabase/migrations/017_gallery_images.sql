CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gallery images are viewable by everyone" ON gallery_images;
CREATE POLICY "Gallery images are viewable by everyone"
  ON gallery_images FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create gallery images" ON gallery_images;
CREATE POLICY "Authenticated users can create gallery images"
  ON gallery_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete gallery images" ON gallery_images;
CREATE POLICY "Authenticated users can delete gallery images"
  ON gallery_images FOR DELETE
  TO authenticated
  USING (true);
