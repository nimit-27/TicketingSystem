package com.ticketingSystem.api.service;

import com.ticketingSystem.api.config.NagiosMonitoringProperties;
import com.ticketingSystem.api.dto.nagios.NagiosTicketSlaSnapshotDto;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.models.TicketSla;
import com.ticketingSystem.api.models.TicketStatus;
import com.ticketingSystem.api.repository.TicketSlaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NagiosTicketSlaServiceTest {

    @Mock
    private TicketSlaRepository ticketSlaRepository;

    private NagiosMonitoringProperties nagiosMonitoringProperties;

    @InjectMocks
    private NagiosTicketSlaService nagiosTicketSlaService;

    @BeforeEach
    void setUp() {
        nagiosMonitoringProperties = new NagiosMonitoringProperties();
        nagiosMonitoringProperties.setApiKey("nagios-secret");
        nagiosMonitoringProperties.setAllowedClientIds(List.of("nagios-client"));
        nagiosTicketSlaService = new NagiosTicketSlaService(ticketSlaRepository, nagiosMonitoringProperties);
    }

    @Test
    void fetchSnapshotReturnsMappedResponseWhenVerificationSucceeds() {
        Ticket ticket = new Ticket();
        ticket.setId("ticket-id");
        ticket.setTicketNumber("T-123");
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

        Authentication authentication = new UsernamePasswordAuthenticationToken("nagios-client", null, List.of());

        NagiosTicketSlaSnapshotDto snapshot = nagiosTicketSlaService.fetchSnapshot(authentication, "nagios-secret", 10);

        assertThat(snapshot.totalRecords()).isEqualTo(10L);
        assertThat(snapshot.breachedRecords()).isEqualTo(2L);
        assertThat(snapshot.compliancePercentage().doubleValue()).isEqualTo(80.0d);
        assertThat(snapshot.returnedRecords()).isEqualTo(1);
        assertThat(snapshot.records()).hasSize(1);
        assertThat(snapshot.records().get(0).ticketNumber()).isEqualTo("T-123");
    }

    @Test
    void fetchSnapshotRejectsClientOutsideAllowList() {
        Authentication authentication = new UsernamePasswordAuthenticationToken("other-client", null, List.of());

        assertThatThrownBy(() -> nagiosTicketSlaService.fetchSnapshot(authentication, "nagios-secret", 10))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("403 FORBIDDEN");
    }

    @Test
    void fetchSnapshotRejectsInvalidApiKey() {
        Authentication authentication = new UsernamePasswordAuthenticationToken("nagios-client", null, List.of());

        assertThatThrownBy(() -> nagiosTicketSlaService.fetchSnapshot(authentication, "wrong", 10))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("401 UNAUTHORIZED");
    }
}
