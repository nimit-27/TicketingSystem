# SLA Calculation Report

This report keeps the language simple and uses bullet points and tables so anyone can follow the SLA math.

## 1. Key inputs

| Severity | Target resolution minutes | Notes |
| --- | --- | --- |
| Critical | 120 | Fastest response, 2 business hours. |
| High | 240 | 4 business hours. |
| Medium | 480 | 1 business day. |
| Low | 1440 | 3 business days. |

*Each severity points to an `SlaConfig` row that stores the minutes above. The system reads that value, adds it to the reported time, and creates the first due date using calendar time.* 【F:api/src/main/java/com/ticketingSystem/api/service/TicketSlaService.java†L71-L85】

Additional inputs that change the clock:

- **Business hours + overrides:** Default working hours come from `calendar_working_hours`. Overrides (special shifts, weekend closures) replace or close the day. Closed days do not add SLA time. 【F:api/src/main/java/com/ticketingSystem/calendar/service/BusinessHoursService.java†L35-L80】
- **Regional holidays:** Holiday records pause the timer and push it to the next open day. 【F:api/src/main/java/com/ticketingSystem/calendar/service/SlaCalculatorService.java†L25-L136】

## 2. Calendar-aware timers

- **computeCalendarEnd**
  - Converts ticket timestamps to the calendar timezone.
  - Walks the schedule minute by minute.
  - Skips closed or holiday blocks and only counts time inside open windows.
  - Returns the due date that respects business time. 【F:api/src/main/java/com/ticketingSystem/api/service/TicketSlaService.java†L84-L85】【F:api/src/main/java/com/ticketingSystem/api/service/TicketSlaService.java†L411-L419】【F:api/src/main/java/com/ticketingSystem/calendar/service/SlaCalculatorService.java†L25-L55】

- **computeWorkingDurationBetween**
  - Measures “how long did X take?”
  - Adds minutes only when the clock is inside business hours.
  - Skips holidays automatically and supports negative ranges (end < start). 【F:api/src/main/java/com/ticketingSystem/calendar/service/SlaCalculatorService.java†L58-L116】

## 3. Ticket-level SLA numbers

- **Response time:** First history row with `slaFlag=true` marks acknowledgement. Working minutes between report and that point = response SLA. 【F:api/src/main/java/com/ticketingSystem/api/service/TicketSlaService.java†L95-L111】
- **Resolution vs. idle:**
  - Replay each status change.
  - `slaFlag=true` minutes → resolution time (SLA ticking).
  - `slaFlag=false` minutes → idle time (SLA paused).
  - Keeps running until resolved or “now.” 【F:api/src/main/java/com/ticketingSystem/api/service/TicketSlaService.java†L122-L190】
- **Elapsed vs. allowed minutes:**
  - `elapsed` = working minutes from report to the evaluation moment.
  - `allowedMinutes` = policy minutes (plus escalations) from report to the current due date. 【F:api/src/main/java/com/ticketingSystem/api/service/TicketSlaService.java†L112-L220】
- **Due-date pushes for pauses:** Idle time is replayed through the calendar so the due date moves forward only during business hours. 【F:api/src/main/java/com/ticketingSystem/api/service/TicketSlaService.java†L206-L210】
- **Breach alert:** `breachedBy = resolution - allowedMinutes`. Positive → SLA breached → send `TICKET_SLA_BREACHED`. 【F:api/src/main/java/com/ticketingSystem/api/service/TicketSlaService.java†L221-L258】
- **Dashboard fields:** Response, resolution, idle, total SLA minutes, and “working time left” are stored for charts and breach tables. 【F:api/src/main/java/com/ticketingSystem/api/service/TicketSlaService.java†L233-L257】

## 4. Worked examples

Assume weekday hours **09:00–18:00** and weekends/holidays closed. Adjust the times to match your own `calendar_working_hours` rows.

### Example A – Due date for a High ticket

| Detail | Value |
| --- | --- |
| Policy | 4-hour SLA |
| Reported | Monday 16:45 |
| Monday window left | 75 minutes (16:45 → 18:00) |
| Remaining SLA | 165 minutes |
| Tuesday start | 09:00 |
| Finish | 09:00 + 165 minutes = 11:45 |

**Result:** Due date = **Tuesday 11:45** because the clock paused overnight and resumed at the next opening hour.

### Example B – Response, resolution, idle

| Item | Time range | SLA status | Working minutes |
| --- | --- | --- | --- |
| Reported | 09:00 | SLA clock starts | — |
| Assignment | 09:45 | Response captured | 45 |
| Work block 1 | 09:45–12:00 | SLA on | 135 |
| Pause | 12:00–13:00 | SLA off (waiting on customer) | 60 idle |
| Work block 2 | 13:00–15:30 | SLA on | 150 |

- **Totals**
  - Response time = 45 minutes.
  - Resolution time = 135 + 150 = 285 minutes (4h 45m).
  - Idle time = 60 minutes, so the due date shifts by one business hour (6h policy + 1h pause = 7h after report).
  - `breachedBy = 285 - 360 = -75` → still within SLA.

These examples use `computeWorkingDurationBetween` for every duration and `computeCalendarEnd` for each due date so the math always honors business hours, holidays, and escalations. 【F:api/src/main/java/com/ticketingSystem/calendar/service/SlaCalculatorService.java†L25-L136】【F:api/src/main/java/com/ticketingSystem/api/service/TicketSlaService.java†L95-L220】

---
By aligning SLA policies with the calendar module, teams get clear “working time” metrics plus reliable breach alerts for dashboards and notifications.
