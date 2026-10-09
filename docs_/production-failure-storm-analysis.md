# Production failure-storm analysis

## P0 findings

### Cross-cutting exception amplification

* **File/method:** `api/aspect/LoggingAspect.java`, `logAround` (formerly lines 31-43).
* **Observed behavior:** the pointcut advises every method below every `controller` and `service` package. It logged entry and exit at INFO and logged a full stack trace before rethrowing at every nested layer.
* **Impact/root cause:** one repository failure traversing `IssueTypeService -> TicketSlaService -> SlaCalculationJobService`, or `AuthService -> LoginPayloadService`, generated a stack trace at each advised method and another at the real HTTP/scheduler boundary. Argument/result string creation also happened for every advised call even when it was not diagnostically useful.
* **Fix:** entry/exit logging is DEBUG and guarded by `isDebugEnabled`; propagation is a one-line DEBUG event without a throwable. `GlobalExceptionHandler`, scheduled jobs, and asynchronous job boundaries remain authoritative stack-trace owners.
* **Risk:** low. No control flow changes; DEBUG logging can still reconstruct method flow when deliberately enabled.

### JDBC result classification failure

* **Files/methods:** all Spring Data repository reads, most visibly `UserRepository.findByUsername`, `IssueTypeRepository.findById`, and `AppRuntimeConfigRepository.findById`.
* **Observed behavior:** Hibernate calls `ResultSet.next()` for ordinary derived SELECT queries, but Connector/J reports `Not a navigable ResultSet`. Connector/J uses this exact message when `next()` is invoked on a result internally marked as containing no row data; it is not the message for a closed result set or a forward-only cursor.
* **Evidence:** the authentication and runtime-config paths contain no custom/native query, `ResultSet`, `Statement`, `Connection`, or shared `EntityManager`. The only manual JDBC connections are method-local Jasper connections protected by try-with-resources. The failure across unrelated derived SELECTs therefore rules out an individual projection/relationship and points to the 9.2.0 driver result classification/lifecycle.
* **Fix:** Connector/J is pinned to the preceding 9.1.0 runtime. This is intentionally isolated from Hibernate, Hikari, repository, and query behavior.
* **Risk:** low-to-medium. It is a driver rollback and should be validated against the production MySQL version before deployment.

### SLA scheduler turns a database outage into per-ticket failures

* **Files/methods:** `SlaCalculationScheduler.runScheduledSlaCalculation` (every minute); `SlaCalculationJobService.executeRun` (ticket loop); `TicketSlaService.calculateAndSaveByCalendarInternal`; `IssueTypeService.isSlaEnabledForIssueType`.
* **Observed behavior:** up to 100 tickets are loaded per page. Each ticket performed an issue-type lookup, SLA-config lookup, ticket-SLA lookup, save, and potentially notification/user queries. A common database failure was caught as if it belonged to one ticket, so the loop immediately attempted the same broken database operation for every remaining ticket and logged each failure.
* **Fix:** database-access exceptions now abort the run, produce one boundary stack trace, and pause scheduled starts for five minutes. Non-database record-specific failures remain isolated but only the first has a stack trace; details/counts remain in the job summary. Issue-type SLA flags are cached for two minutes, reducing the normal-path lookup from one per ticket to one per distinct issue type per cache window.
* **Risk:** low. Manual runs remain available. A database outage no longer produces a misleading completed-with-thousands-of-record-errors run.

### Email dispatcher polls a failed database every five seconds

* **Files/methods:** `EmailNotificationDispatcher.dispatchPendingEmails`; `NotificationRuntimeToggleService.isNotificationEnabled/isChannelEnabled`.
* **Observed behavior:** the dispatcher is scheduled with a five-second fixed delay. Toggle values are normally cached for two minutes, but a failed lookup cannot populate the cache, so every invocation retries and used to acquire/log through the same failing repository path.
* **Fix:** a database-access failure is logged once by the dispatcher boundary and opens a two-minute polling backoff. Message delivery failures retain their existing per-recipient exponential retry policy.
* **Risk:** low. During a database outage queued emails wait up to two additional minutes; they are not discarded.

