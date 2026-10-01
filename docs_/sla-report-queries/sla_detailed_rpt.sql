-- SLA_DETAILED_RPT (MySQL 8)
--
-- The Jasper report contains two tables. Run this entire script to return one
-- result set for each table. Dates are inclusive calendar dates.
-- Edit these three values before running the queries.
SET @from_date       = '2026-07-01';
SET @to_date         = DATE_FORMAT(CURRENT_DATE, '%Y-%m-%d');
SET @report_interval = 'MONTHLY'; -- MONTHLY or QUARTERLY

-- Table 1: SLA summary by month or quarter.
SELECT
    CASE
        WHEN UPPER(COALESCE(@report_interval, 'MONTHLY')) = 'QUARTERLY'
            THEN CONCAT(YEAR(t.reported_date), '-Q', QUARTER(t.reported_date))
        ELSE DATE_FORMAT(t.reported_date, '%Y-%m')
    END AS period,
    COUNT(DISTINCT t.ticket_id) AS total_ticket_count,
    COUNT(DISTINCT CASE
        WHEN ts.is_sla_applicable IS TRUE
             AND COALESCE(ts.breached_by_minutes, 0) > 0
            THEN t.ticket_id
    END) AS breached_ticket_count,
    ROUND(
        100.0 * COUNT(DISTINCT CASE
            WHEN ts.is_sla_applicable IS TRUE
                 AND COALESCE(ts.breached_by_minutes, 0) > 0
                THEN t.ticket_id
        END) / NULLIF(COUNT(DISTINCT t.ticket_id), 0),
        2
    ) AS breached_percentage
FROM tickets t
LEFT JOIN ticket_sla ts
    ON ts.ticket_id = t.ticket_id
WHERE t.reported_date >= STR_TO_DATE(@from_date, '%Y-%m-%d')
  AND t.reported_date < DATE_ADD(
      STR_TO_DATE(@to_date, '%Y-%m-%d'),
      INTERVAL 1 DAY
  )
  AND t.status <> 'CHANGE_REQUESTED'
GROUP BY period
ORDER BY MIN(t.reported_date);

-- Table 2: complete list of SLA-breached tickets.
SELECT DISTINCT
    t.ticket_id AS ticket_id,
    DATE_FORMAT(t.reported_date, '%Y-%m-%d %H:%i:%s') AS reported_on,
    t.status AS ticket_status
FROM tickets t
INNER JOIN ticket_sla ts
    ON ts.ticket_id = t.ticket_id
WHERE t.reported_date >= STR_TO_DATE(@from_date, '%Y-%m-%d')
  AND t.reported_date < DATE_ADD(
      STR_TO_DATE(@to_date, '%Y-%m-%d'),
      INTERVAL 1 DAY
  )
  AND t.status <> 'CHANGE_REQUESTED'
  AND ts.is_sla_applicable IS TRUE
  AND COALESCE(ts.breached_by_minutes, 0) > 0
ORDER BY reported_on, ticket_id;
