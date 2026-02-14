# Trigger SLA Feature - Technical Documentation

## 1) Scope
This document explains the technical implementation of Trigger SLA, covering:

- data tables/entities used
- frontend call flow and function order
- APIs invoked by frontend
- backend execution flow from controller to database and response

---

## 2) Data model / tables used

## A. `trigger_job`
Purpose: stores configurable trigger jobs shown in UI dropdown.

Key columns:
- `trigger_job_id` (PK)
- `trigger_job_code` (unique code; e.g. `sla_job`, `sla_job_from_scratch`)
- `trigger_job_name`
- `batch_size`
- `trigger_period` (`MANUAL`, `PERIODIC`, `SCHEDULE`)
- `cron_expression` (nullable)
- `running` (boolean column exists in entity, runtime lock is managed in service)

Entity: `TriggerJob`.
Repository: `TriggerJobRepository`.

## B. `sla_calculation_job_run`
Purpose: execution audit/history for each triggered or scheduled SLA run.

Key columns:
- `sla_calculation_job_run_id` (UUID string PK)
- `trigger_type` (`MANUAL`/`SCHEDULED`)
- `scope` (`ACTIVE_ONLY`, `ALL_TICKETS`, `ALL_TICKETS_FROM_SCRATCH`)
- `run_status` (`RUNNING`, `COMPLETED`, `COMPLETED_WITH_ERRORS`, `FAILED`)
- `triggered_by`
- `started_at`, `completed_at`, `duration_ms`
- `total_candidate_tickets`, `processed_tickets`, `succeeded_tickets`, `failed_tickets`
- `batch_size`
- `error_summary`

Entity: `SlaCalculationJobRun`.
Repository: `SlaCalculationJobRunRepository`.
Migration: `V6__create_sla_calculation_job_run.sql` + scope addition in `V7__add_scope_to_sla_job_run.sql`.

## C. `tickets`
Purpose: candidate source records for SLA calculation.

Used for:
- paging ticket batches
- filtering active tickets by excluding `CLOSED`, `RESOLVED`

Repository methods used:
- `findAll(Pageable)` for all-ticket scope
- `findByTicketStatusNotIn(..., Pageable)` for active-only scope

## D. `status_histories` (mapped as `StatusHistory`)
Purpose: provides ordered timeline per ticket for accurate SLA computation.

Repository method used:
- `findByTicketInOrderByTimestampAsc(List<Ticket>)`

## E. `ticket_sla`
Purpose: persisted SLA outcome per ticket after each run.

Updated metrics include:
- due dates (`due_at`, `actual_due_at`, `due_at_after_escalation`)
- response/resolution/elapsed/idle minutes
- breach minutes

Primary write path:
- `TicketSlaService.calculateAndSaveByCalendar(...)`
- `TicketSlaService.calculateAndSaveByCalendarFromScratch(...)`

---

## 3) Frontend process and function order

UI component: `ui/src/components/SlaJob/SlaCalculationTrigger.tsx`

## A. Dialog open path
1. User clicks **Trigger SLA Calculation** button.
2. `open` state changes to true.
3. `useEffect` detects open dialog and calls `loadOverview()`.
4. `loadOverview()` calls `historyApiHandler(() => fetchSlaCalculationJobHistory(25))`.
5. Another interval refresh executes every 10 seconds while dialog remains open.

## B. Trigger now path
1. User clicks **Trigger**.
2. `handleTrigger()` sets local `triggering=true`.
3. Calls `triggerApiHandler(() => triggerSlaCalculationJob(selectedJobCode))`.
4. Shows snackbar depending on returned run status (`RUNNING` means accepted).
5. Calls `loadOverview()` again to refresh history and running state.

## C. Update period/cron path
1. User changes trigger period and/or cron fields.
2. UI validates each cron token with `validateCronToken()`.
3. `handleSubmitPeriod()` builds payload:
   - `{ triggerPeriod, cronExpression }`
4. Calls `updateApiHandler(() => updateTriggerJobPeriod(jobCode, payload))`.
5. On success, shows message and reloads overview.

## D. API wrapper functions used
Service file: `ui/src/services/ReportService.ts`

