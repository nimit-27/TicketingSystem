CREATE TABLE IF NOT EXISTS app_runtime_config (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO app_runtime_config (config_key, config_value)
VALUES ('notification.enabled', 'true')
ON DUPLICATE KEY UPDATE config_value = config_value;
