# Deployment Manifest: <deployment-version>

## 1. Basic Details

Environment:
<ENV>

Deployment Version:
<deployment-version>

UI Version:
<ui-version>

API Version:
<api-version>

Release Line:
<release-line>

Updated Date:
<DD-MM-YYYY>

Prepared By:
<name>

SVN Branch/Path:
<branch-path>

SVN Revision:
<revision>

---

## 2. Manifest Environment Mapping

The following manifests correspond to deployments sharing the same code base and version across environments:

- DEV   → docs/manifests/dev/<deployment-version>.md
- QA    → docs/manifests/qa/<deployment-version>.md
- UAT   → docs/manifests/uat/<deployment-version>.md
- STG   → docs/manifests/stg/<deployment-version>.md
- PROD  → docs/manifests/prod/<deployment-version>.md

> Note: All above environments are built from the same source (SVN branch/revision) and differ only in configuration.

---

## 3. Docker Images

### UI

Image:
<registry>/ticketing-ui:<tag>

Changed:
<Yes/No>

### API

Image:
<registry>/ticketing-api:<tag>

Changed:
<Yes/No>

---

## 4. Changes Included

### UI Changes

- <ui-change-1>
- <ui-change-2>
- <ui-change-3>

### API Changes

- <api-change-1>
- <api-change-2>
- <api-change-3>

### DB Changes

- <db-change-1>
- <db-change-2>

---

## 5. Database Scripts

DB Batch:
<db-batch-name>

Execute scripts in the order mentioned below.

1.
<db/script/path_1.sql>

2.
<db/script/path_2.sql>

---

## Sample Dummy Data

# Deployment Manifest: dev-x.xx.x

## 1. Basic Details

Environment:
DEV

Deployment Version:
dev-x.xx.x

UI Version:
x.xx.x

API Version:
x.xx.x

Release Line:
X.XX

Updated Date:
01-01-2026

Prepared By:
John Doe

SVN Branch/Path:
/trunk

SVN Revision:
r0000

---

## 2. Manifest Environment Mapping

The following manifests correspond to deployments sharing the same code base and version across environments:

- DEV   → docs/manifests/dev/dev-x.xx.x.md
- QA    → docs/manifests/qa/qa-x.xx.x.md
- UAT   → docs/manifests/uat/uat-x.xx.x.md
- STG   → docs/manifests/stg/stg-x.xx.x.md
- PROD  → docs/manifests/prod/prod-x.xx.x.md

> Note: All environments use the same source code (SVN revision r0000). Differences are environment-specific configurations only.

---

## 3. Docker Images

### UI

Image:
oci-registry-url/ticketing-ui:dev-x.xx.x

Changed:
Yes

### API

Image:
oci-registry-url/ticketing-api:dev-x.xx.x

Changed:
Yes

---

## 4. Changes Included

### UI Changes

- Added sample approval screen
- Updated sample ticket layout
- Fixed sample sidebar permission issue

### API Changes

- Added sample history APIs
- Added sample audit logging
- Fixed sample SLA status issue

### DB Changes

- Added sample history table
- Added sample configuration entries

---

## 5. Database Scripts

DB Batch:
D000_sample_batch

Execute scripts in the order mentioned below.

1.
db/migrations/D000_sample_batch/V001__create_sample_table.sql

2.
db/migrations/D000_sample_batch/V002__insert_sample_config.sql
