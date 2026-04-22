UPDATE role_permission_config 
SET `allowed_status_action_ids` = '21|28|30' 
WHERE (`role_id` = '13');

INSERT INTO ticket_status_workflow (`TSW_Id`, `TSW_Action`, `TSW_Current_Status`, `TSW_Next_Status`) 
VALUES ('30', 'Resolve', '5', '7');