package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.TicketDto;
import com.ticketingSystem.api.dto.StatusTimestampUpdateRequest;
import com.ticketingSystem.api.enums.RecommendedSeverityStatus;
import com.ticketingSystem.api.enums.TicketStatus;
import com.ticketingSystem.api.exception.InvalidRequestException;
import com.ticketingSystem.api.models.Status;
import com.ticketingSystem.api.models.StatusHistory;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.models.TicketHistory;
import com.ticketingSystem.api.models.RecommendedSeverityFlow;
import com.ticketingSystem.api.models.Role;
import com.ticketingSystem.api.models.RequesterUser;
import com.ticketingSystem.api.repository.*;
import com.ticketingSystem.api.typesense.TypesenseClient;
import com.ticketingSystem.api.models.User;
import com.ticketingSystem.notification.enums.ChannelType;
import com.ticketingSystem.notification.service.NotificationService;
import com.ticketingSystem.calendar.service.SlaCalculatorService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDateTime;
import java.time.Duration;
import java.time.ZoneId;
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
    private StatusHistoryRepository statusHistoryRepository;
    @Mock
    private AssignmentHistoryRepository assignmentHistoryRepository;
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
    private IssueTypeRepository issueTypeRepository;
    @Mock
    private UploadedFileRepository uploadedFileRepository;
    @Mock
    private FileStorageService fileStorageService;
    @Mock
    private TicketSlaService ticketSlaService;
    @Mock
    private RecommendedSeverityFlowRepository recommendedSeverityFlowRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private StakeholderRepository stakeholderRepository;
    @Mock
    private RegionMasterRepository regionMasterRepository;
    @Mock
    private DistrictMasterRepository districtMasterRepository;
    @Mock
    private DivisionMasterRepository divisionMasterRepository;
    @Mock
    private DivisionHistoryService divisionHistoryService;
    @Mock
    private TicketIdGenerator ticketIdGenerator;
    @Mock
    private TicketCrService ticketCrService;
    @Mock
    private TicketHistoryRepository ticketHistoryRepository;
    @Mock
    private TicketHistoryConfigRepository ticketHistoryConfigRepository;
    @Mock
    private TicketTextHistoryRepository ticketTextHistoryRepository;
    @Mock
    private SlaCalculatorService slaCalculatorService;

    @InjectMocks
    private TicketService ticketService;

    @Test
    void updateHistoryTimestampUpdatesEveryRowInTheGroup() {
        LocalDateTime original = LocalDateTime.of(2026, 9, 17, 10, 0);
        LocalDateTime corrected = LocalDateTime.of(2026, 9, 17, 11, 30);
        TicketHistory selected = historyRow(1L, "group-1", original);
        TicketHistory companion = historyRow(2L, "group-1", original);
        when(ticketHistoryRepository.findById(1L)).thenReturn(Optional.of(selected));
        when(ticketHistoryRepository.findByUpdateGroupIdOrderByTicketHistoryIdAsc("group-1"))
                .thenReturn(List.of(selected, companion));

        ticketService.updateHistoryTimestamp(1L, new StatusTimestampUpdateRequest(corrected, null));

        assertThat(selected.getUpdatedOn()).isEqualTo(corrected);
        assertThat(companion.getUpdatedOn()).isEqualTo(corrected);
        assertThat(selected.getUpdatedTimestamp()).isEqualTo(corrected);
        assertThat(companion.getUpdatedTimestamp()).isEqualTo(corrected);
        verify(ticketHistoryRepository).saveAll(List.of(selected, companion));
    }

    @Test
    void updateHistoryTimestampUpdatesLinkedStatusAndAssignmentRows() {
        LocalDateTime original = LocalDateTime.of(2026, 9, 17, 10, 0);
        LocalDateTime corrected = original.plusMinutes(30);
        TicketHistory statusTicketRow = historyRow(1L, "group-1", original);
        statusTicketRow.setSourceTable("status_history");
        statusTicketRow.setSourceHistoryId("status-1");
        TicketHistory assignmentTicketRow = historyRow(2L, "group-1", original);
        assignmentTicketRow.setSourceTable("assignment_history");
        assignmentTicketRow.setSourceHistoryId("assignment-1");
        StatusHistory status = new StatusHistory();
        status.setId("status-1");
        status.setTimestamp(original);
        com.ticketingSystem.api.models.AssignmentHistory assignment =
                new com.ticketingSystem.api.models.AssignmentHistory();
        assignment.setId("assignment-1");
        assignment.setTimestamp(original);
        when(ticketHistoryRepository.findById(1L)).thenReturn(Optional.of(statusTicketRow));
        when(ticketHistoryRepository.findByUpdateGroupIdOrderByTicketHistoryIdAsc("group-1"))
                .thenReturn(List.of(statusTicketRow, assignmentTicketRow));
        when(statusHistoryRepository.findById("status-1")).thenReturn(Optional.of(status));
        when(assignmentHistoryRepository.findById("assignment-1")).thenReturn(Optional.of(assignment));

        ticketService.updateHistoryTimestamp(1L, new StatusTimestampUpdateRequest(corrected, null));

        assertThat(status.getTimestamp()).isEqualTo(corrected);
        assertThat(status.getUpdatedTimestamp()).isEqualTo(corrected);
        assertThat(assignment.getTimestamp()).isEqualTo(corrected);
        verify(statusHistoryRepository).save(status);
        verify(assignmentHistoryRepository).save(assignment);
    }

    @Test
    void undoHistoryTimestampRestoresOneTimestampAcrossTheGroup() {
        LocalDateTime original = LocalDateTime.of(2026, 9, 17, 10, 0);
        LocalDateTime corrected = LocalDateTime.of(2026, 9, 17, 11, 30);
        TicketHistory selected = historyRow(1L, "group-1", corrected);
        selected.setOriginalTimestamp(original);
        selected.setUpdatedTimestamp(corrected);
        TicketHistory companion = historyRow(2L, "group-1", corrected);
        companion.setOriginalTimestamp(original.plusSeconds(1));
        companion.setUpdatedTimestamp(corrected);
        when(ticketHistoryRepository.findById(1L)).thenReturn(Optional.of(selected));
        when(ticketHistoryRepository.findByUpdateGroupIdOrderByTicketHistoryIdAsc("group-1"))
                .thenReturn(List.of(selected, companion));

        ticketService.undoHistoryTimestamp(1L);

        assertThat(selected.getUpdatedOn()).isEqualTo(original);
        assertThat(companion.getUpdatedOn()).isEqualTo(original);
        assertThat(selected.getUpdatedTimestamp()).isNull();
        assertThat(companion.getUpdatedTimestamp()).isNull();
        verify(ticketHistoryRepository).saveAll(List.of(selected, companion));
    }

    @Test
    void previewHistoryTimestampReturnsTimestampAndBusinessMinuteBounds() {
        LocalDateTime previousTime = LocalDateTime.of(2026, 9, 17, 9, 0);
        LocalDateTime currentTime = LocalDateTime.of(2026, 9, 17, 10, 0);
        LocalDateTime nextTime = LocalDateTime.of(2026, 9, 17, 12, 0);
        TicketHistory previous = historyRow(1L, "previous", previousTime);
        TicketHistory selected = historyRow(2L, "selected", currentTime);
        TicketHistory next = historyRow(3L, "next", nextTime);
        selected.setTicketId("T-1");
        when(ticketHistoryRepository.findById(2L)).thenReturn(Optional.of(selected));
        when(ticketHistoryRepository.findByTicketIdOrderByUpdatedOnUtcDescUpdatedOnDescTicketHistoryIdDesc("T-1"))
                .thenReturn(List.of(next, selected, previous));
        when(slaCalculatorService.computeWorkingDurationBetween(any(), any()))
                .thenReturn(Duration.ofMinutes(-60), Duration.ofMinutes(120));

        var result = ticketService.previewHistoryTimestamp(2L,
                new StatusTimestampUpdateRequest(LocalDateTime.of(2026, 9, 17, 11, 0), null));

        assertThat(result.minimumTimestamp()).isEqualTo(previousTime);
        assertThat(result.maximumTimestamp()).isEqualTo(nextTime);
        assertThat(result.minimumBusinessMinutes()).isEqualTo(-60);
        assertThat(result.maximumBusinessMinutes()).isEqualTo(120);
    }

    @Test
    void previewHistoryTimestampIncludesStatusAndAssignmentHistoryBounds() {
        LocalDateTime current = LocalDateTime.of(2026, 9, 17, 10, 0);
        TicketHistory selected = historyRow(2L, "selected", current);
        selected.setTicketId("T-1");
        Ticket ticket = new Ticket();
        ticket.setId("T-1");
        StatusHistory previous = new StatusHistory();
        previous.setId("status-previous");
        previous.setTimestamp(current.minusMinutes(30));
        com.ticketingSystem.api.models.AssignmentHistory next =
                new com.ticketingSystem.api.models.AssignmentHistory();
        next.setId("assignment-next");
        next.setTimestamp(current.plusMinutes(45));
        when(ticketHistoryRepository.findById(2L)).thenReturn(Optional.of(selected));
        when(ticketHistoryRepository.findByTicketIdOrderByUpdatedOnUtcDescUpdatedOnDescTicketHistoryIdDesc("T-1"))
                .thenReturn(List.of(selected));
        when(ticketRepository.findById("T-1")).thenReturn(Optional.of(ticket));
        when(statusHistoryRepository.findByTicketOrderByTimestampAsc(ticket)).thenReturn(List.of(previous));
        when(assignmentHistoryRepository.findByTicketOrderByTimestampAsc(ticket)).thenReturn(List.of(next));

        var result = ticketService.previewHistoryTimestamp(2L,
                new StatusTimestampUpdateRequest(current.plusMinutes(10), null));

        assertThat(result.minimumTimestamp()).isEqualTo(previous.getTimestamp());
        assertThat(result.maximumTimestamp()).isEqualTo(next.getTimestamp());
    }

    @Test
    void previewHistoryTimestampSupportsSubtractingBusinessMinutes() {
        LocalDateTime currentTime = LocalDateTime.of(2026, 9, 17, 10, 0);
        LocalDateTime calculated = LocalDateTime.of(2026, 9, 16, 17, 0);
        TicketHistory selected = historyRow(2L, "selected", currentTime);
        selected.setTicketId("T-1");
        when(ticketHistoryRepository.findById(2L)).thenReturn(Optional.of(selected));
        when(ticketHistoryRepository.findByTicketIdOrderByUpdatedOnUtcDescUpdatedOnDescTicketHistoryIdDesc("T-1"))
                .thenReturn(List.of(selected));
        when(slaCalculatorService.computeStart(any(), eq(Duration.ofMinutes(60))))
                .thenReturn(calculated.atZone(ZoneId.of("Asia/Kolkata")));

        var result = ticketService.previewHistoryTimestamp(2L,
                new StatusTimestampUpdateRequest(null, -60L));

        assertThat(result.calculatedTimestamp()).isEqualTo(calculated);
    }

    @Test
    void updateHistoryTimestampRejectsTimesOutsideAdjacentHistory() {
        LocalDateTime previousTime = LocalDateTime.of(2026, 9, 17, 9, 0);
        LocalDateTime currentTime = LocalDateTime.of(2026, 9, 17, 10, 0);
        LocalDateTime nextTime = LocalDateTime.of(2026, 9, 17, 12, 0);
        TicketHistory previous = historyRow(1L, "previous", previousTime);
        TicketHistory selected = historyRow(2L, "selected", currentTime);
        TicketHistory next = historyRow(3L, "next", nextTime);
        selected.setTicketId("T-1");
        when(ticketHistoryRepository.findById(2L)).thenReturn(Optional.of(selected));
        when(ticketHistoryRepository.findByTicketIdOrderByUpdatedOnUtcDescUpdatedOnDescTicketHistoryIdDesc("T-1"))
                .thenReturn(List.of(next, selected, previous));

        assertThatThrownBy(() -> ticketService.updateHistoryTimestamp(2L,
                new StatusTimestampUpdateRequest(previousTime.minusMinutes(1), null)))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("previous ticket history timestamp");
        assertThatThrownBy(() -> ticketService.updateHistoryTimestamp(2L,
                new StatusTimestampUpdateRequest(nextTime.plusMinutes(1), null)))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("next ticket history timestamp");
        verify(ticketHistoryRepository, never()).saveAll(anyList());
    }

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
    void updateTicket_statusChange_recalculatesSlaWithLatestStatusHistory() {
        String ticketId = "T-SLA-STATUS";
        Ticket existing = buildExistingTicket(ticketId, "agent1");
        existing.setReportedDate(LocalDateTime.now().minusHours(2));
        existing.setSeverity("HIGH");
        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(existing));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));
        prepareStatusTransitionMocks();

        StatusHistory latestHistory = new StatusHistory();
        when(statusHistoryRepository.findByTicketOrderByTimestampAsc(existing))
                .thenReturn(List.of(latestHistory));

        ticketService.updateTicket(ticketId, buildUpdateRequest());

        verify(ticketSlaService).calculateAndSaveByCalendar(existing, List.of(latestHistory));
    }

    @Test
    void updateTicket_assignmentChange_recalculatesSla() {
        String ticketId = "T-SLA-ASSIGNMENT";
        Ticket existing = buildExistingTicket(ticketId, "agent-old");
        existing.setReportedDate(LocalDateTime.now().minusHours(1));
        existing.setSeverity("MEDIUM");
        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(existing));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        StatusHistory currentHistory = new StatusHistory();
        when(statusHistoryRepository.findByTicketOrderByTimestampAsc(existing))
                .thenReturn(List.of(currentHistory));

        Ticket update = new Ticket();
        update.setAssignedTo("agent-new");
        update.setUpdatedBy("manager1");

        ticketService.updateTicket(ticketId, update);

        verify(ticketSlaService).calculateAndSaveByCalendar(existing, List.of(currentHistory));
    }

    @Test
    void updateTicket_changeRequestedCreatesCrWithinUpdateFlow() {
        String ticketId = "T-CR";
        Ticket existing = buildExistingTicket(ticketId, "agent1");
        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(existing));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Status changeRequestedStatus = new Status();
        changeRequestedStatus.setStatusId("CHANGE_REQUESTED_ID");
        changeRequestedStatus.setStatusCode(TicketStatus.CHANGE_REQUESTED.name());
        changeRequestedStatus.setStatusName("Change Requested");
        when(workflowService.getStatusCodeById("CHANGE_REQUESTED_ID"))
                .thenReturn(TicketStatus.CHANGE_REQUESTED.name());
        when(statusMasterRepository.findById("CHANGE_REQUESTED_ID"))
                .thenReturn(Optional.of(changeRequestedStatus));
        when(statusHistoryService.addHistory(eq(ticketId), anyString(), any(), any(), anyBoolean(), any()))
                .thenReturn(new StatusHistory());

        Ticket update = new Ticket();
        update.setStatus(changeRequestedStatus);
        update.setUpdatedBy("agent2");
        update.setRemark("Needs production change");

        ticketService.updateTicket(ticketId, update);

        verify(ticketCrService).createForTicketIfMissing(
                ticketId,
                "Needs production change",
                "agent2"
        );
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
        existing.setSubject("Login issue");

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

        verify(notificationService).sendNotificationForUser(
                eq("TICKET_STATUS_UPDATE"),
                argThat(map ->
                        ticketId.equals(map.get("ticketId"))
                                && ticketId.equals(map.get("ticketNumber"))
                                && "Resolved".equals(map.get("newStatus"))
                                && map.containsKey("oldStatus")
                                && "agent2".equals(map.get("actorName"))
                                && "Requester Name".equals(map.get("recipientName"))
                                && "Login issue".equals(map.get("issue"))
                                && "Resolved now".equals(map.get("resolution"))
                                && ("/tickets/" + ticketId + "/feedback").equals(map.get("feedbackLink"))
                ),
                same(requestor)
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

        ArgumentCaptor<Map<String, Object>> assigneeDataCaptor = ArgumentCaptor.forClass(Map.class);
        ArgumentCaptor<User> assigneeCaptor = ArgumentCaptor.forClass(User.class);

        verify(notificationService).sendNotificationForUser(
                eq("TICKET_ASSIGNED"),
                assigneeDataCaptor.capture(),
                assigneeCaptor.capture()
        );

        assertThat(assigneeCaptor.getValue()).isSameAs(assignee);
        assertThat(assigneeDataCaptor.getValue())
                .containsEntry("ticketId", "T-100")
                .containsEntry("assigneeName", "Agent Jane")
                .containsEntry("assignedBy", "supervisor");

        verify(notificationService).sendNotificationForUser(
                eq("TICKET_UPDATED"),
                argThat(payload ->
                        "T-100".equals(payload.get("ticketId"))
                                && "T-100".equals(payload.get("ticketNumber"))
                                && "ASSIGNMENT_UPDATED".equals(payload.get("updateType"))
                                && "Agent Jane".equals(payload.get("currentAssignee"))
                ),
                same(requestor)
        );
    }

    @Test
    void updateTicket_statusChange_sendsNotificationToRequesterUserWhenUserIsAbsent() throws Exception {
        String ticketId = "T-REQUESTER-STATUS";
        Ticket existing = buildExistingTicket(ticketId, "agent1");
        existing.setUser(null);
        existing.setUserId("requester-1");
        existing.setRequestorEmailId("requester@ticketingSystem.com");
        existing.setDescription("Requester cannot submit form");

        RequesterUser requesterUser = new RequesterUser();
        requesterUser.setRequesterUserId("requester-1");
        requesterUser.setUsername("requesterUser");
        requesterUser.setName("Requester User Name");
        requesterUser.setEmailId("requester@ticketingSystem.com");

        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(existing));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findById("requester-1")).thenReturn(Optional.empty());
        when(requesterUserRepository.findById("requester-1")).thenReturn(Optional.of(requesterUser));

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

        ticketService.updateTicket(ticketId, update);

        verify(notificationService).sendNotificationForUser(
                eq("TICKET_STATUS_UPDATE"),
                argThat(map ->
                        ticketId.equals(map.get("ticketId"))
                                && "Resolved".equals(map.get("newStatus"))
                                && "Requester User Name".equals(map.get("recipientName"))
                                && "Requester cannot submit form".equals(map.get("issue"))
                                && "Resolved".equals(map.get("resolution"))
                                && ("/tickets/" + ticketId + "/feedback").equals(map.get("feedbackLink"))
                ),
                same(requesterUser)
        );
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

        ArgumentCaptor<Map<String, Object>> assigneePayloadCaptor = ArgumentCaptor.forClass(Map.class);
        ArgumentCaptor<User> assigneeCaptor = ArgumentCaptor.forClass(User.class);

        verify(notificationService).sendNotificationForUser(
                eq("TICKET_ASSIGNED"),
                assigneePayloadCaptor.capture(),
                assigneeCaptor.capture()
        );

        assertThat(assigneeCaptor.getValue()).isSameAs(newAssignee);
        assertThat(assigneePayloadCaptor.getValue())
                .containsEntry("ticketId", "T-3")
                .containsEntry("assigneeName", "Agent New")
                .containsEntry("assignedBy", "manager1");

        verify(notificationService).sendNotificationForUser(
                eq("TICKET_UPDATED"),
                argThat(payload ->
                        "T-3".equals(payload.get("ticketId"))
                                && "ASSIGNMENT_UPDATED".equals(payload.get("updateType"))
                                && "Agent New".equals(payload.get("currentAssignee"))
                                && "manager1".equals(payload.get("actorName"))
                ),
                same(requestor)
        );
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
                eq("NONE"),
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

    @Test
    void linkToMaster_closesChildTicket_andAddsMasterLinkRemarkInStatusHistory() {
        String childId = "T-CHILD";
        String masterId = "T-MASTER";

        Ticket child = buildExistingTicket(childId, "agent1");
        child.setIssueTypeId("ISSUE-1");
        child.setFeedbackStatus(null);
        child.setMaster(false);

        Ticket master = buildExistingTicket(masterId, "agent2");
        master.setMaster(true);

        Status closedStatus = new Status();
        closedStatus.setStatusId("CLOSED_ID");
        closedStatus.setStatusCode(TicketStatus.CLOSED.name());
        closedStatus.setStatusName("Closed");
        closedStatus.setLabel("Closed");

        when(ticketRepository.findById(childId)).thenReturn(Optional.of(child));
        when(ticketRepository.findById(masterId)).thenReturn(Optional.of(master));
        when(workflowService.getStatusIdByCode(TicketStatus.CLOSED.name())).thenReturn("CLOSED_ID");
        when(statusMasterRepository.findById("CLOSED_ID")).thenReturn(Optional.of(closedStatus));
        when(workflowService.getSlaFlagByStatusAndIssueType("CLOSED_ID", "ISSUE-1")).thenReturn(Boolean.FALSE);
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TicketDto result = ticketService.linkToMaster(childId, masterId, "agent-linker");

        assertThat(result.getMasterId()).isEqualTo(masterId);
        assertThat(result.getStatus()).isEqualTo(TicketStatus.CLOSED);

        verify(statusHistoryService).addHistory(
                eq(childId),
                eq("agent-linker"),
                eq("OPEN_ID"),
                eq("CLOSED_ID"),
                eq(Boolean.FALSE),
                eq("Linked to a Master ticket")
        );
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

    private TicketHistory historyRow(Long id, String groupId, LocalDateTime timestamp) {
        TicketHistory history = new TicketHistory();
        history.setTicketHistoryId(id);
        history.setUpdateGroupId(groupId);
        history.setUpdatedOn(timestamp);
        return history;
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
