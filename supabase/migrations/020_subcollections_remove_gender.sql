ALTER TABLE subcollections
DROP CONSTRAINT IF EXISTS subcollections_gender_name_key;

ALTER TABLE subcollections
DROP CONSTRAINT IF EXISTS subcollections_gender_check;

DROP INDEX IF EXISTS idx_subcollections_gender;

ALTER TABLE subcollections
DROP COLUMN IF EXISTS gender;

ALTER TABLE subcollections
DROP CONSTRAINT IF EXISTS subcollections_collection_id_name_key;

ALTER TABLE subcollections
ADD CONSTRAINT subcollections_collection_id_name_key UNIQUE (collection_id, name);
