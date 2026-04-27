CREATE TABLE IF NOT EXISTS cr_status_master (
    cr_status_id VARCHAR(255) PRIMARY KEY,
    cr_status_name VARCHAR(255) NOT NULL,
    cr_status_code VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(1000),
    color VARCHAR(100),
    created_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL DEFAULT 'SYSTEM',
    updated_by VARCHAR(255) NOT NULL DEFAULT 'SYSTEM'
);

CREATE TABLE IF NOT EXISTS ticket_cr_sequences (
    id VARCHAR(20) PRIMARY KEY,
    sequence_date DATE NOT NULL UNIQUE,
    `last_value` BIGINT NOT NULL,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ticket_cr (
    ticket_cr_id VARCHAR(20) PRIMARY KEY,
    ticket_id VARCHAR(255) NOT NULL,
    status_id INT NOT NULL,
    cr_status_id VARCHAR(10) NOT NULL,
    subject VARCHAR(500),
    description TEXT,
    requested_by VARCHAR(255),
    assigned_to VARCHAR(255),
    assigned_by VARCHAR(255),
    remarks TEXT,
    created_date TIMESTAMP NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    updated_on TIMESTAMP NOT NULL,
    updated_by VARCHAR(255),
    CONSTRAINT fk_ticket_cr_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id),
    CONSTRAINT fk_ticket_cr_status FOREIGN KEY (status_id) REFERENCES status_master(status_id),
    CONSTRAINT fk_ticket_cr_cr_status FOREIGN KEY (cr_status_id) REFERENCES cr_status_master(cr_status_id)
);

CREATE INDEX idx_ticket_cr_ticket_id ON ticket_cr(ticket_id);
CREATE INDEX idx_ticket_cr_status_id ON ticket_cr(status_id);
CREATE INDEX idx_ticket_cr_cr_status_id ON ticket_cr(cr_status_id);
