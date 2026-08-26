-- What-if SLA breach report for MySQL Workbench
-- This script creates a session-local TEMPORARY table, returns summary + detail result sets,
-- then drops the TEMPORARY table. It does not change application data.
-- Purpose: calculate SLA outcomes for every ticket as if every issue_type_master.sla_flag were TRUE,
-- while also showing the currently stored ticket_sla breach values.
--
-- Notes:
--   * This is a read-only report query; it does not update ticket_sla or issue_type_master.
--   * It intentionally does NOT filter by issue_type_master.sla_flag.
--   * It uses status_history.sla_flag to decide whether each timeline segment is SLA-running
--     or idle/paused, matching the application SLA calculation logic.
--   * It uses the active calendar_working_hours row and excludes calendar_holiday rows for
--     region 'IN-WB-Kolkata'. If your report needs calendar_working_hours_exception support,
--     run the application from-scratch SLA job instead because exceptions are resolved in Java.

DROP TABLE IF EXISTS tmp_sla_what_if_all_issue_types;

CREATE TABLE tmp_sla_what_if_all_issue_types AS
WITH RECURSIVE
params AS (
    SELECT
        'IN-WB-Kolkata' AS holiday_region,
        NOW() AS calculation_time
),
active_hours AS (
    SELECT start_time, end_time
    FROM calendar_working_hours
    WHERE is_active = 1
    ORDER BY id DESC
    LIMIT 1
),
ticket_base AS (
    SELECT
        t.ticket_id,
        t.reported_date,
        COALESCE(t.resolved_at, p.calculation_time) AS calculation_end,
        t.resolved_at,
        t.status,
        t.issue_type_id,
        itm.name AS issue_type_name,
        COALESCE(itm.sla_flag, 0) AS current_issue_type_sla_flag,
        t.severity,
        sc.sla_id,
        COALESCE(sc.resolution_minutes, 0) AS allowed_resolution_minutes,
        ts.ticket_sla_id AS current_ticket_sla_id,
        ts.sla_id AS current_ticket_sla_config_id,
        ts.resolution_time_minutes AS current_resolution_minutes,
        ts.elapsed_time_minutes AS current_elapsed_minutes,
        ts.response_time_minutes AS current_response_minutes,
        ts.idle_time_minutes AS current_idle_minutes,
        ts.breached_by_minutes AS current_breached_by_minutes,
        ts.breached_by_minutes AS current_is_breached_by_minutes,
        CASE WHEN COALESCE(ts.breached_by_minutes, 0) > 0 THEN 1 ELSE 0 END AS currently_breached
    FROM tickets t
    CROSS JOIN params p
    LEFT JOIN issue_type_master itm
        ON itm.issue_type_id = t.issue_type_id
    LEFT JOIN sla_config sc
        ON sc.severity_level = CASE
            WHEN t.severity REGEXP 'S[0-9]+' THEN REGEXP_SUBSTR(t.severity, 'S[0-9]+')
            ELSE t.severity
        END
    LEFT JOIN ticket_sla ts
        ON ts.ticket_id = t.ticket_id
    WHERE t.reported_date IS NOT NULL
      AND t.master_id IS NULL
      AND sc.sla_id IS NOT NULL
),
ordered_history AS (
    SELECT
        sh.ticket_id,
        sh.timestamp,
        sh.sla_flag,
        UPPER(TRIM(sh.current_status)) AS current_status,
        UPPER(TRIM(sh.previous_status)) AS previous_status,
        LEAD(sh.timestamp) OVER (PARTITION BY sh.ticket_id ORDER BY sh.timestamp, sh.status_history_id) AS next_timestamp,
        LEAD(UPPER(TRIM(sh.current_status))) OVER (PARTITION BY sh.ticket_id ORDER BY sh.timestamp, sh.status_history_id) AS next_status,
        LEAD(UPPER(TRIM(sh.previous_status))) OVER (PARTITION BY sh.ticket_id ORDER BY sh.timestamp, sh.status_history_id) AS next_previous_status
    FROM status_history sh
    JOIN ticket_base tb
        ON tb.ticket_id = sh.ticket_id
    WHERE sh.timestamp IS NOT NULL
      AND sh.timestamp <= tb.calculation_end
),
segments AS (
    SELECT
        oh.ticket_id,
        oh.timestamp AS segment_start,
        COALESCE(oh.next_timestamp, tb.calculation_end) AS segment_end,
        oh.sla_flag,
        CASE
            WHEN COALESCE(oh.next_status, '') = 'REOPENED'
             AND (oh.current_status = 'RESOLVED' OR COALESCE(oh.next_previous_status, '') = 'RESOLVED')
                THEN 1
            ELSE 0
        END AS skip_segment
    FROM ordered_history oh
    JOIN ticket_base tb
        ON tb.ticket_id = oh.ticket_id
    WHERE oh.timestamp < COALESCE(oh.next_timestamp, tb.calculation_end)
),
segment_dates AS (
    SELECT
        s.ticket_id,
        s.segment_start,
        s.segment_end,
        s.sla_flag,
        s.skip_segment,
        DATE(s.segment_start) AS work_date
    FROM segments s
    UNION ALL
    SELECT
        sd.ticket_id,
        sd.segment_start,
        sd.segment_end,
        sd.sla_flag,
        sd.skip_segment,
        DATE_ADD(sd.work_date, INTERVAL 1 DAY)
    FROM segment_dates sd
    WHERE sd.work_date < DATE(sd.segment_end)
),
segment_work AS (
    SELECT
        sd.ticket_id,
        sd.sla_flag,
        sd.skip_segment,
        GREATEST(
            0,
            TIMESTAMPDIFF(
                MINUTE,
                GREATEST(sd.segment_start, TIMESTAMP(sd.work_date, ah.start_time)),
                LEAST(sd.segment_end, TIMESTAMP(sd.work_date, ah.end_time))
            )
        ) AS working_minutes
    FROM segment_dates sd
    CROSS JOIN active_hours ah
    CROSS JOIN params p
    LEFT JOIN calendar_holiday ch
        ON ch.holiday_date = sd.work_date
       AND ch.region = p.holiday_region
    WHERE ch.id IS NULL
),
per_ticket_from_history AS (
    SELECT
        tb.ticket_id,
        COALESCE(SUM(CASE WHEN sw.skip_segment = 0 AND sw.sla_flag = 1 THEN sw.working_minutes ELSE 0 END), 0) AS what_if_resolution_minutes,
        COALESCE(SUM(CASE WHEN sw.skip_segment = 0 AND COALESCE(sw.sla_flag, 0) <> 1 THEN sw.working_minutes ELSE 0 END), 0) AS what_if_idle_minutes
    FROM ticket_base tb
    LEFT JOIN segment_work sw
        ON sw.ticket_id = tb.ticket_id
    GROUP BY tb.ticket_id
),
response_ack AS (
    SELECT
        tb.ticket_id,
        MIN(sh.timestamp) AS first_sla_on_at
    FROM ticket_base tb
    LEFT JOIN status_history sh
        ON sh.ticket_id = tb.ticket_id
       AND sh.sla_flag = 1
       AND sh.timestamp <= tb.calculation_end
    GROUP BY tb.ticket_id
),
response_dates AS (
    SELECT
        tb.ticket_id,
        tb.reported_date AS response_start,
        ra.first_sla_on_at AS response_end,
        DATE(tb.reported_date) AS work_date
    FROM ticket_base tb
    JOIN response_ack ra
        ON ra.ticket_id = tb.ticket_id
    WHERE ra.first_sla_on_at IS NOT NULL
    UNION ALL
    SELECT
        rd.ticket_id,
        rd.response_start,
        rd.response_end,
        DATE_ADD(rd.work_date, INTERVAL 1 DAY)
    FROM response_dates rd
    WHERE rd.work_date < DATE(rd.response_end)
),
response_minutes AS (
    SELECT
        rd.ticket_id,
        SUM(
            GREATEST(
                0,
                TIMESTAMPDIFF(
                    MINUTE,
                    GREATEST(rd.response_start, TIMESTAMP(rd.work_date, ah.start_time)),
                    LEAST(rd.response_end, TIMESTAMP(rd.work_date, ah.end_time))
                )
            )
        ) AS what_if_response_minutes
    FROM response_dates rd
    CROSS JOIN active_hours ah
    CROSS JOIN params p
    LEFT JOIN calendar_holiday ch
        ON ch.holiday_date = rd.work_date
       AND ch.region = p.holiday_region
    WHERE ch.id IS NULL
    GROUP BY rd.ticket_id
),
what_if AS (
    SELECT
        tb.ticket_id,
        tb.reported_date,
        tb.calculation_end,
        tb.resolved_at,
        tb.status,
        tb.issue_type_id,
        tb.issue_type_name,
        tb.current_issue_type_sla_flag,
        tb.severity,
        tb.sla_id,
        tb.allowed_resolution_minutes,
        tb.current_ticket_sla_id,
        tb.current_ticket_sla_config_id,
        tb.current_response_minutes,
        tb.current_resolution_minutes,
        tb.current_elapsed_minutes,
        tb.current_idle_minutes,
        tb.current_breached_by_minutes,
        tb.current_is_breached_by_minutes,
        tb.currently_breached,
        COALESCE(rm.what_if_response_minutes, 0) AS what_if_response_minutes,
        pth.what_if_resolution_minutes,
        pth.what_if_idle_minutes,
        pth.what_if_resolution_minutes - tb.allowed_resolution_minutes AS what_if_breached_by_minutes,
        CASE WHEN pth.what_if_resolution_minutes > tb.allowed_resolution_minutes THEN 1 ELSE 0 END AS would_breach_if_issue_type_sla_true
    FROM ticket_base tb
    JOIN per_ticket_from_history pth
        ON pth.ticket_id = tb.ticket_id
    LEFT JOIN response_minutes rm
        ON rm.ticket_id = tb.ticket_id
)
SELECT * FROM what_if;

