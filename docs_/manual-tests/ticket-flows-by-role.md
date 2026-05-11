# Ticket Flows and Scenarios by Role

> Flows use `→` arrows to show sequence. Keep preconditions satisfied before running each scenario.

## Requestor / End User
- **R1 (Portal)**
  - Flow: Start (logged in) → **New Ticket** → Fill category/priority/subject/description → Add attachment → Submit
  - Expected Outcome: Ticket ID generated; success modal shows; form resets.
  - Preconditions: Valid account; required fields known.
- **R2 (Portal)**
  - Flow: Start (existing ticket) → **Add Comment** → Attach file → Save
  - Expected Outcome: Comment appears with timestamp; attachment downloadable.
  - Preconditions: Ticket in Open/Assigned status.
- **R3 (Portal)**
  - Flow: Start (Resolved/Closed ticket) → **Reopen** → Add remark → Confirm
  - Expected Outcome: Status flips to Reopened/Pending; timeline logs remark.
  - Preconditions: Ticket closed within allowed window.
- **R4 (Portal)**
  - Flow: Start (Open ticket) → **Edit** subject/description → Save
  - Expected Outcome: Ticket updates succeed; history captures changes.
  - Preconditions: User owns ticket.
- **R5 (Email)**
  - Flow: Compose email with subject/body/attachments → Send to support address
  - Expected Outcome: Ticket auto-created with email content; auto-ack sent.
  - Preconditions: Mail ingestion enabled.

## Helpdesk Agent (L1)
- **A1 (Phone/Walk-in → UI)**
  - Flow: Start → **Create on behalf** → Choose requester & category → Set priority → Assign to self → Submit
  - Expected Outcome: Ticket created assigned to agent; requester notified.
  - Preconditions: Agent has create permission.
- **A2 (UI)**
  - Flow: Open ticket → **Update fields** (priority/severity) → Save
  - Expected Outcome: Fields persist; SLA recalculates if applicable.
  - Preconditions: Ticket editable; agent owns or has rights.
- **A3 (UI)**
  - Flow: Open ticket → **Status change** Open → In Progress → On Hold → Add remark → Save
  - Expected Outcome: Status updated with remark logged; SLA pause resumes per rules.
  - Preconditions: Allowed status transitions configured.
- **A4 (UI)**
  - Flow: Open ticket → **Assign** → Choose level (L2) → Select assignee → Confirm
  - Expected Outcome: Assignee set; "My Workload" reflects assignment; requester notified.
  - Preconditions: L2 assignee active.
- **A5 (UI)**
  - Flow: Open ticket → **Link to master** → Search ID → Link
  - Expected Outcome: Ticket shows master banner; child list updates on master.
  - Preconditions: Master ticket exists; not already master.
- **A6 (UI)**
  - Flow: Open ticket → **Resolve/Close** → Enter resolution → Submit
  - Expected Outcome: Status set to Resolved/Closed; feedback prompt available to requester.
  - Preconditions: Problem fixed; closure rights granted.

## Senior Agent / L2 Specialist
- **S1 (UI)**
  - Flow: Open assigned ticket → **Accept assignment** → Update diagnosis notes
  - Expected Outcome: Assignment locked to L2; notes visible to team.
  - Preconditions: Ticket assigned to L2 queue.
- **S2 (UI)**
  - Flow: Open ticket → **Escalate** → Select escalation level/team → Add remark → Confirm
  - Expected Outcome: Status transitions to Escalated; notifications sent; SLA path switches.
  - Preconditions: Escalation matrix configured.
- **S3 (UI)**
  - Flow: Open ticket → **Recommend severity** → Provide justification → Submit
  - Expected Outcome: Recommendation stored; awaiting approver action; audit entry added.
  - Preconditions: Recommendation feature enabled.
- **S4 (UI)**
  - Flow: Open ticket → **Add RCA** after resolution → Save
  - Expected Outcome: RCA visible in RCA panel; history updated.
  - Preconditions: Ticket Resolved/Closed; RCA permission.

## Team Lead / Supervisor
- **L1 (UI)**
  - Flow: Open queue view → **Bulk select** tickets → Assign to agent → Confirm
  - Expected Outcome: All selected tickets assigned; workload view reflects new owners.
  - Preconditions: Lead has assign rights; agents active.
- **L2 (UI)**
  - Flow: Open ticket → **Override priority** → Save
  - Expected Outcome: Priority updates; SLA recalculated; note captured.
  - Preconditions: Lead permission to override.
