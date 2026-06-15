-- Tickets that were once pending/assigned with FCI and are currently assigned.
--
-- This mirrors the updateTicket intent for `is_assigned_back_from_fci`: when a ticket
-- moves from PENDING_WITH_FCI and is assigned again, the ticket should be treated as
-- assigned back from FCI. Because older assignment-only updates may not have persisted
-- the flag, this query derives the same condition directly from status_history.

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
