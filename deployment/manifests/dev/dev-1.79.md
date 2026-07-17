# Deployment Manifest: dev-1.79

## 1. Basic Details

Environment:
DEVELOPMENT

Deployment Version:
dev-1.79

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

## 2. Version Index

- **Release line:** `1.79` (DEVELOPMENT)
- **Manifest purpose:** Single reference for the base release and follow-up UI/API subversions.

### Version entries

- **Base Version**
  - Deployment Version: `dev-1.79`
  - UI Version: `1.79`
  - API Version: `1.79.2`
  - Updated Date: 03-07-2026
  - Details: [Base Release Details](#5-changes-included)

- **UI/API Sub Version**
  - Deployment Version: `dev-1.79.2`
  - UI Version: `1.79.2`
  - API Version: `1.79.8`
  - Updated Date: 17-07-2026
  - Details: [Sub Version Details](#6-sub-version-details)

---

## 3. Manifest Environment Mapping

The following manifests correspond to deployments sharing the same code base and version across environments:

- DEV   → deployment/manifests/dev/dev-1.79.md
- STG   → deployment/manifests/staging/stg-1.27.md
- PROD  → deployment/manifests/production/prod-1.17.md

> Note: All environments use the same source code (SVN revision VERSION -U). Differences are environment-specific configurations only.

---

## 4. Docker Images

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

## 5. Changes Included

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

## 5.1 Database Scripts

DB Batch:
Notifications / ENH-48.3

Execute scripts in the order mentioned below:

1. api/src/main/resources/db/migration/V17__add_utc_ticket_status_audit_columns.sql

2. api/src/main/resources/db/migration/V17__create_role_notification_channel_mapping.sql

3. api/src/main/resources/db/migration/V18__drop_redundant_updated_at_utc_columns.sql

4. api/src/main/resources/db/migration/V18__seed_role_notification_channel_mapping.sql

5. api/src/main/resources/db/migration/V19__ticket_resolution_closure_notifications.sql

6. api/src/main/resources/db/migration/V20__notification_master_channel_settings.sql

---

## 6. Sub Version Details

### UI/API Sub Version: dev-1.79.2

This subversion belongs to the `1.79` release line and is intentionally documented inside `dev-1.79.md`.

#### Basic Details

Environment:
DEVELOPMENT

Deployment Version:
dev-1.79.2

UI Version:
1.79.2

API Version:
1.79.8

Release Line:
1.79

Updated Date:
17-07-2026

Prepared By:
Nimit Jain

SVN Branch/Path:
https://172.18.50.113/svn/CH-GEBIZ-Synergy_Base/FCI/Source/Web/Development

SVN Revision:
VERSION -U

#### Manifest Environment Mapping

The following subversion deployments contain the same release changes with environment-specific versions and configuration:

- DEV   → deployment/manifests/dev/dev-1.79.md (sub version dev-1.79.2)
- STG   → deployment/manifests/staging/stg-1.27.md (sub version stg-1.27.4)
- PROD  → deployment/manifests/production/prod-1.17.md (sub version prod-1.17.1)

#### Docker Images

##### UI

Image:
bom.ocir.io/bmozxse0db74/ad_test_repo:ticketing-ui_v1.79.1

Changed:
Yes

##### API

Image:
bom.ocir.io/bmozxse0db74/ad_test_repo:ticketing-api_v1.79.8

Changed:
Yes

#### Changes Included

##### API Changes

###### Security Headers

- Enabled the `X-Content-Type-Options: nosniff` header in all API responses.
- Implemented a strict, well-scoped Content Security Policy (CSP) to restrict content sources.
- Added the `Referrer-Policy` security header.
- Added the `Permissions-Policy` security header.
- Added the `X-Frame-Options` header to prevent clickjacking attacks.
- Removed web server version disclosure from API responses.

###### Access Control & Security Enhancements

- Added rate limiting to the Add User Escalation API.
- Fixed broken access control that allowed unauthorized user enumeration via pagination.
- Enforced strict Role-Based Access Control (RBAC) on user listing APIs.
- Prevented user enumeration via pagination.

###### Functional Enhancements

- Added `BreachedOnFromDate` and `BreachedOnToDate` filters to reporting and search APIs.

##### UI Changes

- Implemented force password change on first login.
- Enforced a strong password policy.
- Added Multi-Factor Authentication (MFA) support.

##### Database Changes

- Added the `password_change_required` column to `requester_users` and `users`.
- Updated authorization mappings in `access_policy` and `role_policy_map`.

#### Database Scripts

DB Batch:
Security hardening and user access control

Execute scripts in the order mentioned below:

1. api/src/main/resources/db/migration/V22__add_password_change_required_to_users.sql

2. db/commonScripts/query_to_seed_user_listing_access_policy.sql
