package com.ticketingSystem.api.service;

import com.ticketingSystem.api.exception.TicketNotFoundException;
import com.ticketingSystem.api.models.DivisionHistory;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.repository.DivisionHistoryRepository;
import com.ticketingSystem.api.repository.TicketRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DivisionHistoryServiceTest {

    @Mock
    private DivisionHistoryRepository divisionHistoryRepository;
    @Mock
    private TicketRepository ticketRepository;

    @InjectMocks
    private DivisionHistoryService service;

    @Test
    void addHistoryShouldPersistAuditRecord() {
        Ticket ticket = new Ticket();
        when(ticketRepository.findById("T-1")).thenReturn(Optional.of(ticket));
        when(divisionHistoryRepository.save(any(DivisionHistory.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        DivisionHistory saved = service.addHistory("T-1", "editor", "A", "B", "Escalated");

        assertThat(saved.getTicket()).isEqualTo(ticket);
        assertThat(saved.getUpdatedBy()).isEqualTo("editor");
        assertThat(saved.getPreviousDivision()).isEqualTo("A");
        assertThat(saved.getCurrentDivision()).isEqualTo("B");
        assertThat(saved.getRemark()).isEqualTo("Escalated");
        assertThat(saved.getTimestamp()).isNotNull();

        ArgumentCaptor<DivisionHistory> captor = ArgumentCaptor.forClass(DivisionHistory.class);
        verify(divisionHistoryRepository).save(captor.capture());
        assertThat(captor.getValue().getTimestamp()).isNotNull();
    }

    @Test
    void addHistoryShouldThrowWhenTicketNotFound() {
        when(ticketRepository.findById("404")).thenReturn(Optional.empty());

        assertThrows(TicketNotFoundException.class,
                () -> service.addHistory("404", "u", "x", "y", "remark"));
    }
}
