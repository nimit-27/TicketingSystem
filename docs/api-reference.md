# Ticketing System API Reference

This document describes core ticketing and FAQ APIs, including expected request payloads and responses.

## List tickets
- **Endpoint:** `GET /tickets`
- **Query params:**
  - `page` (default `0`), `size` (default `10`)
  - `priority` (optional)
  - `sortBy` (default `id`) and `direction` (default `ASC`)
- **Response:** `200 OK` with `PaginationResponse<TicketDto>`
```json
{
  "items": [
    {
      "id": "string",
      "shortId": "string",
      "reportedDate": "2024-01-01T12:00:00",
      "mode": "ONLINE",
      "modeId": "string",
      "userId": "string",
      "requestorName": "string",
      "requestorEmailId": "string",
      "requestorMobileNo": "string",
      "office": "string",
      "officeCode": "string",
      "regionCode": "string",
      "zoneCode": "string",
      "districtCode": "string",
      "regionName": "string",
      "districtName": "string",
      "stakeholder": "string",
      "stakeholderId": "string",
      "subject": "string",
      "description": "string",
      "category": "string",
      "categoryId": "string",
      "subCategory": "string",
      "subCategoryId": "string",
      "priority": "string",
      "priorityId": "string",
      "severity": "string",
      "severityId": "string",
      "severityLabel": "string",
      "recommendedSeverity": "string",
      "impact": "string",
      "severityRecommendedBy": "string",
      "recommendedSeverityStatus": "string",
      "severityApprovedBy": "string",
      "status": "OPEN",
      "statusId": "string",
      "statusLabel": "string",
      "statusName": "string",
      "attachmentPaths": ["path/to/file"],
      "assignToLevel": "string",
      "assignTo": "string",
      "assignedToLevel": "string",
      "assignedTo": "string",
      "assignedToName": "string",
      "assignedBy": "string",
      "levelId": "string",
      "updatedBy": "string",
      "isMaster": false,
      "masterId": "string",
      "lastModified": "2024-01-02T09:30:00",
      "resolvedAt": "2024-01-03T10:00:00",
      "feedbackStatus": "PENDING",
      "rcaStatus": "string"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1
}
```

## Create a ticket
- **Endpoint:** `POST /tickets/add`
- **Consumes:** `multipart/form-data`
- **Payload:** send a multipart form where each ticket property is a field and attachments are optional files. The JSON object below shows the exact keys/values that are serialized into the form fields:
```json
{
  "mode": "ONLINE",
  "modeId": "portal",
  "userId": "user-123",
  "requestorName": "Alex",
  "requestorEmailId": "alex@example.com",
  "requestorMobileNo": "9876543210",
  "office": "HQ",
  "officeCode": "HQ01",
  "regionCode": "R1",
  "zoneCode": "Z1",
  "districtCode": "D1",
  "regionName": "Region",
  "districtName": "District",
  "stakeholder": "Stakeholder",
  "subject": "Printer issue",
  "description": "Printer not working",
  "category": "Hardware",
  "subCategory": "Printer",
  "priority": "High",
  "severity": "S2",
  "recommendedSeverity": "S2",
  "impact": "Office floor",
  "severityRecommendedBy": "system",
  "ticketStatus": "OPEN",
  "assignedToLevel": "L1",
  "levelId": "L1",
  "assignedTo": "tech1",
  "assignedBy": "manager1",
  "updatedBy": "manager1",
  "isMaster": false,
  "masterId": null,
  "lastModified": "2024-01-02T09:30:00",
  "resolvedAt": null,
  "feedbackStatus": "PENDING",
  "remark": "First submission"
}
```
- **Attachments field (optional):** `attachments` → multiple binary files.
- **Response:** `200 OK` with the created `TicketDto` (same shape as the list response). Uploaded attachments, if any, are saved and returned in `attachmentPaths`.

## Update a ticket
- **Endpoint:** `PUT /tickets/{id}`
- **Consumes:** `application/json`
- **Payload:** JSON body matching the `Ticket` model (same keys as the creation form, but sent as JSON). Full example:
```json
{
  "mode": "ONLINE",
  "modeId": "portal",
  "userId": "user-123",
  "requestorName": "Alex",
  "requestorEmailId": "alex@example.com",
  "requestorMobileNo": "9876543210",
  "office": "HQ",
  "officeCode": "HQ01",
  "regionCode": "R1",
  "zoneCode": "Z1",
  "districtCode": "D1",
  "regionName": "Region",
  "districtName": "District",
  "stakeholder": "Stakeholder",
  "subject": "Printer issue",
  "description": "Printer not working",
  "category": "Hardware",
  "subCategory": "Printer",
  "priority": "High",
  "severity": "S2",
  "recommendedSeverity": "S2",
  "impact": "Office floor",
  "severityRecommendedBy": "system",
  "ticketStatus": "OPEN",
  "assignedToLevel": "L1",
  "levelId": "L1",
  "assignedTo": "tech1",
  "assignedBy": "manager1",
  "updatedBy": "manager1",
  "isMaster": false,
  "masterId": null,
  "lastModified": "2024-01-02T09:30:00",
  "resolvedAt": null,
  "feedbackStatus": "PENDING",
  "remark": "Updated details"
}
```
- **Response:** `200 OK` with a JSON object containing the updated ticket DTO:
```json
{
  "ticket": { /* TicketDto fields as in list response */ }
}
```

