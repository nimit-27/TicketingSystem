# Page-wise Manual Test Cases

The following manual test scenarios are organized by primary application pages to ensure comprehensive coverage across the ticketing platform. Dev mode behaviors are explicitly excluded as requested.

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

