# Deployment Manifest: dev-x.xx.x

## 1. Basic Details

Environment:
DEVELOPMENT

Deployment Version:
dev-1.76

UI Version:
1.76

API Version:
1.76

Release Line:
1.76

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
bom.ocir.io/bmozxse0db74/ad_test_repo:ticketing-ui_v1.76

Changed:
Yes

### API

Image:
bom.ocir.io/bmozxse0db74/ad_test_repo:ticketing-api_v1.76

Changed:
Yes

---

## 4. Changes Included

### UI Changes

- Added REACT_APP_VERSION in .env files for each environment

### API Changes

- Added app.version in application.properties files for each environment

### DB Changes

- --NA--

---

## 5. Database Scripts

DB Batch:
--NA--

Execute scripts in the order mentioned below:

- --NA--
