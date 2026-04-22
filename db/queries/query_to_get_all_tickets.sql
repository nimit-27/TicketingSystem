SELECT 
	t.ticket_id as 'Ticket Id', 
    t.reported_date as 'Reported Date', 
    t.requestor_name as 'Requestor Name', 
    t.subject as 'Subject', 
    t.description as 'Description',
    c.category as 'Module',
    s.sub_category as 'Sub Module',
    i.name as 'Issue Type',
    t.assigned_to as 'Assigned To',
    p.tp_level as 'Priority', 
    sev.ts_level as 'Severity',
    sm.status_name as 'Status',
    t.office_code as 'Office Code',
    d.district_name as 'District Name',
    d.district_code as 'District Code',
    z.zone_code as 'Zone Code',
    z.zone_name as 'Zone',
    r.region_name as 'Region Name',
    r.region_code as 'Region Code',
    t.user_id as 'Requestor User Id', 
    t.requestor_email_id as 'Requestor Email Id', 
    t.requestor_mobile_no as 'Requestor Mobile No.'
FROM ad_prd_ticket_system.tickets t
LEFT JOIN categories c ON c.category_id = t.category
LEFT JOIN sub_categories s ON s.sub_category_id = t.sub_category
LEFT JOIN issue_type_master i ON i.issue_type_id = t.issue_type_id
LEFT JOIN priority_master p ON p.tp_id = t.priority
LEFT JOIN severity_master sev ON sev.ts_id = t.severity
LEFT JOIN zone_master z ON z.zone_code = t.zone_code
LEFT JOIN region_master r ON r.region_code = t.region_code
LEFT JOIN district_master d ON d.district_code = t.district_code 
LEFT JOIN status_master sm ON sm.status_id = t.status_id
ORDER BY t.zone_code, t.region_code
 