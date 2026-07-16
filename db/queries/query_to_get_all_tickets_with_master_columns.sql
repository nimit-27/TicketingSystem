SELECT
    t.ticket_id                                  AS 'Ticket Id', 
    t.master_id                                     AS 'Master Id',
    t.is_master                                     AS 'Is Master',
    COALESCE(ct.child_ticket_count, 0)            AS 'Child Ticket Count',
    t.reported_date                              AS 'Reported Date', 
    t.requestor_name                             AS 'Requestor Name', 
    sh.remark                                    AS 'Remark',
    sh.updated_by                                AS 'Updated By',
    t.last_modified								 AS 'Last Modified Date',
    t.last_modified_status_date					 AS 'Last Modified Status Date',
    t.status                                      AS 'Status',
    t.subject                                    AS 'Subject', 
    t.description                                AS 'Description',
    c.category                                   AS 'Module',
    s.sub_category                               AS 'Sub Module',
    i.name                                       AS 'Issue Type',
    t.assigned_to                                AS 'Assigned To',
    p.tp_level                                   AS 'Priority', 
    sev.ts_level                                 AS 'Severity',
    t.office_code                                AS 'Office Code',
    d.district_name                              AS 'District Name',
    d.district_code                              AS 'District Code',
    z.zone_code                                  AS 'Zone Code',
    z.zone_name                                  AS 'Zone',
    r.region_name                                AS 'Region Name',
    r.region_code                                AS 'Region Code',
    t.depot_code								 AS 'Depot Code',
    t.user_id                                    AS 'Requestor User Id', 
    t.requestor_email_id                         AS 'Requestor Email Id', 
    t.requestor_mobile_no                        AS 'Requestor Mobile No.',
    dm.division_name                             AS 'Division'
FROM ad_prd_ticket_system.tickets t

LEFT JOIN categories        c   ON c.category_id      = t.category
LEFT JOIN sub_categories    s   ON s.sub_category_id  = t.sub_category
LEFT JOIN issue_type_master i   ON i.issue_type_id    = t.issue_type_id
LEFT JOIN priority_master   p   ON p.tp_id            = t.priority
LEFT JOIN severity_master   sev ON sev.ts_id          = t.severity
LEFT JOIN zone_master       z   ON z.zone_code        = t.zone_code
LEFT JOIN region_master     r   ON r.region_code      = t.region_code
LEFT JOIN district_master   d   ON d.district_code    = t.district_code 
LEFT JOIN division_master   dm  ON dm.division_id     = t.division
LEFT JOIN depot_master 		de  ON de.depot_code 	  = t.depot_code

/* ✅ Child ticket count per master */
LEFT JOIN (
    SELECT 
        master_id,
        COUNT(*) AS child_ticket_count
    FROM ad_prd_ticket_system.tickets
    WHERE master_id IS NOT NULL
    GROUP BY master_id
) ct
    ON ct.master_id = t.ticket_id

/* Latest status_history timestamp per ticket */
LEFT JOIN (
    SELECT ticket_id, MAX(`timestamp`) AS max_ts
    FROM status_history
    GROUP BY ticket_id
) sh_max
    ON sh_max.ticket_id = t.ticket_id

LEFT JOIN status_history sh
    ON sh.ticket_id = t.ticket_id
   AND sh.`timestamp` = sh_max.max_ts

LEFT JOIN status_master sm
    ON sm.status_id = sh.current_status
WHERE t.last_modified_status_date >= '2026-07-12 00:00:00'
AND t.status IN ('RESOLVED', 'CLOSED');
-- Optional filters
-- WHERE t.status = 'PENDING_WITH_FCI'
-- WHERE t.status_id IN ('3')
-- WHERE t.status_id NOT IN ('7', '8', '9')