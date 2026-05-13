# Deployment Manifest: dev-x.xx.x

## 1. Basic Details

Environment:
PRODUCTION

Deployment Version:
dev-1.15

UI Version:
1.15

API Version:
1.15

Release Line:
1.15

Updated Date:
13-05-2026

Prepared By:
Nimit Jain

SVN Branch/Path:
https://172.18.50.113/svn/CH-GEBIZ-Synergy_Base/FCI/Source/Web/Development

SVN Revision:
r2351

---

## 2. Manifest Environment Mapping

The following manifests correspond to deployments sharing the same code base and version across environments:

- DEV   → docs/manifests/dev/dev-1.76.md
- STG   → docs/manifests/stg/stg-1.25.md
- PROD  → docs/manifests/prod/prod-1.15.md

> Note: All environments use the same source code (SVN revision r0000). Differences are environment-specific configurations only.

---

## 3. Docker Images

### UI

Image:
bom.ocir.io/bmozxse0db74/prod_ticketing_system:ticketing-ui_prod_v1.15 

Changed:
Yes

### API

Image:
bom.ocir.io/bmozxse0db74/prod_ticketing_system:ticketing-api_prod_v1.15

Changed:
Yes

---

## 4. Changes Included

### UI Changes

- Added REACT_APP_VERSION in .env files for each environment
- Change Requests page, filters
- Add toggle filter isAssignedBackFromFci on All Tickets page
- If isAssignedBackFromFci = true and status ≠ Change Request, show "Send for CR Approval" button on View Ticket
- Add new page: ViewCrTicket
- Filter persistence on All Tickets

### API Changes

- Added app.version in application.properties files for each environment
- Implemented CR approval flow (send for CR, status update, CR creation)
- Added support for isAssignedBackFromFci flag in ticket processing
- Created CR Approver role
- Implemented role-based permissions using allowed_cr_status_action_ids
- Added CR workflow handling using ticket_cr_status_workflow
- Added CR history tracking logic

### DB Changes

- Created tables:
    - ticket_cr
    - ticket_cr_sequences
    - cr_status_master
    - ticket_cr_status_workflow
    - ticket_cr_history_config
    - ticket_cr_history
- Added column isAssignedBackFromFci in tickets table
- Added column allowed_cr_status_action_ids in role_permission_config table
- Added status "Change Requested" in status_master
- Added workflow: Assigned → Change Requested in status_workflow
- Populated cr_status_master table
- Provided permissions:
    - CRSW-1, CRSW-2 → CR Approver
    - 31, 32 → Team Lead

---

## 5. Database Scripts

DB Batch:
--NA--

Execute scripts in the order mentioned below:

1. \api\src\main\resources\db\migration\V15_cr_bucket_flow_full_script_V10-V14.sql
