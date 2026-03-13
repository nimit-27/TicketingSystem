package com.ticketingSystem.api.service;

import com.ticketingSystem.api.exception.TicketNotFoundException;
import com.ticketingSystem.api.models.AssignmentHistory;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.repository.AssignmentHistoryRepository;
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
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AssignmentHistoryServiceTest {

    @Mock
    private AssignmentHistoryRepository historyRepository;
    @Mock
    private TicketRepository ticketRepository;

    @InjectMocks
    private AssignmentHistoryService service;

    @Test
    void addHistoryShouldPersistMappedFields() {
        Ticket ticket = new Ticket();
        ticket.setId("T-1");
        when(ticketRepository.findById("T-1")).thenReturn(Optional.of(ticket));

        AssignmentHistory saved = new AssignmentHistory();
        when(historyRepository.save(org.mockito.ArgumentMatchers.any(AssignmentHistory.class))).thenReturn(saved);

        AssignmentHistory result = service.addHistory("T-1", "alice", "bob", "L1", "Investigating");

        ArgumentCaptor<AssignmentHistory> captor = ArgumentCaptor.forClass(AssignmentHistory.class);
        verify(historyRepository).save(captor.capture());
        AssignmentHistory persisted = captor.getValue();

        assertThat(persisted.getTicket()).isEqualTo(ticket);
        assertThat(persisted.getAssignedBy()).isEqualTo("alice");
        assertThat(persisted.getAssignedTo()).isEqualTo("bob");
        assertThat(persisted.getLevelId()).isEqualTo("L1");
        assertThat(persisted.getRemark()).isEqualTo("Investigating");
        // Timestamp should always be generated server-side for traceability.
        assertThat(persisted.getTimestamp()).isNotNull();
        assertThat(result).isEqualTo(saved);
    }

    @Test
    void addHistoryShouldThrowWhenTicketMissing() {
        when(ticketRepository.findById("MISSING")).thenReturn(Optional.empty());

        assertThrows(TicketNotFoundException.class,
                () -> service.addHistory("MISSING", "a", "b", "L2", "remark"));
    }

    @Test
    void getHistoryForTicketShouldReturnChronologicalEntries() {
        Ticket ticket = new Ticket();
        when(ticketRepository.findById("T-2")).thenReturn(Optional.of(ticket));
        List<AssignmentHistory> history = List.of(new AssignmentHistory(), new AssignmentHistory());
        when(historyRepository.findByTicketOrderByTimestampAsc(ticket)).thenReturn(history);

        List<AssignmentHistory> result = service.getHistoryForTicket("T-2");

        assertThat(result).containsExactlyElementsOf(history);
    }
}
