/*
  Audit SLA breaches against ticket status history (MySQL 8+).

  One result row is returned for every status-history period of every ticket
  whose breached_by_minutes is greater than zero. A breached ticket without
  history is still returned because status_periods is LEFT JOINed.

  status_duration_minutes is elapsed clock time, not business-calendar time.
  The historical status_history.sla_flag is preferred because a master's flag
  can change later. status_master.sla_flag is only a fallback for older rows.

  allocated_breach_minutes distributes the removable portion of the breach
  proportionally over SLA-paused periods (sla_flag = 0), without allocating
  more than either the breach or the total paused duration. The ticket-level
  adjusted_breached_by_minutes is therefore:

      GREATEST(breached_by_minutes - total_sla_paused_minutes, 0)

  This is an audit SELECT only; review its output before using the values in an
  UPDATE. It intentionally uses status_history rather than ticket_history:
  ticket_history stores field changes, while status_history stores the status
  transition timestamp and the SLA flag needed to form status periods.
*/
WITH status_events AS (
    SELECT
        sh.status_history_id,
        sh.ticket_id,
        sh.previous_status,
        sh.current_status AS status_id,
        COALESCE(
            sh.timestamp_utc,
            CONVERT_TZ(sh.`timestamp`, 'Asia/Kolkata', '+00:00')
        ) AS status_started_at_utc,
        LEAD(
            COALESCE(
                sh.timestamp_utc,
                CONVERT_TZ(sh.`timestamp`, 'Asia/Kolkata', '+00:00')
            )
        ) OVER (
            PARTITION BY sh.ticket_id
            ORDER BY
                COALESCE(
                    sh.timestamp_utc,
                    CONVERT_TZ(sh.`timestamp`, 'Asia/Kolkata', '+00:00')
                ),
                sh.status_history_id
        ) AS next_status_started_at_utc,
        sh.sla_flag AS historical_sla_flag,
        sh.updated_by,
        sh.remark
    FROM status_history sh
),
status_periods AS (
    SELECT
        se.status_history_id,
        se.ticket_id,
        se.previous_status,
        se.status_id,
        sm.status_name,
        sm.status_code,
        COALESCE(se.historical_sla_flag, sm.sla_flag) AS sla_flag,
        se.status_started_at_utc,
        CASE
            WHEN se.next_status_started_at_utc IS NOT NULL
                THEN se.next_status_started_at_utc
            /* A terminal status stops the clock when it is entered. */
            WHEN sm.status_code IN ('RESOLVED', 'CLOSED', 'CANCELLED')
                THEN se.status_started_at_utc
            ELSE UTC_TIMESTAMP(6)
        END AS status_ended_at_utc,
        GREATEST(
            TIMESTAMPDIFF(
                MINUTE,
                se.status_started_at_utc,
                CASE
                    WHEN se.next_status_started_at_utc IS NOT NULL
                        THEN se.next_status_started_at_utc
                    WHEN sm.status_code IN ('RESOLVED', 'CLOSED', 'CANCELLED')
                        THEN se.status_started_at_utc
                    ELSE UTC_TIMESTAMP(6)
                END
            ),
            0
        ) AS status_duration_minutes,
        se.updated_by,
        se.remark
    FROM status_events se
    LEFT JOIN status_master sm
        ON CAST(sm.status_id AS CHAR) = se.status_id
),
breached_tickets AS (
    SELECT
        ts.ticket_sla_id,
        ts.ticket_id,
        ts.breached_by_minutes,
        ts.idle_time_minutes,
        COALESCE(
            ts.due_at_after_escalation,
            ts.actual_due_at,
            ts.due_at
        ) AS effective_due_at
    FROM ticket_sla ts
    WHERE COALESCE(ts.breached_by_minutes, 0) > 0
),
joined_history AS (
    SELECT
        bt.ticket_sla_id,
        bt.ticket_id,
        bt.breached_by_minutes,
        bt.idle_time_minutes,
        bt.effective_due_at,
        sp.status_history_id,
        sp.previous_status,
        sp.status_id,
        sp.status_name,
        sp.status_code,
        sp.sla_flag,
        sp.status_started_at_utc,
        sp.status_ended_at_utc,
        sp.status_duration_minutes,
        sp.updated_by,
        sp.remark,
        SUM(
            CASE
                WHEN sp.sla_flag = 0 THEN sp.status_duration_minutes
                ELSE 0
            END
        ) OVER (PARTITION BY bt.ticket_sla_id) AS total_sla_paused_minutes
    FROM breached_tickets bt
    LEFT JOIN status_periods sp
        ON sp.ticket_id = bt.ticket_id
)
SELECT
    t.ticket_id,
    t.subject,
    t.status AS current_ticket_status,
    jh.ticket_sla_id,
    jh.effective_due_at,
    jh.breached_by_minutes,
    jh.idle_time_minutes AS recorded_idle_time_minutes,
    jh.status_history_id,
    jh.previous_status AS previous_status_id,
    jh.status_id,
    jh.status_name,
    jh.status_code,
    jh.sla_flag,
    jh.status_started_at_utc,
    jh.status_ended_at_utc,
    jh.status_duration_minutes,
    jh.total_sla_paused_minutes,
    CASE
        WHEN jh.sla_flag = 0 AND jh.total_sla_paused_minutes > 0
            THEN ROUND(
                LEAST(jh.breached_by_minutes, jh.total_sla_paused_minutes)
                * jh.status_duration_minutes
                / jh.total_sla_paused_minutes,
                2
            )
        ELSE 0
    END AS allocated_breach_minutes,
    GREATEST(
        jh.breached_by_minutes - jh.total_sla_paused_minutes,
        0
    ) AS adjusted_breached_by_minutes,
    jh.updated_by AS status_updated_by,
    jh.remark AS status_remark
FROM joined_history jh
JOIN tickets t
    ON t.ticket_id = jh.ticket_id
ORDER BY
    t.ticket_id,
    jh.status_started_at_utc,
    jh.status_history_id;