## Get FAQs
- **Endpoint:** `GET /public/faqs`
- **Response:** `200 OK` with an array of `FaqDto` objects:
```json
[
  {
    "id": "string",
    "questionEn": "How to reset password?",
    "questionHi": "string",
    "answerEn": "Use the reset link...",
    "answerHi": "string",
    "keywords": "reset,password",
    "createdBy": "admin",
    "createdOn": "2024-01-01T12:00:00",
    "updatedBy": "admin",
    "updatedOn": "2024-01-02T12:00:00"
  }
]
```

## List stakeholders (mobile)
- **Endpoint:** `GET /helpdeskbackend/m/stakeholders`
- **Purpose:** Returns the catalog of stakeholder types that can be associated with users or tickets.
- **Response:** `200 OK` with an array of `StakeholderDto` objects:
```json
[
  {
    "id": 101,
    "description": "Department",
    "stakeholderGroupId": 5,
    "isActive": "Y"
  }
]
```

## Get requester user details (mobile)
- **Endpoint:** `GET /helpdeskbackend/m/users/requesters/{userId}`
- **Path variables:**
  - `userId` – requester user identifier.
- **Response:** `200 OK` with a `RequesterUserDto` when found. Example:
```json
{
  "requesterUserId": "req-123",
  "username": "alice",
  "name": "Alice Johnson",
  "firstName": "Alice",
  "middleName": null,
  "lastName": "Johnson",
  "emailId": "alice@example.com",
  "mobileNo": "9876543210",
  "office": "HQ",
  "roles": "REQUESTER",
  "roleNames": ["Requester"],
  "roleIds": ["ROLE_REQUESTER"],
  "stakeholder": "Department",
  "stakeholderId": "101",
  "dateOfJoining": "2024-01-01T00:00:00",
  "dateOfRetirement": null,
  "officeType": "Head Office",
  "officeCode": "HO1",
  "zoneCode": "Z1",
  "regionCode": "R1",
  "districtCode": "D1"
}
```
- **Errors:** `404 Not Found` when the requester user does not exist.

## List helpdesk levels (mobile)
- **Endpoint:** `GET /helpdeskbackend/m/levels`
- **Purpose:** Returns the configured escalation/assignment levels.
- **Response:** `200 OK` with an array of `LevelDto` objects:
```json
[
  {
    "levelId": "L1",
    "levelName": "Level 1"
  },
  {
    "levelId": "L2",
    "levelName": "Level 2"
  }
]
```

## List priorities (mobile)
- **Endpoint:** `GET /helpdeskbackend/m/priorities`
- **Purpose:** Returns the priority master data used by tickets.
- **Response:** `200 OK` with an array of priority objects:
```json
[
  {
    "id": "P1",
    "level": "Critical",
    "description": "Business-critical outage",
    "weightage": 100,
    "activeFlag": "Y"
  }
]
```

## Manage ticket attachments (mobile)
- **Endpoints:**
  - `POST /helpdeskbackend/m/tickets/{ticketId}/attachments` (multipart form-data)
  - `DELETE /helpdeskbackend/m/tickets/{ticketId}/attachments?path=<storedPath>`
- **Purpose:** Uploads or deletes file attachments for an existing ticket.
- **Upload payload:**
  - Multipart field name: `attachments` (one or many files).
- **Responses:**
  - `200 OK` with the updated `TicketDto`, including `attachmentPaths`, when upload or delete succeeds.
- **Example response snippet:**
```json
{
  "id": "TICKET-001",
  "attachmentPaths": [
    "attachments/TICKET-001/log.txt",
    "attachments/TICKET-001/screenshot.png"
  ]
}
```

## View assignment history (mobile)
- **Endpoint:** `GET /helpdeskbackend/m/assignment-history/{ticketId}`
- **Path variables:**
  - `ticketId` – ticket identifier to fetch its assignment trail.
- **Response:** `200 OK` with an array of assignment history entries:
```json
[
  {
    "id": "0c4f...",
    "assignedBy": "agent-1",
    "assignedTo": "agent-2",
    "levelId": "L2",
    "timestamp": "2024-01-05T10:15:00",
    "remark": "Escalated to level 2"
  }
]
```

## Dashboard summary for requester (mobile)
- **Endpoint:** `GET /helpdeskbackend/m/reports/support-dashboard-summary`
- **Query params (all optional):**
  - `timeScale` – aggregation granularity (e.g., `DAILY`, `MONTHLY`).
  - `timeRange` – named window such as `LAST_7_DAYS`, `LAST_MONTH`, `CUSTOM`.
  - `customStartYear`, `customEndYear` – bounds used when `timeRange=CUSTOM`.
- **Headers:**
  - `X-USER-ID` (optional) – requester identifier to scope the dashboard; when omitted, data defaults to the authenticated user.
- **Response:** `200 OK` with `SupportDashboardSummaryDto` including sections like overall ticket counts, workload, SLA compliance, resolution time, and category-level breakdowns. A minimal example:
```json
{
  "openResolved": { "openTickets": 12, "resolvedTickets": 30 },
  "slaCompliance": [ { "label": "Within SLA", "value": 85 } ],
  "ticketVolume": [ { "label": "2024-01", "value": 25 } ],
  "allTicketsByCategory": [ { "category": "Hardware", "open": 5, "resolved": 10 } ]
}
```
