# Deployment Manifest: dev-1.81

## 1. Basic Details

Environment:
DEVELOPMENT

Deployment Version:
dev-1.81.8.14

UI Version:
1.81.8

API Version:
1.81.14

Release Line:
1.81

Updated Date:
08-10-2026

Prepared By:
Nimit Jain

SVN Branch/Path:
https://172.18.50.113/svn/CH-GEBIZ-Synergy_Base/FCI/Source/Web/Development

SVN Revision:
VERSION -U

---

## 2. Manifest Environment Mapping

- DEV   → deployment/manifests/dev/dev-1.81/dev-1.81.8.14.md

> Note: These environments use the same source code. Differences are environment-specific configurations and versions only.

---

## 3. Docker Images

### UI

Image:
bom.ocir.io/bmozxse0db74/ad_test_repo:ticketing-ui_v1.81.8

Changed:
Yes

### API

Image:
bom.ocir.io/bmozxse0db74/ad_test_repo:ticketing-api_v1.81.14

Changed:
Yes

---

## 4. Changes Included

### UI & API Changes

- Added SLA Management page.
- Added functionality to edit ticket history.
- Add download functionality for each report type -> Ticket Summary Report, Problem Management, Ticket Resolution Time, Customer Satisfaction.
- Updated Problem Management -> Added table to show Master tickets and children count.
- Added "Breach In Ascending" & "Due At Descending" drop down options to "Sort By dropdown" 

### UI Changes


### API Changes


### DB Changes

- Updated report_master table - Added rows for report_code SLA_SUMMARY_RPT, MIS_TICKET_SUMMARY_RPT, MIS_RESOLUTION_TIME_RPT, MIS_CUSTOMER_SATISFACTION_RPT, MIS_PROBLEM_MANAGEMENT_RPT, SLA_SUMMARY_RPT_2, SLA_DETAILED_RPT
- Updated report_filter_mapping table.
- Add email_personalized column to notification_master table

---

## 4.1 Database Scripts

DB Batch:
Ticket history and SLA configuration

Execute scripts in the order mentioned below:

1. api/src/main/resources/db/migration/V23__create_ticket_history_tables.sql

2. api/src/main/resources/db/migration/V24__add_ticket_text_history.sql
