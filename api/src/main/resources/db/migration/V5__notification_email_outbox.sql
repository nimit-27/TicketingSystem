ALTER TABLE notification_master
    ADD COLUMN email_personalized TINYINT(1) NOT NULL DEFAULT 1;

ALTER TABLE notification_recipient
    ADD COLUMN channel VARCHAR(20) NOT NULL DEFAULT 'IN_APP',
    ADD COLUMN status VARCHAR(20) NULL,
    ADD COLUMN retry_count INT NOT NULL DEFAULT 0,
    ADD COLUMN next_retry_at DATETIME NULL,
    ADD COLUMN last_error VARCHAR(2000) NULL,
    ADD COLUMN locked_by VARCHAR(100) NULL,
    ADD COLUMN locked_at DATETIME NULL,
    ADD COLUMN sent_at DATETIME NULL,
    ADD COLUMN email_cc TEXT NULL,
    ADD COLUMN email_bcc TEXT NULL;

CREATE INDEX idx_nr_status_retry ON notification_recipient (status, next_retry_at);
CREATE INDEX idx_nr_notification_status ON notification_recipient (notification_id, status);
