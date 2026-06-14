ALTER TABLE status_history
    DROP COLUMN IF EXISTS updated_at_utc;

ALTER TABLE tickets
    DROP COLUMN IF EXISTS updated_at_utc;
