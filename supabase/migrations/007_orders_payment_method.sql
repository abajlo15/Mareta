ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'card';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_payment_method_check'
  ) THEN
    ALTER TABLE orders
    ADD CONSTRAINT orders_payment_method_check
    CHECK (payment_method IN ('card', 'cash_on_delivery'));
  END IF;
END $$;
