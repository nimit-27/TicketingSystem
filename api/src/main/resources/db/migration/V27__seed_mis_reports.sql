INSERT INTO report_master
(report_code, name, description, data_key, source_type, source_ref, template_location, template_type, default_output_format, is_active, created_by, updated_by)
VALUES
('MIS_TICKET_SUMMARY_RPT','Ticket Summary Report','Ticket totals and status counts grouped by the selected interval','ticketSummary','template_sql','tickets','reports/mis_ticket_summary_report.jrxml','JASPER','EXCEL',TRUE,'SYSTEM','SYSTEM'),
('MIS_RESOLUTION_TIME_RPT','Ticket Resolution Time Report','Resolution time statistics grouped by the selected interval','resolutionTime','template_sql','tickets','reports/mis_resolution_time_report.jrxml','JASPER','EXCEL',TRUE,'SYSTEM','SYSTEM'),
('MIS_CUSTOMER_SATISFACTION_RPT','Customer Satisfaction Report','Customer feedback ratings grouped by the selected interval','customerSatisfaction','template_sql','ticket_feedback','reports/mis_customer_satisfaction_report.jrxml','JASPER','EXCEL',TRUE,'SYSTEM','SYSTEM'),
('MIS_PROBLEM_MANAGEMENT_RPT','Problem Management Report','Recurring ticket and SLA breach statistics grouped by interval and module','problemManagement','template_sql','tickets','reports/mis_problem_management_report.jrxml','JASPER','EXCEL',TRUE,'SYSTEM','SYSTEM')
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), template_location=VALUES(template_location), is_active=TRUE, updated_by='SYSTEM';

INSERT IGNORE INTO report_filter_mapping (report_id,display_order,filter_key,filter_type,is_required,default_value,created_by,updated_by)
SELECT rm.report_id, f.display_order, f.filter_key, f.filter_type, FALSE, f.default_value, 'SYSTEM', 'SYSTEM'
FROM report_master rm JOIN (
 SELECT 1 display_order,'fromDate' filter_key,'DATE' filter_type,'2026-07-01' default_value UNION ALL
 SELECT 2,'toDate','DATE',NULL UNION ALL SELECT 3,'interval','SELECT','DAILY' UNION ALL
 SELECT 4,'categoryId','SELECT',NULL UNION ALL SELECT 5,'subCategoryId','SELECT',NULL UNION ALL
 SELECT 6,'zoneCode','SELECT',NULL UNION ALL SELECT 7,'regionCode','SELECT',NULL UNION ALL
 SELECT 8,'districtCode','SELECT',NULL UNION ALL SELECT 9,'issueTypeId','SELECT',NULL UNION ALL
 SELECT 10,'divisionId','SELECT',NULL UNION ALL SELECT 11,'assignedTo','SELECT',NULL
) f
WHERE rm.report_code IN ('MIS_TICKET_SUMMARY_RPT','MIS_RESOLUTION_TIME_RPT','MIS_CUSTOMER_SATISFACTION_RPT','MIS_PROBLEM_MANAGEMENT_RPT');
