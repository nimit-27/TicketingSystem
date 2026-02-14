CREATE TABLE IF NOT EXISTS trigger_job (
    trigger_job_id BIGINT NOT NULL AUTO_INCREMENT,
    trigger_job_code VARCHAR(80) NOT NULL,
    trigger_job_name VARCHAR(120) NOT NULL,
    batch_size INT NOT NULL,
    trigger_period VARCHAR(20) NOT NULL,
    cron_expression VARCHAR(120) NULL,
    running BIT(1) NOT NULL DEFAULT b'0',
    PRIMARY KEY (trigger_job_id),
    UNIQUE KEY uk_trigger_job_code (trigger_job_code)
);

INSERT INTO trigger_job (
    trigger_job_code,
    trigger_job_name,
    batch_size,
    trigger_period,
    cron_expression,
    running
)
SELECT 'sla_job', 'SLA Job', 100, 'PERIODIC', '0 0 */4 * * *', b'0'
WHERE NOT EXISTS (SELECT 1 FROM trigger_job WHERE trigger_job_code = 'sla_job');

INSERT INTO trigger_job (
    trigger_job_code,
    trigger_job_name,
    batch_size,
    trigger_period,
    cron_expression,
    running
)
SELECT 'sla_job_from_scratch', 'SLA Job from Scratch', 100, 'MANUAL', NULL, b'0'
WHERE NOT EXISTS (SELECT 1 FROM trigger_job WHERE trigger_job_code = 'sla_job_from_scratch');
