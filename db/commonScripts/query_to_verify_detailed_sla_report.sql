-- Set the same values selected in the Detailed SLA Report modal.
SET @from_date = '2026-01-01';
SET @to_date = '2026-12-31';
SET @report_interval = 'MONTHLY'; -- MONTHLY or QUARTERLY

-- Table 1: counts and breach percentage by period. CHANGE_REQUESTED is excluded.
SELECT
    CASE WHEN UPPER(@report_interval) = 'QUARTERLY'
         THEN CONCAT(YEAR(t.reported_date), '-Q', QUARTER(t.reported_date))
         ELSE DATE_FORMAT(t.reported_date, '%Y-%m') END AS period,
    COUNT(DISTINCT t.ticket_id) AS total_ticket_count,
    COUNT(DISTINCT CASE WHEN ts.is_sla_applicable IS TRUE
                         AND COALESCE(ts.breached_by_minutes, 0) > 0 THEN t.ticket_id END)
        AS breached_ticket_count,
    ROUND(100.0 * COUNT(DISTINCT CASE WHEN ts.is_sla_applicable IS TRUE
                                      AND COALESCE(ts.breached_by_minutes, 0) > 0 THEN t.ticket_id END)
          / NULLIF(COUNT(DISTINCT t.ticket_id), 0), 2) AS breached_percentage
FROM tickets t
LEFT JOIN ticket_sla ts ON ts.ticket_id = t.ticket_id
WHERE t.reported_date >= STR_TO_DATE(@from_date, '%Y-%m-%d')
  AND t.reported_date < DATE_ADD(STR_TO_DATE(@to_date, '%Y-%m-%d'), INTERVAL 1 DAY)
  AND t.status <> 'CHANGE_REQUESTED'
GROUP BY YEAR(t.reported_date),
         CASE WHEN UPPER(@report_interval) = 'QUARTERLY' THEN QUARTER(t.reported_date) ELSE MONTH(t.reported_date) END
ORDER BY MIN(t.reported_date);

-- Table 2: all breached tickets in the same date range.
SELECT DISTINCT t.ticket_id, t.reported_date AS reported_on, t.status
FROM tickets t
JOIN ticket_sla ts ON ts.ticket_id = t.ticket_id
WHERE t.reported_date >= STR_TO_DATE(@from_date, '%Y-%m-%d')
  AND t.reported_date < DATE_ADD(STR_TO_DATE(@to_date, '%Y-%m-%d'), INTERVAL 1 DAY)
  AND t.status <> 'CHANGE_REQUESTED'
  AND ts.is_sla_applicable IS TRUE
  AND COALESCE(ts.breached_by_minutes, 0) > 0
ORDER BY t.reported_date, t.ticket_id;
