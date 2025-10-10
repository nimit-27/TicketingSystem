SET @has_working_hours = (
    SELECT COUNT(*)
    FROM information_schema.TABLES
    WHERE table_schema = DATABASE()
      AND table_name = 'calendar_working_hours'
);

SET @update_working_hours = IF(
    @has_working_hours > 0,
    'UPDATE calendar_working_hours SET start_time = ''02:00:00'', end_time = ''02:05:00'' WHERE is_active = 1;',
    'SELECT 1'
);

PREPARE stmt FROM @update_working_hours;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_source_table = (
    SELECT COUNT(*)
    FROM information_schema.TABLES
    WHERE table_schema = DATABASE()
      AND table_name = 'calendar_source'
);

SET @upsert_source = IF(
    @has_source_table > 0,
    'INSERT INTO calendar_source (provider_code, base_url, api_key, enabled) VALUES (''NAGER_DATE'', ''https://date.nager.at'', NULL, 1) ON DUPLICATE KEY UPDATE base_url = VALUES(base_url), api_key = VALUES(api_key), enabled = VALUES(enabled);',
    'SELECT 1'
);

PREPARE stmt2 FROM @upsert_source;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;