- `fetchSlaCalculationJobHistory(limit)` → `GET /reports/sla-calculation/history`
- `triggerSlaCalculationJob(jobCode)` → `POST /reports/sla-calculation/trigger?jobCode=...`
- `updateTriggerJobPeriod(jobCode, payload)` → `PUT /reports/sla-calculation/trigger-jobs/{jobCode}/period`

Additional available APIs (not used directly by this dialog buttons):
- `POST /reports/sla-calculation/trigger-all`
- `POST /reports/sla-calculation/trigger-all-from-scratch`
- `GET /reports/sla-calculation/trigger-jobs`

---

## 4) Backend request flow (controller → service → repository/db → response)

## A. Get overview/history flow
1. Request: `GET /reports/sla-calculation/history?limit=25`
2. `ReportsController.getSlaCalculationHistory(limit)` delegates to `SlaCalculationJobService.getOverview(limit)`.
3. Service fetches run history from `SlaCalculationJobRunRepository.findAllByOrderByStartedAtDesc(...)`.
4. Service computes next scheduled time from cron.
5. Service loads trigger jobs via `TriggerJobRepository.findAll()` and maps each to `TriggerJobDto` (including per-job next run for periodic entries).
6. Response: `SlaCalculationJobOverviewDto`.

## B. Trigger run flow
1. Request: `POST /reports/sla-calculation/trigger?jobCode=sla_job`
2. `ReportsController.triggerSlaCalculationJob(...)` resolves user and calls `SlaCalculationJobService.triggerManualByJobCode(jobCode, triggeredBy)`.
3. Service decides scope:
   - default `sla_job` → `ACTIVE_ONLY`
   - `sla_job_from_scratch` → `ALL_TICKETS_FROM_SCRATCH`
4. `triggerRun(...)` attempts lock with `AtomicBoolean running.compareAndSet(false, true)`.
   - if lock fails: returns latest run DTO (already running case)
   - if lock succeeds: inserts run row with `RUNNING` status into `sla_calculation_job_run`
5. Async execution starts on single-thread executor via `executeRun(runId)`.

### Inside `executeRun(runId)`
6. Loads run entity by id.
7. Reads ticket pages (`tickets`) using configured batch size.
8. For each page, loads status history in bulk (`status_histories`) and groups by ticket id.
9. For each ticket:
   - calls `TicketSlaService.calculateAndSaveByCalendar(...)` or `...FromScratch(...)`
   - updates success/failure counters
10. On completion:
   - updates totals + final status
   - writes completion time and duration
   - saves run record.
11. On exception:
   - marks run `FAILED` with error summary.
12. Finally releases `running` lock.

13. Initial HTTP response was already returned as `202 Accepted` with initial run DTO.

## C. Update trigger period flow
1. Request: `PUT /reports/sla-calculation/trigger-jobs/{jobCode}/period`
2. `ReportsController.updateTriggerJobPeriod(...)` passes body to service.
3. `SlaCalculationJobService.updateTriggerPeriod(...)`:
   - validates trigger period enum
   - validates cron if `PERIODIC`
   - updates `trigger_job` row
   - if job code is `sla_job` and periodic cron provided, updates in-memory scheduler cron value used by service.
4. Response: updated `TriggerJobDto`.

## D. Scheduled flow (non-manual)
1. `SlaCalculationScheduler.runScheduledSlaCalculation()` executes on configured cron.
2. Checks `isSchedulerEnabled()`.
3. Calls `triggerScheduled()` in service (same run pipeline as manual, trigger type = `SCHEDULED`, scope = `ACTIVE_ONLY`).

---

## 5) Response journey back to frontend

- Controller returns DTO via Spring `ResponseEntity`.
- Axios client (`apiClient`) resolves HTTP promise.
- `useApi.apiHandler()` unwraps payload (`response.data` / `body` / `data`) and updates local React state.
- Component updates chips/history rows and notifies users with snackbar.

---

## 6) Error handling and concurrency behavior

- UI prevents invalid cron submit and disables trigger while run is active.
- Backend validates `triggerPeriod` and cron expression again; invalid requests return `400`.
- Concurrency gate (`AtomicBoolean`) ensures one batch run at a time.
- Per-ticket errors do not abort entire batch; failures are accumulated and returned as `COMPLETED_WITH_ERRORS` with summary.
- Catastrophic run exception marks run as `FAILED`.
