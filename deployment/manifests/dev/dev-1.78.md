# Deployment Manifest: dev-1.78

## 1. Basic Details

Environment:
DEVELOPMENT

Deployment Version:
dev-1.78

UI Version:
1.78

API Version:
1.78

Release Line:
1.78

Updated Date:
25-05-2026

Prepared By:
Nimit Jain

SVN Branch/Path:
https://172.18.50.113/svn/CH-GEBIZ-Synergy_Base/FCI/Source/Web/Development

SVN Revision:
r2353

---

## 2. Version Index

- **Release line:** `1.78` (DEVELOPMENT)
- **Manifest purpose:** Single reference for the base release and follow-up UI/API subversions.

### Version entries

- **Base Version**
  - Deployment Version: `dev-1.78`
  - UI Version: `1.78`
  - API Version: `1.78`
  - Updated Date: 25-05-2026
  - Details: [Base Release Details](#5-changes-included)

- **UI/API Sub Version**
  - Deployment Version: `dev-1.78.2`
  - UI Version: `1.78.2`
  - API Version: `1.78.2`
  - Updated Date: 30-05-2026
  - Details: [Sub Version Details](#6-sub-version-details)

---

## 3. Manifest Environment Mapping

The following manifests correspond to deployments sharing the same code base and version across environments:

- DEV   → deployment/manifests/dev/dev-1.78.md
- STG   → deployment/manifests/staging/stg-1.26.md
- PROD  → deployment/manifests/production/prod-1.16.md

> Note: All environments use the same source code (SVN revision r2353). Differences are environment-specific configurations only.

---

## 4. Docker Images

### UI

Image:
bom.ocir.io/bmozxse0db74/ad_test_repo:ticketing-ui_v1.78

Changed:
Yes

### API

Image:
bom.ocir.io/bmozxse0db74/ad_test_repo:ticketing-api_v1.78

Changed:
Yes

---

## 5. Changes Included

### UI Changes

- Added Downloads page with Downloads table to download generated reports.
- Updated Generate Report flow (PDF/Excel) to call asynchronous API.
- Added permission-based rendering on Download page.

### API Changes

- Added controller flow to invoke asynchronous report generation.
- Added `.jrxml` files for report generation templates.
- Added `/request` API to fetch and trigger report requests for Downloads page.
- Added logger instrumentation for asynchronous report generation and download flow.

### DB Changes

- Created table `report_master`.
- Created table `report_filter_mapping`.
- Created table `report_column_mapping`.
- Created table `report_request_history`.
- Created table `report_artifact`.
- Added indexes for all above reporting tables.

---

## 6. Sub Version Details

### UI/API Sub Version: dev-1.78.2

This subversion belongs to the `1.78` release line and is intentionally documented inside `dev-1.78.md`.

#### Basic Details

Environment:
DEVELOPMENT

Deployment Version:
dev-1.78.2

UI Version:
1.78.2

API Version:
1.78.2

Release Line:
1.78

Updated Date:
30-05-2026

Prepared By:
Nimit Jain

SVN Branch/Path:
https://172.18.50.113/svn/CH-GEBIZ-Synergy_Base/FCI/Source/Web/Development

SVN Revision:
r2353

#### Manifest Environment Mapping

The following subversion deployments share the same code base and version across environments:

- DEV   → deployment/manifests/dev/dev-1.78.md (sub version dev-1.78.2)
- STG   → deployment/manifests/staging/stg-1.26.md (sub version stg-1.26.1)
- PROD  → deployment/manifests/production/prod-1.16.md (sub version prod-1.16.2)

> Note: All subversion deployments use the same source code (SVN revision r2353). Differences are environment-specific configurations only.

#### Docker Images

##### UI

Image:
bom.ocir.io/bmozxse0db74/ad_test_repo:ticketing-ui_v1.78.2

Changed:
Yes

##### API

Image:
bom.ocir.io/bmozxse0db74/ad_test_repo:ticketing-api_v1.78.2

Changed:
Yes

#### Changes Included

##### UI Changes

- Added pagination on Downloads page.
- Added role-based access handling for Downloads page visibility and report requests.

##### API Changes

- Added paginated download request retrieval.
- Added policy-scoped access checks for download report requests.
- Resolved bug for assignedBackFromFci flag handling when tickets transition to Assigned.
- Added user details related column in the tickets download report.

##### DB Changes

- Added policy entries for Downloads page self-generated report access.
- Mapped Downloads page access policy to applicable roles.

#### Database Scripts

DB Batch:
--NA--

Execute scripts in the order mentioned below:

1. db/commonScripts/query_to_update_role_based_access_for_downloads_page.sql

---

## 7. Database Scripts

DB Batch:
--NA--

Execute scripts in the order mentioned below:

- --NA--
