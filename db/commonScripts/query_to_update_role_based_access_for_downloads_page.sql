INSERT INTO access_policy (`policy_id`, `code`, `resource`, `effect`, `description`, `is_active`) 
VALUES ('5', 'DOWNLOADS_VIEW_SELF', 'downloads', 'allow', 'View self generated reports', '1');

INSERT INTO `ticketing_system`.`policy_rule` (`rule_id`, `policy_id`, `condition_key`, `operator`, `condition_value`, `priority`, `is_active`) 
VALUES ('4', '5', 'requestedBy', 'EQ', 'user_id', '100', '1');

INSERT INTO role_policy_map (role_id, policy_id, is_active)
VALUES 
(1, 5, 1),
(2, 5, 1),
(3, 5, 1),
(4, 5, 1),
(5, 5, 1),
(6, 5, 1),
(7, 5, 1),
(8, 5, 1),
(9, 5, 1),
(10, 5, 1),
(11, 5, 1),
(13, 5, 1),
(14, 5, 1),
(15, 5, 1);
