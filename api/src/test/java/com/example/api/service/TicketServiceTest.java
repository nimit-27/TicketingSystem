package com.example.api.service;

import com.example.api.enums.TicketStatus;
import com.example.api.models.Status;
import com.example.api.models.StatusHistory;
import com.example.api.models.Ticket;
import com.example.api.models.RecommendedSeverityFlow;
import com.example.api.repository.*;
import com.example.api.typesense.TypesenseClient;
import com.example.api.models.User;
import com.example.notification.enums.ChannelType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock
    private TypesenseClient typesenseClient;
    @Mock
    private TicketRepository ticketRepository;
    @Mock
    private UserRepository userRepository;
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

    @InjectMocks
    private TicketService ticketService;

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
    void updateTicket_statusChangeWithRemarkOnAssignedTicket_addsAssignmentHistory() {
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

        verify(assignmentHistoryService).addHistory(ticketId, update.getUpdatedBy(), "agent1", "L1", update.getRemark());
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
        existing.setRequestorEmailId("requestor@example.com");

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
        doNothing().when(ticketSlaService).calculateAndSave(any(Ticket.class), anyList());

        ticketService.addTicket(ticket);

        ArgumentCaptor<String> codeCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Map<String, Object>> dataCaptor = ArgumentCaptor.forClass(Map.class);
        ArgumentCaptor<String> recipientCaptor = ArgumentCaptor.forClass(String.class);

        verify(notificationService, times(3)).sendNotification(
                eq(ChannelType.IN_APP),
                codeCaptor.capture(),
                dataCaptor.capture(),
                recipientCaptor.capture()
        );

        List<String> codes = codeCaptor.getAllValues();
        List<Map<String, Object>> payloads = dataCaptor.getAllValues();
        List<String> recipients = recipientCaptor.getAllValues();

        assertThat(codes).containsExactlyInAnyOrder("TICKET_CREATED", "TICKET_ASSIGNED", "TICKET_UPDATED");
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
        existing.setRequestorEmailId("requestor@example.com");
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
