# Standalone SLA report queries

The MySQL 8 script in this directory reproduces the two tables generated for
the `SLA_DETAILED_RPT` Jasper report.

## Detailed SLA report

[`sla_detailed_rpt.sql`](sla_detailed_rpt.sql) returns two result sets:

1. SLA totals and breach percentages, grouped monthly or quarterly.
2. The complete list of SLA-breached tickets in the selected date range.

Edit the `@from_date`, `@to_date`, and `@report_interval` values at the top of
the file, then run the entire script against the application's MySQL database.
Both dates are inclusive. Supported interval values are `MONTHLY` and
`QUARTERLY`; any other value follows the report's monthly fallback behavior.
