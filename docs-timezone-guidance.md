# India-only timestamp strategy (Spring Boot + Hibernate + MySQL + React)

Since this app is India-specific, you can run an **IST-only policy** end-to-end.

## Why `LocalDateTime.now()` and `@CreationTimestamp` differed

- `LocalDateTime.now()` uses the JVM default zone (or server zone if not explicitly set).
- `@CreationTimestamp` is generated at persistence time and can be influenced by JDBC/session timezone and DB timezone.
- If app JVM, JDBC session, and MySQL session/server zones are not aligned, values differ for the same event.

## India-only policy to remove drift

Use **Asia/Kolkata** in every layer:

1. JDBC connection/session timezone = `Asia/Kolkata`
2. Hibernate JDBC timezone = `Asia/Kolkata`
3. JSON serialization timezone = `Asia/Kolkata`
4. Any manual `now()` usage should explicitly use `ZoneId.of("Asia/Kolkata")`
5. Frontend default date rendering should also use `Asia/Kolkata` (not UTC `toISOString()`)

## Places in this codebase where timezone discrepancy can happen

1. **Backend persistence config** in `application.properties`
   - JDBC URL and Hibernate timezone control how DB values are written/read.
2. **Manual timestamp generation in backend**
   - `TypesenseClient` updates sync time using `now()`. If zone is implicit, it can drift.
3. **String serialization/parsing of sync metadata**
   - `SyncMetadataService` stores time as string; mixed formats/zones can cause parse inconsistencies.
4. **Frontend default date**
   - `new Date().toISOString()` is UTC and can show previous/next day around IST boundaries.

## Historical data rectification (existing rows)

> Always take a DB backup before running these updates.

### A) If old values are actually UTC but should be IST wall-clock

Use a one-time conversion for timestamp-like columns:

```sql
-- Example for DATETIME/TIMESTAMP columns
UPDATE tickets
SET last_modified = CONVERT_TZ(last_modified, '+00:00', '+05:30')
WHERE last_modified IS NOT NULL;
```

If MySQL timezone tables are available, prefer named zones:

```sql
UPDATE tickets
SET last_modified = CONVERT_TZ(last_modified, 'UTC', 'Asia/Kolkata')
WHERE last_modified IS NOT NULL;
```

### B) If old values are already IST

Do **not** convert historical rows; only fix runtime config to prevent future drift.

### C) How to decide A vs B safely

1. Pick 20 recent rows from two affected tables.
2. Compare with app logs / user-observed event time.
3. If DB values are consistently 5h30m behind expected IST, run conversion A.
4. Otherwise keep rows as-is and only standardize config/code.

### D) Keep idempotency/safety

- Run conversion in batches.
- Add a temporary marker column/table to record migrated row IDs.
- Validate with `SELECT` samples before/after.
