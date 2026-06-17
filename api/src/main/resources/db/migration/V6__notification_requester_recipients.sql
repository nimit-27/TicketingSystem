ALTER TABLE notification_recipient
    ALTER COLUMN recipient_user_id DROP NOT NULL;

ALTER TABLE notification_recipient
    ADD COLUMN requester_recipient_user_id VARCHAR(255) NULL;

CREATE INDEX idx_nr_requester_inbox
    ON notification_recipient (requester_recipient_user_id, is_read, created_at);
