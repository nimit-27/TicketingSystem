CREATE TABLE IF NOT EXISTS role_notification_channel_mapping (
    mapping_id BIGINT NOT NULL AUTO_INCREMENT,
    role_id INT NOT NULL,
    notification_type_id INT NOT NULL,
    channel_code VARCHAR(20) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    created_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (mapping_id),
    CONSTRAINT uq_role_notification_channel_mapping UNIQUE (role_id, notification_type_id, channel_code),
    CONSTRAINT fk_rncm_role FOREIGN KEY (role_id) REFERENCES role_permission_config(role_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_rncm_notification_type FOREIGN KEY (notification_type_id) REFERENCES notification_master(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_rncm_role_notification_active
ON role_notification_channel_mapping(role_id, notification_type_id, is_active);

CREATE INDEX idx_rncm_notification_channel_active
ON role_notification_channel_mapping(notification_type_id, channel_code, is_active);
