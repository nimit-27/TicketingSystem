CREATE TABLE IF NOT EXISTS ticket_cr_history_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    table_name VARCHAR(100) NOT NULL DEFAULT 'ticket_cr',
    column_name VARCHAR(100) NOT NULL,
    display_label VARCHAR(255) NOT NULL,
    change_type_code VARCHAR(50) NOT NULL,
    is_trackable BOOLEAN NOT NULL DEFAULT TRUE,
    is_filterable BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_table_column (table_name, column_name)
);

INSERT INTO ticket_cr_history_config (table_name, column_name, display_label, change_type_code, is_trackable, is_filterable, display_order)
VALUES
('ticket_cr', 'subject', 'Subject Updated', 'SUBJECT_CHANGE', TRUE, TRUE, 10),
('ticket_cr', 'description', 'Description Updated', 'DESCRIPTION_CHANGE', TRUE, TRUE, 20),
('ticket_cr', 'status_id', 'Ticket Status Changed', 'TICKET_STATUS_CHANGE', TRUE, TRUE, 30),
('ticket_cr', 'cr_status_id', 'CR Status Changed', 'CR_STATUS_CHANGE', TRUE, TRUE, 40),
('ticket_cr', 'requested_by', 'Requested By Changed', 'REQUESTED_BY_CHANGE', TRUE, TRUE, 50),
('ticket_cr', 'assigned_to', 'Assigned To Changed', 'ASSIGNED_TO_CHANGE', TRUE, TRUE, 60),
('ticket_cr', 'assigned_by', 'Assigned By Changed', 'ASSIGNED_BY_CHANGE', TRUE, TRUE, 70),
('ticket_cr', 'remarks', 'Remarks Updated', 'REMARKS_CHANGE', FALSE, TRUE, 80),
('ticket_cr', 'updated_by', 'Updated By', 'UPDATED_BY', FALSE, TRUE, 90),
('ticket_cr', 'updated_on', 'Updated On', 'UPDATED_ON', FALSE, TRUE, 100),
('ticket_cr', 'created_by', 'Created By', 'CREATED_BY', FALSE, TRUE, 110),
('ticket_cr', 'created_date', 'Created Date', 'CREATED_DATE', FALSE, TRUE, 120)
ON DUPLICATE KEY UPDATE
    display_label = VALUES(display_label),
    change_type_code = VALUES(change_type_code),
    is_trackable = VALUES(is_trackable),
    is_filterable = VALUES(is_filterable),
    display_order = VALUES(display_order),
    updated_on = CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS ticket_cr_history (
    history_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    change_group_id VARCHAR(100) NOT NULL,
    ticket_cr_id VARCHAR(20) NOT NULL,
    ticket_id VARCHAR(255) NOT NULL,
    column_name VARCHAR(100) NOT NULL,
    change_type_code VARCHAR(50) NOT NULL,
    display_label VARCHAR(255) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by VARCHAR(255) NOT NULL,
    changed_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT
);

CREATE INDEX idx_ticket_cr_history_ticket_cr_id ON ticket_cr_history(ticket_cr_id);
CREATE INDEX idx_ticket_cr_history_ticket_id ON ticket_cr_history(ticket_id);
CREATE INDEX idx_ticket_cr_history_change_group_id ON ticket_cr_history(change_group_id);
CREATE INDEX idx_ticket_cr_history_change_type_code ON ticket_cr_history(change_type_code);
CREATE INDEX idx_ticket_cr_history_changed_on ON ticket_cr_history(changed_on);
