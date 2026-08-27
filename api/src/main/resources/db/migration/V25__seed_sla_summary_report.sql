INSERT INTO report_master
(report_code, name, description, data_key, source_type, source_ref, template_location, template_type, default_output_format, is_active, created_by, updated_by)
VALUES
('SLA_SUMMARY_RPT', 'SLA Summary Report', 'Overall and severity-wise SLA ticket totals, breaches, and average response and resolution times',
 'slaSummary', 'template_sql', 'ticket_sla', 'reports/sla_summary_report.jrxml', 'JASPER', 'EXCEL', TRUE, 'SYSTEM', 'SYSTEM')
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), template_location = VALUES(template_location), is_active = TRUE, updated_by = 'SYSTEM';

INSERT IGNORE INTO report_filter_mapping
(report_id, display_order, filter_key, filter_type, is_required, created_by, updated_by)
SELECT report_id, 1, 'fromDate', 'DATE', FALSE, 'SYSTEM', 'SYSTEM' FROM report_master WHERE report_code = 'SLA_SUMMARY_RPT';
INSERT IGNORE INTO report_filter_mapping
(report_id, display_order, filter_key, filter_type, is_required, created_by, updated_by)
SELECT report_id, 2, 'toDate', 'DATE', FALSE, 'SYSTEM', 'SYSTEM' FROM report_master WHERE report_code = 'SLA_SUMMARY_RPT';
INSERT IGNORE INTO report_filter_mapping
(report_id, display_order, filter_key, filter_type, is_required, created_by, updated_by)
SELECT report_id, 3, 'breachedOnFromDate', 'DATE', FALSE, 'SYSTEM', 'SYSTEM' FROM report_master WHERE report_code = 'SLA_SUMMARY_RPT';
INSERT IGNORE INTO report_filter_mapping
(report_id, display_order, filter_key, filter_type, is_required, created_by, updated_by)
SELECT report_id, 4, 'breachedOnToDate', 'DATE', FALSE, 'SYSTEM', 'SYSTEM' FROM report_master WHERE report_code = 'SLA_SUMMARY_RPT';
