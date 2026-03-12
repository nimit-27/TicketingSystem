-- 1) Division master table
CREATE TABLE IF NOT EXISTS division_master (
    division_id VARCHAR(20) PRIMARY KEY,
    division_name VARCHAR(255) NOT NULL,
    division_code VARCHAR(50),
    description VARCHAR(500),
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_on TIMESTAMP NULL,
    updated_by VARCHAR(100),
    is_active CHAR(1) DEFAULT '1'
);

-- Seed active divisions
INSERT INTO division_master (division_id, division_name, division_code, description, created_by, is_active)
VALUES
('DIV-001', 'Procurement Division', 'PROC', 'Procurement Division', 'SYSTEM', '1'),
('DIV-002', 'Storage Division', 'STRG', 'Storage Division', 'SYSTEM', '1'),
('DIV-003', 'Movement Division', 'MOVE', 'Movement Division', 'SYSTEM', '1'),
('DIV-004', 'Quality Division', 'QUAL', 'Quality Division', 'SYSTEM', '1'),
('DIV-005', 'Stocks/PV Division', 'STPV', 'Stocks/PV Division', 'SYSTEM', '1'),
('DIV-006', 'Sales Division', 'SALE', 'Sales Division', 'SYSTEM', '1'),
('DIV-007', 'Import & Export Division', 'IMEX', 'Import & Export Division', 'SYSTEM', '1'),
('DIV-008', 'IT Division', 'IT', 'IT Division', 'SYSTEM', '1'),
('DIV-009', 'General/House Keeping Division', 'GENHK', 'General/House Keeping Division', 'SYSTEM', '1'),
('DIV-010', 'Contract Division', 'CONT', 'Contract Division', 'SYSTEM', '1'),
('DIV-011', 'IRL Division', 'IRL', 'IRL Division', 'SYSTEM', '1'),
('DIV-012', 'Engineering & Maintenance (Civil & Mechanical)', 'ENMCM', 'Engineering & Maintenance (Civil & Mechanical)', 'SYSTEM', '1');

-- 2) Add division column to tickets
ALTER TABLE tickets
    ADD COLUMN division VARCHAR(20);

-- Optional FK for data integrity
ALTER TABLE tickets
    ADD CONSTRAINT fk_tickets_division
    FOREIGN KEY (division)
    REFERENCES division_master(division_id);

-- 3) Division history table
CREATE TABLE IF NOT EXISTS division_history (
    division_history_id VARCHAR(36) PRIMARY KEY,
    ticket_id VARCHAR(255) NOT NULL,
    updated_by VARCHAR(100),
    previous_division VARCHAR(20),
    current_division VARCHAR(20),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remark VARCHAR(255),
    CONSTRAINT fk_division_history_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
);
