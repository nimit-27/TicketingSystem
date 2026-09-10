/*
  Preview SLA-breach redistribution across ticket status history (MySQL 8+).

  Every ticket_sla row whose breached_by_minutes is positive is retained, even
  if it has no status history. The SLA flag comes only from status_master.

  Breach minutes are divided equally, as whole minutes, only among periods in
  PENDING_WITH_REQUESTER or PENDING_WITH_FCI where status_master.sla_flag = 0.
  Any division remainder is assigned one minute at a time to the earliest
  eligible periods, so allocated_breach_minutes sums exactly to the breach.

  The proposed timestamps move only the transition immediately after an
  eligible period. The eligible period grows while the following status period
  shrinks by the same amount; the resolution timestamp remains unchanged.
  ticket_sla resolution values are business-working minutes calculated by the
  application calendar, and the SLA threshold comes from sla_config. This
  SELECT is a preview only. Use shift_ticket_history_timestamps.sql to apply an approved
  shift while keeping status, assignment, and generic ticket history aligned.
*/
WITH status_events AS (
    SELECT
        sh.status_history_id,
        sh.ticket_id,
        sh.previous_status,
        sh.current_status AS status_id,
        COALESCE(
            sh.timestamp_utc,
            CONVERT_TZ(sh.`timestamp`, '+05:30', '+00:00')
        ) AS status_started_at_utc,
        LEAD(
            COALESCE(
                sh.timestamp_utc,
                CONVERT_TZ(sh.`timestamp`, '+05:30', '+00:00')
            )
        ) OVER (
            PARTITION BY sh.ticket_id
            ORDER BY
                COALESCE(
                    sh.timestamp_utc,
                    CONVERT_TZ(sh.`timestamp`, '+05:30', '+00:00')
                ),
                sh.status_history_id
        ) AS next_status_started_at_utc,
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
        sm.sla_flag,
        se.status_started_at_utc,
        CASE
            WHEN se.next_status_started_at_utc IS NOT NULL
                THEN se.next_status_started_at_utc
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
eligibility AS (
    SELECT
        sp.*,
        CASE
            WHEN sp.sla_flag = 0
             AND sp.status_code IN ('PENDING_WITH_REQUESTER', 'PENDING_WITH_FCI')
                THEN 1
            ELSE 0
        END AS is_allocation_status
    FROM status_periods sp
),
ranked_periods AS (
    SELECT
        e.*,
        SUM(e.is_allocation_status) OVER (
            PARTITION BY e.ticket_id
        ) AS allocation_status_count,
        SUM(e.is_allocation_status) OVER (
            PARTITION BY e.ticket_id
            ORDER BY e.status_started_at_utc, e.status_history_id
            ROWS UNBOUNDED PRECEDING
        ) AS allocation_status_sequence
    FROM eligibility e
),
breached_tickets AS (
    SELECT
        ts.ticket_sla_id,
        ts.ticket_id,
        ts.breached_by_minutes,
        ts.idle_time_minutes,
        ts.resolution_time_minutes,
        sc.resolution_minutes AS resolution_threshold_minutes,
        COALESCE(
            ts.due_at_after_escalation,
            ts.actual_due_at,
            ts.due_at
        ) AS effective_due_at
    FROM ticket_sla ts
    LEFT JOIN sla_config sc
        ON sc.sla_id = ts.sla_id
    WHERE COALESCE(ts.breached_by_minutes, 0) > 0
),
allocations AS (
    SELECT
        bt.ticket_sla_id,
        bt.ticket_id,
        bt.breached_by_minutes,
        bt.idle_time_minutes,
        bt.resolution_time_minutes,
        bt.resolution_threshold_minutes,
        bt.effective_due_at,
        rp.status_history_id,
        rp.previous_status,
        rp.status_id,
        rp.status_name,
        rp.status_code,
        rp.sla_flag,
        rp.status_started_at_utc,
        rp.status_ended_at_utc,
        rp.status_duration_minutes,
        rp.updated_by,
        rp.remark,
        rp.is_allocation_status,
        rp.allocation_status_count,
        rp.allocation_status_sequence,
        CASE
            WHEN rp.is_allocation_status = 1
                THEN FLOOR(bt.breached_by_minutes / rp.allocation_status_count)
                   + CASE
                         WHEN rp.allocation_status_sequence
                              <= MOD(bt.breached_by_minutes, rp.allocation_status_count)
                             THEN 1
                         ELSE 0
                     END
            ELSE 0
        END AS allocated_breach_minutes
    FROM breached_tickets bt
    LEFT JOIN ranked_periods rp
        ON rp.ticket_id = bt.ticket_id
),
proposed_periods AS (
    SELECT
        a.*,
        TIMESTAMPADD(
            MINUTE,
            COALESCE(
                LAG(a.allocated_breach_minutes) OVER (
                    PARTITION BY a.ticket_sla_id
                    ORDER BY a.status_started_at_utc, a.status_history_id
                ),
                0
            ),
            a.status_started_at_utc
        ) AS proposed_status_started_at_utc,
        TIMESTAMPADD(
            MINUTE,
            a.allocated_breach_minutes,
            a.status_ended_at_utc
        ) AS proposed_status_ended_at_utc
    FROM allocations a
)
SELECT
    t.ticket_id,
    t.subject,
    t.status AS current_ticket_status,
    pp.ticket_sla_id,
    pp.effective_due_at,
    pp.breached_by_minutes,
    pp.idle_time_minutes AS recorded_idle_time_minutes,
    pp.resolution_time_minutes AS business_resolution_time_minutes,
    pp.resolution_threshold_minutes AS business_resolution_threshold_minutes,
    pp.status_history_id,
    pp.previous_status AS previous_status_id,
    pp.status_id,
    pp.status_name,
    pp.status_code,
    pp.sla_flag,
    pp.status_started_at_utc,
    pp.status_ended_at_utc,
    pp.status_duration_minutes,
    pp.is_allocation_status,
    pp.allocation_status_count,
    pp.allocated_breach_minutes,
    pp.proposed_status_started_at_utc,
    pp.proposed_status_ended_at_utc,
    GREATEST(
        TIMESTAMPDIFF(
            MINUTE,
            pp.proposed_status_started_at_utc,
            pp.proposed_status_ended_at_utc
        ),
        0
    ) AS proposed_status_duration_minutes,
    CASE
        WHEN pp.proposed_status_started_at_utc
             <= pp.proposed_status_ended_at_utc
            THEN 'YES'
        ELSE 'NO'
    END AS transition_order_valid,
    GREATEST(
        pp.resolution_time_minutes - pp.breached_by_minutes,
        0
    ) AS proposed_business_resolution_minutes,
    CASE
        WHEN pp.allocation_status_count > 0
         AND pp.resolution_time_minutes - pp.breached_by_minutes
             <= pp.resolution_threshold_minutes
            THEN 'YES'
        ELSE 'NO'
    END AS within_business_sla_threshold,
    pp.updated_by AS status_updated_by,
    pp.remark AS status_remark
FROM proposed_periods pp
JOIN tickets t
    ON t.ticket_id = pp.ticket_id
ORDER BY
    t.ticket_id,
    pp.status_started_at_utc,
    pp.status_history_id;
