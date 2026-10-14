SELECT * FROM requester_users
WHERE requester_user_id = '312692';

SELECT * FROM region_master;

UPDATE `ad_prd_ticket_system`.`requester_users` 
SET `office_type` = 'ZO', `office_code` = 'SA11', 
`district_code` = NULL, `region_code` = NULL 
WHERE (`requester_user_id` = '282592');

UPDATE `ad_prd_ticket_system`.`requester_users` 
SET `office_type` = 'ZO', `office_code` = 'SA11', 
`district_code` = NULL, `region_code` = NULL 
WHERE (`requester_user_id` = '284101');

UPDATE `ad_prd_ticket_system`.`requester_users` 
SET `office_code` = 'NF18', 
`district_code` = 'NF18' ,
`region_code` = 'NF'
WHERE (`requester_user_id` = '276560');

UPDATE `ad_prd_ticket_system`.`requester_users` SET `office_code` = 'WF11', `district_code` = 'WF11', `region_code` = 'WF' WHERE (`requester_user_id` = '308703');

UPDATE `ad_prd_ticket_system`.`requester_users` SET `office_code` = 'EF18', `district_code` = 'EF18' WHERE (`requester_user_id` = '291538');

UPDATE `ad_prd_ticket_system`.`requester_users` SET `office_code` = 'EF11', `district_code` = 'EF11' WHERE (`requester_user_id` = '283082');

UPDATE `ad_prd_ticket_system`.`requester_users` SET `office_code` = 'EE17', `district_code` = 'EE17', `region_code` = 'EE' WHERE (`requester_user_id` = '298283');

-- https://annadarpan.in/helpdesk/tickets/TKT-1-202604-02576
UPDATE `ad_prd_ticket_system`.`requester_users` SET `office_code` = 'WB14', `district_code` = 'WB14', `region_code` = 'WB' WHERE (`requester_user_id` = '142478');

-- https://annadarpan.in/helpdesk/tickets/TKT-1-202610-01574
UPDATE `ad_prd_ticket_system`.`requester_users` SET `office_code` = 'SE14', `district_code` = 'SE14', `region_code` = 'SE' WHERE (`requester_user_id` = '312692');
