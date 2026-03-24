CREATE TABLE IF NOT EXISTS ticket_activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  actor_id INT NULL,
  event_type VARCHAR(50) NOT NULL,
  field_name VARCHAR(50) NULL,
  old_value VARCHAR(255) NULL,
  new_value VARCHAR(255) NULL,
  description VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ticket_activity_logs_ticket_id (ticket_id),
  INDEX idx_ticket_activity_logs_created_at (created_at),
  CONSTRAINT fk_ticket_activity_logs_ticket
    FOREIGN KEY (ticket_id) REFERENCES tickets(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_ticket_activity_logs_actor
    FOREIGN KEY (actor_id) REFERENCES users(id)
    ON DELETE SET NULL
);