-- Result set 1: summary count of tickets that would breach if all issue types had SLA enabled.
SELECT
    COUNT(*) AS total_tickets_checked,
    SUM(would_breach_if_issue_type_sla_true) AS tickets_that_would_breach,
    SUM(CASE WHEN current_issue_type_sla_flag = 0 AND would_breach_if_issue_type_sla_true = 1 THEN 1 ELSE 0 END) AS currently_sla_disabled_tickets_that_would_breach,
    SUM(CASE WHEN current_issue_type_sla_flag = 1 AND would_breach_if_issue_type_sla_true = 1 THEN 1 ELSE 0 END) AS currently_sla_enabled_tickets_that_would_breach,
    SUM(currently_breached) AS tickets_currently_breached_from_ticket_sla,
    SUM(CASE WHEN currently_breached = 0 AND would_breach_if_issue_type_sla_true = 1 THEN 1 ELSE 0 END) AS additional_tickets_that_would_breach
FROM tmp_sla_what_if_all_issue_types;

-- Result set 2: per-ticket details.
SELECT *
FROM tmp_sla_what_if_all_issue_types
ORDER BY would_breach_if_issue_type_sla_true DESC, what_if_breached_by_minutes DESC, reported_date;

DROP TABLE IF EXISTS tmp_sla_what_if_all_issue_types;
