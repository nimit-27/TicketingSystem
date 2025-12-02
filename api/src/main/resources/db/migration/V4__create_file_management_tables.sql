CREATE TABLE IF NOT EXISTS managed_files (
    file_id VARCHAR(36) NOT NULL,
    original_name VARCHAR(500) NOT NULL,
    stored_name VARCHAR(500) NOT NULL,
    content_type VARCHAR(255),
    file_size BIGINT,
    section VARCHAR(255),
    description TEXT,
    uploaded_by VARCHAR(50),
    uploaded_by_name VARCHAR(255),
    uploaded_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    storage_path VARCHAR(1000) NOT NULL,
    is_active BIT DEFAULT b'1',
    PRIMARY KEY (file_id)
);

CREATE TABLE IF NOT EXISTS managed_file_roles (
    file_role_id BIGINT NOT NULL AUTO_INCREMENT,
    file_id VARCHAR(36) NOT NULL,
    role VARCHAR(100) NOT NULL,
    PRIMARY KEY (file_role_id),
    CONSTRAINT fk_managed_file_roles_file FOREIGN KEY (file_id) REFERENCES managed_files(file_id)
);

CREATE TABLE IF NOT EXISTS managed_file_users (
    file_user_id BIGINT NOT NULL AUTO_INCREMENT,
    file_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    PRIMARY KEY (file_user_id),
    CONSTRAINT fk_managed_file_users_file FOREIGN KEY (file_id) REFERENCES managed_files(file_id)
);

CREATE INDEX IF NOT EXISTS idx_managed_files_section ON managed_files(section);
CREATE INDEX IF NOT EXISTS idx_managed_file_roles_role ON managed_file_roles(role);
CREATE INDEX IF NOT EXISTS idx_managed_file_users_user ON managed_file_users(user_id);
