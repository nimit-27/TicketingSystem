SELECT 
	t.ticket_id AS 'Ticket Id', 
	t.reported_date AS 'Reported Date',
    itm.name,
    t.status AS 'Current Status',
    t.last_modified_status_date AS 'Status Updated Date',
    ts.due_at AS 'Due At',
    CASE
		WHEN ts.breached_by_minutes > 0
			THEN 'YES'
		ELSE 'NO'
	END AS 'Is Breached'
    FROM ad_prd_ticket_system.ticket_sla ts
LEFT JOIN tickets t ON t.ticket_id = ts.ticket_id
LEFT JOIN issue_type_master itm ON itm.issue_type_id = t.issue_type_id
WHERE ts.breached_by_minutes > 0
ORDER BY ts.due_at DESC;
