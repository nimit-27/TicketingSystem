CREATE TABLE ticket_feedback (
  feedback_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  ticket_id VARCHAR(36) NOT NULL,
  submitted_by VARCHAR(36) NULL,
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  overall_satisfaction TINYINT NOT NULL,
  resolution_effectiveness TINYINT NOT NULL,
  communication_support TINYINT NOT NULL,
  timeliness TINYINT NOT NULL,
  comments TEXT NULL,
  CONSTRAINT fk_feedback_ticket
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
    ON DELETE CASCADE,
  CONSTRAINT chk_feedback_range_overall              CHECK (overall_satisfaction BETWEEN 1 AND 5),
  CONSTRAINT chk_feedback_range_resolution_effective CHECK (resolution_effectiveness BETWEEN 1 AND 5),
  CONSTRAINT chk_feedback_range_comm_support         CHECK (communication_support BETWEEN 1 AND 5),
  CONSTRAINT chk_feedback_range_timeliness           CHECK (timeliness BETWEEN 1 AND 5),
  UNIQUE KEY uq_ticket_feedback_one_per_ticket (ticket_id)
);

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS resolved_at DATETIME NULL;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS feedback_status ENUM('PENDING','PROVIDED','NOT_PROVIDED') DEFAULT 'PENDING';
