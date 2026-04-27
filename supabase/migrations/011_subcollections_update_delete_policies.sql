DROP POLICY IF EXISTS "Authenticated users can update subcollections" ON subcollections;
CREATE POLICY "Authenticated users can update subcollections"
  ON subcollections FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete subcollections" ON subcollections;
CREATE POLICY "Authenticated users can delete subcollections"
  ON subcollections FOR DELETE
  TO authenticated
  USING (true);
