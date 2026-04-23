ALTER TABLE products
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_discount_percentage_check'
  ) THEN
    ALTER TABLE products
    ADD CONSTRAINT products_discount_percentage_check
    CHECK (discount_percentage >= 0 AND discount_percentage <= 100);
  END IF;
END $$;
