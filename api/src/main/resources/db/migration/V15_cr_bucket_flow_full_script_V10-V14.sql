CREATE TABLE IF NOT EXISTS cr_status_master (
    cr_status_id VARCHAR(255) PRIMARY KEY,
    cr_status_name VARCHAR(255) NOT NULL,
    cr_status_code VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(1000),
    color VARCHAR(100),
    created_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL DEFAULT 'SYSTEM',
    updated_by VARCHAR(255) NOT NULL DEFAULT 'SYSTEM'
);

CREATE TABLE IF NOT EXISTS ticket_cr_sequences (
    id VARCHAR(20) PRIMARY KEY,
    sequence_date DATE NOT NULL UNIQUE,
    `last_value` BIGINT NOT NULL,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ticket_cr (
    ticket_cr_id VARCHAR(20) PRIMARY KEY,
    ticket_id VARCHAR(255) NOT NULL,
    status_id INT NOT NULL,
    cr_status_id VARCHAR(10) NOT NULL,
    subject VARCHAR(500),
    description TEXT,
    requested_by VARCHAR(255),
    assigned_to VARCHAR(255),
    assigned_by VARCHAR(255),
    remarks TEXT,
    created_date TIMESTAMP NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    updated_on TIMESTAMP NOT NULL,
    updated_by VARCHAR(255),
    CONSTRAINT fk_ticket_cr_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id),
    CONSTRAINT fk_ticket_cr_status FOREIGN KEY (status_id) REFERENCES status_master(status_id),
    CONSTRAINT fk_ticket_cr_cr_status FOREIGN KEY (cr_status_id) REFERENCES cr_status_master(cr_status_id)
);

CREATE INDEX idx_ticket_cr_ticket_id ON ticket_cr(ticket_id);
CREATE INDEX idx_ticket_cr_status_id ON ticket_cr(status_id);
CREATE INDEX idx_ticket_cr_cr_status_id ON ticket_cr(cr_status_id);

INSERT INTO cr_status_master (cr_status_id, cr_status_name, cr_status_code, description, color, created_by, updated_by)
VALUES
('CRS-1', 'CR Pending for approval', 'CR_PENDING_APPROVAL', 'Initial state when CR is submitted for approval', '#FFA726', 'SYSTEM', 'SYSTEM'),
('CRS-2', 'CR Approved', 'CR_APPROVED', 'CR has been approved', '#66BB6A', 'SYSTEM', 'SYSTEM'),
('CRS-3', 'CR Rejected', 'CR_REJECTED', 'CR has been rejected', '#EF5350', 'SYSTEM', 'SYSTEM')
ON DUPLICATE KEY UPDATE
cr_status_name = VALUES(cr_status_name),
cr_status_code = VALUES(cr_status_code),
description = VALUES(description),
color = VALUES(color),
updated_on = CURRENT_TIMESTAMP,
updated_by = VALUES(updated_by);

ALTER TABLE tickets
    ADD COLUMN is_assigned_back_from_fci BOOLEAN NOT NULL DEFAULT FALSE;
    
INSERT INTO `ticketing_system`.`status_master` (`status_id`, `status_name`, `label`, `status_code`, `sla_flag`, `description`, `color`) 
VALUES ('12', 'Change Requested', 'Change Requested', 'CHANGE_REQUESTED', '0', 'Ticket has been sent for Change Request approval', '#9C27B0');

INSERT INTO ticket_status_workflow (`TSW_Id`, `TSW_Action`, `TSW_Current_Status`, `TSW_Next_Status`) VALUES ('31', 'Send for CR Approval', '1', '12');
INSERT INTO `ticket_status_workflow` (`TSW_Id`, `TSW_Action`, `TSW_Current_Status`, `TSW_Next_Status`) VALUES ('32', 'Send for CR Approval', '2', '12');

