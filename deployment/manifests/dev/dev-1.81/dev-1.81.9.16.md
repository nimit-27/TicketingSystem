# Deployment Manifest: dev-1.81

## 1. Basic Details

Environment:
DEVELOPMENT

Deployment Version:
dev-1.81.9.16

UI Version:
1.81.9

API Version:
1.81.16

Release Line:
1.81

Updated Date:
12-10-2026

Prepared By:
Nimit Jain

SVN Branch/Path:
https://172.18.50.113/svn/CH-GEBIZ-Synergy_Base/FCI/Source/Web/Development

SVN Revision:
VERSION -U

---

## 2. Manifest Environment Mapping

- DEV   → deployment/manifests/dev/dev-1.81/dev-1.81.9.16.md

> Note: These environments use the same source code. Differences are environment-specific configurations and versions only.

---

## 3. Docker Images

### UI

Image:
bom.ocir.io/bmozxse0db74/ad_test_repo:ticketing-ui_v1.81.9

Changed:
No

### API

Image:
bom.ocir.io/bmozxse0db74/ad_test_repo:ticketing-api_v1.81.16

Changed:
Yes

---

## 4. Changes Included

### UI & API Changes


### UI Changes


### API Changes
- Added logic to make isSlaApplicable as FALSE for tickets with status 'CHANGE_REQUESTED'

### DB Changes


---

## 4.1 Database Scripts

