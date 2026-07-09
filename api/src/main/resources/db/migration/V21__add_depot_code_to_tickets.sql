ALTER TABLE tickets
    ADD COLUMN IF NOT EXISTS depot_code varchar(20) DEFAULT NULL AFTER district_code;
