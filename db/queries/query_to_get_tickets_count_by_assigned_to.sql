SELECT 
	assigned_to AS 'Assigned To', 
    COUNT(*) as 'Count' 
FROM ad_prd_ticket_system.tickets
WHERE status_id = '2'
GROUP BY assigned_to;