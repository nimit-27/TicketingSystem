/*
  Apply one approved paused-period extension from the preview query (MySQL 8+).

  The procedure accepts the history row that ENTERED Pending with Requester or
  Pending with FCI. It verifies status_master.sla_flag = 0, locates only the
  immediately following status transition, and moves that boundary by the
  approved allocation. Later transitions (including resolution) stay fixed, so
  the paused period grows and the following active period shrinks.

  p_new_boundary_utc must be calculated by the application with
  SlaCalculatorService.computeEnd(oldBoundary, Duration.ofMinutes(allocation)).
  This is intentional: TIMESTAMPADD would add absolute elapsed minutes and would
  be wrong when a shift crosses closing time, a holiday, or an hours exception.
  After applying all approved boundary changes, rerun the
  application's calendar-aware SLA recalculation; this procedure deliberately
  does not overwrite ticket_sla.
*/
DROP PROCEDURE IF EXISTS shift_ticket_history_timestamps;

DELIMITER $$

CREATE PROCEDURE shift_ticket_history_timestamps(
    IN p_ticket_id VARCHAR(36),
    IN p_paused_status_history_id VARCHAR(36),
    IN p_new_boundary_utc DATETIME(6)
)
BEGIN
    DECLARE v_paused_status_code VARCHAR(50);
    DECLARE v_paused_sla_flag TINYINT;
    DECLARE v_paused_started_at_utc DATETIME(6);
    DECLARE v_boundary_history_id VARCHAR(36);
    DECLARE v_boundary_utc DATETIME(6);
    DECLARE v_following_transition_utc DATETIME(6);
    DECLARE v_boundary_local DATETIME(6);
    DECLARE v_new_boundary_utc DATETIME(6);
    DECLARE v_new_boundary_local DATETIME(6);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_ticket_id IS NULL OR p_ticket_id = '' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'p_ticket_id is required';
    END IF;

    IF p_paused_status_history_id IS NULL OR p_paused_status_history_id = '' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'p_paused_status_history_id is required';
    END IF;

    IF p_new_boundary_utc IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'p_new_boundary_utc is required';
    END IF;

    /* Resolve and validate the row that entered the paused status. */
    SELECT
        sm.status_code,
        sm.sla_flag,
        COALESCE(
            sh.timestamp_utc,
            CONVERT_TZ(sh.`timestamp`, '+05:30', '+00:00')
        )
    INTO
        v_paused_status_code,
        v_paused_sla_flag,
        v_paused_started_at_utc
    FROM status_history sh
    JOIN status_master sm
      ON CAST(sm.status_id AS CHAR) = sh.current_status
    WHERE sh.status_history_id = p_paused_status_history_id
      AND sh.ticket_id = p_ticket_id;

    IF v_paused_started_at_utc IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'paused status-history row was not found';
    END IF;

    IF v_paused_sla_flag <> 0
       OR v_paused_status_code NOT IN ('PENDING_WITH_REQUESTER', 'PENDING_WITH_FCI') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'history row is not an eligible SLA-paused status';
    END IF;

    /* Locate the one transition that ends the selected paused period. */
    SELECT
        sh.status_history_id,
        COALESCE(
            sh.timestamp_utc,
            CONVERT_TZ(sh.`timestamp`, '+05:30', '+00:00')
        ),
        sh.`timestamp`
    INTO
        v_boundary_history_id,
        v_boundary_utc,
        v_boundary_local
    FROM status_history sh
    WHERE sh.ticket_id = p_ticket_id
      AND (
          COALESCE(
              sh.timestamp_utc,
              CONVERT_TZ(sh.`timestamp`, '+05:30', '+00:00')
          ) > v_paused_started_at_utc
          OR (
              COALESCE(
                  sh.timestamp_utc,
                  CONVERT_TZ(sh.`timestamp`, '+05:30', '+00:00')
              ) = v_paused_started_at_utc
              AND sh.status_history_id > p_paused_status_history_id
          )
      )
    ORDER BY
        COALESCE(
            sh.timestamp_utc,
            CONVERT_TZ(sh.`timestamp`, '+05:30', '+00:00')
        ),
        sh.status_history_id
    LIMIT 1;

    IF v_boundary_history_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'paused status has no following transition';
    END IF;

    SET v_new_boundary_utc = p_new_boundary_utc;
    SET v_new_boundary_local = CONVERT_TZ(p_new_boundary_utc, '+00:00', '+05:30');

    IF v_new_boundary_utc <= v_boundary_utc THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'new boundary must be later than the existing boundary';
    END IF;

    /* Keep the next fixed event (often resolution) from being crossed. */
    SELECT MIN(
        COALESCE(
            sh.timestamp_utc,
            CONVERT_TZ(sh.`timestamp`, '+05:30', '+00:00')
        )
    )
    INTO v_following_transition_utc
    FROM status_history sh
    WHERE sh.ticket_id = p_ticket_id
      AND COALESCE(
            sh.timestamp_utc,
            CONVERT_TZ(sh.`timestamp`, '+05:30', '+00:00')
          ) > v_boundary_utc;

    IF v_following_transition_utc IS NULL
       OR v_new_boundary_utc > v_following_transition_utc THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'shift would overlap the following status transition';
    END IF;

    START TRANSACTION;

    /* Move only the row that exits the selected paused period. */
    UPDATE status_history sh
    SET
        sh.timestamp_utc = v_new_boundary_utc,
        sh.`timestamp` = v_new_boundary_local
    WHERE sh.status_history_id = v_boundary_history_id
      AND sh.ticket_id = p_ticket_id;

    /* An assignment made at that transition must move with it. */
    UPDATE assignment_history ah
    SET ah.`timestamp` = v_new_boundary_local
    WHERE ah.ticket_id = p_ticket_id
      AND CONVERT_TZ(ah.`timestamp`, '+05:30', '+00:00') = v_boundary_utc;

    /* Synchronize generic history rows backed by the moved status event. */
    UPDATE ticket_history th
    SET
        th.updated_on = v_new_boundary_local,
        th.updated_on_utc = v_new_boundary_utc
    WHERE th.ticket_id = p_ticket_id
      AND th.source_table = 'status_history'
      AND th.source_history_id = v_boundary_history_id;

    /* Synchronize generic history rows backed by moved assignment events. */
    UPDATE ticket_history th
    JOIN assignment_history ah
      ON th.source_table = 'assignment_history'
     AND th.source_history_id = ah.id
    SET
        th.updated_on = ah.`timestamp`,
        th.updated_on_utc = CONVERT_TZ(ah.`timestamp`, '+05:30', '+00:00')
    WHERE th.ticket_id = p_ticket_id
      AND ah.ticket_id = p_ticket_id
      AND CONVERT_TZ(ah.`timestamp`, '+05:30', '+00:00') = v_new_boundary_utc;

    COMMIT;

    /* Return the applied boundary for audit/logging by the caller. */
    SELECT
        p_ticket_id AS ticket_id,
        p_paused_status_history_id AS paused_status_history_id,
        v_boundary_history_id AS moved_status_history_id,
        v_boundary_utc AS previous_boundary_utc,
        v_new_boundary_utc AS new_boundary_utc,
        TIMESTAMPDIFF(MINUTE, v_boundary_utc, v_new_boundary_utc)
            AS elapsed_shift_minutes;
END$$

DELIMITER ;

/*
Example: pending starts at 13:10, its next Assigned row is at 13:20, and the
approved breach allocation is 3 minutes. The procedure moves only Assigned to
13:23; a later Resolved row at 13:30 remains 13:30.

CALL shift_ticket_history_timestamps(
    'TKT-1-202601-00001',
    '<status_history_id-that-entered-pending>',
    '<calendar-aware-new-boundary-utc>'
);
*/
