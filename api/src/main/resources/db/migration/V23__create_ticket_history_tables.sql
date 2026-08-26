CREATE TABLE IF NOT EXISTS ticket_history_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    table_name VARCHAR(100) NOT NULL DEFAULT 'tickets',
    column_name VARCHAR(100) NOT NULL,
    display_label VARCHAR(255) NOT NULL,
    update_type_code VARCHAR(50) NOT NULL,
    is_trackable BOOLEAN NOT NULL DEFAULT TRUE,
    is_filterable BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_ticket_history_config_table_column (table_name, column_name)
);

INSERT INTO ticket_history_config (table_name, column_name, display_label, update_type_code, is_trackable, is_filterable, display_order)
VALUES
('tickets', 'subject', 'Subject Updated', 'SUBJECT_UPDATE', TRUE, TRUE, 10),
('tickets', 'description', 'Description Updated', 'DESCRIPTION_UPDATE', TRUE, TRUE, 20),
('tickets', 'status_id', 'Status Updated', 'STATUS_UPDATE', TRUE, TRUE, 30),
('tickets', 'assigned_to', 'Assigned To Updated', 'ASSIGNED_TO_UPDATE', TRUE, TRUE, 40),
('tickets', 'assigned_by', 'Assigned By Updated', 'ASSIGNED_BY_UPDATE', TRUE, TRUE, 50),
('tickets', 'priority', 'Priority Updated', 'PRIORITY_UPDATE', TRUE, TRUE, 60),
('tickets', 'severity', 'Severity Updated', 'SEVERITY_UPDATE', TRUE, TRUE, 70),
('tickets', 'recommended_severity', 'Recommended Severity Updated', 'RECOMMENDED_SEVERITY_UPDATE', TRUE, TRUE, 80),
('tickets', 'severity_recommended_by', 'Severity Recommended By Updated', 'SEVERITY_RECOMMENDED_BY_UPDATE', TRUE, TRUE, 90),
('tickets', 'impact', 'Impact Updated', 'IMPACT_UPDATE', TRUE, TRUE, 100),
('tickets', 'category', 'Category Updated', 'CATEGORY_UPDATE', TRUE, TRUE, 110),
('tickets', 'sub_category', 'Sub Category Updated', 'SUB_CATEGORY_UPDATE', TRUE, TRUE, 120),
('tickets', 'issue_type_id', 'Issue Type Updated', 'ISSUE_TYPE_UPDATE', TRUE, TRUE, 130),
('tickets', 'division', 'Division Updated', 'DIVISION_UPDATE', TRUE, TRUE, 140),
('tickets', 'assigned_to_level', 'Assigned To Level Updated', 'ASSIGNED_TO_LEVEL_UPDATE', TRUE, TRUE, 150),
('tickets', 'level_id', 'Level Updated', 'LEVEL_UPDATE', FALSE, TRUE, 160),
('tickets', 'office', 'Office Updated', 'OFFICE_UPDATE', TRUE, TRUE, 170),
('tickets', 'office_code', 'Office Code Updated', 'OFFICE_CODE_UPDATE', TRUE, TRUE, 180),
('tickets', 'region_code', 'Region Updated', 'REGION_UPDATE', TRUE, TRUE, 190),
('tickets', 'zone_code', 'Zone Updated', 'ZONE_UPDATE', TRUE, TRUE, 200),
('tickets', 'district_code', 'District Updated', 'DISTRICT_UPDATE', TRUE, TRUE, 210),
('tickets', 'depot_code', 'Depot Updated', 'DEPOT_UPDATE', TRUE, TRUE, 220),
('tickets', 'master_id', 'Master Ticket Updated', 'MASTER_TICKET_UPDATE', TRUE, TRUE, 230),
('tickets', 'is_master', 'Master Flag Updated', 'MASTER_FLAG_UPDATE', TRUE, TRUE, 240),
('tickets', 'is_assigned_back_from_fci', 'Assigned Back From FCI Updated', 'ASSIGNED_BACK_FROM_FCI_UPDATE', TRUE, TRUE, 250),
('tickets', 'updated_by', 'Updated By', 'UPDATED_BY', FALSE, TRUE, 260),
('tickets', 'last_modified', 'Updated On', 'UPDATED_ON', FALSE, TRUE, 270)
ON DUPLICATE KEY UPDATE
    display_label = VALUES(display_label),
    update_type_code = VALUES(update_type_code),
    is_trackable = VALUES(is_trackable),
    is_filterable = VALUES(is_filterable),
    display_order = VALUES(display_order),
    updated_on = CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS ticket_history (
    ticket_history_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    update_group_id VARCHAR(100) NOT NULL,
    ticket_id VARCHAR(255) NOT NULL,
    column_name VARCHAR(100) NOT NULL,
    update_type_code VARCHAR(50) NOT NULL,
    display_label VARCHAR(255) NOT NULL,
    old_ref_id VARCHAR(255) NULL,
    new_ref_id VARCHAR(255) NULL,
    old_value TEXT,
    new_value TEXT,
    updated_by VARCHAR(255) NOT NULL,
    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_on_utc TIMESTAMP NULL,
    remarks TEXT,
    source_table VARCHAR(100) NULL,
    source_history_id VARCHAR(100) NULL,
    source_column_name VARCHAR(100) NULL,
    UNIQUE KEY uk_ticket_history_source (source_table, source_history_id, source_column_name)
);

CREATE INDEX idx_ticket_history_ticket_id ON ticket_history(ticket_id);
CREATE INDEX idx_ticket_history_update_group_id ON ticket_history(update_group_id);
CREATE INDEX idx_ticket_history_update_type_code ON ticket_history(update_type_code);
CREATE INDEX idx_ticket_history_updated_on ON ticket_history(updated_on);
CREATE INDEX idx_ticket_history_updated_on_utc ON ticket_history(updated_on_utc);
