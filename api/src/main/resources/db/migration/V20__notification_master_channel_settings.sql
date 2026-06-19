-- NOTIFICATION_MASTER_CHANGE: Seed application-wide notification channel switches without overwriting existing choices.
INSERT INTO app_runtime_config (config_key, config_value)
VALUES
    ('notification.channel.email', 'true'),
    ('notification.channel.in_app', 'true'),
    ('notification.channel.sms', 'true')
ON DUPLICATE KEY UPDATE config_value = config_value;

-- NOTIFICATION_MASTER_CHANGE: Register Notification Master in the permission/page catalogue.
INSERT INTO page_master (
    page_name, page_code, page_description, parent_id, is_active, is_on_sidebar,
    created_on, created_by, updated_on, updated_by
)
SELECT
    'Notification Master', 'notificationMaster', 'Application-wide notification channel settings',
    NULL, TRUE, TRUE, NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (
    SELECT 1 FROM page_master WHERE page_code = 'notificationMaster'
);

-- NOTIFICATION_MASTER_CHANGE: Add the permission object beside existing sidebar options and inherit Role Master access.
UPDATE role_permission_config
SET permissions = JSON_SET(
    permissions,
    '$.sidebar.children.notificationMaster',
    JSON_OBJECT(
        'show', COALESCE(JSON_EXTRACT(permissions, '$.sidebar.children.roleMaster.show'), FALSE),
        'metadata', JSON_OBJECT('name', 'Notification Master', 'type', 'menu')
    ),
    '$.pages.children.notificationMaster',
    JSON_OBJECT(
        'show', COALESCE(JSON_EXTRACT(permissions, '$.pages.children.roleMaster.show'), FALSE),
        'metadata', JSON_OBJECT('name', 'Notification Master', 'type', 'page')
    )
)
WHERE JSON_VALID(permissions);
