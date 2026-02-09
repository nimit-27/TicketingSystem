package com.ticketingSystem.api.service;

import com.ticketingSystem.api.enums.TicketStatus;
import com.ticketingSystem.api.models.Status;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.repository.StatusMasterRepository;
import com.ticketingSystem.api.repository.TicketRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TicketStatusSchedulerTest {

    @Mock
    private TicketRepository ticketRepository;
    @Mock
    private TicketStatusWorkflowService workflowService;
    @Mock
    private StatusMasterRepository statusMasterRepository;

    @Test
    void closeResolvedTickets_doesNothingWhenAutoClosureDisabled() {
        TicketStatusScheduler scheduler = new TicketStatusScheduler(
                ticketRepository,
                workflowService,
                statusMasterRepository,
                false
        );

        scheduler.closeResolvedTickets();

        verify(ticketRepository, never()).findByTicketStatusAndLastModifiedBefore(any(), any());
        verify(ticketRepository, never()).saveAll(any());
    }

    @Test
    void closeResolvedTickets_closesResolvedTicketsWhenEnabled() {
        Ticket ticket = new Ticket();
        ticket.setId("T-1");
        ticket.setTicketStatus(TicketStatus.RESOLVED);
        ticket.setLastModified(LocalDateTime.now().minusHours(80));

        Status closedStatus = new Status();
        closedStatus.setStatusId("CLOSED_ID");
        closedStatus.setStatusCode(TicketStatus.CLOSED.name());

        when(ticketRepository.findByTicketStatusAndLastModifiedBefore(eq(TicketStatus.RESOLVED), any()))
                .thenReturn(List.of(ticket));
        when(workflowService.getStatusIdByCode(TicketStatus.CLOSED.name())).thenReturn("CLOSED_ID");
        when(statusMasterRepository.findById("CLOSED_ID")).thenReturn(Optional.of(closedStatus));

        TicketStatusScheduler scheduler = new TicketStatusScheduler(
                ticketRepository,
                workflowService,
                statusMasterRepository,
                true
        );

        scheduler.closeResolvedTickets();

        verify(ticketRepository).findByTicketStatusAndLastModifiedBefore(eq(TicketStatus.RESOLVED), any());
        verify(ticketRepository).saveAll(eq(List.of(ticket)));
        assertThat(ticket.getTicketStatus()).isEqualTo(TicketStatus.CLOSED);
        assertThat(ticket.getUpdatedBy()).isEqualTo("SYSTEM");
        assertThat(ticket.getFeedbackStatus()).isNotNull();
    }
}
