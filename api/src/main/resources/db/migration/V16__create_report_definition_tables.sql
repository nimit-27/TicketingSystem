CREATE TABLE IF NOT EXISTS report_master (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    report_code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    data_key VARCHAR(255) NOT NULL,
    source_type VARCHAR(100) NOT NULL,
    source_ref TEXT NOT NULL,
    template_location TEXT,
    template_type VARCHAR(100),
    default_output_format VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM'
);

------------------------------------------------------

CREATE TABLE IF NOT EXISTS report_filter_mapping (
    filter_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_id BIGINT NOT NULL,
    display_order INT NOT NULL DEFAULT 1,
    filter_key VARCHAR(255) NOT NULL,
    filter_type VARCHAR(100) NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    default_value TEXT,
    option_source_type VARCHAR(100),
    option_source_ref TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    CONSTRAINT uk_report_filter UNIQUE (report_id, filter_key),
    FOREIGN KEY (report_id) REFERENCES report_master(report_id) ON DELETE CASCADE
);

------------------------------------------------------

CREATE TABLE IF NOT EXISTS report_column_mapping (
    column_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_id BIGINT NOT NULL,
    column_key VARCHAR(255) NOT NULL,
    column_label VARCHAR(255) NOT NULL,
    data_type VARCHAR(100) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT TRUE,
    is_selectable BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    CONSTRAINT uk_report_column UNIQUE (report_id, column_key),
    FOREIGN KEY (report_id) REFERENCES report_master(report_id) ON DELETE CASCADE
);

------------------------------------------------------

CREATE TABLE IF NOT EXISTS report_request_history (
    request_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_id BIGINT NOT NULL,
    requested_by BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    output_format VARCHAR(50) NOT NULL,
    selected_columns_json JSON,
    filters_json JSON,
    engine_name VARCHAR(255),
    requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    started_at DATETIME,
    completed_at DATETIME,
    failed_at DATETIME,
    error_message TEXT,
    expires_at DATETIME,
    FOREIGN KEY (report_id) REFERENCES report_master(report_id)
);

------------------------------------------------------

CREATE TABLE IF NOT EXISTS report_artifact (
    artifact_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT NOT NULL,
    file_name VARCHAR(512) NOT NULL,
    content_type VARCHAR(255),
    file_size BIGINT,
    storage_location TEXT NOT NULL,
    checksum VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    download_count INT NOT NULL DEFAULT 0,
    last_downloaded_at DATETIME,
    FOREIGN KEY (request_id) REFERENCES report_request_history(request_id) ON DELETE CASCADE
);

------------------------------------------------------

CREATE INDEX idx_report_filter_mapping_report_id
ON report_filter_mapping(report_id);

CREATE INDEX idx_report_column_mapping_report_id
ON report_column_mapping(report_id);

CREATE INDEX idx_report_request_history_report_id
ON report_request_history(report_id);

CREATE INDEX idx_report_request_history_status
ON report_request_history(status);

CREATE INDEX idx_report_artifact_request_id
ON report_artifact(request_id);