INSERT INTO role_permission_config (`role`, `permissions`, `updated_on`, `created_on`, `updated_by`, `created_by`, `is_deleted`, `allowed_status_action_ids`) 
VALUES ('CR Approver', '{\"pages\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"children\": {\"addQnAButton\": {\"show\": true, \"metadata\": {\"name\": \"Add QnA Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"FAQ\", \"type\": \"page\"}}, \"users\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Users\"}}, \"dashboard\": {\"show\": true, \"children\": {\"keyMetrics\": {\"show\": true, \"children\": {\"lowSeverityCard\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Low Severity Card\"}}, \"highSeverityCard\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"High Severity Card\"}}, \"mediumSeverityCard\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Medium Severity Card\"}}, \"criticalSeverityCard\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Critical Severity Card\"}}, \"totalTicketsRaisedCard\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Total Tickets Raised Card\"}}, \"pendingForAcknowledgementCard\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Pending For Acknowledgement Card\"}}}, \"metadata\": {\"name\": \"Key Metrics\"}}, \"overallTickets\": {\"show\": true, \"metadata\": {\"name\": \"Overall Tickets\"}}, \"slaComplianceGraph\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"SLA Compliance Graph\"}}, \"assignedTicketsCount\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Assigned Tickets Count\"}}, \"ticketsCreatedPerMonth\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Tickets Created Per Month\"}}, \"ticketLifecycleSunburstChart\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Ticket Lifecycle Sunburst Chart\"}}}, \"metadata\": {\"name\": \"Dashboard\"}}, \"myTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": true, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": true, \"children\": {\"columns\": {\"show\": true, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"children\": {\"allowAssignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"allTickets\": {\"show\": false, \"children\": {\"grid\": {\"show\": false, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": false, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": false, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": false, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": false, \"children\": {\"columns\": {\"show\": false, \"children\": {\"email\": {\"show\": false, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": false, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": false, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": false, \"children\": {\"allowAssignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}, \"Allow Assignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"allowAssignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": false, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": false, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": false, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": false, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": false, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": false, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": false, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": false, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": false, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": false, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"All Tickets\", \"type\": \"page\"}}, \"misReports\": {\"show\": false, \"children\": {\"filters\": {\"show\": false, \"children\": {\"zone\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Zone\"}}, \"range\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Range\"}}, \"module\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Module\"}}, \"region\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Region\"}}, \"toDate\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"To Date\"}}, \"assignee\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Assignee\"}}, \"district\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"District\"}}, \"division\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Division\"}}, \"fromDate\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"From Date\"}}, \"interval\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Interval\"}}, \"issueType\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Issue Type\"}}, \"subModule\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Sub Module\"}}}, \"metadata\": {\"name\": \"Filters\"}}, \"reportGenerator\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Report Generator\"}}, \"viewingDataText\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Viewing Data Text\"}}, \"ticketSummaryReport\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Ticket Summary Report\"}}, \"problemManagementReport\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Problem Management Report\"}}, \"customerSatisfactionReport\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Customer Satisfaction Report\"}}, \"ticketResolutionTimeReport\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Ticket Resolution Time Report\"}}}, \"metadata\": {\"name\": \"MIS Reports\"}}, \"myWorkload\": {\"show\": false, \"children\": {\"grid\": {\"show\": false, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": false, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": false, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": false, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": false, \"children\": {\"columns\": {\"show\": false, \"children\": {\"email\": {\"show\": false, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": false, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": false, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": false, \"children\": {\"allowAssignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}, \"Allow Assignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"allowAssignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": false, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": false, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": false, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": false, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": false, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": false, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": false, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": false, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": false, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": false, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Workload\", \"type\": \"page\"}}, \"slaReports\": {\"show\": false, \"children\": {\"filters\": {\"show\": false, \"children\": {\"zone\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Zone\"}}, \"range\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Range\"}}, \"module\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Module\"}}, \"region\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Region\"}}, \"toDate\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"To Date\"}}, \"assignee\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Assignee\"}}, \"breached\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Breached\"}}, \"district\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"District\"}}, \"division\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Division\"}}, \"fromDate\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"From Date\"}}, \"interval\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Interval\"}}, \"issueType\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Issue Type\"}}, \"subModule\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Sub Module\"}}}, \"metadata\": {\"name\": \"Filters\"}}, \"reportGenerator\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Report Generator\"}}, \"slaPerformanceReport\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Sla Performance Report\"}}}, \"metadata\": {\"name\": \"SLA Reports\"}}, \"ticketForm\": {\"show\": true, \"children\": {\"comments\": {\"show\": true, \"children\": {\"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": true, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": true, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": true, \"children\": {\"impact\": {\"show\": false, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": true, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"division\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Division\"}}, \"editMode\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Edit Mode\", \"type\": \"operation\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"severity\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Severity\"}}, \"issueType\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Issue Type\"}}, \"assignedTo\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": true, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": false, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": true, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": false, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": true, \"selectedImpact\": true, \"recommendedSeverity\": true}, \"assignedToLevel\": {\"show\": false, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": false, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": false, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"recommendSeverity\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Recommend Severity\"}}, \"recommendedSeverity\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Recommended Severity\"}}, \"assignFurtherCheckbox\": {\"show\": false, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": false, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": true, \"children\": {\"mode\": {\"show\": true, \"children\": {\"call\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Call\"}}, \"self\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Self\"}}, \"email\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Email\"}}}, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": true, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": true, \"children\": {\"role\": {\"show\": true, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": true, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": true, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": true, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": true, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": true, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": false, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}, \"linkToMasterTicketModal\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"linkToMasterTicketButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}, \"ticketView\": {\"show\": true, \"children\": {\"sla\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Sla\"}}, \"subject\": {\"show\": true, \"children\": {\"allowEdit\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Allow Edit\"}}}, \"metadata\": {\"name\": \"Subject\"}}, \"category\": {\"show\": true, \"children\": {\"allowEdit\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Allow Edit\"}}}, \"metadata\": {\"name\": \"Category\"}}, \"comments\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Comments\"}}, \"division\": {\"show\": true, \"children\": {\"allowEdit\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Allow Edit\"}}}, \"metadata\": {\"name\": \"Division\"}}, \"priority\": {\"show\": true, \"children\": {\"allowEdit\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Allow Edit\"}}}, \"metadata\": {\"name\": \"Priority\"}}, \"severity\": {\"show\": false, \"children\": {\"allowEdit\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Allow Edit\"}}}, \"metadata\": {\"name\": \"Severity\"}}, \"issueType\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Issue Type\"}}, \"description\": {\"show\": true, \"children\": {\"allowEdit\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Allow Edit\"}}}, \"metadata\": {\"name\": \"Description\"}}, \"subcategory\": {\"show\": true, \"children\": {\"allowEdit\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Allow Edit\"}}}, \"metadata\": {\"name\": \"Subcategory\"}}, \"viewRCAButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"View RCA Button\"}}, \"submitRCAButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Submit RCA Button\"}}, \"assignedUserIcon\": {\"show\": false, \"children\": {\"allowAssignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}}, \"metadata\": {\"name\": \"Assigned User Icon\"}}, \"viewEditIconButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"View Edit Icon Button\"}}, \"linkToMasterTicketModal\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"linkToMasterTicketButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket View\"}}, \"UserProfile\": {\"show\": true, \"metadata\": {\"name\": \"UserProfile\", \"type\": \"page\"}}, \"History Sidebar\": {\"show\": true, \"children\": {\"Status History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Tab\"}}, \"Status History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Button\"}}, \"Assignment History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Tab\"}}, \"Assignment History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Button\"}}}, \"metadata\": {\"name\": \"History Sidebar\"}}, \"rootCauseAnalysis\": {\"show\": false, \"children\": {\"ticketsTable\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Tickets Table\"}}}, \"metadata\": {\"name\": \"Root Cause Analysis\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"rca\": {\"show\": false, \"metadata\": {\"name\": \"Root Cause Analysis\", \"type\": \"menu\"}}, \"users\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Users\"}}, \"dashboard\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Dashboard\"}}, \"myTickets\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"menu\"}}, \"allTickets\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"All Tickets\", \"type\": \"menu\"}}, \"misReports\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"MIS Reports\"}}, \"myWorkload\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"My Workload\", \"type\": \"menu\"}}, \"roleMaster\": {\"show\": false, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"slaReports\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"SLA Reports\"}}, \"raiseTickets\": {\"show\": true, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": false, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"changeRequests\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Change Requests\"}}, \"categoriesMaster\": {\"show\": false, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": false, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}', 
NOW(), NOW(), 'SYSTEM', 'SYSTEM', '0', '31|32');

