-- MIS_PROBLEM_MANAGEMENT_RPT (MySQL 8)
-- Category, subcategory, and interval are intentionally not used by this report.
-- Edit these values; leave an optional filter NULL or '' to disable it.
SET @from_date     = '2026-07-01';
SET @to_date       = DATE_FORMAT(CURRENT_DATE, '%Y-%m-%d');
SET @zone_code     = NULL;
SET @region_code   = NULL;
SET @district_code = NULL;
SET @issue_type_id = NULL;
SET @division_id   = NULL;
SET @assigned_to   = NULL;

SELECT
    t.ticket_id AS ticketId,
    t.status AS status,
    t.reported_date AS reportedDate,
    (
        SELECT COUNT(*)
        FROM tickets child
        WHERE child.master_id = t.ticket_id
    ) AS childrenCount
FROM tickets t
WHERE t.is_master = TRUE
  AND (t.master_id IS NULL OR t.master_id = '')
  AND t.reported_date >= STR_TO_DATE(COALESCE(NULLIF(@from_date, ''), '2026-07-01'), '%Y-%m-%d')
  AND t.reported_date < DATE_ADD(
      STR_TO_DATE(COALESCE(NULLIF(@to_date, ''), DATE_FORMAT(CURRENT_DATE, '%Y-%m-%d')), '%Y-%m-%d'),
      INTERVAL 1 DAY
  )
  AND (@zone_code IS NULL OR @zone_code = '' OR t.zone_code = @zone_code)
  AND (@region_code IS NULL OR @region_code = '' OR t.region_code = @region_code)
  AND (@district_code IS NULL OR @district_code = '' OR t.district_code = @district_code)
  AND (@issue_type_id IS NULL OR @issue_type_id = '' OR t.issue_type_id = @issue_type_id)
  AND (@division_id IS NULL OR @division_id = '' OR t.division = @division_id)
  AND (@assigned_to IS NULL OR @assigned_to = '' OR t.assigned_to = @assigned_to)
ORDER BY t.reported_date DESC;
