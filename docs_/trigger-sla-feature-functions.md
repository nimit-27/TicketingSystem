# Trigger SLA Feature - Functional Documentation

## 1) What the Trigger SLA feature does

The **Trigger SLA** feature allows operations or support users (typically in dev/admin mode) to force the SLA calculation engine to run immediately, and to manage how SLA jobs are scheduled.

At a functional level, it provides:

- **On-demand execution** of SLA calculation for active tickets.
- **Job selection** (`sla_job` vs `sla_job_from_scratch`) so teams can choose normal recalculation or full recomputation.
- **Trigger period management** (Manual / Periodic / Schedule placeholder).
- **Cron configuration** for periodic jobs with validation in the UI and validation again on backend save.
- **Operational visibility** into recent runs (started/completed time, status, processed/succeeded/failed counts, errors).
- **Runtime protection** so only one SLA batch run is processed at a time.

---

## 2) Main user-facing functions

## A. Open Trigger SLA dialog
- From Support Dashboard header, users can open **"Trigger SLA Calculation"**.
- The dialog shows current trigger jobs, next run timing, cron, batch size, and recent execution history.
- While open, history auto-refreshes every 10 seconds.

## B. Refresh current state
- **Refresh** pulls latest trigger-job metadata and latest run history from backend.
- This is useful when another user/scheduler may have started a run.

## C. Trigger selected SLA job now
- **Trigger** executes selected job code immediately.
- If no run is currently active, backend creates a run record and starts async processing.
- If a run is already active, backend returns the latest run and UI informs user that a job is already running.

## D. Update Trigger Period and cron
- Users can switch trigger period:
  - **MANUAL**: no cron, only explicit trigger.
  - **PERIODIC**: cron required and validated.
  - **SCHEDULE**: currently reserved/coming soon at UI level.
- For `PERIODIC`, UI accepts only `*`, `*/n`, or a number in valid range per field.
- Save sends update request to backend, which also parses cron expression before persisting.

## E. Review execution history
Each run row shows:
- start and end times
- duration
- trigger type (manual/scheduled)
- scope (active/all/from scratch)
- user who triggered
- status (running/completed/completed_with_errors/failed)
- total candidate tickets, processed, succeeded, failed
- condensed error summary

---

## 3) Business behavior during execution

When a run starts, SLA calculation service iterates tickets in batches and recalculates SLA fields. Behavior differs by scope:

- **ACTIVE_ONLY**: excludes closed and resolved tickets.
- **ALL_TICKETS**: includes all tickets.
- **ALL_TICKETS_FROM_SCRATCH**: recomputes from baseline using history as if rebuilding SLA state.

For each ticket, SLA service computes:
- due dates
- response/resolution/elapsed/idle minutes
- breach by minutes
- working time left
- and persists into `ticket_sla`.

If the calculation for one ticket fails, run continues for other tickets; failed count and error summary are updated.

---

## 4) Example scenario

## Scenario: Support manager wants periodic run every 15 minutes

1. Open Trigger SLA dialog.
2. Select Job = **SLA Job (`sla_job`)**.
3. Set Trigger Period = **PERIODIC**.
4. Enter cron fields for `0 */15 * * * *`.
5. Save trigger period.
6. Confirm chips show next scheduled run and minutes until next run.
7. Optionally click **Trigger** once to run immediately.
8. In history table, verify new entry:
   - `triggerType = MANUAL`
   - `scope = ACTIVE_ONLY`
   - `runStatus` moves from `RUNNING` to `COMPLETED` (or `COMPLETED_WITH_ERRORS`)
   - processed counters are populated.

### Expected outcome
- SLA records are recalculated for active tickets.
- Dashboard/reporting that depends on SLA values reflects updated data.
- Future runs happen every 15 minutes due to saved cron.

---

## 5) Operational notes

- Trigger button is disabled while a run is in progress.
- Cron expression is stored per trigger job; for `sla_job` periodic updates also refresh runtime scheduler cron in service.
- Feature is intended for controlled usage (visible in dev mode in current UI wiring).
