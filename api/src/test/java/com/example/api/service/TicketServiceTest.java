package com.example.api.service;

import com.example.api.enums.TicketStatus;
import com.example.api.models.Status;
import com.example.api.models.Ticket;
import com.example.api.models.RecommendedSeverityFlow;
import com.example.api.repository.*;
import com.example.api.typesense.TypesenseClient;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

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
