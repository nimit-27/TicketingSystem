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
bom.ocir.io/bmozxse0db74/ad_test_repo:ticketing-ui_v1.78

Changed:
Yes

### API

Image:
bom.ocir.io/bmozxse0db74/ad_test_repo:ticketing-api_v1.78

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
