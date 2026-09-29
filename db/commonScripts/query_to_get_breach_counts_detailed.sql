SELECT
    DATE_FORMAT(CURDATE(), '%d-%b-%Y') AS date_generated,
    DATE_FORMAT(NOW(), '%H:%i:%s') AS timestamp_generated,
    
	DATE_FORMAT('2026-07-01 00:00:00', '%b-%Y') AS generated_for_month,


    COUNT(*) AS total_reported_tickets,

    SUM(CASE
            WHEN ts.breached_by_minutes > 0 THEN 1
            ELSE 0
        END) AS total_breached,

    SUM(CASE
            WHEN ts.breached_by_minutes > 0
             AND t.status IN ('CLOSED', 'RESOLVED')
            THEN 1
            ELSE 0
        END) AS closed_resolved_breached,

    SUM(CASE
            WHEN ts.breached_by_minutes > 0
             AND t.status NOT IN ('CLOSED', 'RESOLVED')
            THEN 1
            ELSE 0
        END) AS pending_breached,

    SUM(CASE
            WHEN COALESCE(ts.breached_by_minutes, 0) <= 0
             AND t.status NOT IN ('CLOSED', 'RESOLVED')
            THEN 1
            ELSE 0
        END) AS pending_not_breached_yet,

    SUM(CASE
            WHEN COALESCE(ts.breached_by_minutes, 0) <= 0
             AND t.status IN ('CLOSED', 'RESOLVED')
            THEN 1
            ELSE 0
        END) AS closed_resolved_not_breached,

    ROUND(
        100 * SUM(
            CASE
                WHEN ts.breached_by_minutes > 0 THEN 1
                ELSE 0
            END
        ) / NULLIF(COUNT(*), 0),
        2
    ) AS breach_percentage,

    CEIL(COUNT(*) * 0.04) AS threshold_breach_count,
    
	SUM(
		CASE
			WHEN ts.breached_by_minutes > 0 THEN 1
			ELSE 0
		END
	) - CEIL(COUNT(*) * 0.04) AS need_to_be_updated

FROM tickets t
LEFT JOIN ticket_sla ts ON ts.ticket_id = t.ticket_id
LEFT JOIN status_master sm ON sm.status_id = t.status
WHERE t.reported_date >= '2026-07-01 00:00:00'
  AND t.reported_date < '2026-08-01 00:00:00'
  AND t.status <> 'CHANGE_REQUESTED';