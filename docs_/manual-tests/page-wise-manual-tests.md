# Page-wise Manual Test Cases

The following manual test scenarios are organized by primary application pages to ensure comprehensive coverage across the ticketing platform. Dev mode behaviors are explicitly excluded as requested. For end-to-end flows by role, see [`ticket-flows-by-role.md`](./ticket-flows-by-role.md).

## Login & Portal Selection
1. **Portal selection required before login submission** – Attempt to submit credentials without choosing a portal; ensure no authentication request is issued and a validation prompt appears.
2. **Portal chooser exposes Requestor and Helpdesk options** – Verify both portal options render, can be selected, and the active selection is visually indicated.
3. **Remembered portal selection** – Refresh the login page after selecting a portal and confirm the previously chosen portal remains selected when the session storage allows persistence.
4. **Successful login flow** – Submit valid credentials for a selected portal; confirm token storage, user detail retrieval, role lookup, and navigation to the home screen.
5. **Failed login surfaces error messaging** – Submit invalid credentials and ensure the inline error message is displayed without changing routes.
6. **Unauthorized navigation redirect** – Attempt to access a protected route without stored user details and confirm redirect back to `/login`.
7. **Logout clears session and returns to login** – From an authenticated state, sign out and ensure tokens and user details are cleared and the login page is shown.

## Raise Ticket Page
8. **Category field validation** – Leave category empty and attempt to submit; expect the “Please select Category” validation message.
9. **Subcategory cascading requirement** – Select a category with children, then clear it; ensure subcategory resets and validation triggers if required on submit.
10. **Priority selection enforcement** – Submit without a priority to trigger required validation and confirm tooltip guidance is available.
11. **Subject mandatory validation** – Attempt to submit with subject empty and confirm inline error.
12. **Description mandatory validation** – Submit without description to ensure required error displays.
13. **Attachment upload limit enforcement** – Upload a file larger than 5 MB and verify the FileUpload control prevents submission.
14. **Attachment type restrictions** – Attempt to upload an unsupported file type and ensure the component surfaces the restriction message.
15. **Multiple attachment management** – Add several files, remove one before submission, and confirm only remaining files upload.
16. **Assign level before assignee requirement** – Verify the “Assign to” dropdown remains disabled until an assignment level is chosen.
17. **Assign to required when level set** – Select a level but leave assignee blank; ensure validation prevents submission.
18. **Link to master disabled for master tickets** – Mark the ticket as “master” and confirm the “Link to master” control disables automatically.
19. **Open and close Link to Master modal** – Launch the modal, search for a ticket, select it, and confirm the linked ID populates on close.
20. **Link to Master search validation** – Attempt linking with an invalid ticket ID and verify error handling prevents association.
21. **Ticket submission triggers attachment upload** – Submit a ticket with attachments and confirm files upload after the ticket ID is generated.
22. **Post-submit success modal** – After successful submission, ensure the success modal appears with the generated ticket ID.
23. **Form reset after submission** – Confirm all input fields and attachments clear after acknowledging the success modal.
24. **Draft preservation on navigation** – Begin composing a ticket, navigate away, then return and ensure unsaved data is either preserved or cleared according to product requirements.
25. **Recommended severity interaction** – If available from the creation page, trigger recommended severity and ensure the appropriate modal collects a remark before submission.
26. **Cancel creation confirmation** – Attempt to cancel with unsaved changes and ensure the confirmation dialog appears before discarding data.

