ALTER TABLE tickets
    ADD COLUMN created_at_utc TIMESTAMP(6) NULL,
    ADD COLUMN last_modified_utc TIMESTAMP(6) NULL,
    ADD COLUMN last_modified_status_date_utc TIMESTAMP(6) NULL,
    ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

ALTER TABLE status_history
    ADD COLUMN timestamp_utc TIMESTAMP(6) NULL,
    ADD COLUMN created_at_utc TIMESTAMP(6) NULL;

UPDATE tickets
SET created_at_utc = COALESCE(
        created_at_utc,
        DATE_SUB(reported_date, INTERVAL 330 MINUTE),
        DATE_SUB(last_modified, INTERVAL 330 MINUTE),
        UTC_TIMESTAMP(6)
    ),
    last_modified_utc = COALESCE(
        last_modified_utc,
        DATE_SUB(last_modified, INTERVAL 330 MINUTE),
        DATE_SUB(reported_date, INTERVAL 330 MINUTE),
        UTC_TIMESTAMP(6)
    ),
    last_modified_status_date_utc = CASE
        WHEN last_modified_status_date IS NULL THEN last_modified_status_date_utc
        ELSE COALESCE(
            last_modified_status_date_utc,
            DATE_SUB(last_modified_status_date, INTERVAL 330 MINUTE)
        )
    END;

UPDATE status_history
SET timestamp_utc = COALESCE(
        timestamp_utc,
        DATE_SUB(timestamp, INTERVAL 330 MINUTE),
        UTC_TIMESTAMP(6)
    ),
    created_at_utc = COALESCE(
        created_at_utc,
        timestamp_utc,
        DATE_SUB(timestamp, INTERVAL 330 MINUTE),
        UTC_TIMESTAMP(6)
    );
