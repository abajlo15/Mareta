-- Prebaci products.category (TEXT) u products.categories (TEXT[])
ALTER TABLE products
ADD COLUMN IF NOT EXISTS categories TEXT[] NOT NULL DEFAULT '{}';

-- Migracija postojećih vrijednosti poput "Muška kolekcija, Ženska kolekcija"
UPDATE products
SET categories = ARRAY(
  SELECT trim(value)
  FROM unnest(string_to_array(COALESCE(category, ''), ',')) AS value
  WHERE trim(value) <> ''
)
WHERE category IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_categories ON products USING GIN(categories);
