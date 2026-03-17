# Raise Ticket APIs (Division, Issue Type, and `/m` mobile routes)

This document is intended for mobile app integration and Postman testing.

## 1) Base URL

Use the environment base URL and append the context path (commonly `/helpdesk` in local/dev):

- Local example: `http://localhost:8082/helpdesk`
- UAT/Staging/Prod examples are configured through `REACT_APP_API_URL` in UI env files.

---

## 2) Authentication model

There are two auth patterns in this project:

1. **Web/API JWT auth** for normal routes like `/divisions`, `/issue-types`, `/tickets/**`.
2. **Mobile client token auth** for routes under `/m/**` (except `/m/auth/token`).

### 2.1 Get mobile client token (`/m/auth/token`)

- **Method:** `POST`
- **Path:** `/m/auth/token`
- **Auth:** Public endpoint (`permitAll`), no request body required.
- **Success response (200):**

```json
{
  "accessToken": "<jwt>",
  "expiresInMinutes": 60,
  "clientId": "parent-mobile-app"
}
```

- **Failure response (401):**

```json
{ "message": "Invalid client credentials" }
```

### cURL (copy to Postman)

```bash
curl --location --request POST '{{BASE_URL}}/m/auth/token'
```

> In Postman, set `BASE_URL` like `http://localhost:8082/helpdesk`.

---

## 3) Division and Issue Type APIs used in Raise Ticket

UI Raise Ticket loads these two masters:

- `GET /divisions`
- `GET /issue-types`

Mobile can call either the standard endpoints directly or the `/m`-prefixed forwarded routes (details in section 4).

## 3.1 Get Divisions

- **Method:** `GET`
- **Path:** `/divisions`
- **Auth:** Bearer token required (JWT).
- **Response:** array of `DivisionDto`

```json
[
  {
    "divisionId": "DIV-1",
    "divisionName": "North Division",
    "divisionCode": "ND",
    "description": "North operations",
    "isActive": "Y"
  }
]
```

### cURL (JWT route)

```bash
curl --location '{{BASE_URL}}/divisions' \
  --header 'Authorization: Bearer {{JWT_TOKEN}}'
```

### cURL (`/m` route using mobile token)

```bash
curl --location '{{BASE_URL}}/m/divisions' \
  --header 'Authorization: Bearer {{MOBILE_ACCESS_TOKEN}}'
```

## 3.2 Get Issue Types

- **Method:** `GET`
- **Path:** `/issue-types`
- **Auth:** Bearer token required (JWT).
- **Response:** array of `IssueTypeDto`

```json
[
  {
    "issueTypeId": "ISS-1",
    "issueTypeLabel": "Application Issue",
    "description": "Issue in application",
    "isActive": "Y",
    "slaFlag": true,
    "createdAt": "2025-01-10T12:30:00",
    "updatedAt": "2025-01-12T09:00:00"
  }
]
```

### cURL (JWT route)

```bash
curl --location '{{BASE_URL}}/issue-types' \
  --header 'Authorization: Bearer {{JWT_TOKEN}}'
```

### cURL (`/m` route using mobile token)

```bash
curl --location '{{BASE_URL}}/m/issue-types' \
  --header 'Authorization: Bearer {{MOBILE_ACCESS_TOKEN}}'
```

---

## 4) What “slash M” (`/m`) means in this backend

`/m` is a **mobile route prefix**.

- `/m/auth/token` → issues mobile client token.
- `/m/ping` → mobile token protected status endpoint.
- Any other `/m/**` (for example `/m/divisions`, `/m/issue-types`, `/m/tickets/search`) is forwarded internally to the equivalent non-`/m` route (`/divisions`, `/issue-types`, `/tickets/search`).

So for mobile, these are equivalent in behavior (with different auth expectation):

- `/divisions` and `/m/divisions`
- `/issue-types` and `/m/issue-types`
- `/tickets/search` and `/m/tickets/search`

> Practical recommendation for mobile app: use `/m/**` consistently and send `Authorization: Bearer <mobile_access_token>`.

### cURL for slash M ping

```bash
curl --location '{{BASE_URL}}/m/ping' \
  --header 'Authorization: Bearer {{MOBILE_ACCESS_TOKEN}}'
```

Expected response:

```json
{
  "message": "Mobile client authenticated",
  "clientId": "parent-mobile-app",
  "timestamp": "2026-01-01T10:00:00+05:30"
}
```

---

## 5) Related “anything else” for Raise Ticket filtering

If mobile app also supports ticket list/search filters by issue type and division, use:

- **Method:** `GET`
- **Path:** `/tickets/search`
- **Filter query params:** `issueTypeId`, `divisionId` (along with other optional params)

### cURL (standard)

```bash
curl --location '{{BASE_URL}}/tickets/search?query=*&page=0&size=10&issueTypeId={{ISSUE_TYPE_ID}}&divisionId={{DIVISION_ID}}' \
  --header 'Authorization: Bearer {{JWT_TOKEN}}'
```

### cURL (mobile slash M)

```bash
curl --location '{{BASE_URL}}/m/tickets/search?query=*&page=0&size=10&issueTypeId={{ISSUE_TYPE_ID}}&divisionId={{DIVISION_ID}}' \
  --header 'Authorization: Bearer {{MOBILE_ACCESS_TOKEN}}'
```

---

## 6) Postman quick setup

Create Postman variables:

- `BASE_URL` = `http://localhost:8082/helpdesk`
- `JWT_TOKEN` = web login token
- `MOBILE_ACCESS_TOKEN` = token returned from `POST /m/auth/token`
- `ISSUE_TYPE_ID` = sample issue type id
- `DIVISION_ID` = sample division id

Then paste any cURL from above directly into Postman Import.
