# Requester User Sync Design

## Goal

Synchronize users from an external source into `requester_users` in batches while preserving an auditable record of every inbound record, validation result, retry, and failure shared back to the external system.

## Recommended Architecture

Use an asynchronous ingestion pipeline:

1. The external application calls a secured bulk API in this application.
2. The API validates request shape, authentication, batch idempotency, and record-level required fields.
3. The API stores records in an append-only staging/audit table and returns an accepted response with a batch identifier.
4. A scheduled worker processes pending or retryable staging rows in small chunks.
5. The worker maps external fields into the internal `requester_users` model, validates business rules, and performs idempotent upserts.
6. The worker updates each staging row with processing status, retry count, timestamps, and error details.
7. A failure-report API or callback exposes failed records to the external application with stable identifiers, ticket id/user id where applicable, and error details.

This is preferable to letting the external system directly update internal tables because it decouples external availability and schema changes from the ticketing system's transactional user model.

## Mapping Ownership

Keep canonical mapping and validation on this application's side, while requiring the external application to send a stable contract.

The external application should own:

- A stable external user id.
- Source-system batch id and record id.
- Raw source attributes using a documented API contract.
- Basic syntactic quality, such as valid JSON and known date formats.

This application should own:

- Mapping source fields to `requester_users` columns.
- Default values for missing optional fields.
- Internal role/stakeholder/office-code interpretation.
- Username conflict handling.
- Active/inactive behavior.
- Referential and ticket-impacting validations.

Reason: `requester_users` is an internal persistence model with application-specific constraints and behavior. Mapping in the ticketing system lets you evolve the external contract independently, version the mapper, keep audit evidence, and prevent external callers from depending on internal database details.

## Staging Table Recommendation

Create a staging table such as `requester_user_sync_staging` with both raw data and processing metadata.

Suggested columns:

- `id` primary key.
- `request_id` from the external request and derived `batch_id`.
- `source_system`.
- `source_record_id`.
- `external_user_id` / `emp_id`, using the external `empId`.
- `payload_json` containing the raw inbound user object.
- Optional normalized columns used for querying, such as `username`, `first_name`, `last_name`, `email_id`, `mobile_no`, `designation`, `reporting_manager_code`, `reporting_manager_name`, `office_type`, and `office_code`.
- `status`: references `requester_user_sync_status_master.status_code` with seeded values such as `RECEIVED`, `VALIDATION_FAILED`, `PENDING`, `PROCESSING`, `SUCCESS`, `RETRYABLE_FAILED`, `PERMANENT_FAILED`, and `SKIPPED_NO_CHANGE`.
- `retry_count` and `max_retries`.
- `error_code`, `error_message`, and optional `error_details_json`.
- `requester_user_id` once mapped/upserted.
- `idempotency_key`, preferably unique per source system + source record id + source version/hash.
- `payload_hash` to detect no-change records.
- `received_at`, `processing_started_at`, `processed_at`, `created_at`, `updated_at`.

Add indexes for scheduler pickup and de-duplication:

- Unique index on `(source_system, batch_id, source_record_id)` or another agreed idempotency key.
- Index on `(status, retry_count, updated_at)` for worker polling.
- Index on `external_user_id` and/or `username` for troubleshooting.

## API Recommendation

Expose a bulk ingestion endpoint, for example:

`POST /ext/requester-users/batches`

Request envelope now matches the external source payload:

```json
{
  "requestId": 6947,
  "users": [
    {
      "empId": "user1_MD_DHANBAD",
      "firstName": "user1_MD_DHANBAD",
      "middleName": null,
      "lastName": "NA",
      "reportingManagerCode": "admin",
      "reportingManagerName": "admin",
      "mobileNumber": "1212341256",
      "emailId": "user1_MD_DHANBAD256@stg.com",
      "designation": "DEPOT_MANAGER",
      "dateOfJoining": "23042026",
      "dateOfRetirement": "01012036",
      "officeType": "DO",
      "officeCode": "ED12"
    }
  ]
}
```

The API derives `batchId` from `requestId`, uses `empId` as the external user id and username, and expects external dates in `ddMMyyyy` format. `sourceSystem` is optional and defaults to the configured requester-user sync source.

Response:

```json
{
  "requestId": 6947,
  "sourceSystem": "EXTERNAL",
  "batchId": "6947",
  "accepted": 100,
  "rejected": 2,
  "duplicate": 1,
  "statusUrl": "/ext/requester-users/batches/6947"
}
```

