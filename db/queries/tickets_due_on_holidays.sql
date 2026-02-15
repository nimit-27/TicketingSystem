/*
  Tickets whose SLA due date (due_at or actual_due_at) falls on a holiday.
  Compatible with MySQL 8+.
*/
SELECT DISTINCT
  t.ticket_id,
  t.subject,
  ts.ticket_sla_id,
  ts.due_at,
  ts.actual_due_at,
  ch.holiday_date,
  ch.name AS holiday_name,
  ch.region,
  CASE
    WHEN DATE(ts.actual_due_at) = ch.holiday_date THEN 'actual_due_at'
    WHEN DATE(ts.due_at) = ch.holiday_date THEN 'due_at'
  END AS matched_on
FROM ticket_sla ts
JOIN tickets t
  ON t.ticket_id = ts.ticket_id
JOIN calendar_holiday ch
  ON DATE(ts.actual_due_at) = ch.holiday_date
  OR DATE(ts.due_at) = ch.holiday_date
ORDER BY ch.holiday_date, t.ticket_id;
