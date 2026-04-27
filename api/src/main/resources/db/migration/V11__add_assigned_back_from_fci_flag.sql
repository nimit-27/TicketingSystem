ALTER TABLE tickets
    ADD COLUMN is_assigned_back_from_fci BOOLEAN NOT NULL DEFAULT FALSE;