SET SQL_SAFE_UPDATES = 0;
-- Add CR status workflow action mapping column (pipe-separated IDs, Option A)
ALTER TABLE role_permission_config
    ADD COLUMN allowed_cr_status_action_ids VARCHAR(255) DEFAULT NULL
    AFTER allowed_status_action_ids;

-- Set CR workflow action IDs for CR Approver role
-- Replace the sample IDs below with your final CR status workflow IDs.
UPDATE role_permission_config
SET allowed_cr_status_action_ids = '1|2|3'
WHERE role = 'CR Approver'
  AND is_deleted = 0;
CREATE TABLE IF NOT EXISTS ticket_cr_status_workflow (
    crsw_id VARCHAR(20) PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    current_status_id VARCHAR(20) NOT NULL,
    next_status_id VARCHAR(20) NOT NULL,
    created_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_ticket_cr_status_workflow_current_status FOREIGN KEY (current_status_id)
        REFERENCES cr_status_master (cr_status_id),
    CONSTRAINT fk_ticket_cr_status_workflow_next_status FOREIGN KEY (next_status_id)
        REFERENCES cr_status_master (cr_status_id)
);

INSERT INTO ticket_cr_status_workflow
    (crsw_id, action, current_status_id, next_status_id)
VALUES
    ('CRSW-1', 'Reject CR', 'CRS-1', 'CRS-3'),
    ('CRSW-2', 'Approve CR', 'CRS-1', 'CRS-2');

