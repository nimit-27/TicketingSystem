-- Tickets that were once pending/assigned with FCI and are currently assigned.
--
-- This mirrors the updateTicket intent for `is_assigned_back_from_fci`: when a ticket
-- moves from PENDING_WITH_FCI and is assigned again, the ticket should be treated as
-- assigned back from FCI. Because older assignment-only updates may not have persisted
-- the flag, these queries derive the same condition directly from status_history.
--
-- Run order:
--   1. Preview the rows that will be affected.
--   2. Create/populate the backup table.
--   3. Run the update.
--   4. Verify the updated rows.
--   5. If required, run the rollback section at the bottom.

-- 1) Preview candidate tickets before updating the flag.
SELECT DISTINCT
    t.ticket_id,
    t.reported_date,
    t.subject,
    t.requestor_name,
    t.requestor_email_id,
    t.assigned_to,
    t.assigned_to_level,
    t.level_id,
    t.assigned_by,
    t.status_id AS current_status_id,
    current_sm.status_code AS current_status_code,
    current_sm.status_name AS current_status_name,
    t.last_modified,
    t.last_modified_status_date,
    t.is_assigned_back_from_fci,
    first_fci_history.first_fci_status_at,
    latest_assigned_history.latest_assigned_status_at
FROM ad_prd_ticket_system.tickets t
JOIN ad_prd_ticket_system.status_master current_sm
    ON current_sm.status_id = t.status_id
JOIN (
    SELECT
        sh.ticket_id,
        MIN(sh.`timestamp`) AS first_fci_status_at
    FROM ad_prd_ticket_system.status_history sh
    JOIN ad_prd_ticket_system.status_master sh_current_sm
        ON sh_current_sm.status_id = sh.current_status
    WHERE sh_current_sm.status_code = 'PENDING_WITH_FCI'
    GROUP BY sh.ticket_id
) first_fci_history
    ON first_fci_history.ticket_id = t.ticket_id
LEFT JOIN (
    SELECT
        sh.ticket_id,
        MAX(sh.`timestamp`) AS latest_assigned_status_at
    FROM ad_prd_ticket_system.status_history sh
    JOIN ad_prd_ticket_system.status_master sh_current_sm
        ON sh_current_sm.status_id = sh.current_status
    WHERE sh_current_sm.status_code = 'ASSIGNED'
    GROUP BY sh.ticket_id
) latest_assigned_history
    ON latest_assigned_history.ticket_id = t.ticket_id
WHERE current_sm.status_code = 'ASSIGNED'
  AND t.assigned_to IS NOT NULL
  AND TRIM(t.assigned_to) <> ''
ORDER BY t.last_modified DESC, t.ticket_id;

-- 2) Backup current flag values for rollback.
CREATE TABLE IF NOT EXISTS ad_prd_ticket_system.assigned_back_from_fci_flag_backup (
    ticket_id VARCHAR(36) NOT NULL PRIMARY KEY,
    previous_is_assigned_back_from_fci BOOLEAN NOT NULL,
    backed_up_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO ad_prd_ticket_system.assigned_back_from_fci_flag_backup (
    ticket_id,
    previous_is_assigned_back_from_fci
)
SELECT DISTINCT
    t.ticket_id,
    t.is_assigned_back_from_fci
FROM ad_prd_ticket_system.tickets t
JOIN ad_prd_ticket_system.status_master current_sm
    ON current_sm.status_id = t.status_id
WHERE current_sm.status_code = 'ASSIGNED'
  AND t.assigned_to IS NOT NULL
  AND TRIM(t.assigned_to) <> ''
  AND COALESCE(t.is_assigned_back_from_fci, 0) <> 1
  AND EXISTS (
      SELECT 1
      FROM ad_prd_ticket_system.status_history sh
      JOIN ad_prd_ticket_system.status_master sh_current_sm
          ON sh_current_sm.status_id = sh.current_status
      WHERE sh.ticket_id = t.ticket_id
        AND sh_current_sm.status_code = 'PENDING_WITH_FCI'
  );

-- 3) Update candidate tickets to mark them as assigned back from FCI.
UPDATE ad_prd_ticket_system.tickets t
JOIN ad_prd_ticket_system.status_master current_sm
    ON current_sm.status_id = t.status_id
SET t.is_assigned_back_from_fci = 1
WHERE current_sm.status_code = 'ASSIGNED'
  AND t.assigned_to IS NOT NULL
  AND TRIM(t.assigned_to) <> ''
  AND COALESCE(t.is_assigned_back_from_fci, 0) <> 1
  AND EXISTS (
      SELECT 1
      FROM ad_prd_ticket_system.status_history sh
      JOIN ad_prd_ticket_system.status_master sh_current_sm
          ON sh_current_sm.status_id = sh.current_status
      WHERE sh.ticket_id = t.ticket_id
        AND sh_current_sm.status_code = 'PENDING_WITH_FCI'
  );

-- 4) Verify the tickets updated by this script.
SELECT
    t.ticket_id,
    b.previous_is_assigned_back_from_fci,
    t.is_assigned_back_from_fci AS current_is_assigned_back_from_fci,
    b.backed_up_at
FROM ad_prd_ticket_system.assigned_back_from_fci_flag_backup b
JOIN ad_prd_ticket_system.tickets t
    ON t.ticket_id = b.ticket_id
ORDER BY b.backed_up_at DESC, t.ticket_id;

-- 5) Rollback: restore the flag values captured in the backup table.
-- Run this only if you need to undo the update above.
UPDATE ad_prd_ticket_system.tickets t
JOIN ad_prd_ticket_system.assigned_back_from_fci_flag_backup b
    ON b.ticket_id = t.ticket_id
SET t.is_assigned_back_from_fci = b.previous_is_assigned_back_from_fci;

-- Optional cleanup after a successful rollback. Keep the backup table if you want an audit trail.
-- DROP TABLE ad_prd_ticket_system.assigned_back_from_fci_flag_backup;
