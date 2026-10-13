ALTER TABLE tickets
ADD COLUMN resolved_at DATETIME(6) AFTER last_modified_status_date_utc,
ADD COLUMN resolved_at_utc TIMESTAMP(6) AFTER resolved_at,
ADD COLUMN closed_at DATETIME(6) AFTER resolved_at_utc,
ADD COLUMN closed_at_utc TIMESTAMP(6) AFTER closed_at;



DESC TICKETS;