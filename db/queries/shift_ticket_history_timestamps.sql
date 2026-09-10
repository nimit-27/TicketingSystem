/*
  Apply one approved timeline shift from the preview query (MySQL 8+).

  Call this once per eligible period using that period's original
  status_ended_at_utc as p_shift_from_utc and allocated_breach_minutes as
  p_shift_minutes. Only the transition immediately after the paused period is
  moved. Later transitions, including resolution, remain fixed; therefore the
  paused period grows and the following period shrinks by the same amount.

  The procedure moves status_history and assignment_history events exactly at
  the boundary. It then synchronizes only ticket_history rows backed by those
  source tables. It does not change ticket_sla; recalculate SLA metrics through
  the application after all approved shifts have been applied.
*/
DROP PROCEDURE IF EXISTS shift_ticket_history_timestamps;

DELIMITER $$

CREATE PROCEDURE shift_ticket_history_timestamps(
    IN p_ticket_id VARCHAR(36),
    IN p_shift_from_utc DATETIME(6),
    IN p_shift_minutes BIGINT
)
BEGIN
    DECLARE v_following_transition_utc DATETIME(6);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_ticket_id IS NULL OR p_ticket_id = '' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'p_ticket_id is required';
    END IF;

    IF p_shift_from_utc IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'p_shift_from_utc is required';
    END IF;

    IF p_shift_minutes IS NULL OR p_shift_minutes <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'p_shift_minutes must be greater than zero';
    END IF;

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
          ) > p_shift_from_utc;

    IF v_following_transition_utc IS NULL
       OR TIMESTAMPADD(MINUTE, p_shift_minutes, p_shift_from_utc)
            > v_following_transition_utc THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'shift would overlap the following status transition';
    END IF;

    START TRANSACTION;

    UPDATE status_history sh
    SET
        sh.timestamp_utc = TIMESTAMPADD(
            MINUTE,
            p_shift_minutes,
            COALESCE(
                sh.timestamp_utc,
                CONVERT_TZ(sh.`timestamp`, '+05:30', '+00:00')
            )
        ),
        sh.`timestamp` = TIMESTAMPADD(MINUTE, p_shift_minutes, sh.`timestamp`)
    WHERE sh.ticket_id = p_ticket_id
      AND COALESCE(
            sh.timestamp_utc,
            CONVERT_TZ(sh.`timestamp`, '+05:30', '+00:00')
          ) = p_shift_from_utc;

    UPDATE assignment_history ah
    SET ah.`timestamp` = TIMESTAMPADD(MINUTE, p_shift_minutes, ah.`timestamp`)
    WHERE ah.ticket_id = p_ticket_id
      AND CONVERT_TZ(ah.`timestamp`, '+05:30', '+00:00') = p_shift_from_utc;

    UPDATE ticket_history th
    JOIN status_history sh
      ON th.source_table = 'status_history'
     AND th.source_history_id = sh.status_history_id
    SET
        th.updated_on = sh.`timestamp`,
        th.updated_on_utc = sh.timestamp_utc
    WHERE th.ticket_id = p_ticket_id;

    UPDATE ticket_history th
    JOIN assignment_history ah
      ON th.source_table = 'assignment_history'
     AND th.source_history_id = ah.id
    SET
        th.updated_on = ah.`timestamp`,
        th.updated_on_utc = CONVERT_TZ(ah.`timestamp`, '+05:30', '+00:00')
    WHERE th.ticket_id = p_ticket_id;

    COMMIT;
END$$

DELIMITER ;

/*
Example, using an eligible row from the preview query:

CALL shift_ticket_history_timestamps(
    'TKT-1-202601-00001',
    '2026-01-15 08:30:00.000000',
    15
);
*/