## All Tickets / Ticket List Page
27. **Initial fetch uses default filters** – Load the list and confirm the default filter set (status, page size, sort) matches requirements.
28. **Ticket search debounce** – Enter text in the search bar and verify API calls fire only after the debounce delay.
29. **Status filter options respect permissions** – Check that the status dropdown displays only statuses allowed for the current role.
30. **Category and subcategory filters cascading** – Select a category and ensure subcategory options update; clearing category resets subcategory.
31. **Date range presets** – Apply presets such as “Today,” “Last 7 Days,” and ensure API parameters reflect the chosen range.
32. **Custom date range validation** – Input an invalid range (end before start) and ensure validation prevents submission.
33. **Level chips filtering** – Toggle level chips (e.g., L1, L2) and confirm ticket results filter accordingly.
34. **Master-only filter** – Enable the master ticket filter and verify only master tickets remain in the list.
35. **Sort dropdown behavior** – Switch between “Created Date” and “Latest Updated” sorting and confirm list order and backend query parameters change.
36. **View toggle availability** – Ensure both grid and table view options appear when permitted and switching updates layout state.
37. **Loading overlay on fetch** – Trigger a filter change and confirm a loading indicator displays while awaiting results.
38. **Ticket row interactions** – Click on a ticket ID to open the sidebar view and another cell to navigate to the ticket detail page when allowed.
39. **Pagination controls** – Change page size and navigate between pages, verifying ticket data updates and the page indicator reflects the current page.
40. **Empty state messaging** – Apply filters yielding no results and ensure an informative empty state message is shown.
41. **Bulk selection persistence** – Select multiple tickets, switch pages, and ensure selections clear or persist based on design expectations.
42. **Permission-based action visibility** – Confirm only authorized actions (e.g., escalate, close) render for the current user role within the list.
43. **My Tickets role override** – Switch to “My Tickets” tab and ensure the API request includes the requestor override limiting to owned tickets.
44. **My Workload assigned-to enforcement** – On “My Workload,” confirm results are limited to tickets assigned to the signed-in user.
45. **Team lead status restrictions** – For team lead roles, verify “My Workload” shows only Open and Assigned statuses.
46. **Export list availability** – If export is supported, ensure the action triggers a download with current filters applied.

## Ticket View Page
47. **Ticket details render correctly** – Open a ticket and confirm subject, description, category, priority, and status fields show accurate data.
48. **Edit mode permission control** – Attempt to toggle edit mode; ensure it is only available for roles with edit rights.
49. **Field editing and save** – Modify subject/description, save, and verify success notification plus refreshed data from backend.
50. **Validation in edit mode** – Clear mandatory fields while editing and ensure inline validation prevents saving.
51. **Status timeline rendering** – Ensure the status history/timeline component displays chronological updates.
52. **Comments section add/update** – Post a new comment and verify it appears with correct author and timestamp.
53. **Comment deletion restrictions** – Attempt to delete another user’s comment and confirm permission denial.
54. **Attachment upload within ticket** – Add a new attachment from ticket view and confirm it uploads and appears in the list.
55. **Attachment removal workflow** – Remove an existing attachment and ensure confirmation plus list refresh occurs.
56. **Attachment download integrity** – Download an attachment and verify the file contents match the original upload.
57. **Recommended severity action** – Initiate the recommend severity flow, enter required remarks, and ensure recommendation is saved.
58. **Approve recommended severity** – As an approver role, accept the recommendation and verify status and severity update accordingly.
59. **Escalation action** – Trigger escalation (where permitted) and confirm status changes to the escalation state with audit entry.
60. **Status change remark requirement** – Attempt a status change that requires remarks without providing one to confirm enforcement.
61. **Feedback modal availability** – For closed tickets, open the feedback modal, submit feedback, and ensure it persists.
62. **Root cause analysis modal** – Launch the RCA modal, submit content, and verify the RCA data displays afterward.
63. **Master ticket banner navigation** – On a child ticket, use the master ticket banner link to navigate to the master record.
64. **Child ticket listing** – Open a master ticket and confirm the child ticket list populates with correct links.
65. **SLA visualization accuracy** – Confirm SLA timers/charts reflect expected values, including overdue indicators.
66. **Audit history availability** – Verify the audit/history section can be toggled to show detailed change logs.
67. **Recommendation focus from list** – When opening a ticket via “Recommend Severity” action from the list, ensure focus scrolls to the recommendation section.

