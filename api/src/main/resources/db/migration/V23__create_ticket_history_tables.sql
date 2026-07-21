CREATE TABLE IF NOT EXISTS ticket_history_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    table_name VARCHAR(100) NOT NULL DEFAULT 'tickets',
    column_name VARCHAR(100) NOT NULL,
    display_label VARCHAR(255) NOT NULL,
    change_type_code VARCHAR(50) NOT NULL,
    is_trackable BOOLEAN NOT NULL DEFAULT TRUE,
    is_filterable BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_ticket_history_config_table_column (table_name, column_name)
);

INSERT INTO ticket_history_config (table_name, column_name, display_label, change_type_code, is_trackable, is_filterable, display_order)
VALUES
('tickets', 'subject', 'Subject Updated', 'SUBJECT_CHANGE', TRUE, TRUE, 10),
('tickets', 'description', 'Description Updated', 'DESCRIPTION_CHANGE', TRUE, TRUE, 20),
('tickets', 'status_id', 'Status Changed', 'STATUS_CHANGE', TRUE, TRUE, 30),
('tickets', 'assigned_to', 'Assigned To Changed', 'ASSIGNED_TO_CHANGE', TRUE, TRUE, 40),
('tickets', 'assigned_by', 'Assigned By Changed', 'ASSIGNED_BY_CHANGE', TRUE, TRUE, 50),
('tickets', 'priority', 'Priority Changed', 'PRIORITY_CHANGE', TRUE, TRUE, 60),
('tickets', 'severity', 'Severity Changed', 'SEVERITY_CHANGE', TRUE, TRUE, 70),
('tickets', 'recommended_severity', 'Recommended Severity Changed', 'RECOMMENDED_SEVERITY_CHANGE', TRUE, TRUE, 80),
('tickets', 'severity_recommended_by', 'Severity Recommended By Changed', 'SEVERITY_RECOMMENDED_BY_CHANGE', TRUE, TRUE, 90),
('tickets', 'impact', 'Impact Changed', 'IMPACT_CHANGE', TRUE, TRUE, 100),
('tickets', 'category', 'Category Changed', 'CATEGORY_CHANGE', TRUE, TRUE, 110),
('tickets', 'sub_category', 'Sub Category Changed', 'SUB_CATEGORY_CHANGE', TRUE, TRUE, 120),
('tickets', 'issue_type_id', 'Issue Type Changed', 'ISSUE_TYPE_CHANGE', TRUE, TRUE, 130),
('tickets', 'division', 'Division Changed', 'DIVISION_CHANGE', TRUE, TRUE, 140),
('tickets', 'assigned_to_level', 'Assigned To Level Changed', 'ASSIGNED_TO_LEVEL_CHANGE', TRUE, TRUE, 150),
('tickets', 'level_id', 'Level Changed', 'LEVEL_CHANGE', TRUE, TRUE, 160),
('tickets', 'office', 'Office Changed', 'OFFICE_CHANGE', TRUE, TRUE, 170),
('tickets', 'office_code', 'Office Code Changed', 'OFFICE_CODE_CHANGE', TRUE, TRUE, 180),
('tickets', 'region_code', 'Region Changed', 'REGION_CHANGE', TRUE, TRUE, 190),
('tickets', 'zone_code', 'Zone Changed', 'ZONE_CHANGE', TRUE, TRUE, 200),
('tickets', 'district_code', 'District Changed', 'DISTRICT_CHANGE', TRUE, TRUE, 210),
('tickets', 'depot_code', 'Depot Changed', 'DEPOT_CHANGE', TRUE, TRUE, 220),
('tickets', 'master_id', 'Master Ticket Changed', 'MASTER_TICKET_CHANGE', TRUE, TRUE, 230),
('tickets', 'is_master', 'Master Flag Changed', 'MASTER_FLAG_CHANGE', TRUE, TRUE, 240),
('tickets', 'is_assigned_back_from_fci', 'Assigned Back From FCI Changed', 'ASSIGNED_BACK_FROM_FCI_CHANGE', TRUE, TRUE, 250),
('tickets', 'updated_by', 'Updated By', 'UPDATED_BY', FALSE, TRUE, 260),
('tickets', 'last_modified', 'Updated On', 'UPDATED_ON', FALSE, TRUE, 270)
ON DUPLICATE KEY UPDATE
    display_label = VALUES(display_label),
    change_type_code = VALUES(change_type_code),
    is_trackable = VALUES(is_trackable),
    is_filterable = VALUES(is_filterable),
    display_order = VALUES(display_order),
    updated_on = CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS ticket_history (
    history_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    change_group_id VARCHAR(100) NOT NULL,
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

CREATE INDEX idx_ticket_history_ticket_id ON ticket_history(ticket_id);
CREATE INDEX idx_ticket_history_change_group_id ON ticket_history(change_group_id);
CREATE INDEX idx_ticket_history_change_type_code ON ticket_history(change_type_code);
CREATE INDEX idx_ticket_history_changed_on ON ticket_history(changed_on);
