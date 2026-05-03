-- Add CR status workflow action mapping column (pipe-separated IDs, Option A)
ALTER TABLE role_permission_config
    ADD COLUMN allowed_cr_status_action_ids VARCHAR(255) DEFAULT NULL
    AFTER allowed_status_action_ids;

-- Set CR workflow action IDs for CR Approver role
-- Replace the sample IDs below with your final CR status workflow IDs.
UPDATE role_permission_config
SET allowed_cr_status_action_ids = '1|2|3'
WHERE role = 'CR Approver'
  AND is_deleted = 0;
