# Deployment Manifest: dev-1.80

## 1. Basic Details

Environment:
DEVELOPMENT

Deployment Version:
dev-1.80

UI Version:
1.80

API Version:
1.80.2

Release Line:
1.80

Updated Date:
30-07-2026

Prepared By:
Nimit Jain

SVN Branch/Path:
https://172.18.50.113/svn/CH-GEBIZ-Synergy_Base/FCI/Source/Web/Development

SVN Revision:
VERSION -U

---

## 2. Manifest Environment Mapping

- DEV   → deployment/manifests/dev/dev-1.80.md
- PROD  → deployment/manifests/production/prod-1.18.md

> Note: These environments use the same source code. Differences are environment-specific configurations and versions only.

---

## 3. Docker Images

### UI

Image:
bom.ocir.io/bmozxse0db74/ad_test_repo:ticketing-ui_v1.80

Changed:
Yes

### API

Image:
bom.ocir.io/bmozxse0db74/ad_test_repo:ticketing-api_v1.80.2

Changed:
Yes

---

## 4. Changes Included

### UI & API Changes

- Added **Last Modified Status From Date** and **Last Modified Status To Date** filters to the All Tickets page and implemented the corresponding backend flow.
- Added the Ticket History workflow.

### UI Changes

- Added a remark option when updating the issue type.

### API Changes

- Added `lastModifiedStatusDate` to the JRXML report.

### DB Changes

- Created the `ticket_history` and `ticket_history_config` tables and populated `ticket_history_config`.
- Created the `ticket_text_history` table.
- Updated the SLA flag to `true` for the **Incident** and **Security Incident** issue types.

---

## 4.1 Database Scripts

DB Batch:
Ticket history and SLA configuration

Execute scripts in the order mentioned below:

1. api/src/main/resources/db/migration/V23__create_ticket_history_tables.sql

2. api/src/main/resources/db/migration/V24__add_ticket_text_history.sql
