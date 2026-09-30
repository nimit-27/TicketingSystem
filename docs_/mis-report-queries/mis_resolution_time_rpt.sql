-- MIS_RESOLUTION_TIME_RPT (MySQL 8)
-- Edit these values; leave an optional filter NULL or '' to disable it.
SET @from_date       = '2026-07-01';
SET @to_date         = DATE_FORMAT(CURRENT_DATE, '%Y-%m-%d');
SET @report_interval = 'DAILY'; -- DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY
SET @category_id     = NULL;    -- tickets.category text
SET @sub_category_id = NULL;    -- tickets.sub_category text
SET @zone_code       = NULL;
SET @region_code     = NULL;
SET @district_code   = NULL;
SET @issue_type_id   = NULL;
SET @division_id     = NULL;
SET @assigned_to     = NULL;

SELECT
    CASE UPPER(COALESCE(@report_interval, 'DAILY'))
        WHEN 'MONTHLY'   THEN DATE_FORMAT(t.reported_date, '%Y-%m')
        WHEN 'QUARTERLY' THEN CONCAT(YEAR(t.reported_date), '-Q', QUARTER(t.reported_date))
        WHEN 'YEARLY'    THEN DATE_FORMAT(t.reported_date, '%Y')
        WHEN 'WEEKLY'    THEN CONCAT(
            YEARWEEK(t.reported_date, 3) DIV 100,
            '-W',
            LPAD(YEARWEEK(t.reported_date, 3) % 100, 2, '0')
        )
        ELSE DATE_FORMAT(t.reported_date, '%Y-%m-%d')
    END AS periodLabel,
    COUNT(*) AS resolvedTickets,
    ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.reported_date, t.resolved_at)) / 60, 2) AS avgResolutionHours,
    ROUND(MIN(TIMESTAMPDIFF(MINUTE, t.reported_date, t.resolved_at)) / 60, 2) AS minResolutionHours,
    ROUND(MAX(TIMESTAMPDIFF(MINUTE, t.reported_date, t.resolved_at)) / 60, 2) AS maxResolutionHours
FROM tickets t
WHERE t.reported_date >= STR_TO_DATE(COALESCE(NULLIF(@from_date, ''), '2026-07-01'), '%Y-%m-%d')
  AND t.reported_date < DATE_ADD(
      STR_TO_DATE(COALESCE(NULLIF(@to_date, ''), DATE_FORMAT(CURRENT_DATE, '%Y-%m-%d')), '%Y-%m-%d'),
      INTERVAL 1 DAY
  )
  AND (@category_id IS NULL OR @category_id = '' OR t.category = @category_id)
  AND (@sub_category_id IS NULL OR @sub_category_id = '' OR t.sub_category = @sub_category_id)
  AND (@zone_code IS NULL OR @zone_code = '' OR t.zone_code = @zone_code)
  AND (@region_code IS NULL OR @region_code = '' OR t.region_code = @region_code)
  AND (@district_code IS NULL OR @district_code = '' OR t.district_code = @district_code)
  AND (@issue_type_id IS NULL OR @issue_type_id = '' OR t.issue_type_id = @issue_type_id)
  AND (@division_id IS NULL OR @division_id = '' OR t.division = @division_id)
  AND (@assigned_to IS NULL OR @assigned_to = '' OR t.assigned_to = @assigned_to)
  AND t.resolved_at IS NOT NULL
  AND t.status IN ('RESOLVED', 'CLOSED')
GROUP BY periodLabel
ORDER BY MIN(t.reported_date);
