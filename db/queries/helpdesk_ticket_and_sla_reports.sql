/*
  Helpdesk Ticket Analysis Report
  -------------------------------
  Output columns:
  Ticket No. | Module | Sub-Module | Ticket Subject | Ticket Description |
  Ticket Priority | Issue Type | Ticket Severity | Opening Date & Time |
  Current Status | Resolution Date & Time | Re-opened by End-User |
  Feedback (if Any)

  Notes:
  - Compatible with MySQL 8+.
  - `Issue Type` uses `tickets.impact` when present, otherwise falls back to category.
  - `Re-opened by End-User` is marked Yes when ticket reached status_id=10 (Reopened)
    by the original requester identifiers available on the ticket.
*/
WITH reopened_by_end_user AS (
  SELECT
    sh.ticket_id,
    MAX(
      CASE
        WHEN sh.current_status = '10'
             AND (
               sh.updated_by = t.created_by
               OR sh.updated_by = t.requestor_name
               OR sh.updated_by = t.requestor_email_id
               OR sh.updated_by = t.user_id
             )
          THEN 1
        ELSE 0
      END
    ) AS reopened_by_end_user_flag
  FROM status_history sh
  JOIN tickets t ON t.ticket_id = sh.ticket_id
  GROUP BY sh.ticket_id
)
SELECT
  t.ticket_id AS `Ticket No.`,
  COALESCE(c.category, t.category) AS `Module`,
  COALESCE(sc.sub_category, t.sub_category) AS `Sub-Module`,
  t.subject AS `Ticket Subject`,
  t.description AS `Ticket Description`,
  t.priority AS `Ticket Priority`,
  COALESCE(NULLIF(t.impact, ''), c.category, t.category) AS `Issue Type`,
  t.severity AS `Ticket Severity`,
  t.reported_date AS `Opening Date & Time`,
  COALESCE(sm.status_name, t.status) AS `Current Status`,
  t.resolved_at AS `Resolution Date & Time`,
  CASE
    WHEN COALESCE(rbeu.reopened_by_end_user_flag, 0) = 1 THEN 'Yes'
    ELSE 'No'
  END AS `Re-opened by End-User`,
  tf.comments AS `Feedback (if Any)`
FROM tickets t
LEFT JOIN categories c
  ON c.category_id = t.category
LEFT JOIN sub_categories sc
  ON sc.sub_category_id = t.sub_category
LEFT JOIN status_master sm
  ON sm.status_id = CAST(t.status_id AS UNSIGNED)
LEFT JOIN ticket_feedback tf
  ON tf.ticket_id = t.ticket_id
LEFT JOIN reopened_by_end_user rbeu
  ON rbeu.ticket_id = t.ticket_id
ORDER BY t.reported_date DESC, t.ticket_id DESC;


/*
  SLA Report
  ----------
  Same output as Helpdesk Ticket Analysis Report + SLA Breach (Yes/No)
*/
WITH reopened_by_end_user AS (
  SELECT
    sh.ticket_id,
    MAX(
      CASE
        WHEN sh.current_status = '10'
             AND (
               sh.updated_by = t.created_by
               OR sh.updated_by = t.requestor_name
               OR sh.updated_by = t.requestor_email_id
               OR sh.updated_by = t.user_id
             )
          THEN 1
        ELSE 0
      END
    ) AS reopened_by_end_user_flag
  FROM status_history sh
  JOIN tickets t ON t.ticket_id = sh.ticket_id
  GROUP BY sh.ticket_id
)
SELECT
  t.ticket_id AS `Ticket No.`,
  COALESCE(c.category, t.category) AS `Module`,
  COALESCE(sc.sub_category, t.sub_category) AS `Sub-Module`,
  t.subject AS `Ticket Subject`,
  t.description AS `Ticket Description`,
  t.priority AS `Ticket Priority`,
  COALESCE(NULLIF(t.impact, ''), c.category, t.category) AS `Issue Type`,
  t.severity AS `Ticket Severity`,
  t.reported_date AS `Opening Date & Time`,
  COALESCE(sm.status_name, t.status) AS `Current Status`,
  t.resolved_at AS `Resolution Date & Time`,
  CASE
    WHEN COALESCE(rbeu.reopened_by_end_user_flag, 0) = 1 THEN 'Yes'
    ELSE 'No'
  END AS `Re-opened by End-User`,
  tf.comments AS `Feedback (if Any)`,
  CASE
    WHEN COALESCE(ts.breached_by_minutes, 0) > 0 THEN 'Yes'
    ELSE 'No'
  END AS `SLA Breach (Yes/No)`
FROM tickets t
LEFT JOIN categories c
  ON c.category_id = t.category
LEFT JOIN sub_categories sc
  ON sc.sub_category_id = t.sub_category
LEFT JOIN status_master sm
  ON sm.status_id = CAST(t.status_id AS UNSIGNED)
LEFT JOIN ticket_feedback tf
  ON tf.ticket_id = t.ticket_id
LEFT JOIN ticket_sla ts
  ON ts.ticket_id = t.ticket_id
LEFT JOIN reopened_by_end_user rbeu
  ON rbeu.ticket_id = t.ticket_id
ORDER BY t.reported_date DESC, t.ticket_id DESC;
