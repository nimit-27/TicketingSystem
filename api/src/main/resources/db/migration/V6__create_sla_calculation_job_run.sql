CREATE TABLE IF NOT EXISTS sla_calculation_job_run (
    sla_calculation_job_run_id VARCHAR(36) PRIMARY KEY,
    trigger_type VARCHAR(20) NOT NULL,
    run_status VARCHAR(40) NOT NULL,
    triggered_by VARCHAR(120) NULL,
    started_at DATETIME NOT NULL,
    completed_at DATETIME NULL,
    duration_ms BIGINT NULL,
    total_candidate_tickets BIGINT NULL,
    processed_tickets BIGINT NULL,
    succeeded_tickets BIGINT NULL,
    failed_tickets BIGINT NULL,
    batch_size INT NULL,
    error_summary VARCHAR(1000) NULL,
    INDEX idx_sla_job_run_started_at (started_at),
    INDEX idx_sla_job_run_status (run_status)
);
