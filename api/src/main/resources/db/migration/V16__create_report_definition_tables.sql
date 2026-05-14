CREATE TABLE IF NOT EXISTS report_master (
    report_id BIGSERIAL PRIMARY KEY,
    report_code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    data_key VARCHAR(255) NOT NULL,
    source_type VARCHAR(100) NOT NULL,
    source_ref TEXT NOT NULL,
    template_location TEXT,
    template_type VARCHAR(100),
    default_output_format VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS report_filter_definition (
    filter_id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL REFERENCES report_master(report_id) ON DELETE CASCADE,
    filter_key VARCHAR(255) NOT NULL,
    filter_type VARCHAR(100) NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    default_value TEXT,
    option_source_type VARCHAR(100),
    option_source_ref TEXT,
    display_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_report_filter UNIQUE (report_id, filter_key)
);

CREATE TABLE IF NOT EXISTS report_column_definition (
    column_id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL REFERENCES report_master(report_id) ON DELETE CASCADE,
    column_key VARCHAR(255) NOT NULL,
    column_label VARCHAR(255) NOT NULL,
    data_type VARCHAR(100) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT TRUE,
    is_selectable BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_report_column UNIQUE (report_id, column_key)
);

CREATE TABLE IF NOT EXISTS report_request_history (
    request_id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL REFERENCES report_master(report_id),
    requested_by BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    output_format VARCHAR(50) NOT NULL,
    selected_columns_json JSONB,
    filters_json JSONB,
    engine_name VARCHAR(255),
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    error_message TEXT,
    expires_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS report_artifact (
    artifact_id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL REFERENCES report_request_history(request_id) ON DELETE CASCADE,
    file_name VARCHAR(512) NOT NULL,
    content_type VARCHAR(255),
    file_size BIGINT,
    storage_location TEXT NOT NULL,
    checksum VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    download_count INTEGER NOT NULL DEFAULT 0,
    last_downloaded_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_report_filter_definition_report_id
    ON report_filter_definition(report_id);

CREATE INDEX IF NOT EXISTS idx_report_column_definition_report_id
    ON report_column_definition(report_id);

CREATE INDEX IF NOT EXISTS idx_report_request_history_report_id
    ON report_request_history(report_id);

CREATE INDEX IF NOT EXISTS idx_report_request_history_status
    ON report_request_history(status);

CREATE INDEX IF NOT EXISTS idx_report_artifact_request_id
    ON report_artifact(request_id);
