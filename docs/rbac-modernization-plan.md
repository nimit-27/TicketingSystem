# RBAC Modernization Plan (Ticketing System)

## Why this change is needed

Today, role/access behavior is split across JSON permissions, hard-coded IDs/names, and role helper utilities. This makes “create a role and grant ticket access” a backend-change task rather than a configuration task.

Current examples in code:

- Permission bootstrap and mutation are role-record backed, but include hard-coded role ID logic (`USER_PAGE_ROLE_IDS`) in service code.
- Ticket authorization includes hard-coded role identifiers (`"9"`, `"13"`, `"it manager"`) and condition logic in Java.
- `RoleUtils` contains static role identifier sets for unrestricted access.

## Target state

Make authorization **data-driven** so admins can manage:

1. Role creation.
2. Scope of ticket visibility (all tickets vs own/assigned/etc.).
3. Action-level capabilities (status transitions, comments, assignment, escalation).
4. Resource-level conditions (e.g., status-specific visibility).

…without backend code changes.

## Recommended design

## 1) Normalize authorization into explicit policy tables

Add tables (or equivalent JSON columns if incremental migration is preferred):

- `access_policy`
  - `policy_id`, `code`, `resource` (e.g., `ticket`), `effect` (`allow`/`deny`), `description`, `is_active`.
- `policy_rule`
  - `rule_id`, `policy_id`, `condition_type`, `condition_key`, `operator`, `condition_value`.
  - Example: `condition_key=ticket.status`, `operator=IN`, `condition_value=["AWAITING_ESCALATION_APPROVAL"]`.
  - Zone-based example: `condition_key=ticket.zone_id`, `operator=IN_CONTEXT`, `condition_value="user.zone_ids"`.
- `role_policy_map`
  - `role_id`, `policy_id`.

Minimum starter policy set for ticket visibility:

- `TICKET_VIEW_ALL`
- `TICKET_VIEW_OWN`
- `TICKET_VIEW_ASSIGNED`
- `TICKET_VIEW_STATUS_BASED`

This removes hard-coded role IDs/names from service code.

## 2) Keep existing `permissions` JSON for UI features only

Your existing `RolePermission` model (`sidebar`/`pages`) works for menu/page toggles. Keep it for UI-level controls.

Move **domain authorization** (ticket access rules) out of `RoleUtils` and `TicketAuthorizationService` into policy evaluation.

## 3) Introduce a Policy Evaluation Service

Create a dedicated service API:

- `boolean canViewTicket(UserContext user, TicketAccessContext ticket)`
- `boolean canPerform(String action, UserContext user, TicketAccessContext ticket)`

Behavior:

1. Resolve user roles.
2. Resolve policies mapped to those roles.
3. Evaluate policy rules against the ticket context.
4. Return allow/deny with deterministic precedence (explicit deny > allow).

## 4) Add admin endpoints for configuration

Add APIs to manage policy without redeploy:

- `POST /policies`
- `PUT /policies/{id}`
- `POST /roles/{id}/policies`
- `GET /roles/{id}/effective-access`

This enables role onboarding directly from admin UI or scripts.

## 5) Cache with invalidation

Use in-memory cache for role→policy and policy→rules lookup with invalidation on policy update.

- On role/policy update: evict related cache keys.
- On startup: warm caches from DB.

## 6) Backward-compatible migration strategy

Phase 1:

- Add policy tables + read path (no write cutover).
- Mirror current hard-coded behavior into seed policies.

Phase 2:

- Switch `TicketAuthorizationService` to policy evaluator first, with fallback to old checks.

Phase 3:

- Remove hard-coded checks from:
  - `TicketAuthorizationService`
  - `RoleUtils`
  - `PermissionService` role-ID-specific branches

Phase 4:

- Add admin UI for role-policy mapping.

## Practical “all tickets access” flow after migration

1. Create role in `role_permission_config` (existing flow).
2. Assign policy `TICKET_VIEW_ALL` to that role (new API/UI).
3. Optional: assign `TICKET_EDIT_ALL`, `TICKET_ASSIGN_ALL`, `TICKET_ESCALATE` policies.
4. User with that role gets access immediately after cache invalidation.

No backend code edits required.

## Discussion Q&A

### Can I create new policies right now?

Not yet in the **current implementation**. Right now, policy CRUD endpoints and policy tables are a proposed target-state, not live features.

### Can we support zone-based ticket access?

Yes — this is exactly what the policy-rule model is meant to support. The intended rule shape is:

- Resource: `ticket`
- Policy: `TICKET_VIEW_SAME_ZONE`
- Rule: `ticket.zone_id IN user.zone_ids`

At evaluation time, the engine reads user context (e.g., `zone_ids`) and ticket context (`zone_id`) and returns allow/deny without hard-coding role IDs in Java.

### What changes are needed for that?

1. Add policy schema (`access_policy`, `policy_rule`, `role_policy_map`).
2. Extend user context resolver to provide `zone_ids`.
3. Extend ticket access context to provide `zone_id`.
4. Implement comparator `IN_CONTEXT` (left field evaluated against right-side context attribute).
5. Attach `TICKET_VIEW_SAME_ZONE` to any role from admin UI/API.

## Start small: Phase-1 implementation checklist (no hard-coded `role_id`)

If your immediate goal is: “while creating a role, I should not change backend code”, implement these first.

### A) Database changes (minimum)

