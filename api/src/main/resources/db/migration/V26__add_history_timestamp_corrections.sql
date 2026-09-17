ALTER TABLE status_history
    ADD COLUMN original_timestamp TIMESTAMP NULL AFTER timestamp,
    ADD COLUMN updated_timestamp TIMESTAMP NULL AFTER original_timestamp;

UPDATE status_history
SET original_timestamp = timestamp
WHERE original_timestamp IS NULL;

ALTER TABLE ticket_history
    ADD COLUMN original_timestamp TIMESTAMP NULL AFTER updated_on_utc,
    ADD COLUMN updated_timestamp TIMESTAMP NULL AFTER original_timestamp;

UPDATE ticket_history
SET original_timestamp = updated_on
WHERE original_timestamp IS NULL;
