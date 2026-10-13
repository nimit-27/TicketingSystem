package com.ticketingSystem.api.service;

import com.ticketingSystem.api.models.*;
import com.ticketingSystem.api.repository.*;
import org.junit.jupiter.api.Test;
import java.time.Instant;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.anyList;

class TicketTimestampHistoryServiceTest {
    @Test
    void recordsOnlyEnabledChangedColumnsIncludingClearingToNull() {
        var configs = mock(TicketHistoryConfigRepository.class);
        var rows = mock(TicketHistoryRepository.class);
        var service = new TicketTimestampHistoryService(configs, rows);
        Ticket ticket = new Ticket();
        ticket.setId("T-1");
        ticket.setResolvedAtUtc(Instant.parse("2026-10-13T06:00:00Z"));
        ticket.setClosedAtUtc(ticket.getResolvedAtUtc());
        var before = service.snapshot(ticket);
        ticket.setResolvedAtUtc(null);
        ticket.setClosedAtUtc(null);
        TicketHistoryConfig config = new TicketHistoryConfig();
        config.setColumnName("resolved_at_utc");
        config.setDisplayLabel("Resolved At UTC Updated");
        config.setUpdateTypeCode("RESOLVED_AT_UTC_UPDATE");
        // Disabled columns are absent from this repository query.
        when(configs.findByTableNameAndIsTrackableTrueOrderByDisplayOrderAsc("tickets"))
                .thenReturn(List.of(config));
        doAnswer(call -> {
            List<TicketHistory> saved = call.getArgument(0);
            assertThat(saved).hasSize(1);
            assertThat(saved.get(0).getColumnName()).isEqualTo("resolved_at_utc");
            assertThat(saved.get(0).getOldValue()).isEqualTo("2026-10-13T06:00:00Z");
            assertThat(saved.get(0).getNewValue()).isNull();
            assertThat(saved.get(0).getUpdatedBy()).isEqualTo("agent");
            return saved;
        }).when(rows).saveAll(anyList());
        service.recordChanges(before, ticket, "agent", "Reopened");
        verify(rows).saveAll(anyList());
        service.recordChanges(service.snapshot(ticket), ticket, "agent", "Unchanged");
        verify(rows, times(1)).saveAll(anyList());
    }
}
