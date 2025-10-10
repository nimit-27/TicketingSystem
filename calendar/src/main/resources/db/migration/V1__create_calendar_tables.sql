CREATE TABLE IF NOT EXISTS calendar_holiday (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    holiday_date DATE NOT NULL,
    name VARCHAR(128) NOT NULL,
    region VARCHAR(64) NOT NULL DEFAULT 'IN-WB-Kolkata',
    is_optional TINYINT(1) NOT NULL DEFAULT 0,
    UNIQUE KEY uq_calendar_holiday_date_region (holiday_date, region)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS calendar_working_hours (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    UNIQUE KEY uq_calendar_working_hours_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS calendar_working_hours_exception (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    scope VARCHAR(16) NOT NULL,
    target_date DATE NULL,
    weekday TINYINT NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    start_time TIME NULL,
    end_time TIME NULL,
    is_closed TINYINT(1) NOT NULL DEFAULT 0,
    priority INT NOT NULL DEFAULT 0,
    note VARCHAR(255) NULL,
    INDEX idx_calendar_working_hours_exception_scope (scope),
    INDEX idx_calendar_working_hours_exception_date (target_date),
    INDEX idx_calendar_working_hours_exception_weekday (weekday),
    INDEX idx_calendar_working_hours_exception_range (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS calendar_event (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    start_at DATETIME NOT NULL,
    end_at DATETIME NOT NULL,
    is_all_day TINYINT(1) NOT NULL DEFAULT 0,
    background_color VARCHAR(16) NULL,
    text_color VARCHAR(16) NULL,
    meta JSON NULL,
    INDEX idx_calendar_event_start (start_at),
    INDEX idx_calendar_event_end (end_at),
    INDEX idx_calendar_event_all_day (is_all_day)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS calendar_source (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    provider_code VARCHAR(64) NOT NULL,
    base_url VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) NULL,
    enabled TINYINT(1) NOT NULL DEFAULT 1,
    UNIQUE KEY uq_calendar_source_provider (provider_code),
    INDEX idx_calendar_source_enabled (enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
