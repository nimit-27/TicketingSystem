# Deployment Manifest: dev-1.78.2

## 1. Basic Details

Environment:
DEVELOPMENT

Deployment Version:
dev-1.78.2

UI Version:
1.78.2

API Version:
1.78.2

Release Line:
1.78.2

Updated Date:
30-05-2026

Prepared By:
Nimit Jain

SVN Branch/Path:
https://172.18.50.113/svn/CH-GEBIZ-Synergy_Base/FCI/Source/Web/Development

SVN Revision:
r2351

---

## 2. Manifest Environment Mapping

The following manifests correspond to deployments sharing the same code base and version across environments:

- DEV   → deployment/manifests/dev/dev-1.78.2.md
- STG   → deployment/manifests/staging/stg-1.26.1.md
- PROD  → deployment/manifests/production/prod-1.16.2.md

> Note: All environments use the same source code (SVN revision r2351). Differences are environment-specific configurations only.

---

## 3. Docker Images

### UI

Image:
bom.ocir.io/bmozxse0db74/ad_test_repo:ticketing-ui_v1.78.2

Changed:
Yes

### API

Image:
bom.ocir.io/bmozxse0db74/ad_test_repo:ticketing-api_v1.78.2

Changed:
Yes

---

## 4. Changes Included

### UI Changes

- Updated Downloads page to consume paginated API data from `useApi` state.
- Updated report download request payload to send `format` instead of `outputFormat`.
- Added role-based access handling for Downloads page visibility and report requests.

### API Changes

- Added paginated download request retrieval using snake_case native query mapping.
- Added policy-scoped access checks for download report requests.
- Updated assigned-back-from-FCI flag handling when tickets transition to Assigned.
- Added v2 master ticket JRXML template with requestor contact filters.

### DB Changes

- Added policy entries for Downloads page self-generated report access.
- Mapped Downloads page access policy to applicable roles.

---

## 5. Database Scripts

DB Batch:
--NA--

Execute scripts in the order mentioned below:

1. db/commonScripts/query_to_update_role_based_access_for_downloads_page.sql
---
