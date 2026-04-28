ALTER TABLE gallery_images
ADD COLUMN IF NOT EXISTS position INTEGER;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS new_position
  FROM gallery_images
)
UPDATE gallery_images
SET position = ranked.new_position
FROM ranked
WHERE gallery_images.id = ranked.id
  AND gallery_images.position IS NULL;

ALTER TABLE gallery_images
ALTER COLUMN position SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_gallery_images_position ON gallery_images(position);
