ALTER TABLE ticket_history
    ADD COLUMN old_ref_id VARCHAR(255) NULL AFTER display_label,
    ADD COLUMN new_ref_id VARCHAR(255) NULL AFTER old_ref_id;

CREATE TABLE IF NOT EXISTS ticket_text_history (
    text_history_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ticket_history_id BIGINT NOT NULL,
    ticket_id VARCHAR(255) NOT NULL,
    column_name VARCHAR(100) NOT NULL,
    old_text LONGTEXT,
    new_text LONGTEXT,
    old_text_hash VARCHAR(64) NULL,
    new_text_hash VARCHAR(64) NULL,
    old_text_length INT NULL,
    new_text_length INT NULL,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ticket_text_history_ticket_history
        FOREIGN KEY (ticket_history_id) REFERENCES ticket_history(ticket_history_id)
        ON DELETE CASCADE
);

CREATE INDEX idx_ticket_text_history_ticket_history_id ON ticket_text_history(ticket_history_id);
CREATE INDEX idx_ticket_text_history_ticket_id ON ticket_text_history(ticket_id);
CREATE INDEX idx_ticket_text_history_column_name ON ticket_text_history(column_name);