CREATE TABLE IF NOT EXISTS ticket_cr_history_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    table_name VARCHAR(100) NOT NULL DEFAULT 'ticket_cr',
    column_name VARCHAR(100) NOT NULL,
    display_label VARCHAR(255) NOT NULL,
    change_type_code VARCHAR(50) NOT NULL,
    is_trackable BOOLEAN NOT NULL DEFAULT TRUE,
    is_filterable BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_table_column (table_name, column_name)
);

INSERT INTO ticket_cr_history_config (table_name, column_name, display_label, change_type_code, is_trackable, is_filterable, display_order)
VALUES
('ticket_cr', 'subject', 'Subject Updated', 'SUBJECT_CHANGE', TRUE, TRUE, 10),
('ticket_cr', 'description', 'Description Updated', 'DESCRIPTION_CHANGE', TRUE, TRUE, 20),
('ticket_cr', 'status_id', 'Ticket Status Changed', 'TICKET_STATUS_CHANGE', TRUE, TRUE, 30),
('ticket_cr', 'cr_status_id', 'CR Status Changed', 'CR_STATUS_CHANGE', TRUE, TRUE, 40),
('ticket_cr', 'requested_by', 'Requested By Changed', 'REQUESTED_BY_CHANGE', TRUE, TRUE, 50),
('ticket_cr', 'assigned_to', 'Assigned To Changed', 'ASSIGNED_TO_CHANGE', TRUE, TRUE, 60),
('ticket_cr', 'assigned_by', 'Assigned By Changed', 'ASSIGNED_BY_CHANGE', TRUE, TRUE, 70),
('ticket_cr', 'remarks', 'Remarks Updated', 'REMARKS_CHANGE', FALSE, TRUE, 80),
('ticket_cr', 'updated_by', 'Updated By', 'UPDATED_BY', FALSE, TRUE, 90),
('ticket_cr', 'updated_on', 'Updated On', 'UPDATED_ON', FALSE, TRUE, 100),
('ticket_cr', 'created_by', 'Created By', 'CREATED_BY', FALSE, TRUE, 110),
('ticket_cr', 'created_date', 'Created Date', 'CREATED_DATE', FALSE, TRUE, 120)
ON DUPLICATE KEY UPDATE
    display_label = VALUES(display_label),
    change_type_code = VALUES(change_type_code),
    is_trackable = VALUES(is_trackable),
    is_filterable = VALUES(is_filterable),
    display_order = VALUES(display_order),
    updated_on = CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS ticket_cr_history (
    history_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    change_group_id VARCHAR(100) NOT NULL,
    ticket_cr_id VARCHAR(20) NOT NULL,
    ticket_id VARCHAR(255) NOT NULL,
    column_name VARCHAR(100) NOT NULL,
    change_type_code VARCHAR(50) NOT NULL,
    display_label VARCHAR(255) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by VARCHAR(255) NOT NULL,
    changed_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT
);

CREATE INDEX idx_ticket_cr_history_ticket_cr_id ON ticket_cr_history(ticket_cr_id);
CREATE INDEX idx_ticket_cr_history_ticket_id ON ticket_cr_history(ticket_id);
CREATE INDEX idx_ticket_cr_history_change_group_id ON ticket_cr_history(change_group_id);
CREATE INDEX idx_ticket_cr_history_change_type_code ON ticket_cr_history(change_type_code);
CREATE INDEX idx_ticket_cr_history_changed_on ON ticket_cr_history(changed_on);

UPDATE `role_permission_config` SET `allowed_cr_status_action_ids` = 'CRSW-1|CRSW-2' WHERE (`role_id` = '15');

UPDATE `role_permission_config` SET `allowed_status_action_ids` = '1|2|3|4|8|9|10|15|16|17|18|19|20|21|26|27|28|29|31|32' WHERE (`role_id` = '7');