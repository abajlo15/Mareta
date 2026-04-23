ALTER TABLE orders
ALTER COLUMN user_id DROP NOT NULL;

DROP POLICY IF EXISTS "Guests can create orders" ON orders;
CREATE POLICY "Guests can create orders"
  ON orders FOR INSERT
  WITH CHECK (user_id IS NULL);

DROP POLICY IF EXISTS "Guests can create order items" ON order_items;
CREATE POLICY "Guests can create order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id IS NULL
    )
  );
