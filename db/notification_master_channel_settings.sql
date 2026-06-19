-- NOTIFICATION_MASTER_CHANGE: Standalone deployment query for application-wide channel defaults.
INSERT INTO app_runtime_config (config_key, config_value)
VALUES
    ('notification.channel.email', 'true'),
    ('notification.channel.in_app', 'true'),
    ('notification.channel.sms', 'true')
ON DUPLICATE KEY UPDATE config_value = config_value;

-- NOTIFICATION_MASTER_CHANGE: Example operational query to enable/disable a channel immediately.
UPDATE app_runtime_config
SET config_value = 'false', updated_at = CURRENT_TIMESTAMP
WHERE config_key = 'notification.channel.sms';
