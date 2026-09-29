SELECT t.ticket_id, t.reported_date, 
		sm.status_name,
		ts.breached_by_minutes, ts.due_at,
        sh.timestamp
	FROM ticket_sla ts
LEFT JOIN tickets t ON t.ticket_id = ts.ticket_id
-- LEFT JOIN status_history sh ON sh.ticket_id = t.ticket_id
-- LEFT JOIN status_master sm ON sm.status_id = sh.current_status
WHERE t.reported_date >= '2026-08-01 00:00:00'
AND t.reported_date < '2026-09-01 00:00:00'
AND ts.breached_by_minutes > 0
AND t.status <> 'CHANGE_REQUESTED';
AND t.status NOT IN ('CLOSED', 'RESOLVED');
ORDER BY ts.breached_by_minutes;

SELECT * FROM status_history WHERE ticket_id = 'TKT-1-202607-00846';