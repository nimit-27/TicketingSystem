-- Register the workbook-style SLA report used by the Generate SLA Report action.
-- This statement is also safe to run manually when Flyway is not used.
INSERT INTO report_master
    (report_code, name, description, data_key, source_type, source_ref,
     template_location, template_type, default_output_format, is_active,
     created_by, updated_by)
VALUES
    ('SLA_SUMMARY_RPT_2', 'SLA Report',
     'Ticket management SLA summary in the approved SLA workbook layout',
     'slaSummary', 'template_sql', 'tickets,ticket_sla',
     'reports/sla_report.jrxml', 'JASPER_JRXML', 'EXCEL', TRUE,
     'SYSTEM', 'SYSTEM')
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description),
    data_key = VALUES(data_key),
    source_type = VALUES(source_type),
    source_ref = VALUES(source_ref),
    template_location = VALUES(template_location),
    template_type = VALUES(template_type),
    default_output_format = VALUES(default_output_format),
    is_active = TRUE,
    updated_by = 'SYSTEM';

INSERT IGNORE INTO report_filter_mapping
    (report_id, display_order, filter_key, filter_type, is_required, default_value, created_by, updated_by)
SELECT report_id, 1, 'fromDate', 'DATE', FALSE, NULL, 'SYSTEM', 'SYSTEM'
FROM report_master WHERE report_code = 'SLA_SUMMARY_RPT_2';

INSERT IGNORE INTO report_filter_mapping
    (report_id, display_order, filter_key, filter_type, is_required, created_by, updated_by)
SELECT report_id, 2, 'toDate', 'DATE', FALSE, 'SYSTEM', 'SYSTEM'
FROM report_master WHERE report_code = 'SLA_SUMMARY_RPT_2';

INSERT IGNORE INTO report_filter_mapping
    (report_id, display_order, filter_key, filter_type, is_required, created_by, updated_by)
SELECT report_id, 3, 'breachedOnFromDate', 'DATE', FALSE, 'SYSTEM', 'SYSTEM'
FROM report_master WHERE report_code = 'SLA_SUMMARY_RPT_2';

INSERT IGNORE INTO report_filter_mapping
    (report_id, display_order, filter_key, filter_type, is_required, created_by, updated_by)
SELECT report_id, 4, 'breachedOnToDate', 'DATE', FALSE, 'SYSTEM', 'SYSTEM'
FROM report_master WHERE report_code = 'SLA_SUMMARY_RPT_2';
