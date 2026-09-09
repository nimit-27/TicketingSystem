/*
  Find breached tickets whose effective SLA breach due date occurred while the
  ticket was in a status for which status_master.sla_flag = 0.

  MySQL 8+ is required for LEAD(). Status periods are treated as half-open
  intervals [status_started_at, status_ended_at), so a status change made at
  the exact due time belongs to the new status.

  due_at_after_escalation is the effective SLA target after a severity-based
  escalation. Otherwise actual_due_at is the original SLA target. due_at is a
  final fallback for older rows that do not have actual_due_at populated.
*/
WITH status_periods AS (
  SELECT
    sh.status_history_id,
    sh.ticket_id,
    sh.current_status AS status_id,
    sh.`timestamp` AS status_started_at,
    LEAD(sh.`timestamp`) OVER (
      PARTITION BY sh.ticket_id
      ORDER BY sh.`timestamp`, sh.status_history_id
    ) AS status_ended_at
  FROM status_history sh
),
breached_tickets AS (
  SELECT
    ts.ticket_sla_id,
    ts.ticket_id,
    COALESCE(
      ts.due_at_after_escalation,
      ts.actual_due_at,
      ts.due_at
    ) AS breach_due_at,
    ts.breached_by_minutes
  FROM ticket_sla ts
  WHERE COALESCE(ts.breached_by_minutes, 0) > 0
)
SELECT
  t.ticket_id,
  t.subject,
  bt.ticket_sla_id,
  bt.breach_due_at,
  bt.breached_by_minutes,
  sm.status_id,
  sm.status_name,
  sm.status_code,
  sm.sla_flag,
  sp.status_started_at,
  sp.status_ended_at
FROM breached_tickets bt
JOIN tickets t
  ON t.ticket_id = bt.ticket_id
JOIN status_periods sp
  ON sp.ticket_id = bt.ticket_id
 AND bt.breach_due_at >= sp.status_started_at
 AND (
   sp.status_ended_at IS NULL
   OR bt.breach_due_at < sp.status_ended_at
 )
JOIN status_master sm
  ON sm.status_id = CAST(sp.status_id AS UNSIGNED)
WHERE sm.sla_flag = 0
ORDER BY bt.breach_due_at DESC, t.ticket_id;
