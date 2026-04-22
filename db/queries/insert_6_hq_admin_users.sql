INSERT INTO requester_users (
  requester_user_id, name, email_id, mobile_no, office, username, password, roles, stakeholder,
  first_name, middle_name, last_name, date_of_joining, date_of_retirement, office_type, office_code,
  zone_code, district_code, region_code, active
) VALUES
  ('HQ_Super_Admin',         'HQ_Super_Admin',         NULL, NULL, 'HQ', 'HQ_Super_Admin',         'AnnaDarpan@321', '5|14', '5', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1),
  ('HA11_SALES_ADMIN',       'HA11_SALES_ADMIN',       NULL, NULL, 'HQ', 'HA11_SALES_ADMIN',       'AnnaDarpan@321', '5|14', '5', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1),
  ('HA11_PROCUREMENT_ADMIN', 'HA11_PROCUREMENT_ADMIN', NULL, NULL, 'HQ', 'HA11_PROCUREMENT_ADMIN', 'AnnaDarpan@321', '5|14', '5', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1),
  ('HA11_STOTAGE_ADMIN',     'HA11_STOTAGE_ADMIN',     NULL, NULL, 'HQ', 'HA11_STOTAGE_ADMIN',     'AnnaDarpan@321', '5|14', '5', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1),
  ('HA11_MOVEMENT_ADMIN',    'HA11_MOVEMENT_ADMIN',    NULL, NULL, 'HQ', 'HA11_MOVEMENT_ADMIN',    'AnnaDarpan@321', '5|14', '5', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1),
  ('HA11_QC_ADMIN',          'HA11_QC_ADMIN',          NULL, NULL, 'HQ', 'HA11_QC_ADMIN',          'AnnaDarpan@321', '5|14', '5', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1),
  ('HA11_STOCKS_PV_ADMIN',   'HA11_STOCKS_PV_ADMIN',   NULL, NULL, 'HQ', 'HA11_STOCKS_PV_ADMIN',   'AnnaDarpan@321', '5|14', '5', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1)
AS v
ON DUPLICATE KEY UPDATE
  name        = v.name,
  office      = v.office,
  username    = v.username,
  password    = v.password,
  roles       = v.roles,
  stakeholder = v.stakeholder,
  active      = v.active;