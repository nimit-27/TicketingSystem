# Deployment Manifest: dev-1.79.2

## 1. Basic Details

Environment:
DEVELOPMENT

Deployment Version:
dev-1.79.2

UI Version:
1.79

API Version:
1.79.2

Release Line:
1.79

Updated Date:
03-07-2026

Prepared By:
Nimit Jain

SVN Branch/Path:
https://172.18.50.113/svn/CH-GEBIZ-Synergy_Base/FCI/Source/Web/Development

SVN Revision:
VERSION -U

---

## 2. Manifest Environment Mapping

The following manifests correspond to deployments sharing the same code base and version across environments:

- DEV   → deployment/manifests/dev/dev-1.79.2.md
- STG   → deployment/manifests/staging/stg-1.27.1.md
- PROD  → deployment/manifests/production/prod-1.17.md

> Note: All environments use the same source code (SVN revision VERSION -U). Differences are environment-specific configurations only.

---

## 3. Docker Images

### UI

Image:
bom.ocir.io/bmozxse0db74/ad_test_repo:ticketing-ui_v1.79

Changed:
Yes

### API

Image:
bom.ocir.io/bmozxse0db74/ad_test_repo:ticketing-api_v1.79.2

Changed:
Yes

---

## 4. Changes Included

### UI Changes

- Added UI to manage role-based notifications.
- Added Notification Master page.
- Updated Change Requests page with a table listing tickets in `Change Requested` status where the CR has not yet been created.
- Rectified notification template logic.

### API Changes

- Updated Nagios attribute handling for attributes containing spaces.
- Built CR creation and ticket status update logic inside a transaction.
- Added notification framework changes and notification trigger calls.
- Added notification call for Resolved, Closed, and Assign to Requestor flows for the Requestor role.
- Added UTC audit columns in `tickets` and `status_history` tables.
- Fixed `assignBackFromFci` not becoming true when the ticket status was `OPEN`.

### DB Changes

- Created table `role_notification_channel_mapping`.
- Seeded `role_notification_channel_mapping` for role-based notification channel preferences.
- Added UTC columns in `tickets` and `status_history` tables.
- Dropped redundant UTC update columns after audit column refinement.

---

## 5. Database Scripts

DB Batch:
Notifications / ENH-48.3

Execute scripts in the order mentioned below:

1. api/src/main/resources/db/migration/V17__add_utc_ticket_status_audit_columns.sql

2. api/src/main/resources/db/migration/V17__create_role_notification_channel_mapping.sql

3. api/src/main/resources/db/migration/V18__drop_redundant_updated_at_utc_columns.sql

4. api/src/main/resources/db/migration/V18__seed_role_notification_channel_mapping.sql

5. api/src/main/resources/db/migration/V19__ticket_resolution_closure_notifications.sql

6. api/src/main/resources/db/migration/V20__notification_master_channel_settings.sql
