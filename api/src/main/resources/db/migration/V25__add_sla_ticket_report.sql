INSERT INTO report_master (
    report_code, name, description, data_key, source_type, source_ref,
    template_location, template_type, default_output_format, is_active,
    created_by, updated_by
)
SELECT
    'SLA_TICKETS_RPT',
    'SLA Tickets Report',
    'Ticket-level SLA report including due date and calculated breach status',
    'tickets',
    'DB',
    'tickets',
    'reports/sla_ticket_report.jrxml',
    'JRXML',
    'EXCEL',
    TRUE,
    'SYSTEM',
    'SYSTEM'
WHERE NOT EXISTS (
    SELECT 1 FROM report_master WHERE report_code = 'SLA_TICKETS_RPT'
);