## Master Data – Categories & Subcategories Page
68. **Category list retrieval** – Load the page and confirm existing categories display with correct counts.
69. **Add new category** – Create a category with valid data and ensure it appears in the list without refresh.
70. **Prevent duplicate category creation** – Attempt to add an existing category name and verify an error prevents duplication.
71. **Edit category flow** – Rename a category and confirm the list updates with the new name.
72. **Delete category confirmation** – Delete a category and ensure confirmation is required and the category is removed.
73. **Category selection impacts subcategory panel** – Select a category and verify associated subcategories populate.
74. **Add subcategory** – Create a subcategory under the selected category and ensure it appears immediately.
75. **Edit subcategory flow** – Rename a subcategory and confirm updates persist.
76. **Delete subcategory** – Remove a subcategory and ensure the list refreshes without the deleted entry.
77. **Subcategory search filter** – Use the search box to filter subcategories and verify results narrow accordingly.
78. **“Other” subcategory grouping** – Confirm subcategories flagged as “Other” display within their special grouping.
79. **Disabled actions when no category selected** – Ensure add/edit/delete subcategory actions disable until a category is selected.

## Escalation Contacts Page
80. **Escalation list retrieval** – Verify existing escalation contacts load with role and contact details.
81. **Add escalation contact validation** – Submit without required fields and ensure validation errors display.
82. **Successful escalation contact creation** – Add a new contact and confirm success messaging plus list refresh.
83. **Search and filter behavior** – Enter criteria into search filters and verify results update with debounce.
84. **Edit escalation contact** – Modify an existing contact’s details and ensure the list reflects changes.
85. **Delete escalation contact confirmation** – Initiate deletion, accept confirmation, and confirm the contact is removed.

## Roles Administration Page
86. **Role list display** – Load roles page and ensure grid/table displays all roles with key data points.
87. **Create new role validation** – Attempt to save with missing mandatory fields and confirm validation triggers.
88. **Successful role creation** – Add a new role, assign permissions, and verify it appears in the list.
89. **Edit role permissions** – Update permissions for an existing role and confirm changes persist after refresh.
90. **Delete single role** – Delete a role and ensure confirmation plus removal from the list.
91. **Bulk role selection** – Select multiple roles in table view and confirm bulk action toolbar appears.
92. **Bulk role deletion** – Delete selected roles via bulk action and ensure all targeted roles are removed post-confirmation.
93. **View toggle between grid and table** – Switch views and verify columns/cards update accordingly while retaining filter state.

## Notifications & Global Elements
94. **Global toast notifications** – Trigger success and error actions across pages and verify toasts display with consistent styling.
95. **Breadcrumb navigation** – Confirm breadcrumbs update correctly when navigating between list and detail pages.
96. **Header user info** – Ensure the signed-in user’s name/role render correctly in the header.
97. **Help/support link** – Click the help link and verify it navigates to or opens the support documentation as configured.
98. **Session timeout handling** – Simulate session expiry and ensure the user is returned to login with a relevant message.
99. **Unauthorized action handling** – Attempt an action beyond the user’s permissions and ensure an error banner or toast appears.


## Detailed UI Test Cases for Specific Pages

### AllTickets.tsx
| # | Scenario | Preconditions | Steps | Expected Result |
|---|----------|---------------|-------|-----------------|
| 100 | Highlight recommended severity row from list action | User has access to the All Tickets list and at least one ticket with an available "Recommend Severity" action. | 1. From the list, trigger the "Recommend Severity" control on any ticket.<br>2. Observe the table row state after the action fires. | The targeted row gains the focus highlight and remains scrolled into view until the detail view acknowledges the recommendation. |
| 101 | Clear recommendation focus once handled in ticket view | Scenario 100 completed and the ticket view opened in a separate tab or pane. | 1. Open the ticket that was highlighted.<br>2. Complete or dismiss the recommendation workflow inside the ticket view.<br>3. Return to the list. | The highlight is removed and the list reflects the cleared focus state without additional user interaction. |
| 102 | Reset focus when selection changes to a different ticket | A recommended severity highlight is active. | 1. Select a different ticket via the checkbox or row click.<br>2. Deselect to return to no active selection. | The focus highlight for the original ticket disappears, ensuring the state is cleared when another ticket becomes active. |
| 103 | Navigate to ticket details via row click | User can open ticket details from the list. | 1. Click any row (not the ticket ID hyperlink). | The router navigates to `/tickets/{id}` for the clicked ticket. |