## P1 findings

### Authentication performs database work on every protected request

* **Files/methods:** `JwtAuthenticationFilter.doFilterInternal`, `LoginPayloadService.hydrate`, `AuthService.findUser`.
* **Observed behavior:** each valid authenticated request performs one internal-user SELECT (and eager user-level load); if absent, a requester-user SELECT. Payload construction then loads role rows, while permission JSON itself is held in memory by `PermissionService`.
* **Reason:** access tokens intentionally contain identity only. Hydration refreshes roles, password-change state, levels, and authorization data, so blindly restoring these claims or adding an unbounded cache would delay revocation and change security semantics.
* **Recommendation:** retain the current fresh lookup for now. If load remains excessive after the driver/scheduler/logging fixes, add a bounded, short-lived authorization cache with explicit invalidation in user/role mutation services and an agreed revocation SLA.
* **Risk:** high if changed casually; no authentication caching change is included.

### Notification schema is newer than deployed databases

* **Files:** `NotificationMaster.emailPersonalized`; `V5__notification_email_outbox.sql`; every environment properties file.
* **Observed behavior/root cause:** the entity selects `notification_master.email_personalized`, and V5 creates it, but Flyway is disabled in every environment. `Unknown column ... email_personalized` therefore proves that the deployment schema step was not applied; it is not an entity fetch bug.
* **Recommended fix:** apply V5 (and verify the remaining migration ledger) before deploying the email dispatcher. Do not remove the field: it controls whether templates are rendered per recipient.
* **Risk:** low for the additive column, but migration execution must follow the deployment change process because this repository currently contains duplicate Flyway version numbers and cannot safely be enabled without first repairing/baselining its history.

### Data conversion and column-index errors indicate schema/data or external report-template drift

* **Observed behavior:** usernames being read as numbers, email addresses being read as timestamps, and an 11th column being requested from a 10-column result cannot be produced by the reviewed derived authentication/toggle queries. Repository native projections use named aliases rather than `Object[]` positional extraction. Jasper templates can execute their own SQL through a managed connection, and production schemas are manually maintained with Flyway disabled.
* **Recommended fix:** capture the SQL and mapper/template name adjacent to each error, compare `information_schema.columns` with the mapped entity, and validate each deployed JRXML SELECT against its fields. Repair the affected row/schema/template rather than catching conversion failures.
* **Risk:** depends on the production correction; insufficient log evidence identifies a specific corrupt column safely enough to mutate it in source.

## P2 findings

### Client disconnects and request correlation

* `AsyncRequestNotUsableException` during SSE/download response writes is an expected client disconnect after the response is committed. It is now handled at DEBUG without attempting a second response or emitting a full ERROR stack trace. Unexpected exceptions still reach the generic handler.
* `RequestCorrelationFilter` accepts a safe `X-Request-Id` or creates one, returns it to the caller, and stores it in SLF4J MDC for the request lifetime. Logging patterns can include `%X{requestId}`.
* Method-security `AccessDeniedException` is now returned as a 403 and logged once without a stack trace instead of falling into the generic 500/error-dispatch path.

## Before/after amplification estimate

* A failing authenticated HTTP request previously produced two aspect stack traces (`AuthService`, `LoginPayloadService`), often a controller/service trace farther downstream, and the global-handler trace: typically **3-5 full stack traces plus INFO entry/exit events**. It now produces **one full stack trace at the global HTTP boundary**, with a request ID; aspect propagation is visible only at DEBUG.
* A systemic database failure in one 100-ticket SLA page previously could produce at least **300 full stack traces** (three advised service layers per ticket), plus 100 job warnings. It now produces **one full stack trace**, aborts that run, and suppresses scheduled database attempts for five minutes.
* A notification database failure previously retried every five seconds (**720 attempts/hour**, with multiple aspect/scheduler traces). It now emits at most **one stack trace per two-minute outage window** (**30/hour maximum**) and performs no database work during the backoff.
