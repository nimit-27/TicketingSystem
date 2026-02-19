-- All Tickets Excel-like export query (MySQL)
-- Column names and value precedence aligned with UI export in TicketsTable.
-- Optional filters: uncomment/update WHERE predicates as needed.

SELECT
    t.ticket_id AS `Ticket Id`,
    COALESCE(NULLIF(t.requestor_name, ''), '-') AS `Requestor`,
    COALESCE(DATE_FORMAT(t.reported_date, '%d %b %Y'), '-') AS `Created Date`,
    COALESCE(NULLIF(c.category, ''), NULLIF(t.category, ''), '-') AS `Module`,
    COALESCE(NULLIF(sc.sub_category, ''), NULLIF(t.sub_category, ''), '-') AS `Sub Module`,
    COALESCE(NULLIF(it.name, ''), NULLIF(t.issue_type_id, ''), '-') AS `Issue Type`,
    COALESCE(NULLIF(zm.zone_name, ''), NULLIF(t.zone_code, ''), '-') AS `Zone Name`,
    COALESCE(NULLIF(t.district_name, ''), NULLIF(dm.district_name, ''), '-') AS `District Name`,
    COALESCE(NULLIF(t.region_name, ''), NULLIF(rm.region_name, ''), '-') AS `Region Name`,
    COALESCE(NULLIF(t.severity, ''), '-') AS `Severity`,
    COALESCE(NULLIF(pm.tp_level, ''), NULLIF(t.priority, ''), '-') AS `Priority`,
    COALESCE(NULLIF(au.name, ''), NULLIF(t.assigned_to, ''), '-') AS `Assignee`,
    COALESCE(NULLIF(sm.label, ''), NULLIF(sm.status_name, ''), NULLIF(t.status, ''), '-') AS `Status`
FROM tickets t
LEFT JOIN categories c
    ON c.category_id = t.category
LEFT JOIN sub_categories sc
    ON sc.sub_category_id = t.sub_category
LEFT JOIN issue_type_master it
    ON it.issue_type_id = t.issue_type_id
LEFT JOIN zone_master zm
    ON zm.zone_code = t.zone_code
LEFT JOIN region_master rm
    ON rm.region_code = t.region_code
LEFT JOIN district_master dm
    ON dm.district_code = t.district_code
LEFT JOIN priority_master pm
    ON pm.tp_id = t.priority
LEFT JOIN users au
    ON au.username = t.assigned_to
LEFT JOIN status_master sm
    ON sm.status_id = t.status_id
WHERE 1 = 1
  -- AND t.reported_date >= '2026-01-01 00:00:00'
  -- AND t.reported_date <  '2026-02-01 00:00:00'
  -- AND t.zone_code = 'N'
  -- AND t.region_code = 'NR1'
  -- AND t.district_code = 'NR101'
  -- AND t.issue_type_id = 'INC'
  -- AND LOWER(t.assigned_to) = LOWER('some.username')
ORDER BY t.ticket_id;
