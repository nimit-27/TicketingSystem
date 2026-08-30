-- Recalculate historical SLA due dates after holidays/weekends were added late.
-- MySQL 8.0+
--
-- What this script updates:
--   ticket_sla.actual_due_at
--   ticket_sla.due_at
--
-- Assumptions:
--   1) SLA due date baseline = tickets.reported_date + sla_config.resolution_minutes in BUSINESS time.
--   2) Non-working days = Saturday/Sunday + rows in calendar_holiday for @target_region.
--   3) Working window = currently active row from calendar_working_hours.
--
-- IMPORTANT:
--   - Take DB backup/snapshot before running.
--   - Review the preview query result before COMMIT.

SET @target_region := 'IN-WB-Kolkata';
SET @max_scan_days := 120; -- increase if any SLA can span beyond this many calendar days

START TRANSACTION;

DROP TEMPORARY TABLE IF EXISTS tmp_recomputed_due;
CREATE TEMPORARY TABLE tmp_recomputed_due (
  ticket_sla_id VARCHAR(36) PRIMARY KEY,
  recomputed_due_at DATETIME NOT NULL
);

INSERT INTO tmp_recomputed_due (ticket_sla_id, recomputed_due_at)
WITH RECURSIVE
active_hours AS (
  SELECT cwh.start_time, cwh.end_time
  FROM calendar_working_hours cwh
  WHERE cwh.is_active = 1
  ORDER BY cwh.id DESC
  LIMIT 1
),
base AS (
  SELECT
    ts.ticket_sla_id,
    t.reported_date AS start_ts,
    sc.resolution_minutes AS policy_minutes
  FROM ticket_sla ts
  INNER JOIN tickets t ON t.ticket_id = ts.ticket_id
  INNER JOIN sla_config sc ON sc.sla_id = ts.sla_id
  WHERE t.reported_date IS NOT NULL
    AND sc.resolution_minutes IS NOT NULL
),
span AS (
  SELECT
    b.ticket_sla_id,
    b.start_ts,
    b.policy_minutes,
    DATE(b.start_ts) AS work_date,
    0 AS day_idx
  FROM base b

  UNION ALL

  SELECT
    s.ticket_sla_id,
    s.start_ts,
    s.policy_minutes,
    DATE_ADD(s.work_date, INTERVAL 1 DAY) AS work_date,
    s.day_idx + 1
  FROM span s
  WHERE s.day_idx < @max_scan_days
),
per_day AS (
  SELECT
    s.ticket_sla_id,
    s.policy_minutes,
    s.work_date,
    GREATEST(s.start_ts, TIMESTAMP(s.work_date, ah.start_time)) AS slice_start,
    TIMESTAMP(s.work_date, ah.end_time) AS slice_end,
    CASE
      WHEN DAYOFWEEK(s.work_date) IN (1, 7) THEN 0
      WHEN EXISTS (
        SELECT 1
        FROM calendar_holiday ch
        WHERE ch.holiday_date = s.work_date
          AND ch.region = @target_region
      ) THEN 0
      ELSE GREATEST(
        TIMESTAMPDIFF(
          MINUTE,
          GREATEST(s.start_ts, TIMESTAMP(s.work_date, ah.start_time)),
          TIMESTAMP(s.work_date, ah.end_time)
        ),
        0
      )
    END AS workable_minutes
  FROM span s
  CROSS JOIN active_hours ah
),
accum AS (
  SELECT
    p.ticket_sla_id,
    p.policy_minutes,
    p.work_date,
    p.slice_start,
    p.workable_minutes,
    SUM(p.workable_minutes) OVER (
      PARTITION BY p.ticket_sla_id
      ORDER BY p.work_date
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative_minutes
  FROM per_day p
),
cutoff AS (
  SELECT
    a.ticket_sla_id,
    DATE_ADD(
      a.slice_start,
      INTERVAL (a.policy_minutes - (a.cumulative_minutes - a.workable_minutes)) MINUTE
    ) AS recomputed_due_at,
    ROW_NUMBER() OVER (
      PARTITION BY a.ticket_sla_id
      ORDER BY a.work_date
    ) AS rn
  FROM accum a
  WHERE a.workable_minutes > 0
    AND a.cumulative_minutes >= a.policy_minutes
)
SELECT c.ticket_sla_id, c.recomputed_due_at
FROM cutoff c
WHERE c.rn = 1;

-- Preview changed rows before applying update
SELECT
  ts.ticket_sla_id,
  ts.due_at AS old_due_at,
  ts.actual_due_at AS old_actual_due_at,
  trd.recomputed_due_at AS new_due_at
FROM ticket_sla ts
JOIN tmp_recomputed_due trd ON trd.ticket_sla_id = ts.ticket_sla_id
WHERE (ts.due_at <> trd.recomputed_due_at OR ts.actual_due_at <> trd.recomputed_due_at)
ORDER BY ts.ticket_sla_id;

-- Apply update (due_at and actual_due_at aligned to recomputed baseline)
UPDATE ticket_sla ts
JOIN tmp_recomputed_due trd ON trd.ticket_sla_id = ts.ticket_sla_id
SET
  ts.actual_due_at = trd.recomputed_due_at,
  ts.due_at = trd.recomputed_due_at;

-- Post-check count
SELECT ROW_COUNT() AS updated_rows;

COMMIT;

-- If preview looked wrong, run ROLLBACK instead of COMMIT.
