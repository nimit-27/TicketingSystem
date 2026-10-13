INSERT INTO ticket_history_config
    (table_name, column_name, display_label, update_type_code, is_trackable, is_filterable, display_order)
VALUES
    ('tickets', 'resolved_at', 'Resolved At Updated', 'RESOLVED_AT_UPDATE', TRUE, TRUE, 280),
    ('tickets', 'resolved_at_utc', 'Resolved At UTC Updated', 'RESOLVED_AT_UTC_UPDATE', TRUE, TRUE, 290),
    ('tickets', 'closed_at', 'Closed At Updated', 'CLOSED_AT_UPDATE', TRUE, TRUE, 300),
    ('tickets', 'closed_at_utc', 'Closed At UTC Updated', 'CLOSED_AT_UTC_UPDATE', TRUE, TRUE, 310)
ON DUPLICATE KEY UPDATE column_name = VALUES(column_name);
