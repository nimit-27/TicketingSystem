ALTER TABLE sla_calculation_job_run
    ADD COLUMN scope VARCHAR(30) NOT NULL DEFAULT 'ACTIVE_ONLY' AFTER trigger_type;

UPDATE sla_calculation_job_run
SET scope = 'ACTIVE_ONLY'
WHERE scope IS NULL;
