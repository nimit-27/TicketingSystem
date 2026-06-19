INSERT INTO notification_master (
    code, name, description, default_title_tpl, default_message_tpl,
    email_template, sms_template, inapp_template, default_channels, is_active,
    created_at, updated_at
) VALUES (
    'TICKET_RESOLVED',
    'Ticket Resolved',
    'Notifies the requester when their ticket is resolved and asks for feedback.',
    'Ticket {{ticketId}} resolved',
    'Your ticket {{ticketId}} has been resolved. Please review the resolution within 72 hours and kindly provide the feedback.',
    'email/TicketResolved.ftl',
    'sms/TicketResolved',
    'ticket_resolved_inapp.html',
    '["EMAIL", "SMS", "IN_APP"]',
    b'1',
    NOW(6),
    NOW(6)
) ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description),
    default_title_tpl = VALUES(default_title_tpl),
    default_message_tpl = VALUES(default_message_tpl),
    email_template = VALUES(email_template),
    sms_template = VALUES(sms_template),
    inapp_template = VALUES(inapp_template),
    default_channels = VALUES(default_channels),
    is_active = b'1',
    updated_at = NOW(6);

INSERT INTO notification_master (
    code, name, description, default_title_tpl, default_message_tpl,
    email_template, sms_template, inapp_template, default_channels, is_active,
    created_at, updated_at
) VALUES (
    'TICKET_CLOSED',
    'Ticket Closed',
    'Notifies the requester when their ticket is closed and asks for feedback.',
    'Ticket {{ticketId}} closed',
    'Your ticket {{ticketId}} has been closed. Please review the closure and kindly provide the feedback.',
    'email/TicketClosed.ftl',
    'sms/TicketClosed',
    'ticket_closed_inapp.html',
    '["EMAIL", "SMS", "IN_APP"]',
    b'1',
    NOW(6),
    NOW(6)
) ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description),
    default_title_tpl = VALUES(default_title_tpl),
    default_message_tpl = VALUES(default_message_tpl),
    email_template = VALUES(email_template),
    sms_template = VALUES(sms_template),
    inapp_template = VALUES(inapp_template),
    default_channels = VALUES(default_channels),
    is_active = b'1',
    updated_at = NOW(6);

UPDATE notification_master
SET name = 'Ticket Assigned - Requester',
    description = 'Notifies the requester when their ticket assignment is updated.',
    default_title_tpl = 'Ticket {{ticketId}} assigned',
    default_message_tpl = 'Your ticket {{ticketId}} has been assigned to {{currentAssignee}}.',
    email_template = 'email/TicketAssignedRequester.ftl',
    inapp_template = 'ticket_assigned_requester_inapp.html',
    default_channels = '["EMAIL", "IN_APP"]',
    is_active = b'1',
    updated_at = NOW(6)
WHERE code = 'TICKET_ASSIGNED_REQUESTER';

INSERT INTO role_notification_channel_mapping (role_id, notification_type_id, channel_code, is_active, created_by, updated_by)
SELECT role_config.role_id, notification_master.id, default_channel.channel_code, TRUE, 'SYSTEM', 'SYSTEM'
FROM role_permission_config role_config
CROSS JOIN notification_master notification_master
JOIN JSON_TABLE(
    COALESCE(notification_master.default_channels, JSON_ARRAY()),
    '$[*]' COLUMNS (
        channel_code VARCHAR(20) PATH '$'
    )
) default_channel
WHERE role_config.is_deleted = 0
  AND notification_master.code IN ('TICKET_RESOLVED', 'TICKET_CLOSED')
  AND notification_master.is_active = b'1'
  AND NOT EXISTS (
      SELECT 1
      FROM role_notification_channel_mapping existing_mapping
      WHERE existing_mapping.role_id = role_config.role_id
        AND existing_mapping.notification_type_id = notification_master.id
        AND existing_mapping.channel_code = default_channel.channel_code
  );
