-- Register the asynchronous detailed SLA report. This script can also be run manually.
INSERT INTO report_master
    (report_code, name, description, data_key, source_type, source_ref,
     template_location, template_type, default_output_format, is_active,
     created_by, updated_by)
VALUES
    ('SLA_DETAILED_RPT', 'Detailed SLA Report',
     'Monthly or quarterly SLA breach summary with the complete breached ticket list',
     'slaDetailed', 'template_sql', 'tickets,ticket_sla',
     'reports/detailed_sla_report.jrxml', 'JASPER_JRXML', 'PDF', TRUE,
     'SYSTEM', 'SYSTEM')
ON DUPLICATE KEY UPDATE
    name = VALUES(name), description = VALUES(description), data_key = VALUES(data_key),
    source_type = VALUES(source_type), source_ref = VALUES(source_ref),
    template_location = VALUES(template_location), template_type = VALUES(template_type),
    default_output_format = VALUES(default_output_format), is_active = TRUE,
    updated_by = 'SYSTEM';

INSERT IGNORE INTO report_filter_mapping
    (report_id, display_order, filter_key, filter_type, is_required, created_by, updated_by)
SELECT report_id, 1, 'fromDate', 'DATE', TRUE, 'SYSTEM', 'SYSTEM'
FROM report_master WHERE report_code = 'SLA_DETAILED_RPT';

INSERT IGNORE INTO report_filter_mapping
    (report_id, display_order, filter_key, filter_type, is_required, created_by, updated_by)
SELECT report_id, 2, 'toDate', 'DATE', TRUE, 'SYSTEM', 'SYSTEM'
FROM report_master WHERE report_code = 'SLA_DETAILED_RPT';

INSERT IGNORE INTO report_filter_mapping
    (report_id, display_order, filter_key, filter_type, is_required, default_value, created_by, updated_by)
SELECT report_id, 3, 'interval', 'SELECT', TRUE, 'MONTHLY', 'SYSTEM', 'SYSTEM'
FROM report_master WHERE report_code = 'SLA_DETAILED_RPT';