1. **Create `access_policy`**
   - Stores reusable policy definitions.
   - Suggested columns:
     - `policy_id` (PK)
     - `code` (unique, e.g., `TICKET_VIEW_ALL`, `TICKET_VIEW_SAME_ZONE`)
     - `resource` (e.g., `ticket`)
     - `effect` (`allow` or `deny`)
     - `description`
     - `is_active`
     - audit fields (`created_on`, `created_by`, `updated_on`, `updated_by`)

2. **Create `policy_rule`**
   - Stores conditions for each policy.
   - Suggested columns:
     - `rule_id` (PK)
     - `policy_id` (FK -> `access_policy.policy_id`)
     - `condition_key` (e.g., `ticket.status`, `ticket.zone_id`)
     - `operator` (e.g., `EQ`, `IN`, `IN_CONTEXT`)
     - `condition_value` (JSON/text; e.g., `["ESCALATED"]` or `user.zone_ids`)
     - `priority` (optional; for deterministic evaluation order)
     - `is_active`

3. **Create `role_policy_map`**
   - Maps role -> policies (many-to-many).
   - Suggested columns:
     - `role_id` (FK -> existing `role_permission_config.role_id`)
     - `policy_id` (FK -> `access_policy.policy_id`)
     - `is_active`
     - audit fields
   - Unique key: (`role_id`, `policy_id`).

4. **(Optional but recommended) Create `user_scope`**
   - If zone/region is not already reliably available for every user, keep normalized user scope attributes.
   - Example columns: `user_id`, `scope_type` (`zone`, `region`), `scope_value`.

### B) Service/API changes (minimum)

1. **Policy CRUD APIs** (admin only)
   - `POST /policies`
   - `PUT /policies/{id}`
   - `POST /roles/{id}/policies`
   - `DELETE /roles/{id}/policies/{policyId}`
   - `GET /roles/{id}/effective-access`

2. **Role create/update flow**
   - Existing role creation remains in `role_permission_config`.
   - Add policy assignment in same workflow (or immediately after create) by writing to `role_policy_map`.
   - No backend code changes for new role access patterns — only data changes.

3. **Policy Evaluation Service**
   - Replace hard-coded checks with:
     - resolve user roles
     - fetch active policies from `role_policy_map`
     - fetch active rules from `policy_rule`
     - evaluate against `TicketAccessContext` + user context
     - enforce precedence: explicit deny > allow > default deny

4. **Ticket authorization integration**
   - `TicketAuthorizationService` should call policy evaluator first.
   - Keep old hard-coded logic only as temporary fallback while migrating.

### C) What gets updated when admin configures access

1. Admin creates/edits a policy -> **`access_policy` updated**.
2. Admin defines conditions -> **`policy_rule` updated**.
3. Admin assigns policy to role -> **`role_policy_map` updated**.
4. Role creation -> existing **`role_permission_config`** row + optional **`role_policy_map`** entries.

No Java constants / no hard-coded role IDs should be required for new access behavior.

### E) Role-to-policy mapping key choice (`policy_id` vs `policy_code`)

Your requirement to map roles using **`policy_id`** is good and suitable for database-level relations.

- **Recommended in DB:** keep `role_policy_map(role_id, policy_id)` as FK-based mapping.
- **Recommended in APIs/UI:** prefer `policy_code` (human-readable, stable semantic key).

Why this hybrid model is better:

1. `policy_id` is efficient and relationally correct for joins/indexes.
2. `policy_code` is safer for external clients and config scripts (IDs differ across envs like DEV/UAT/PROD).
3. You avoid accidental wrong mappings during data migrations/seeding when numeric IDs change.

Suggested API behavior:

- Accept either `policy_id` or `policy_code` in admin APIs.
- Internally resolve `policy_code -> policy_id` once, then persist only `policy_id` in `role_policy_map`.
- Enforce unique `access_policy.code` so code-based mapping is deterministic.

So: **keep your requirement**, and add `policy_code` support at API boundary for portability.

### D) First seed policies to support immediately

- `TICKET_VIEW_ALL` (allow, no rule or always-true rule)
- `TICKET_VIEW_OWN` (`ticket.owner_id EQ user.user_id`)
- `TICKET_VIEW_ASSIGNED` (`ticket.assigned_to EQ user.user_id`)
- `TICKET_VIEW_SAME_ZONE` (`ticket.zone_id IN_CONTEXT user.zone_ids`)

With just these, most onboarding cases can be handled by DB/API config only.

## Suggested quick wins (can be done immediately)

1. Replace hard-coded role checks in `TicketAuthorizationService` with a config-backed lookup table.
2. Stop using role IDs in logic (`"9"`, `"13"`, etc.); use policy codes or role slugs.
3. Add `GET /roles/{id}/effective-access` for auditability.
4. Add automated tests for policy combinations (own + assigned + status-based + unrestricted).

## Risks and controls

- **Risk:** policy misconfiguration causing over-permission.
  - **Control:** default deny, explicit allow, audit logs for policy changes.
- **Risk:** performance overhead.
  - **Control:** cache effective permissions per role/user.
- **Risk:** migration regressions.
  - **Control:** dual-run mode (old + new evaluator) and compare decisions in logs.

## Success criteria

- New role onboarding requires no code change.
- “Grant all ticket access” achieved by policy assignment only.
- Ticket access decisions are explainable via effective policy output.
- Hard-coded role IDs/names removed from authorization paths.
