ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_provider TEXT NOT NULL DEFAULT 'internal';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_shipping_provider_check'
  ) THEN
    ALTER TABLE orders
    ADD CONSTRAINT orders_shipping_provider_check
    CHECK (shipping_provider IN ('internal', 'boxnow'));
  END IF;
END $$;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_method TEXT NOT NULL DEFAULT 'standard';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_shipping_method_check'
  ) THEN
    ALTER TABLE orders
    ADD CONSTRAINT orders_shipping_method_check
    CHECK (shipping_method IN ('standard', 'boxnow_locker'));
  END IF;
END $$;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS boxnow_locker_id TEXT,
ADD COLUMN IF NOT EXISTS boxnow_locker_name TEXT,
ADD COLUMN IF NOT EXISTS boxnow_locker_address TEXT,
ADD COLUMN IF NOT EXISTS boxnow_parcel_id TEXT,
ADD COLUMN IF NOT EXISTS boxnow_reference_number TEXT,
ADD COLUMN IF NOT EXISTS boxnow_payment_mode TEXT,
ADD COLUMN IF NOT EXISTS boxnow_amount_to_be_collected NUMERIC(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS boxnow_label_url TEXT,
ADD COLUMN IF NOT EXISTS boxnow_label_fetched_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS boxnow_last_event TEXT,
ADD COLUMN IF NOT EXISTS boxnow_last_event_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS boxnow_sync_status TEXT NOT NULL DEFAULT 'not_required',
ADD COLUMN IF NOT EXISTS boxnow_sync_error TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_boxnow_payment_mode_check'
  ) THEN
    ALTER TABLE orders
    ADD CONSTRAINT orders_boxnow_payment_mode_check
    CHECK (boxnow_payment_mode IS NULL OR boxnow_payment_mode IN ('prepaid', 'cod'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_boxnow_sync_status_check'
  ) THEN
    ALTER TABLE orders
    ADD CONSTRAINT orders_boxnow_sync_status_check
    CHECK (boxnow_sync_status IN ('not_required', 'pending', 'synced', 'failed'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_shipping_provider ON orders(shipping_provider);
CREATE INDEX IF NOT EXISTS idx_orders_boxnow_parcel_id ON orders(boxnow_parcel_id);
CREATE INDEX IF NOT EXISTS idx_orders_boxnow_sync_status ON orders(boxnow_sync_status);
