INSERT INTO role_notification_channel_mapping (
    role_id,
    notification_type_id,
    channel_code,
    is_active,
    created_by,
    updated_by
)
SELECT
    role_config.role_id,
    notification_master.id AS notification_type_id,
    default_channel.channel_code,
    TRUE AS is_active,
    'SYSTEM' AS created_by,
    'SYSTEM' AS updated_by
FROM role_permission_config role_config
CROSS JOIN notification_master notification_master
JOIN JSON_TABLE(
    COALESCE(notification_master.default_channels, JSON_ARRAY()),
    '$[*]' COLUMNS (
        channel_code VARCHAR(20) PATH '$'
    )
) default_channel
WHERE role_config.is_deleted = 0
  AND notification_master.is_active = b'1'
  AND NOT EXISTS (
      SELECT 1
      FROM role_notification_channel_mapping existing_mapping
      WHERE existing_mapping.role_id = role_config.role_id
        AND existing_mapping.notification_type_id = notification_master.id
        AND existing_mapping.channel_code = default_channel.channel_code
  );
