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
