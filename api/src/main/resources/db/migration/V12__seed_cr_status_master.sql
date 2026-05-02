INSERT INTO cr_status_master (cr_status_id, cr_status_name, cr_status_code, description, color, created_by, updated_by)
VALUES
('CRS-1', 'CR Pending for approval', 'CR_PENDING_APPROVAL', 'Initial state when CR is submitted for approval', '#FFA726', 'SYSTEM', 'SYSTEM'),
('CRS-2', 'CR Approved', 'CR_APPROVED', 'CR has been approved', '#66BB6A', 'SYSTEM', 'SYSTEM'),
('CRS-3', 'CR Rejected', 'CR_REJECTED', 'CR has been rejected', '#EF5350', 'SYSTEM', 'SYSTEM')
ON DUPLICATE KEY UPDATE
cr_status_name = VALUES(cr_status_name),
cr_status_code = VALUES(cr_status_code),
description = VALUES(description),
color = VALUES(color),
updated_on = CURRENT_TIMESTAMP,
updated_by = VALUES(updated_by);
