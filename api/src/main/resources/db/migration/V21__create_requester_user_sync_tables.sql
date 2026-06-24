CREATE TABLE IF NOT EXISTS requester_user_sync_status_master (
    status_code VARCHAR(30) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description VARCHAR(255) DEFAULT NULL,
    terminal TINYINT(1) NOT NULL DEFAULT 0,
    retryable TINYINT(1) NOT NULL DEFAULT 0,
    active TINYINT(1) NOT NULL DEFAULT 1,
    sort_order INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (status_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO requester_user_sync_status_master
(status_code, display_name, description, terminal, retryable, active, sort_order) VALUES
('RECEIVED', 'Received', 'Record was received by the ingestion endpoint', 0, 0, 1, 10),
('VALIDATION_FAILED', 'Validation Failed', 'Record failed validation before or during processing', 1, 0, 1, 20),
('PENDING', 'Pending', 'Record is ready for scheduler processing', 0, 0, 1, 30),
('PROCESSING', 'Processing', 'Record is currently being processed by the scheduler', 0, 0, 1, 40),
('SUCCESS', 'Success', 'Record was successfully applied to requester_users', 1, 0, 1, 50),
('RETRYABLE_FAILED', 'Retryable Failed', 'Record processing failed and can be retried', 0, 1, 1, 60),
('PERMANENT_FAILED', 'Permanent Failed', 'Record failed permanently and will not be retried', 1, 0, 1, 70),
('SKIPPED_NO_CHANGE', 'Skipped No Change', 'Record was valid but did not change requester_users', 1, 0, 1, 80)
ON DUPLICATE KEY UPDATE
    display_name = VALUES(display_name),
    description = VALUES(description),
    terminal = VALUES(terminal),
    retryable = VALUES(retryable),
    active = VALUES(active),
    sort_order = VALUES(sort_order);

CREATE TABLE IF NOT EXISTS requester_user_external_identity (
    id BIGINT NOT NULL AUTO_INCREMENT,
    source_system VARCHAR(50) NOT NULL,
    external_user_id VARCHAR(100) NOT NULL,
    requester_user_id VARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_requester_user_external_identity_source_user (source_system, external_user_id),
    KEY idx_requester_user_external_identity_requester (requester_user_id),
    CONSTRAINT fk_requester_user_external_identity_requester
        FOREIGN KEY (requester_user_id) REFERENCES requester_users (requester_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS requester_user_sync_staging (
    id BIGINT NOT NULL AUTO_INCREMENT,
    batch_id VARCHAR(100) NOT NULL,
    source_system VARCHAR(50) NOT NULL,
    source_record_id VARCHAR(150) NOT NULL,
    external_user_id VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT NULL,
    requester_user_id VARCHAR(100) DEFAULT NULL,
    username VARCHAR(50) DEFAULT NULL,
    email_id VARCHAR(100) DEFAULT NULL,
    mobile_no VARCHAR(15) DEFAULT NULL,
    office_code VARCHAR(20) DEFAULT NULL,
    payload_json JSON NOT NULL,
    payload_hash CHAR(64) NOT NULL,
    idempotency_key VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL,
    retry_count INT NOT NULL DEFAULT 0,
    max_retries INT NOT NULL DEFAULT 3,
    error_code VARCHAR(100) DEFAULT NULL,
    error_message VARCHAR(1000) DEFAULT NULL,
    error_details_json JSON DEFAULT NULL,
    received_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processing_started_at DATETIME DEFAULT NULL,
    processed_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_requester_user_sync_staging_idempotency (idempotency_key),
    KEY idx_requester_user_sync_staging_pickup (status, retry_count, updated_at),
    KEY idx_requester_user_sync_staging_batch (source_system, batch_id),
    KEY idx_requester_user_sync_staging_external_user (source_system, external_user_id),
    KEY idx_requester_user_sync_staging_username (username),
    CONSTRAINT fk_requester_user_sync_staging_requester
        FOREIGN KEY (requester_user_id) REFERENCES requester_users (requester_user_id),
    CONSTRAINT fk_requester_user_sync_staging_status
        FOREIGN KEY (status) REFERENCES requester_user_sync_status_master (status_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