Return `202 Accepted` when the batch is stored for asynchronous processing. Return record-level validation errors only for records that cannot even be staged.

Secure the endpoint with one of these approaches:

- mTLS plus OAuth2 client credentials.
- Signed requests with timestamp and nonce.
- API key only if the network and rotation controls are strong enough.

Also enforce request size limits, maximum records per batch, rate limits, and replay protection.

## Scheduler / Worker Recommendation

The scheduler should:

1. Pick rows in `PENDING` or `RETRYABLE_FAILED` where `retry_count < max_retries`.
2. Lock rows in a way that prevents parallel workers from processing the same row.
3. Mark selected rows as `PROCESSING`.
4. Map and validate each record.
5. Upsert into `requester_users` using a stable internal key strategy.
6. Mark rows as `SUCCESS`, `SKIPPED_NO_CHANGE`, `RETRYABLE_FAILED`, or `PERMANENT_FAILED`.

Prefer small chunks, such as 100 to 500 rows, to reduce lock duration and isolate failures. The worker should be idempotent so re-running the same staging row does not duplicate users or corrupt data.

## Upsert Key Strategy

Do not rely only on name, email, or mobile number as the identity key. Prefer a stable external user identifier mapped to the internal `requester_user_id` or stored in a new cross-reference column/table.

Recommended options:

1. Add `external_user_id` and `source_system` to `requester_users`, with a unique key on `(source_system, external_user_id)`.
2. If modifying `requester_users` is undesirable, create a `requester_user_external_identity` table that maps `(source_system, external_user_id)` to `requester_user_id`.

Keep `username` unique because the current database schema already enforces a unique username constraint.

## Audit and Retention

The staging table can act as audit, but keep it intentionally audit-friendly:

- Store immutable raw payloads.
- Store processing status history or at least final state plus timestamps.
- Avoid storing secrets or password values from external systems.
- Mask or minimize sensitive personal data if long-term retention is required.
- Define retention, archival, and purge policies because staging tables can grow quickly.

Keep allowed staging statuses in `requester_user_sync_status_master` so operational labels, terminal/retryable flags, and active/inactive controls can be managed as master data. If full status transitions are important, add a second table such as `requester_user_sync_stage_events` with one row per status change.

## Failed Ticket/User Update Reporting

For failures, expose a status endpoint and optionally a callback.

Suggested endpoint:

`GET /ext/requester-users/batches/{batchId}/failures`

Response shape:

```json
{
  "batchId": "HRMS-2026-06-24-0001",
  "failures": [
    {
      "requestId": 6947,
      "empId": "user1_MD_DHANBAD",
      "requesterUserId": null,
      "ticketId": "TKT-1-202606-00001",
      "status": "PERMANENT_FAILED",
      "errorCode": "USERNAME_CONFLICT",
      "errorMessage": "Username is already mapped to another external user"
    }
  ]
}
```

If failures are related to ticket updates rather than user updates, use a separate failure table, for example `external_ticket_update_failures`, with `ticket_id`, `external_user_id`, `batch_id`, `error_code`, `error_message`, and retry metadata. Do not overload the user staging table with unrelated ticket update failures.

## Better Approach Than the Initial Proposal

The proposed approach is directionally correct, but improve it in these ways:

- Treat the API as ingestion-only, not as a direct update endpoint.
- Store raw payloads plus metadata in staging for audit and reprocessing.
- Keep mapping and business validation inside this application.
- Use idempotency keys and payload hashes to handle repeated batches safely.
- Separate retryable failures from permanent validation failures.
- Add a clear failure retrieval/callback mechanism for the external system.
- Consider a cross-reference table for external identities rather than depending on names, email, or mobile numbers.
- Define retention and data minimization for audit records.

## Minimal Implementation Plan

1. Add migration for staging and optional external identity tables.
2. Add DTOs for batch request/response and failure response.
3. Add secured controller endpoint for batch ingestion.
4. Add service to validate and persist staging rows idempotently.
5. Add scheduler service to process retryable rows.
6. Add mapper component from external payload to `RequesterUser`.
7. Add repository methods for row locking and upsert support.
8. Add status/failure endpoint for the external application.
9. Add metrics and logs for accepted, processed, succeeded, failed, and retried records.
10. Add integration tests for duplicates, partial failures, retry exhaustion, and idempotent reprocessing.
