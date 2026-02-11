/*
  Report: Tickets currently in Resolved (7) or Closed (8)
  Includes latest resolved/closed remark, timestamp and actor per ticket.

  MySQL requirement: 8.0+ (uses CTE + ROW_NUMBER window function)
*/

WITH latest_resolved AS (
  SELECT
    sh.ticket_id,
    sh.remark AS resolved_remark,
    sh.`timestamp` AS resolved_on,
    sh.updated_by AS resolved_by,
    ROW_NUMBER() OVER (
      PARTITION BY sh.ticket_id
      ORDER BY sh.`timestamp` DESC, sh.status_history_id DESC
    ) AS rn
  FROM status_history sh
  WHERE sh.current_status = '7'
),
latest_closed AS (
  SELECT
    sh.ticket_id,
    sh.remark AS closed_remark,
    sh.`timestamp` AS closed_on,
    sh.updated_by AS closed_by,
    ROW_NUMBER() OVER (
      PARTITION BY sh.ticket_id
      ORDER BY sh.`timestamp` DESC, sh.status_history_id DESC
    ) AS rn
  FROM status_history sh
  WHERE sh.current_status = '8'
)
SELECT
  t.ticket_id,
  t.subject,
  t.status_id,
  lc.closed_remark,
  lr.resolved_remark,
  lc.closed_on,
  lr.resolved_on,
  lc.closed_by,
  lr.resolved_by
FROM tickets t
LEFT JOIN latest_resolved lr
  ON lr.ticket_id = t.ticket_id
 AND lr.rn = 1
LEFT JOIN latest_closed lc
  ON lc.ticket_id = t.ticket_id
 AND lc.rn = 1
WHERE t.status_id IN ('7', '8')
ORDER BY t.ticket_id;