### CategoriesMaster.tsx
| # | Scenario | Preconditions | Steps | Expected Result |
|---|----------|---------------|-------|-----------------|
| 104 | Filter category list as the user types | Existing categories already loaded. | 1. Type a partial string in the Category filter input.<br>2. Observe the primary category list. | Only categories matching the filter remain, while non-matching categories move to the "Other Categories" list. |
| 105 | Show add-category CTA only for unique values | Same as Scenario 104. | 1. Enter a category name that does not currently exist.<br>2. Observe the inline button. | The "Add Category" button appears; selecting it persists the new category and clears the input. |
| 106 | Prevent subcategory creation without selecting a category | At least one category is available. | 1. Ensure no category is selected.<br>2. Enter text in the Sub-Category input and attempt to add. | The add button stays disabled and no API call is issued because a parent category is required. |
| 107 | Delete subcategory after confirmation | A category with at least one subcategory is selected. | 1. Click the delete icon for a subcategory.<br>2. Accept the confirmation prompt. | The subcategory is removed from the list and the latest data is fetched from the service. |

### CreateRole.tsx
| # | Scenario | Preconditions | Steps | Expected Result |
|---|----------|---------------|-------|-----------------|
| 108 | Enforce unique role name requirement | Create Role panel is open. | 1. Leave the Role Name field empty.<br>2. Attempt to submit. | Validation message appears and submission is blocked until a non-empty value is provided. |
| 109 | Trigger custom permissions modal | Permissions list contains the "Custom" option. | 1. Open the Permissions autocomplete.<br>2. Choose the "Custom" chip. | The Permissions modal opens, allowing the user to craft a custom permission JSON. |
| 110 | Persist custom permission selection | Scenario 109 completed. | 1. Submit a JSON payload in the custom permissions modal.<br>2. Close the modal. | The permissions field shows "Custom" as the sole selected value and the JSON payload is staged for submission. |
| 111 | Select multiple status actions for the role | Status actions fetched successfully. | 1. Open the Status Actions autocomplete.<br>2. Select multiple actions.<br>3. Submit the form. | The payload sends the selected action IDs joined by pipe (`|`) in `allowedStatusActionIds`. |

### CustomerSatisfactionForm.tsx
| # | Scenario | Preconditions | Steps | Expected Result |
|---|----------|---------------|-------|-----------------|
| 112 | Record star rating interaction | Feedback form opened for a ticket awaiting feedback. | 1. Click a star value for "Overall Satisfaction".<br>2. Repeat for other rating sections. | The selected rating values persist and render filled stars matching the chosen score. |
| 113 | Prevent submission without ticket context | Feedback route accessed without a valid `ticketId`. | 1. Attempt to submit feedback. | Submission is blocked; no API call is fired because the route enforces a valid ticket identifier. |
| 114 | Submit feedback and receive toast confirmation | Valid `ticketId` with all required ratings provided. | 1. Fill all ratings and add an optional comment.<br>2. Click Submit. | The form disables while submitting, displays a success toast, and navigates back to the previous page. |
| 115 | Respect view-only mode | Feedback is already provided (view mode). | 1. Open an already-submitted feedback form.<br>2. Inspect rating widgets and comment field. | All inputs render in read-only mode and submit/cancel buttons are replaced with a close button. |

### EscalationMaster.tsx
| # | Scenario | Preconditions | Steps | Expected Result |
|---|----------|---------------|-------|-----------------|
| 116 | Validate escalation user form | Page loaded with empty form fields. | 1. Leave Name, Email, or Phone blank.<br>2. Click Submit. | No API call is made and visual feedback instructs the user to complete required fields. |
| 117 | Create escalation contact and reset form | All required fields populated with valid data. | 1. Enter Name, Email, and Phone.<br>2. Click Submit. | Contact is created, success toast appears, and the form clears all inputs. |
| 118 | Search contacts using debounce field | Existing contacts present. | 1. Type a partial term into the Search box.<br>2. Pause typing. | After the debounce interval, the table filters to contacts matching the name, email, or phone substring. |
| 119 | Delete contact via action column | Table populated with at least one contact. | 1. Click the delete icon on a contact row.<br>2. Confirm the prompt. | The contact is removed and the list refreshes to exclude the deleted record. |

