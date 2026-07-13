-- Seed the DB-configurable policy used by UserController for user listing APIs.
-- Update role_policy_map rows for policy code USER_LIST_ACCESS to change which roles
-- can list/search user records; no application code change is required.

INSERT INTO access_policy (code, resource, effect, description, is_active, created_by, updated_by)
SELECT 'USER_LIST_ACCESS', 'users', 'allow', 'Access user listing and user management APIs', TRUE, 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM access_policy WHERE code = 'USER_LIST_ACCESS');

INSERT INTO role_policy_map (role_id, policy_id, is_active, created_by, updated_by)
SELECT role_ids.role_id, ap.policy_id, TRUE, 'SYSTEM', 'SYSTEM'
FROM access_policy ap
JOIN (
    SELECT 2 AS role_id
    UNION ALL SELECT 6
    UNION ALL SELECT 7
    UNION ALL SELECT 14
) role_ids
WHERE ap.code = 'USER_LIST_ACCESS'
  AND NOT EXISTS (
      SELECT 1 FROM role_policy_map rpm
      WHERE rpm.role_id = role_ids.role_id
        AND rpm.policy_id = ap.policy_id
  );
