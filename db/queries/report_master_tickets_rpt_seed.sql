-- Seed entry for Jasper template-based ticket export report
INSERT INTO report_master (
    report_code,
    name,
    description,
    data_key,
    source_type,
    source_ref,
    template_location,
    template_type,
    default_output_format,
    is_active,
    created_by,
    updated_by
)
VALUES (
    'TICKETS_RPT',
    'Tickets Export Report',
    'Jasper report definition for ticket export download (PDF/Excel).',
    'tickets',
    'API',
    '/tickets/search/export/download',
    'reports/tickets_rpt.jrxml',
    'JASPER_JRXML',
    'PDF',
    1,
    'SYSTEM',
    'SYSTEM'
)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description),
    data_key = VALUES(data_key),
    source_type = VALUES(source_type),
    source_ref = VALUES(source_ref),
    template_location = VALUES(template_location),
    template_type = VALUES(template_type),
    default_output_format = VALUES(default_output_format),
    is_active = VALUES(is_active),
    updated_by = VALUES(updated_by);
