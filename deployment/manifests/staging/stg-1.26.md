# Deployment Manifest: stg-1.26

## 1. Basic Details

Environment:
STAGING

Deployment Version:
stg-1.26

UI Version:
1.26

API Version:
1.26

Release Line:
1.26

Updated Date:
25-05-2026

Prepared By:
Nimit Jain

SVN Branch/Path:
https://172.18.50.113/svn/CH-GEBIZ-Synergy_Base/FCI/Source/Web/Development

SVN Revision:
r2351

---

## 2. Manifest Environment Mapping

The following manifests correspond to deployments sharing the same code base and version across environments:

- DEV   → deployment/manifests/dev/dev-1.78.md
- STG   → deployment/manifests/staging/stg-1.26.md
- PROD  → deployment/manifests/production/prod-1.16.md

> Note: All environments use the same source code (SVN revision r2351). Differences are environment-specific configurations only.

---

## 3. Docker Images

### UI

Image:
bom.ocir.io/bmozxse0db74/stg_ticketing_system:ticketing-ui_stg_v1.26

Changed:
Yes

### API

Image:
bom.ocir.io/bmozxse0db74/stg_ticketing_system:ticketing-api_stg_v1.26

Changed:
Yes

---

## 4. Changes Included

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

## 5. Database Scripts

DB Batch:
--NA--

Execute scripts in the order mentioned below:

- --NA--
---
