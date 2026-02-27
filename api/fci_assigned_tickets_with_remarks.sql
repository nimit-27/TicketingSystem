-- Returns all tickets assigned to an FCI user and every remark row for each ticket.
-- Assumed tables:
--   tickets(id, employee_id, subject, description, status, reported_date, ...)
--   employee_details(employee_id, name, role, office, ...)
--   ticket_remarks(id, ticket_id, remark, remark_by, created_at, ...)

SELECT
    t.id                  AS ticket_id,
    t.subject,
    t.description,
    t.reported_date,
    e.employee_id         AS assignee_employee_id,
    e.name                AS assignee_name,
    r.id                  AS remark_id,
    r.remark,
    r.remark_by,
    r.created_at          AS remark_created_at
FROM tickets t
JOIN employee_details e
  ON e.employee_id = t.employee_id
LEFT JOIN ticket_remarks r
  ON r.ticket_id = t.id
WHERE e.role = 'FCI'             -- or use e.office = 'FCI' based on your data model
ORDER BY t.id, r.created_at;
