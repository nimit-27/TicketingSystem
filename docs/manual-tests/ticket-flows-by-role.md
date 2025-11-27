# Ticket Flows and Scenarios by Role

> Flows use `→` arrows to show sequence. Keep preconditions satisfied before running each scenario.

## Requestor / End User
| ID | Mode | Flow | Expected Outcome | Preconditions |
| --- | --- | --- | --- | --- |
| R1 | Portal | Start (logged in) → **New Ticket** → Fill category/priority/subject/description → Add attachment → Submit | Ticket ID generated; success modal shows; form resets. | Valid account; required fields known. |
| R2 | Portal | Start (existing ticket) → **Add Comment** → Attach file → Save | Comment appears with timestamp; attachment downloadable. | Ticket in Open/Assigned status. |
| R3 | Portal | Start (Resolved/Closed ticket) → **Reopen** → Add remark → Confirm | Status flips to Reopened/Pending; timeline logs remark. | Ticket closed within allowed window. |
| R4 | Portal | Start (Open ticket) → **Edit** subject/description → Save | Ticket updates succeed; history captures changes. | User owns ticket. |
| R5 | Email | Compose email with subject/body/attachments → Send to support address | Ticket auto-created with email content; auto-ack sent. | Mail ingestion enabled. |

## Helpdesk Agent (L1)
| ID | Mode | Flow | Expected Outcome | Preconditions |
| --- | --- | --- | --- | --- |
| A1 | Phone/Walk-in → UI | Start → **Create on behalf** → Choose requester & category → Set priority → Assign to self → Submit | Ticket created assigned to agent; requester notified. | Agent has create permission. |
| A2 | UI | Open ticket → **Update fields** (priority/severity) → Save | Fields persist; SLA recalculates if applicable. | Ticket editable; agent owns or has rights. |
| A3 | UI | Open ticket → **Status change** Open → In Progress → On Hold → Add remark → Save | Status updated with remark logged; SLA pause resumes per rules. | Allowed status transitions configured. |
| A4 | UI | Open ticket → **Assign** → Choose level (L2) → Select assignee → Confirm | Assignee set; "My Workload" reflects assignment; requester notified. | L2 assignee active. |
| A5 | UI | Open ticket → **Link to master** → Search ID → Link | Ticket shows master banner; child list updates on master. | Master ticket exists; not already master. |
| A6 | UI | Open ticket → **Resolve/Close** → Enter resolution → Submit | Status set to Resolved/Closed; feedback prompt available to requester. | Problem fixed; closure rights granted. |

## Senior Agent / L2 Specialist
| ID | Mode | Flow | Expected Outcome | Preconditions |
| --- | --- | --- | --- | --- |
| S1 | UI | Open assigned ticket → **Accept assignment** → Update diagnosis notes | Assignment locked to L2; notes visible to team. | Ticket assigned to L2 queue. |
| S2 | UI | Open ticket → **Escalate** → Select escalation level/team → Add remark → Confirm | Status transitions to Escalated; notifications sent; SLA path switches. | Escalation matrix configured. |
| S3 | UI | Open ticket → **Recommend severity** → Provide justification → Submit | Recommendation stored; awaiting approver action; audit entry added. | Recommendation feature enabled. |
| S4 | UI | Open ticket → **Add RCA** after resolution → Save | RCA visible in RCA panel; history updated. | Ticket Resolved/Closed; RCA permission. |

## Team Lead / Supervisor
| ID | Mode | Flow | Expected Outcome | Preconditions |
| --- | --- | --- | --- | --- |
| L1 | UI | Open queue view → **Bulk select** tickets → Assign to agent → Confirm | All selected tickets assigned; workload view reflects new owners. | Lead has assign rights; agents active. |
| L2 | UI | Open ticket → **Override priority** → Save | Priority updates; SLA recalculated; note captured. | Lead permission to override. |
| L3 | UI | Open ticket → **Reopen** Closed ticket → Add remark → Confirm | Ticket returns to Open/Reopened; audit shows lead action. | Closure within reopen policy; lead rights. |
| L4 | UI | Open ticket → **Cancel/Reject** (invalid) → Add reason → Confirm | Ticket moves to Cancelled/Rejected; requester notified. | Policy allows cancellation. |

## Administrator / Service Owner
| ID | Mode | Flow | Expected Outcome | Preconditions |
| --- | --- | --- | --- | --- |
| ADM1 | UI | Open ticket → **Reassign across teams** → Choose queue/team → Confirm | Ownership switches to target team; watchers notified. | Cross-team rights granted. |
| ADM2 | UI | Open ticket → **Edit metadata** (category/SLAs) → Save | Metadata updates persist; downstream automations re-evaluate. | Admin privileges. |
| ADM3 | UI | Closed ticket → **Purge/Archive** → Confirm | Ticket marked archived/purged per policy; removed from active views. | Archival feature enabled. |
| ADM4 | API | Send PATCH /tickets/{id} with status update → Verify in UI | API updates reflect in UI; audit captures API actor. | API token with admin scope. |

## Cross-Role Regression
| ID | Flow | Expected Outcome |
| --- | --- | --- |
| X1 | Requestor raises via R1 → Agent handles A3/A4 → Lead bulk assigns L1 → Admin reassigns ADM1 | Each handoff preserves history; notifications sent at every transition. |
| X2 | Email-created ticket R5 → L1 escalates A4 → L2 escalates S2 → Lead reopens L3 | Status timeline shows each transition; SLA follows escalation policy. |
| X3 | Portal ticket R1 → Agent resolves A6 → Requestor reopens R3 → L2 resolves S4 | Reopen allowed once; resolution updates and RCA attached. |
