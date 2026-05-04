CREATE TABLE IF NOT EXISTS ticket_cr_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ticket_cr_id VARCHAR(20) NOT NULL,
    previous_cr_status_id VARCHAR(255),
    current_cr_status_id VARCHAR(255) NOT NULL,
    remarks TEXT,
    updated_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255) NOT NULL,
    CONSTRAINT fk_ticket_cr_history_ticket_cr FOREIGN KEY (ticket_cr_id) REFERENCES ticket_cr(ticket_cr_id),
    CONSTRAINT fk_ticket_cr_history_prev_status FOREIGN KEY (previous_cr_status_id) REFERENCES cr_status_master(cr_status_id),
    CONSTRAINT fk_ticket_cr_history_curr_status FOREIGN KEY (current_cr_status_id) REFERENCES cr_status_master(cr_status_id)
);

CREATE INDEX idx_ticket_cr_history_ticket_cr_id ON ticket_cr_history(ticket_cr_id);
CREATE INDEX idx_ticket_cr_history_updated_on ON ticket_cr_history(updated_on);
