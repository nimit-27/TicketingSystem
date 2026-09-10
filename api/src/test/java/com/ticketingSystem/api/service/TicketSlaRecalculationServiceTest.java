package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.sla.TicketSlaRecalculationPreviewDto;
import com.ticketingSystem.api.models.StatusHistory;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.models.TicketSla;
import com.ticketingSystem.api.repository.StatusHistoryRepository;
import com.ticketingSystem.api.repository.TicketRepository;
import com.ticketingSystem.api.repository.TicketSlaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketSlaRecalculationServiceTest {
    @Mock TicketRepository ticketRepository;
    @Mock TicketSlaRepository ticketSlaRepository;
    @Mock StatusHistoryRepository statusHistoryRepository;
    @Mock StatusMasterService statusMasterService;
    @Mock TicketSlaService ticketSlaService;
    TicketSlaRecalculationService service;

    @BeforeEach
    void setUp() {
        service = new TicketSlaRecalculationService(ticketRepository, ticketSlaRepository,
                statusHistoryRepository, statusMasterService, ticketSlaService);
    }

    @Test
    void previewSynchronizesHistoryAndDoesNotApplyCalculatedSla() {
        Ticket ticket = new Ticket();
        ticket.setId("T-1");
        StatusHistory history = new StatusHistory();
        history.setCurrentStatus("ON_HOLD");
        history.setSlaFlag(true);
        TicketSla calculated = new TicketSla();
        calculated.setTicket(ticket);
        calculated.setIdleTimeMinutes(60L);

        when(ticketRepository.findById("T-1")).thenReturn(Optional.of(ticket));
        when(ticketSlaRepository.findByTicket_Id("T-1")).thenReturn(Optional.empty());
        when(statusHistoryRepository.findByTicketOrderByTimestampAsc(ticket)).thenReturn(List.of(history));
        when(statusMasterService.getSlaFlagByStatusId("ON_HOLD")).thenReturn(false);
        when(ticketSlaService.calculateByCalendarFromScratch(ticket, List.of(history))).thenReturn(calculated);

        TicketSlaRecalculationPreviewDto result = service.recalculate(List.of("T-1"), false).get(0);

        assertFalse(history.getSlaFlag());
        assertEquals(1, result.synchronizedHistoryRows());
        assertFalse(result.updated());
        assertEquals(60L, result.calculated().getIdleTimeMinutes());
        verify(statusHistoryRepository).saveAll(List.of(history));
        verify(ticketSlaService, never()).calculateAndSaveByCalendarFromScratch(any(), anyList());
    }
}
