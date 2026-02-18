ALTER TABLE tickets
    ADD COLUMN IF NOT EXISTS last_modified_status_date DATETIME NULL;
