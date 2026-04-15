package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.nagios.NagiosTicketSlaSnapshotDto;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.models.TicketSla;
import com.ticketingSystem.api.enums.TicketStatus;
import com.ticketingSystem.api.repository.TicketSlaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NagiosTicketSlaServiceTest {

    @Mock
    private TicketSlaRepository ticketSlaRepository;

    @InjectMocks
    private NagiosTicketSlaService nagiosTicketSlaService;

    @Test
    void fetchSnapshotReturnsMappedResponse() {
        Ticket ticket = new Ticket();
        ticket.setId("ticket-id");
//        ticket.setTicketNumber("T-123");
        ticket.setTicketStatus(TicketStatus.RESOLVED);

        TicketSla ticketSla = new TicketSla();
        ticketSla.setId("sla-id");
        ticketSla.setTicket(ticket);
        ticketSla.setBreachedByMinutes(0L);
        ticketSla.setResponseTimeMinutes(30L);
        ticketSla.setResolutionTimeMinutes(100L);

        Page<TicketSla> page = new PageImpl<>(List.of(ticketSla));

        when(ticketSlaRepository.findAll(any(Pageable.class))).thenReturn(page);
        when(ticketSlaRepository.count()).thenReturn(10L);
        when(ticketSlaRepository.countByBreachedByMinutesGreaterThan(0L)).thenReturn(2L);

        NagiosTicketSlaSnapshotDto snapshot = nagiosTicketSlaService.fetchSnapshot(10);

        assertThat(snapshot.totalRecords()).isEqualTo(10L);
        assertThat(snapshot.breachedRecords()).isEqualTo(2L);
        assertThat(snapshot.compliancePercentage().doubleValue()).isEqualTo(80.0d);
        assertThat(snapshot.returnedRecords()).isEqualTo(1);
        assertThat(snapshot.records()).hasSize(1);
//        assertThat(snapshot.records().get(0).ticketNumber()).isEqualTo("T-123");
    }

    @Test
    void fetchSnapshotUsesDefaultLimitWhenNotProvided() {
        Page<TicketSla> page = new PageImpl<>(List.of());

        when(ticketSlaRepository.findAll(any(Pageable.class))).thenReturn(page);
        when(ticketSlaRepository.count()).thenReturn(0L);
        when(ticketSlaRepository.countByBreachedByMinutesGreaterThan(0L)).thenReturn(0L);

        NagiosTicketSlaSnapshotDto snapshot = nagiosTicketSlaService.fetchSnapshot(null);

        assertThat(snapshot.totalRecords()).isZero();
        assertThat(snapshot.compliancePercentage().doubleValue()).isEqualTo(100.0d);
    }
}
