ALTER TABLE products
ADD COLUMN IF NOT EXISTS audience TEXT;

UPDATE products
SET audience = CASE
  WHEN EXISTS (
    SELECT 1
    FROM unnest(COALESCE(products.categories, ARRAY[]::TEXT[])) AS category
    WHERE translate(lower(category), 'šđčćž', 'sdccz') LIKE '%musk%'
  )
  AND EXISTS (
    SELECT 1
    FROM unnest(COALESCE(products.categories, ARRAY[]::TEXT[])) AS category
    WHERE translate(lower(category), 'šđčćž', 'sdccz') LIKE '%zensk%'
  ) THEN 'both'
  WHEN EXISTS (
    SELECT 1
    FROM unnest(COALESCE(products.categories, ARRAY[]::TEXT[])) AS category
    WHERE translate(lower(category), 'šđčćž', 'sdccz') LIKE '%unisex%'
      OR translate(lower(category), 'šđčćž', 'sdccz') LIKE '%uni sex%'
      OR translate(lower(category), 'šđčćž', 'sdccz') LIKE '%oboje%'
  ) THEN 'both'
  WHEN EXISTS (
    SELECT 1
    FROM unnest(COALESCE(products.categories, ARRAY[]::TEXT[])) AS category
    WHERE translate(lower(category), 'šđčćž', 'sdccz') LIKE '%musk%'
  ) THEN 'male'
  WHEN EXISTS (
    SELECT 1
    FROM unnest(COALESCE(products.categories, ARRAY[]::TEXT[])) AS category
    WHERE translate(lower(category), 'šđčćž', 'sdccz') LIKE '%zensk%'
  ) THEN 'female'
  ELSE 'both'
END
WHERE audience IS NULL;

ALTER TABLE products
ALTER COLUMN audience SET DEFAULT 'both';

ALTER TABLE products
ALTER COLUMN audience SET NOT NULL;

ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_audience_check;

ALTER TABLE products
ADD CONSTRAINT products_audience_check
CHECK (audience IN ('male', 'female', 'both'));

ALTER TABLE subcollections
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

UPDATE subcollections
SET gender = 'male'
WHERE gender IS NULL;

ALTER TABLE subcollections
ALTER COLUMN gender SET NOT NULL;

ALTER TABLE subcollections
DROP CONSTRAINT IF EXISTS subcollections_gender_check;

ALTER TABLE subcollections
ADD CONSTRAINT subcollections_gender_check
CHECK (gender IN ('male', 'female'));

ALTER TABLE subcollections
DROP CONSTRAINT IF EXISTS subcollections_name_key;

ALTER TABLE subcollections
ADD CONSTRAINT subcollections_gender_name_key UNIQUE (gender, name);

CREATE INDEX IF NOT EXISTS idx_products_audience ON products(audience);
CREATE INDEX IF NOT EXISTS idx_subcollections_gender ON subcollections(gender);