### Faq.tsx
| # | Scenario | Preconditions | Steps | Expected Result |
|---|----------|---------------|-------|-----------------|
| 120 | Load FAQs in preferred language | FAQs exist with English and Hindi content. | 1. Set the app language to English.<br>2. Open the FAQ page.<br>3. Switch language to Hindi. | Questions and answers display in the selected language, falling back to the other language when a translation is missing. |
| 121 | Hide create button without permission | Current user lacks `faq.addQnAButton` access. | 1. Navigate to the FAQ page. | The "Add Q & A" button is hidden entirely. |
| 122 | Navigate to FAQ creation when permitted | Current user has `faq.addQnAButton` access. | 1. Click the "Add Q & A" button. | Router navigates to `/faq/new` for question creation. |
| 123 | Render keyword metadata for search indexing | FAQs contain keyword metadata. | 1. Inspect a rendered FAQ entry. | `data-keywords` attributes on question and answer nodes reflect the stored keyword string for client-side filtering. |

### FaqForm.tsx
| # | Scenario | Preconditions | Steps | Expected Result |
|---|----------|---------------|-------|-----------------|
| 124 | Require at least one question and answer | Creation form opened. | 1. Leave both English and Hindi question fields empty.<br>2. Click Submit. | Alert prompts the user to provide at least one question and one answer; submission stops. |
| 125 | Prompt before submitting single-language content | Only English question/answer provided. | 1. Fill in English fields and leave Hindi blank.<br>2. Submit the form.<br>3. Respond to confirmation dialog. | A confirmation prompt appears warning about missing translations; declining aborts submission. |
| 126 | Display success modal after creation | All validation satisfied. | 1. Submit the form with required content.<br>2. Wait for API success. | Success modal opens showing follow-up actions; closing it resets the form. |
| 127 | Handle API failure gracefully | Backend returns an error response. | 1. Submit form while forcing an API failure.<br>2. Observe modal response. | Failure modal opens, informing the user that creation failed; form values remain for correction. |

### Histories.tsx
| # | Scenario | Preconditions | Steps | Expected Result |
|---|----------|---------------|-------|-----------------|
| 128 | Default tab selection | Component rendered without `currentTab` prop. | 1. Mount the Histories component with a ticket ID only. | The Status History tab renders first by default. |
| 129 | Switch to Assignment History tab | Same as Scenario 128. | 1. Click the Assignment History tab header. | Assignment history content replaces the status history view. |
| 130 | Honor controlled tab state | Component receives `currentTab="assignment"`. | 1. Render Histories with `currentTab` prop set.<br>2. Observe initial view. | Assignment History tab is active on mount, reflecting the controlled prop. |
| 131 | Emit tab change callback | Parent supplies `onTabChange`. | 1. Click a non-active tab.<br>2. Inspect callback invocation. | `onTabChange` fires with the newly selected tab key. |

### KnowledgeBase.tsx
| # | Scenario | Preconditions | Steps | Expected Result |
|---|----------|---------------|-------|-----------------|
| 132 | Initialize Filegator session successfully | Filegator service responds with success. | 1. Navigate to Knowledge Base page. | Iframe `src` updates to `http://localhost:8080` once the session promise resolves. |
| 133 | Fallback to default URL on session failure | Filegator session request fails. | 1. Force the service to reject.<br>2. Load the page. | Component still assigns `http://localhost:8080` as iframe source despite failure. |
| 134 | Maintain iframe sizing | Any session outcome. | 1. Resize the viewport.<br>2. Observe iframe container. | Iframe retains full width and 88vh height to maximize available viewport space. |
| 135 | Restrict content to embed only | Any session outcome. | 1. Inspect DOM structure. | Only the iframe renders (Title component intentionally commented out), ensuring no additional navigation is presented. |

