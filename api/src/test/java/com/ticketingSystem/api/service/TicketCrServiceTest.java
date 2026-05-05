package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.TicketCrDto;
import com.ticketingSystem.api.dto.TicketCrUpdateStatusRequestDto;
import com.ticketingSystem.api.models.CrStatusMaster;
import com.ticketingSystem.api.models.Status;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.models.TicketCr;
import com.ticketingSystem.api.models.TicketCrHistory;
import com.ticketingSystem.api.models.TicketCrHistoryConfig;
import com.ticketingSystem.api.models.TicketCrStatusWorkflow;
import com.ticketingSystem.api.repository.CrStatusMasterRepository;
import com.ticketingSystem.api.repository.RoleRepository;
import com.ticketingSystem.api.repository.StatusMasterRepository;
import com.ticketingSystem.api.repository.TicketCrHistoryConfigRepository;
import com.ticketingSystem.api.repository.TicketCrHistoryRepository;
import com.ticketingSystem.api.repository.TicketCrRepository;
import com.ticketingSystem.api.repository.TicketCrStatusWorkflowRepository;
import com.ticketingSystem.api.repository.TicketRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TicketCrServiceTest {

    @Mock
    private TicketCrRepository ticketCrRepository;
    @Mock
    private TicketRepository ticketRepository;
    @Mock
    private StatusMasterRepository statusMasterRepository;
    @Mock
    private CrStatusMasterRepository crStatusMasterRepository;
    @Mock
    private TicketCrIdGenerator ticketCrIdGenerator;
    @Mock
    private TicketCrStatusWorkflowRepository ticketCrStatusWorkflowRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private TicketCrHistoryRepository ticketCrHistoryRepository;
    @Mock
    private TicketCrHistoryConfigRepository ticketCrHistoryConfigRepository;

    @InjectMocks
    private TicketCrService service;

    @Test
    void updateStatusShouldSaveCrStatusNameInHistoryAndReturnColor() {
        Ticket ticket = new Ticket();
        ticket.setId("TICKET-1");
        Status status = new Status();
        status.setStatusId("STATUS-1");
        CrStatusMaster oldStatus = crStatus("CR-1", "Draft", "#999999");
        CrStatusMaster nextStatus = crStatus("CR-2", "Submitted", "#008000");

        TicketCr existing = new TicketCr();
        existing.setTicketCrId("CR-TICKET-1");
        existing.setTicket(ticket);
        existing.setStatus(status);
        existing.setCrStatus(oldStatus);
        existing.setUpdatedBy("old-user");

        TicketCrStatusWorkflow workflow = new TicketCrStatusWorkflow();
        workflow.setId("WF-1");
        workflow.setCurrentStatus(oldStatus);
        workflow.setNextStatus(nextStatus);

        TicketCrHistoryConfig crStatusConfig = new TicketCrHistoryConfig();
        crStatusConfig.setTableName("ticket_cr");
        crStatusConfig.setColumnName("cr_status_id");
        crStatusConfig.setDisplayLabel("CR Status");
        crStatusConfig.setChangeTypeCode("STATUS_CHANGE");
        crStatusConfig.setIsTrackable(true);

        when(ticketCrRepository.findById("CR-TICKET-1")).thenReturn(Optional.of(existing));
        when(ticketCrStatusWorkflowRepository.findById("WF-1")).thenReturn(Optional.of(workflow));
        when(ticketCrRepository.save(existing)).thenReturn(existing);
        when(ticketCrHistoryConfigRepository.findByTableNameAndIsTrackableTrueOrderByDisplayOrderAsc("ticket_cr"))
                .thenReturn(List.of(crStatusConfig));

        TicketCrUpdateStatusRequestDto request = new TicketCrUpdateStatusRequestDto();
        request.setCrswId("WF-1");
        request.setRemarks("Submit for approval");
        request.setUpdatedBy("approver");

        TicketCrDto result = service.updateStatus("CR-TICKET-1", request);

        assertThat(result.getCrStatusId()).isEqualTo("CR-2");
        assertThat(result.getCrStatusName()).isEqualTo("Submitted");
        assertThat(result.getColor()).isEqualTo("#008000");

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<TicketCrHistory>> historyCaptor = ArgumentCaptor.forClass(List.class);
        verify(ticketCrHistoryRepository).saveAll(historyCaptor.capture());
        TicketCrHistory history = historyCaptor.getValue().get(0);
        assertThat(history.getColumnName()).isEqualTo("cr_status_id");
        assertThat(history.getOldValue()).isEqualTo("Draft");
        assertThat(history.getNewValue()).isEqualTo("Submitted");
        assertThat(history.getChangedBy()).isEqualTo("approver");
    }

    private CrStatusMaster crStatus(String id, String name, String color) {
        CrStatusMaster status = new CrStatusMaster();
        status.setCrStatusId(id);
        status.setCrStatusName(name);
        status.setCrStatusCode(name.toUpperCase());
        status.setColor(color);
        return status;
    }
}
