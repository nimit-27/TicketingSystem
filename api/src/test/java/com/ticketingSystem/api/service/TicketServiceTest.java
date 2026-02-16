package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.TicketDto;
import com.ticketingSystem.api.enums.RecommendedSeverityStatus;
import com.ticketingSystem.api.enums.TicketStatus;
import com.ticketingSystem.api.exception.InvalidRequestException;
import com.ticketingSystem.api.models.Status;
import com.ticketingSystem.api.models.StatusHistory;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.models.RecommendedSeverityFlow;
import com.ticketingSystem.api.models.Role;
import com.ticketingSystem.api.repository.*;
import com.ticketingSystem.api.typesense.TypesenseClient;
import com.ticketingSystem.api.models.User;
import com.ticketingSystem.notification.enums.ChannelType;
import com.ticketingSystem.notification.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDateTime;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import java.util.Optional;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class TicketServiceTest {

    @Mock
    private TypesenseClient typesenseClient;
    @Mock
    private TicketRepository ticketRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private RequesterUserRepository requesterUserRepository;
    @Mock
    private TicketCommentRepository commentRepository;
    @Mock
    private AssignmentHistoryService assignmentHistoryService;
    @Mock
    private StatusHistoryService statusHistoryService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private TicketStatusWorkflowService workflowService;
    @Mock
    private StatusMasterRepository statusMasterRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private SubCategoryRepository subCategoryRepository;
    @Mock
    private PriorityRepository priorityRepository;
    @Mock
    private UploadedFileRepository uploadedFileRepository;
    @Mock
    private TicketSlaService ticketSlaService;
    @Mock
    private RecommendedSeverityFlowRepository recommendedSeverityFlowRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private StakeholderRepository stakeholderRepository;
    @Mock
    private TicketIdGenerator ticketIdGenerator;

    @InjectMocks
    private TicketService ticketService;

    @Test
    void addTicket_withRemarkLongerThan255_throwsInvalidRequestException() {
        Ticket ticket = new Ticket();
        ticket.setRemark("x".repeat(256));

        assertThatThrownBy(() -> ticketService.addTicket(ticket))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessage("Remark must be 255 characters or fewer.");

        verifyNoInteractions(ticketRepository);
    }

    @Test
    void searchTickets_withAssignedToUserId_resolvesUsernameAndQueriesBothIdentifiers() {
        User assignee = new User();
        assignee.setUserId("agent-1");
        assignee.setUsername("agentUser");

        when(userRepository.findById("agent-1")).thenReturn(Optional.of(assignee));
        when(ticketRepository.searchTickets(
                anyString(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any()
        )).thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 10), 0));

        ticketService.searchTickets(
                "",
                null,
                null,
                "agent-1",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                PageRequest.of(0, 10)
        );

        verify(ticketRepository).searchTickets(
                anyString(),
                any(),
                any(),
                eq("agent-1"),
                eq("agentUser"),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any()
        );
    }

    @Test
    void searchTicketsList_withAssignedToUsername_resolvesUserIdAndQueriesBothIdentifiers() {
        User assignee = new User();
        assignee.setUserId("agent-1");
        assignee.setUsername("agentUser");

        when(userRepository.findById("agentUser")).thenReturn(Optional.empty());
        when(userRepository.findByUsername("agentUser")).thenReturn(Optional.of(assignee));
        when(ticketRepository.searchTicketsList(
                anyString(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any()
        )).thenReturn(List.of());

        ticketService.searchTicketsList(
                "",
                null,
                null,
                "agentUser",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );

        verify(ticketRepository).searchTicketsList(
                anyString(),
                any(),
                any(),
                eq("agentUser"),
                eq("agent-1"),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any()
        );
    }

    @Test
    void updateTicket_statusChangeWithRemarkOnUnassignedTicket_doesNotAddAssignmentHistory() {
        String ticketId = "T-1";
        Ticket existing = buildExistingTicket(ticketId, null);
        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(existing));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        prepareStatusTransitionMocks();

        when(statusHistoryService.addHistory(eq(ticketId), anyString(), any(), any(), anyBoolean(), any()))
                .thenReturn(null);
        when(recommendedSeverityFlowRepository.save(any(RecommendedSeverityFlow.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Ticket update = buildUpdateRequest();

        ticketService.updateTicket(ticketId, update);

        verify(assignmentHistoryService, never()).addHistory(anyString(), anyString(), any(), any(), any());
    }

    @Test
    void updateTicket_statusChangeWithRemarkOnAssignedTicket_doesNotAddAssignmentHistory() {
        String ticketId = "T-2";
        Ticket existing = buildExistingTicket(ticketId, "agent1");
        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(existing));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        prepareStatusTransitionMocks();

        when(statusHistoryService.addHistory(eq(ticketId), anyString(), any(), any(), anyBoolean(), any()))
                .thenReturn(null);
        when(recommendedSeverityFlowRepository.save(any(RecommendedSeverityFlow.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Ticket update = buildUpdateRequest();

        ticketService.updateTicket(ticketId, update);

        verify(assignmentHistoryService, never()).addHistory(anyString(), anyString(), any(), any(), any());
    }

    @Test
    void updateTicket_statusChange_sendsNotificationToRequestor() throws Exception {
        String ticketId = "T-STATUS";
        Ticket existing = buildExistingTicket(ticketId, "agent1");

        User requestor = new User();
        requestor.setUserId("requestor-1");
        requestor.setUsername("requestorUser");
        requestor.setName("Requester Name");
        existing.setUser(requestor);
        existing.setUserId(requestor.getUserId());
        existing.setRequestorName("Requester Name");
        existing.setRequestorEmailId("requestor@ticketingSystem.com");

        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(existing));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Status resolvedStatus = new Status();
        resolvedStatus.setStatusId("RESOLVED_ID");
        resolvedStatus.setStatusCode(TicketStatus.RESOLVED.name());
        resolvedStatus.setStatusName("Resolved");

        when(workflowService.getStatusIdByCode(TicketStatus.RESOLVED.name())).thenReturn("RESOLVED_ID");
        when(statusMasterRepository.findById("RESOLVED_ID")).thenReturn(Optional.of(resolvedStatus));
        when(workflowService.getSlaFlagByStatusId("RESOLVED_ID")).thenReturn(true);

        when(statusHistoryService.addHistory(eq(ticketId), anyString(), any(), any(), anyBoolean(), any()))
                .thenReturn(new StatusHistory());

        Ticket update = new Ticket();
        update.setTicketStatus(TicketStatus.RESOLVED);
        update.setUpdatedBy("agent2");
        update.setRemark("Resolved now");

        ticketService.updateTicket(ticketId, update);

        verify(notificationService).sendNotification(
                eq(ChannelType.IN_APP),
                eq("TICKET_STATUS_UPDATE"),
                argThat(map ->
                        ticketId.equals(map.get("ticketId"))
                                && ticketId.equals(map.get("ticketNumber"))
                                && "Resolved".equals(map.get("newStatus"))
                                && map.containsKey("oldStatus")
                                && "agent2".equals(map.get("actorName"))
                                && "Requester Name".equals(map.get("recipientName"))
                ),
                eq("requestor-1")
        );
    }

    @Test
    void addTicket_withAssignee_sendsNotificationsToAssignee() throws Exception {
        Ticket ticket = new Ticket();
        ticket.setId("T-100");
        ticket.setUserId("requestor-1");
        ticket.setAssignedTo("agent-1");
        ticket.setAssignedBy("supervisor");
        ticket.setLevelId("L1");
        ticket.setUpdatedBy("supervisor");
        ticket.setReportedDate(LocalDateTime.now());

        User requestor = new User();
        requestor.setUserId("requestor-1");
        requestor.setUsername("requestorUser");
        requestor.setName("Requester Name");

        User assignee = new User();
        assignee.setUserId("agent-1");
        assignee.setUsername("agentUser");
        assignee.setName("Agent Jane");

        when(userRepository.findById("requestor-1")).thenReturn(Optional.of(requestor));
        when(userRepository.findById("agent-1")).thenReturn(Optional.of(assignee));

        Status openStatus = new Status();
        openStatus.setStatusId("OPEN");
        openStatus.setStatusCode(TicketStatus.OPEN.name());
        when(workflowService.getStatusIdByCode(TicketStatus.OPEN.name())).thenReturn("OPEN");
        when(statusMasterRepository.findById("OPEN")).thenReturn(Optional.of(openStatus));
        when(workflowService.getSlaFlagByStatusId("OPEN")).thenReturn(true);

        Status assignedStatus = new Status();
        assignedStatus.setStatusId("ASSIGNED");
        assignedStatus.setStatusCode(TicketStatus.ASSIGNED.name());
        when(workflowService.getStatusIdByCode(TicketStatus.ASSIGNED.name())).thenReturn("ASSIGNED");
        when(statusMasterRepository.findById("ASSIGNED")).thenReturn(Optional.of(assignedStatus));
        when(workflowService.getSlaFlagByStatusId("ASSIGNED")).thenReturn(true);

        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(statusHistoryService.addHistory(anyString(), anyString(), any(), any(), anyBoolean(), any()))
                .thenReturn(new StatusHistory());
        when(assignmentHistoryService.addHistory(anyString(), anyString(), anyString(), anyString(), any()))
                .thenReturn(null);
        when(ticketSlaService.calculateAndSaveByCalendar(any(Ticket.class), anyList())).thenReturn(null);

        ticketService.addTicket(ticket);

        ArgumentCaptor<String> codeCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Map<String, Object>> dataCaptor = ArgumentCaptor.forClass(Map.class);
        ArgumentCaptor<String> recipientCaptor = ArgumentCaptor.forClass(String.class);

        verify(notificationService, times(2)).sendNotification(
                eq(ChannelType.IN_APP),
                codeCaptor.capture(),
                dataCaptor.capture(),
                recipientCaptor.capture()
        );

        List<String> codes = codeCaptor.getAllValues();
        List<Map<String, Object>> payloads = dataCaptor.getAllValues();
        List<String> recipients = recipientCaptor.getAllValues();

        assertThat(codes).containsExactlyInAnyOrder("TICKET_ASSIGNED", "TICKET_UPDATED");
        int assignedIndex = codes.indexOf("TICKET_ASSIGNED");
        assertThat(assignedIndex).isGreaterThanOrEqualTo(0);
        assertThat(recipients.get(assignedIndex)).isEqualTo("agent-1");
        assertThat(payloads.get(assignedIndex))
                .containsEntry("ticketId", "T-100")
                .containsEntry("assigneeName", "Agent Jane")
                .containsEntry("assignedBy", "supervisor");

        int requestorUpdateIndex = codes.indexOf("TICKET_UPDATED");
        assertThat(requestorUpdateIndex).isGreaterThanOrEqualTo(0);
        assertThat(recipients.get(requestorUpdateIndex)).isEqualTo("requestor-1");
        assertThat(payloads.get(requestorUpdateIndex))
                .containsEntry("ticketId", "T-100")
                .containsEntry("ticketNumber", "T-100")
                .containsEntry("updateType", "ASSIGNMENT_UPDATED")
                .containsEntry("currentAssignee", "Agent Jane");
    }

    @Test
    void updateTicket_assignmentChange_sendsAssignmentNotification() throws Exception {
        String ticketId = "T-3";
        Ticket existing = buildExistingTicket(ticketId, "agent-old");
        existing.setUpdatedBy("existingUser");
        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(existing));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        when(assignmentHistoryService.addHistory(anyString(), anyString(), anyString(), anyString(), any()))
                .thenReturn(null);
        when(statusHistoryService.addHistory(anyString(), anyString(), any(), any(), anyBoolean(), any()))
                .thenReturn(new StatusHistory());

        when(workflowService.getStatusIdByCode(TicketStatus.ASSIGNED.name())).thenReturn("ASSIGNED");
        Status assignedStatus = new Status();
        assignedStatus.setStatusId("ASSIGNED");
        assignedStatus.setStatusCode(TicketStatus.ASSIGNED.name());
        when(statusMasterRepository.findById("ASSIGNED")).thenReturn(Optional.of(assignedStatus));
        when(workflowService.getSlaFlagByStatusId("ASSIGNED")).thenReturn(true);

        User newAssignee = new User();
        newAssignee.setUserId("agent-new");
        newAssignee.setUsername("agentNew");
        newAssignee.setName("Agent New");
        when(userRepository.findById("agent-new")).thenReturn(Optional.of(newAssignee));

        User requestor = new User();
        requestor.setUserId("requestor-1");
        requestor.setUsername("requestorUser");
        requestor.setName("Requester Name");
        existing.setUserId(requestor.getUserId());
        existing.setUser(requestor);
        existing.setRequestorName("Requester Name");
        existing.setRequestorEmailId("requestor@ticketingSystem.com");
        when(userRepository.findById("requestor-1")).thenReturn(Optional.of(requestor));

        Ticket update = new Ticket();
        update.setAssignedTo("agent-new");
        update.setAssignedBy("manager1");
        update.setUpdatedBy("manager1");
        update.setLevelId("L2");

        ticketService.updateTicket(ticketId, update);

        ArgumentCaptor<String> codeCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Map<String, Object>> payloadCaptor = ArgumentCaptor.forClass(Map.class);
        ArgumentCaptor<String> recipientCaptor = ArgumentCaptor.forClass(String.class);

        verify(notificationService, times(2)).sendNotification(
                eq(ChannelType.IN_APP),
                codeCaptor.capture(),
                payloadCaptor.capture(),
                recipientCaptor.capture()
        );

        List<String> codes = codeCaptor.getAllValues();
        List<Map<String, Object>> payloads = payloadCaptor.getAllValues();
        List<String> recipients = recipientCaptor.getAllValues();

        int assigneeIndex = codes.indexOf("TICKET_ASSIGNED");
        assertThat(assigneeIndex).isGreaterThanOrEqualTo(0);
        assertThat(recipients.get(assigneeIndex)).isEqualTo("agent-new");
        assertThat(payloads.get(assigneeIndex))
                .containsEntry("ticketId", "T-3")
                .containsEntry("assigneeName", "Agent New")
                .containsEntry("assignedBy", "manager1");

        int requestorIndex = codes.indexOf("TICKET_UPDATED");
        assertThat(requestorIndex).isGreaterThanOrEqualTo(0);
        assertThat(recipients.get(requestorIndex)).isEqualTo("requestor-1");
        assertThat(payloads.get(requestorIndex))
                .containsEntry("ticketId", "T-3")
                .containsEntry("updateType", "ASSIGNMENT_UPDATED")
                .containsEntry("currentAssignee", "Agent New")
                .containsEntry("actorName", "manager1");
    }

    @Test
    void updateTicket_recommendedSeverityApprovedByItManager_notifiesTeamLeads() throws Exception {
        String ticketId = "T-SEV";
        Ticket existing = buildExistingTicket(ticketId, null);
        existing.setSeverity("LOW");
        existing.setRecommendedSeverity("HIGH");
        existing.setSeverityRecommendedBy("teamLead1");

        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(existing));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Ticket update = new Ticket();
        update.setSeverity("HIGH");
        update.setUpdatedBy("itmanager1");

        RecommendedSeverityFlow flow = new RecommendedSeverityFlow();
        flow.setRecommendedSeverityStatus(RecommendedSeverityStatus.PENDING);
        when(recommendedSeverityFlowRepository
                .findTopByTicket_IdAndRecommendedSeverityAndRecommendedSeverityStatusOrderByIdDesc(
                        ticketId,
                        "HIGH",
                        RecommendedSeverityStatus.PENDING))
                .thenReturn(Optional.of(flow));
        when(recommendedSeverityFlowRepository.save(any(RecommendedSeverityFlow.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Role itManagerRole = new Role();
        itManagerRole.setRoleId(9);
        itManagerRole.setRole("IT Manager");
        when(roleRepository.findByRoleIgnoreCaseAndIsDeletedFalse("IT Manager"))
                .thenReturn(Optional.of(itManagerRole));

        Role teamLeadRole = new Role();
        teamLeadRole.setRoleId(7);
        teamLeadRole.setRole("Team Lead");
        when(roleRepository.findByRoleIgnoreCaseAndIsDeletedFalse("Team Lead"))
                .thenReturn(Optional.of(teamLeadRole));

        when(userRepository.findById("itmanager1")).thenReturn(Optional.empty());
        User approver = new User();
        approver.setUserId("IM-1");
        approver.setUsername("itmanager1");
        approver.setName("IT Manager Jane");
        approver.setRoles("9");
        when(userRepository.findByUsername("itmanager1")).thenReturn(Optional.of(approver));

        User teamLead = new User();
        teamLead.setUserId("TL-1");
        teamLead.setUsername("teamLeadUser");
        teamLead.setName("Team Lead Tom");
        teamLead.setRoles("7");
        when(userRepository.findAll()).thenReturn(List.of(teamLead));

        ticketService.updateTicket(ticketId, update);

        ArgumentCaptor<Map<String, Object>> dataCaptor = ArgumentCaptor.forClass(Map.class);
        ArgumentCaptor<String> recipientCaptor = ArgumentCaptor.forClass(String.class);

        verify(notificationService).sendNotification(
                eq(ChannelType.IN_APP),
                eq("TICKET_UPDATED"),
                dataCaptor.capture(),
                recipientCaptor.capture()
        );

        Map<String, Object> payload = dataCaptor.getValue();
        assertThat(recipientCaptor.getValue()).isEqualTo("TL-1");
        assertThat(payload)
                .containsEntry("ticketId", ticketId)
                .containsEntry("ticketNumber", ticketId)
                .containsEntry("updateType", "RECOMMENDED_SEVERITY_APPROVED")
                .containsEntry("recommendedSeverity", "HIGH")
                .containsEntry("actorName", "IT Manager Jane")
                .containsEntry("recipientName", "Team Lead Tom");
        assertThat(payload.get("updateMessage").toString())
                .contains("Recommended severity")
                .contains("HIGH")
                .contains("IT Manager Jane");
    }

    @Test
    void updateTicket_recommendedSeverityApprovedByNonItManager_doesNotNotifyTeamLeads() throws Exception {
        String ticketId = "T-SEV-NEG";
        Ticket existing = buildExistingTicket(ticketId, null);
        existing.setSeverity("LOW");
        existing.setRecommendedSeverity("HIGH");
        existing.setSeverityRecommendedBy("teamLead1");

        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(existing));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Ticket update = new Ticket();
        update.setSeverity("HIGH");
        update.setUpdatedBy("teamleadUser");

        RecommendedSeverityFlow flow = new RecommendedSeverityFlow();
        flow.setRecommendedSeverityStatus(RecommendedSeverityStatus.PENDING);
        when(recommendedSeverityFlowRepository
                .findTopByTicket_IdAndRecommendedSeverityAndRecommendedSeverityStatusOrderByIdDesc(
                        ticketId,
                        "HIGH",
                        RecommendedSeverityStatus.PENDING))
                .thenReturn(Optional.of(flow));
        when(recommendedSeverityFlowRepository.save(any(RecommendedSeverityFlow.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Role itManagerRole = new Role();
        itManagerRole.setRoleId(9);
        itManagerRole.setRole("IT Manager");
        when(roleRepository.findByRoleIgnoreCaseAndIsDeletedFalse("IT Manager"))
                .thenReturn(Optional.of(itManagerRole));

        Role teamLeadRole = new Role();
        teamLeadRole.setRoleId(7);
        teamLeadRole.setRole("Team Lead");
        when(roleRepository.findByRoleIgnoreCaseAndIsDeletedFalse("Team Lead"))
                .thenReturn(Optional.of(teamLeadRole));

        when(userRepository.findById("teamleadUser")).thenReturn(Optional.empty());
        User approver = new User();
        approver.setUserId("TL-APPROVER");
        approver.setUsername("teamleadUser");
        approver.setName("Team Lead Lisa");
        approver.setRoles("7");
        when(userRepository.findByUsername("teamleadUser")).thenReturn(Optional.of(approver));

        when(userRepository.findAll()).thenReturn(List.of(approver));

        ticketService.updateTicket(ticketId, update);

        verify(notificationService, never()).sendNotification(
                eq(ChannelType.IN_APP),
                eq("TICKET_UPDATED"),
                any(Map.class),
                anyString()
        );
    }


    @Test
    void updateTicket_reopenClearsAssignment_addsUnassignmentHistory() {
        String ticketId = "T-REOPEN";
        Ticket existing = buildExistingTicket(ticketId, "agent1");
        existing.setAssignedToLevel("L1");

        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(existing));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Status reopenedStatus = new Status();
        reopenedStatus.setStatusId("REOPENED_ID");
        reopenedStatus.setStatusCode(TicketStatus.REOPENED.name());
        when(workflowService.getStatusIdByCode(TicketStatus.REOPENED.name())).thenReturn("REOPENED_ID");
        when(workflowService.getStatusCodeById("REOPENED_ID")).thenReturn(TicketStatus.REOPENED.name());
        when(statusMasterRepository.findById("REOPENED_ID")).thenReturn(Optional.of(reopenedStatus));
        when(workflowService.getSlaFlagByStatusId("REOPENED_ID")).thenReturn(Boolean.TRUE);

        Ticket update = new Ticket();
        update.setTicketStatus(TicketStatus.REOPENED);
        update.setUpdatedBy("agent2");

        ticketService.updateTicket(ticketId, update);

        verify(assignmentHistoryService).addHistory(
                eq(ticketId),
                eq("agent2"),
                isNull(),
                isNull(),
                eq("Unassigned on reopen")
        );
    }

    @Test
    void markAsMaster_setsMasterFlagsAndClearsMasterId() {
        String ticketId = "T-5";
        Ticket existing = buildExistingTicket(ticketId, null);
        existing.setMaster(false);
        existing.setMasterId("OLD-MASTER");

        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(existing));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TicketDto result = ticketService.markAsMaster(ticketId);

        assertThat(result.isMaster()).isTrue();
        assertThat(result.getMasterId()).isNull();
        verify(ticketRepository).save(existing);
    }

    private Ticket buildExistingTicket(String ticketId, String assignee) {
        Ticket ticket = new Ticket();
        ticket.setId(ticketId);
        ticket.setTicketStatus(TicketStatus.OPEN);
        ticket.setUpdatedBy("existingUser");
        ticket.setAssignedTo(assignee);
        ticket.setLevelId("L1");
        ticket.setLastModified(LocalDateTime.now());
        Status status = new Status();
        status.setStatusId("OPEN_ID");
        status.setStatusCode(TicketStatus.OPEN.name());
        ticket.setStatus(status);
        return ticket;
    }

    private Ticket buildUpdateRequest() {
        Ticket update = new Ticket();
        update.setTicketStatus(TicketStatus.PENDING_WITH_REQUESTER);
        update.setRemark("Need more info");
        update.setUpdatedBy("agent2");
        update.setRecommendedSeverity("HIGH");
        update.setSeverityRecommendedBy("agent2");
        return update;
    }

    private void prepareStatusTransitionMocks() {
        Status pending = new Status();
        pending.setStatusId("PWR_ID");
        pending.setStatusCode(TicketStatus.PENDING_WITH_REQUESTER.name());
        when(workflowService.getStatusIdByCode(TicketStatus.PENDING_WITH_REQUESTER.name())).thenReturn("PWR_ID");
        when(statusMasterRepository.findById("PWR_ID")).thenReturn(Optional.of(pending));
        when(workflowService.getSlaFlagByStatusId("PWR_ID")).thenReturn(Boolean.TRUE);
    }
}
