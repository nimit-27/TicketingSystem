package com.ticketingSystem.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.ticketingSystem.api.dto.nagios.NagiosCountBySeverityView;
import com.ticketingSystem.api.dto.nagios.NagiosTicketSlaSnapshotDto;
import com.ticketingSystem.api.dto.nagios.NagiosTicketSlaSummaryAggregateDto;
import com.ticketingSystem.api.dto.nagios.NagiosTicketSlaSummaryDto;
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

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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
    @Test
    void summarySerializesDatesInNagiosDisplayFormat() throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        NagiosTicketSlaSummaryDto summary = new NagiosTicketSlaSummaryDto(
                "ticketing-system",
                Instant.parse("2026-07-09T10:15:30Z"),
                LocalDateTime.of(2026, 7, 1, 0, 0),
                LocalDateTime.of(2026, 7, 9, 23, 59),
                0L,
                0L,
                0L,
                0L,
                0L,
                0L,
                0L,
                0L,
                0L,
                0L,
                0L,
                0L,
                0L,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                Map.of(),
                Map.of()
        );

        String json = objectMapper.writeValueAsString(summary);

        assertThat(json).contains("\"fromDate\":\"01 Jul 2026 00:00\"");
        assertThat(json).contains("\"toDate\":\"09 Jul 2026 23:59\"");
    }

    @Test
    void fetchSummaryIncludesProblemBugIncidentMetricsBySeverityAndOthers() {
        NagiosTicketSlaSummaryAggregateDto aggregate = new NagiosTicketSlaSummaryAggregateDto(
                12L, 4L, null, null, null, LocalDateTime.of(2026, 8, 1, 0, 0), null);
        NagiosCountBySeverityView s1 = issueTypeCount("S1 - Critical", 3L, 2L);
        NagiosCountBySeverityView s3 = issueTypeCount("S3", 5L, 1L);

        when(ticketSlaRepository.fetchSummary(any(), any())).thenReturn(aggregate);
        when(ticketSlaRepository.fetchSummaryBySeverity(any(), any())).thenReturn(List.of());
        when(ticketSlaRepository.fetchProblemBugIncidentCountsBySeverity(any(), any()))
                .thenReturn(List.of(s1, s3));
        when(ticketSlaRepository.countOtherIssueTypeTickets(any(), any())).thenReturn(4L);

        NagiosTicketSlaSummaryDto summary = nagiosTicketSlaService.fetchSummary(
                LocalDate.of(2026, 8, 1), LocalDate.of(2026, 8, 31));

        assertThat(summary.severitySummary())
                .containsEntry("ProblemBugIncidentCount", 8L)
                .containsEntry("ProblemBugIncidentBreachCount", 3L)
                .containsEntry("ProblemBugIncidentBreachPercentage", new BigDecimal("37.50"))
                .containsEntry("ProblemBugIncidentS1Count", 3L)
                .containsEntry("ProblemBugIncidentS1BreachCount", 2L)
                .containsEntry("ProblemBugIncidentS1BreachPercentage", new BigDecimal("66.67"))
                .containsEntry("ProblemBugIncidentS2Count", 0L)
                .containsEntry("ProblemBugIncidentS3Count", 5L)
                .containsEntry("ProblemBugIncidentS4Count", 0L)
                .containsEntry("Others", 4L);
    }

    private NagiosCountBySeverityView issueTypeCount(String severity, Long totalCount, Long breachCount) {
        return new NagiosCountBySeverityView() {
            public String getSeverity() {
                return severity;
            }

            public Long getTotalCount() {
                return totalCount;
            }

            public Long getBreachCount() {
                return breachCount;
            }
        };
    }

}
