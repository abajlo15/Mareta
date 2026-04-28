ALTER TABLE subcollections
ADD COLUMN IF NOT EXISTS collection_id UUID;

WITH preferred_collections AS (
  SELECT
    id,
    slug,
    name,
    ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS row_num
  FROM collections
),
fallback_collection AS (
  SELECT id
  FROM preferred_collections
  WHERE row_num = 1
),
male_collection AS (
  SELECT id
  FROM preferred_collections
  WHERE slug = 'muska'
     OR lower(name) LIKE '%muska%'
     OR lower(name) LIKE '%muska kolekcija%'
  ORDER BY row_num
  LIMIT 1
),
female_collection AS (
  SELECT id
  FROM preferred_collections
  WHERE slug = 'zenska'
     OR lower(name) LIKE '%zenska%'
     OR lower(name) LIKE '%zenska kolekcija%'
  ORDER BY row_num
  LIMIT 1
)
UPDATE subcollections s
SET collection_id = COALESCE(
  CASE
    WHEN s.gender = 'male' THEN (SELECT id FROM male_collection)
    WHEN s.gender = 'female' THEN (SELECT id FROM female_collection)
    ELSE NULL
  END,
  (SELECT id FROM fallback_collection)
)
WHERE s.collection_id IS NULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM subcollections WHERE collection_id IS NULL) THEN
    RAISE EXCEPTION 'Cannot set subcollections.collection_id to NOT NULL because some rows are still NULL.';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'subcollections_collection_id_fkey'
  ) THEN
    ALTER TABLE subcollections
    ADD CONSTRAINT subcollections_collection_id_fkey
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE RESTRICT;
  END IF;
END $$;

ALTER TABLE subcollections
ALTER COLUMN collection_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subcollections_collection_id ON subcollections(collection_id);
