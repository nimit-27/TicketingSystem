# Calendar Module

The calendar module exposes REST APIs for managing holidays, working hours, SLA computations and external calendar synchronisation. It is packaged as an independent Spring Boot starter that can be imported by the main application or deployed separately.

## Features

- Holiday, working hours and exception management persisted via JPA and Flyway-managed tables.
- SLA-aware end-time computation that honours working windows, holidays and closures.
- FullCalendar-ready DTOs for immediate consumption by frontend clients.
- Extensible external provider facade for syncing holidays from third-party APIs.

## Getting Started

### Build & Test

```bash
gradle clean build
```

### Configuration

Provide a datasource and Flyway configuration (example):

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/ticketing_calendar?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata
    username: calendar_user
    password: changeme
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        format_sql: true
        jdbc:
          time_zone: Asia/Kolkata
  flyway:
    enabled: true
    baseline-on-migrate: true
    locations: classpath:db/migration
    table: flyway_schema_history_calendar
calendar:
  providers:
    calendar-bharat:
      base-url: https://calendar-bharat.example.com
      api-key: your-key
```

### REST APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/calendar/config?from=YYYY-MM-DD&to=YYYY-MM-DD` | GET | Retrieve timezone and resolved business hours for range |
| `/calendar/events?from=YYYY-MM-DD&to=YYYY-MM-DD` | GET | List FullCalendar events (holidays, custom events) |
| `/calendar/compute-end-time` | POST | Compute SLA end datetime from start and duration |
| `/calendar/admin/holidays:upsert` | POST | Upsert holidays for a region |
| `/calendar/admin/working-hours:upsert` | POST | Upsert the default working hours row |
| `/calendar/admin/exceptions:upsert` | POST | Upsert a working hours exception |
| `/calendar/admin/exceptions/{id}` | DELETE | Delete a working hours exception |
| `/calendar/admin/providers/{providerCode}:sync` | POST | Synchronise holidays from external provider |

### Example Payloads

```json
{
  "startDateTimeIso": "2025-10-10T16:45:00+05:30",
  "durationMinutes": 120
}
```

```json
{
  "dates": ["2025-10-02", "2025-10-24"],
  "region": "IN-WB-Kolkata",
  "name": "Festival"
}
```

## Database Migrations

Flyway migration scripts reside under `src/main/resources/db/migration`. Run migrations using the Spring Boot Flyway auto-configuration or via the Flyway CLI pointing to the same directory.

## Module Integration

Import the module by adding it as a Gradle dependency or including its source in the monorepo build. The `CalendarAutoConfiguration` class exposes component scanning, entity scanning and repository configuration so the beans are auto-detected when the module is on the classpath.
