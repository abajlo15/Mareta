ALTER TABLE orders
ADD COLUMN IF NOT EXISTS boxnow_calculated_weight NUMERIC(10,3);
