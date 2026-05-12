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

Deployment Date:
<YYYY-MM-DD>

Prepared By:
<name>

SVN Branch/Path:
<branch-path>

SVN Revision:
<revision>

## 2. Docker Images

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

## 3. Changes Included

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

## 4. Database Scripts

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

Release Line:
X.XX

Deployment Date:
2026-01-01

Prepared By:
John Doe

SVN Branch/Path:
/trunk

SVN Revision:
r0000

## 2. Docker Images

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

## 3. Changes Included

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

## 4. Database Scripts

DB Batch:
D000_sample_batch

Execute scripts in the order mentioned below.

1.
db/migrations/D000_sample_batch/V001__create_sample_table.sql

2.
db/migrations/D000_sample_batch/V002__insert_sample_config.sql