- **L3 (UI)**
  - Flow: Open ticket → **Reopen** Closed ticket → Add remark → Confirm
  - Expected Outcome: Ticket returns to Open/Reopened; audit shows lead action.
  - Preconditions: Closure within reopen policy; lead rights.
- **L4 (UI)**
  - Flow: Open ticket → **Cancel/Reject** (invalid) → Add reason → Confirm
  - Expected Outcome: Ticket moves to Cancelled/Rejected; requester notified.
  - Preconditions: Policy allows cancellation.

## Administrator / Service Owner
- **ADM1 (UI)**
  - Flow: Open ticket → **Reassign across teams** → Choose queue/team → Confirm
  - Expected Outcome: Ownership switches to target team; watchers notified.
  - Preconditions: Cross-team rights granted.
- **ADM2 (UI)**
  - Flow: Open ticket → **Edit metadata** (category/SLAs) → Save
  - Expected Outcome: Metadata updates persist; downstream automations re-evaluate.
  - Preconditions: Admin privileges.
- **ADM3 (UI)**
  - Flow: Closed ticket → **Purge/Archive** → Confirm
  - Expected Outcome: Ticket marked archived/purged per policy; removed from active views.
  - Preconditions: Archival feature enabled.
- **ADM4 (API)**
  - Flow: Send PATCH /tickets/{id} with status update → Verify in UI
  - Expected Outcome: API updates reflect in UI; audit captures API actor.
  - Preconditions: API token with admin scope.

## Cross-Role Regression
- **X1**
  - Flow: Requestor raises via R1 → Agent handles A3/A4 → Lead bulk assigns L1 → Admin reassigns ADM1
  - Expected Outcome: Each handoff preserves history; notifications sent at every transition.
- **X2**
  - Flow: Email-created ticket R5 → L1 escalates A4 → L2 escalates S2 → Lead reopens L3
  - Expected Outcome: Status timeline shows each transition; SLA follows escalation policy.
- **X3**
  - Flow: Portal ticket R1 → Agent resolves A6 → Requestor reopens R3 → L2 resolves S4
  - Expected Outcome: Reopen allowed once; resolution updates and RCA attached.
- **X4**
  - Flow: Requestor creates ticket (R1) → Team Lead assigns to L1 agent (L1) → L1 sets On Hold with clarification to requester (A3) → Requestor responds by comment (R2) → L1 resumes work and resolves (A6)
  - Expected Outcome: Assignment tracked end-to-end; On Hold pauses SLA; requester reply resumes SLA and is visible; final resolution closes the ticket with full audit history.
- **X5**
  - Flow: Requestor raises via email (R5) → L1 triages and assigns to L2 (A4) → L2 recommends higher severity with justification (S3) → Team Lead approves recommendation and escalates priority (L2) → L2 continues fix and adds RCA (S4)
  - Expected Outcome: Severity recommendation captured and approved with audit entries; priority and SLA adjust; RCA stored after fix; notifications issued to requester on key updates.
- **X6**
  - Flow: Requestor submits portal ticket (R1) → L1 links to master incident (A5) → Team Lead bulk assigns related tickets to specialist queue (L1) → Administrator reassigns one ticket across teams (ADM1) → Specialist escalates to higher tier (S2)
  - Expected Outcome: Master/child relationships maintained across reassignments; bulk actions preserve links; cross-team move and escalation both log history and trigger notifications.

## Recommended Severity Workflow (End-to-End)
- **RS1 – Recommendation creation**
  - Flow: RNO opens a ticket → Click **Recommend Severity** → Enter proposed severity and justification → Submit
  - Expected Outcome: Recommendation saved with pending status; audit trail created; ticket remains in current status.
  - Preconditions: Recommendation feature enabled; user has permission S3.
- **RS2 – Approval/override by IT Manager/IT Division**
  - Flow: IT Manager opens ticket with pending recommendation → Review justification → Approve or Reject/Override severity → Add required remark → Confirm
  - Expected Outcome: On approval, ticket severity updates and SLA recalculates; on rejection, recommendation closed with rationale recorded; requester/assignee notified.
- **RS3 – Follow-up handling**
  - Flow: After approval, L1/L2 continues work 
  - Expected Outcome: Downstream actions respect new severity; history shows recommendation lifecycle; reopening does not reapply old recommendation but keeps record.
