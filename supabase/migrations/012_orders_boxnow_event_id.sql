ALTER TABLE orders
ADD COLUMN IF NOT EXISTS boxnow_last_event_id TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_boxnow_last_event_id ON orders(boxnow_last_event_id);
