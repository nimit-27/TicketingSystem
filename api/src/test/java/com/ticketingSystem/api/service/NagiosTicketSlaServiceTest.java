package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.nagios.NagiosTicketSlaRequestDto;
import com.ticketingSystem.api.dto.nagios.NagiosTicketSlaSnapshotDto;
import com.ticketingSystem.api.models.ClientCredential;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.models.TicketSla;
import com.ticketingSystem.api.models.TicketStatus;
import com.ticketingSystem.api.repository.TicketSlaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NagiosTicketSlaServiceTest {

    @Mock
    private TicketSlaRepository ticketSlaRepository;

    @Mock
    private ClientCredentialService clientCredentialService;

    @InjectMocks
    private NagiosTicketSlaService nagiosTicketSlaService;

    @Test
    void fetchSnapshotReturnsMappedResponseWhenCredentialsAreValid() {
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
        NagiosTicketSlaRequestDto request = new NagiosTicketSlaRequestDto();
        request.setClientId("nagios-client");
        request.setClientSecret("nagios-secret");
        request.setLimit(10);

        when(clientCredentialService.authenticate("nagios-client", "nagios-secret"))
                .thenReturn(Optional.of(new ClientCredential()));
        when(ticketSlaRepository.findAll(any(Pageable.class))).thenReturn(page);
        when(ticketSlaRepository.count()).thenReturn(10L);
        when(ticketSlaRepository.countByBreachedByMinutesGreaterThan(0L)).thenReturn(2L);

        NagiosTicketSlaSnapshotDto snapshot = nagiosTicketSlaService.fetchSnapshot(request);

        assertThat(snapshot.totalRecords()).isEqualTo(10L);
        assertThat(snapshot.breachedRecords()).isEqualTo(2L);
        assertThat(snapshot.compliancePercentage().doubleValue()).isEqualTo(80.0d);
        assertThat(snapshot.returnedRecords()).isEqualTo(1);
        assertThat(snapshot.records()).hasSize(1);
        assertThat(snapshot.records().get(0).ticketNumber()).isEqualTo("T-123");
    }

    @Test
    void fetchSnapshotRejectsInvalidCredentials() {
        NagiosTicketSlaRequestDto request = new NagiosTicketSlaRequestDto();
        request.setClientId("nagios-client");
        request.setClientSecret("wrong");

        when(clientCredentialService.authenticate("nagios-client", "wrong"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> nagiosTicketSlaService.fetchSnapshot(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("401 UNAUTHORIZED");
    }
}