### Login.tsx
| # | Scenario | Preconditions | Steps | Expected Result |
|---|----------|---------------|-------|-----------------|
| 136 | Cycle through login themes | Portal selected and login screen visible. | 1. Use the theme toggle control (if exposed) or trigger theme change event. | The layout cycles between three predefined themes, each updating heading styles and form layout. |
| 137 | Enforce portal selection before login | Portal chooser visible. | 1. Attempt to submit credentials before selecting a portal. | Submission is prevented and the user is prompted to pick either Requestor or Helpdesk. |
| 138 | Handle JWT bypass toggle in dev mode | Dev mode enabled via context. | 1. Toggle the JWT bypass switch.<br>2. Perform a login. | Token storage is skipped when bypass is active; decoded auth details fall back to response payload. |
| 139 | Populate user profile after login | Valid credentials provided. | 1. Log in successfully.<br>2. Inspect local storage/session storage utilities. | `setUserDetails` stores normalized user info including role IDs, contact details, and allowed status actions. |

### MyTickets.tsx
| # | Scenario | Preconditions | Steps | Expected Result |
|---|----------|---------------|-------|-----------------|
| 140 | Apply requestor override for requestor role | Logged-in user has role ID `5`. | 1. Navigate to My Tickets list.<br>2. Inspect network request payload. | API request includes `requestorId` equal to the current user ID, limiting results to tickets created by the user. |
| 141 | Use username fallback when userId missing | User profile lacks `userId` but has `username`. | 1. Trigger the My Tickets search. | `createdBy` parameter uses the username fallback to scope results. |
| 142 | Filter out non-applicable statuses for level 4 | User role list includes `4`. | 1. Load My Tickets list.<br>2. Compare returned statuses. | Tickets with statuses other than `1` or `2` are removed client-side for role 4 users. |
| 143 | Show full list for non-restricted roles | User roles exclude `4` and `9`. | 1. Load My Tickets. | No additional client-side filtering is applied; tickets remain as returned by the API. |

### MyWorkload.tsx
| # | Scenario | Preconditions | Steps | Expected Result |
|---|----------|---------------|-------|-----------------|
| 144 | Scope workload to assigned username | Logged-in user has a username. | 1. Navigate to My Workload.<br>2. Inspect outgoing API query. | `assignedTo` parameter equals the current username, limiting results to tickets assigned to the user. |
| 145 | Apply team-lead status filter | User roles include `4` or `TEAM_LEAD`. | 1. View My Workload results.<br>2. Inspect statuses returned. | Only tickets in `OPEN`/`ASSIGNED` (status IDs `1` or `2`) remain after client-side filtering. |
| 146 | Apply escalation role filter | User roles include `9`. | 1. View My Workload results. | Tickets are filtered to statuses `6`/`ESCALATED` only. |
| 147 | Preserve navigation to ticket details | Any role. | 1. Click a row in My Workload. | Router navigates to `/tickets/{id}` matching the clicked ticket. |

### RaiseTicket.tsx
| # | Scenario | Preconditions | Steps | Expected Result |
|---|----------|---------------|-------|-----------------|
| 148 | Toggle dev-mode autofill controls | Dev mode enabled. | 1. Click the formatColorFill icon in Ticket Details section. | Category, subcategory, priority, subject, and description fields populate with sample values for quick testing. |
| 149 | Prevent linking when ticket marked as master | Checkbox `isMaster` selected. | 1. Check the "Mark as master" control.<br>2. Attempt to open the Link to Master modal. | The link button becomes disabled and the informational banner indicates the ticket cannot be linked. |
| 150 | Upload attachments after ticket creation | Form filled with required fields and attachments added. | 1. Submit the ticket.<br>2. Wait for ticket ID generation.<br>3. Observe network calls. | Ticket is created first; attachments upload in a subsequent call tied to the generated ticket ID. |
| 151 | Reset form after closing success modal | Ticket submitted successfully. | 1. Close the success modal using the default button.<br>2. Inspect form fields. | All form controls reset to initial values and attachment state clears. |

