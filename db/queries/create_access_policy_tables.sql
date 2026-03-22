-- RBAC policy model for data-driven authorization

CREATE TABLE IF NOT EXISTS access_policy (
    policy_id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(100) NOT NULL UNIQUE,
    resource VARCHAR(100) NOT NULL,
    effect VARCHAR(20) NOT NULL,
    description VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_on DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_on DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM'
);

CREATE TABLE IF NOT EXISTS policy_rule (
    rule_id INT PRIMARY KEY AUTO_INCREMENT,
    policy_id INT NOT NULL,
    condition_key VARCHAR(100) NOT NULL,
    operator VARCHAR(50) NOT NULL,
    condition_value TEXT,
    priority INT NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_policy_rule_policy
        FOREIGN KEY (policy_id) REFERENCES access_policy(policy_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS role_policy_map (
    role_id INT NOT NULL,
    policy_id INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_on DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_on DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    PRIMARY KEY (role_id, policy_id),
    CONSTRAINT fk_role_policy_role
        FOREIGN KEY (role_id) REFERENCES role_permission_config(role_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_role_policy_policy
        FOREIGN KEY (policy_id) REFERENCES access_policy(policy_id)
        ON DELETE CASCADE
);

CREATE INDEX idx_access_policy_resource_active ON access_policy(resource, is_active);
CREATE INDEX idx_policy_rule_policy_active_priority ON policy_rule(policy_id, is_active, priority);
CREATE INDEX idx_role_policy_map_role_active ON role_policy_map(role_id, is_active);

-- Seed starter ticket view policies (idempotent)
INSERT INTO access_policy (code, resource, effect, description, is_active, created_by, updated_by)
SELECT 'TICKET_VIEW_ALL', 'ticket', 'allow', 'View all tickets', TRUE, 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM access_policy WHERE code = 'TICKET_VIEW_ALL');

INSERT INTO access_policy (code, resource, effect, description, is_active, created_by, updated_by)
SELECT 'TICKET_VIEW_OWN', 'ticket', 'allow', 'View own tickets', TRUE, 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM access_policy WHERE code = 'TICKET_VIEW_OWN');

INSERT INTO access_policy (code, resource, effect, description, is_active, created_by, updated_by)
SELECT 'TICKET_VIEW_ASSIGNED', 'ticket', 'allow', 'View assigned tickets', TRUE, 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM access_policy WHERE code = 'TICKET_VIEW_ASSIGNED');

INSERT INTO access_policy (code, resource, effect, description, is_active, created_by, updated_by)
SELECT 'TICKET_VIEW_SAME_ZONE', 'ticket', 'allow', 'View tickets in same zone as user', TRUE, 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM access_policy WHERE code = 'TICKET_VIEW_SAME_ZONE');

-- Seed starter rules for seeded policies (idempotent)
INSERT INTO policy_rule (policy_id, condition_key, operator, condition_value, priority, is_active)
SELECT ap.policy_id, 'ticket.owner_id', 'EQ', 'user.user_id', 100, TRUE
FROM access_policy ap
WHERE ap.code = 'TICKET_VIEW_OWN'
  AND NOT EXISTS (
      SELECT 1 FROM policy_rule pr
      WHERE pr.policy_id = ap.policy_id
        AND pr.condition_key = 'ticket.owner_id'
        AND pr.operator = 'EQ'
        AND pr.condition_value = 'user.user_id'
  );

INSERT INTO policy_rule (policy_id, condition_key, operator, condition_value, priority, is_active)
SELECT ap.policy_id, 'ticket.assigned_to', 'EQ', 'user.user_id', 100, TRUE
FROM access_policy ap
WHERE ap.code = 'TICKET_VIEW_ASSIGNED'
  AND NOT EXISTS (
      SELECT 1 FROM policy_rule pr
      WHERE pr.policy_id = ap.policy_id
        AND pr.condition_key = 'ticket.assigned_to'
        AND pr.operator = 'EQ'
        AND pr.condition_value = 'user.user_id'
  );

INSERT INTO policy_rule (policy_id, condition_key, operator, condition_value, priority, is_active)
SELECT ap.policy_id, 'ticket.zone_id', 'IN_CONTEXT', 'user.zone_ids', 100, TRUE
FROM access_policy ap
WHERE ap.code = 'TICKET_VIEW_SAME_ZONE'
  AND NOT EXISTS (
      SELECT 1 FROM policy_rule pr
      WHERE pr.policy_id = ap.policy_id
        AND pr.condition_key = 'ticket.zone_id'
        AND pr.operator = 'IN_CONTEXT'
        AND pr.condition_value = 'user.zone_ids'
  );
