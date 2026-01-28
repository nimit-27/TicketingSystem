CREATE TABLE IF NOT EXISTS page_master (
    page_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    page_name VARCHAR(255),
    page_code VARCHAR(255),
    page_description TEXT,
    parent_id BIGINT,
    is_active BOOLEAN,
    is_on_sidebar BOOLEAN,
    created_on DATETIME,
    created_by VARCHAR(255),
    updated_on DATETIME,
    updated_by VARCHAR(255)
);