### RoleDetails.tsx
| # | Scenario | Preconditions | Steps | Expected Result |
|---|----------|---------------|-------|-----------------|
| 152 | Rename role inline | Role details loaded; user has edit permission. | 1. Click the edit icon beside the role title.<br>2. Enter a new name and confirm. | `renameRole` endpoint is called, success toast displays, and navigation updates to the new role route. |
| 153 | Modify permissions using tree component | Role permissions loaded. | 1. Adjust permission nodes within the tree.<br>2. Click Save. | `updateRolePermission` and `updateRole` execute, then permission tree refreshes with persisted values. |
| 154 | Cancel permission edits before save | Permissions modified but not yet saved. | 1. Click Cancel under the permission tree. | Pending modifications are discarded and the tree reverts to last saved state. |
| 155 | Edit JSON structure in master role | Dev mode active and role name "Master". | 1. Click the JSON chip.<br>2. Submit changes via JSON modal. | Permission structure updates immediately and Save button persists the edited JSON. |

### RoleMaster.tsx
| # | Scenario | Preconditions | Steps | Expected Result |
|---|----------|---------------|-------|-----------------|
| 156 | Switch between table and grid layouts | Roles data loaded. | 1. Use the ViewToggle control to switch views. | Layout switches between table and grid; the last selection persists while navigating within the page. |
| 157 | Create role workflow | Permissions metadata fetched. | 1. Click "Create Role".<br>2. Fill required fields in the embedded CreateRole form.<br>3. Submit. | Role is created, permissions cache reloads, and the roles table refreshes with the new entry. |
| 158 | Delete single role from table | Table view active. | 1. Click the delete icon in a role row.<br>2. Confirm prompt. | Role is removed and table refreshes to reflect deletion. |
| 159 | Bulk delete selected roles | Multiple roles selected in table view. | 1. Check the selection boxes for several roles.<br>2. Click "Delete Selected" and confirm. | `deleteRoles` service removes the selected roles and selection state resets. |

### RootCauseAnalysis.tsx
| # | Scenario | Preconditions | Steps | Expected Result |
|---|----------|---------------|-------|-----------------|
| 160 | Normalize severity labels | RCA tickets returned with varying severity formats. | 1. Load the Root Cause Analysis list. | Severity column displays normalized labels (`Critical`, `High`, `Medium`, etc.) regardless of raw value casing. |
| 161 | Filter tickets by category and subcategory | Categories and subcategories available. | 1. Choose a Category from the dropdown.<br>2. Select a Sub Category.<br>3. Observe list refresh. | Tickets update to only those matching the selected filters; subcategory control resets when category changes. |
| 162 | Refresh single ticket from table | List loaded with at least one ticket. | 1. Use the per-row refresh action. | Refresh icon triggers data reload for the targeted ticket; the `refreshingTicketId` indicator activates during the call. |
| 163 | Submit RCA update via modal | Ticket row exposes RCA action. | 1. Click the RCA button.<br>2. Fill modal inputs and submit.<br>3. Close modal. | Modal closes and the table refreshes, reflecting the new RCA status. |

### TicketDetails.tsx
| # | Scenario | Preconditions | Steps | Expected Result |
|---|----------|---------------|-------|-----------------|
| 164 | Toggle history sidebar visibility | Ticket details loaded with history panel closed. | 1. Click the control to open the history sidebar.<br>2. Inspect layout. | History sidebar slides into view at fixed width and main ticket view resizes accordingly. |
| 165 | Persist ticket view when sidebar open | Scenario 164 completed. | 1. Navigate within the ticket view (e.g., change sub-tab). | Ticket view remains visible and responsive while sidebar is open. |
| 166 | Handle missing ticketId gracefully | Route accessed without `ticketId` parameter. | 1. Navigate to `/tickets/` (no ID). | Component returns `null`, resulting in no render and preventing downstream errors. |
| 167 | Render ticket view for provided ID | Valid ticket ID present in URL. | 1. Visit `/tickets/{id}`.<br>2. Observe loaded components. | `TicketView` receives the ID prop and history sidebar binds to the same ID, ensuring synchronized content. |
