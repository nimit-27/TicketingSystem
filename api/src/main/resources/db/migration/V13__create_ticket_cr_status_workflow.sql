CREATE TABLE IF NOT EXISTS ticket_cr_status_workflow (
    crsw_id VARCHAR(20) PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    current_status_id VARCHAR(20) NOT NULL,
    next_status_id VARCHAR(20) NOT NULL,
    created_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_ticket_cr_status_workflow_current_status FOREIGN KEY (current_status_id)
        REFERENCES cr_status_master (cr_status_id),
    CONSTRAINT fk_ticket_cr_status_workflow_next_status FOREIGN KEY (next_status_id)
        REFERENCES cr_status_master (cr_status_id)
);

INSERT INTO ticket_cr_status_workflow
    (crsw_id, action, current_status_id, next_status_id)
VALUES
    ('CRSW-1', 'Reject CR', 'CRS-1', 'CRS-3'),
    ('CRSW-2', 'Approve CR', 'CRS-1', 'CRS-2');
