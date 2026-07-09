package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.nagios.NagiosBreachedTicketsCountDto;
import com.ticketingSystem.api.dto.nagios.NagiosTicketSlaRecordDto;
import com.ticketingSystem.api.dto.nagios.NagiosTicketSlaSnapshotDto;
import com.ticketingSystem.api.dto.nagios.NagiosSeveritySlaAggregateView;
import com.ticketingSystem.api.dto.nagios.NagiosTicketSlaSummaryAggregateDto;
import com.ticketingSystem.api.dto.nagios.NagiosTicketSlaSummaryDto;
import com.ticketingSystem.api.enums.TicketStatus;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.models.TicketSla;
import com.ticketingSystem.api.repository.TicketSlaRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class NagiosTicketSlaService {
    private static final int MAX_RECORD_LIMIT = 500;
    private static final int DEFAULT_RECORD_LIMIT = 200;

    private final TicketSlaRepository ticketSlaRepository;

    public NagiosTicketSlaService(TicketSlaRepository ticketSlaRepository) {
        this.ticketSlaRepository = ticketSlaRepository;
    }

    public NagiosTicketSlaSnapshotDto fetchSnapshot(Integer limit) {
        int normalizedLimit = normalizeLimit(limit);
        List<TicketSla> ticketSlas = ticketSlaRepository.findAll(PageRequest.of(0, normalizedLimit, Sort.by(Sort.Direction.DESC, "dueAt")))
                .getContent();

        long totalRecords = ticketSlaRepository.count();
        long breachedRecords = ticketSlaRepository.countByBreachedByMinutesGreaterThan(0L);

        return new NagiosTicketSlaSnapshotDto(
                "ticketing-system",
                Instant.now(),
                totalRecords,
                breachedRecords,
                calculateCompliance(totalRecords, breachedRecords),
                ticketSlas.size(),
                ticketSlas.stream().map(this::toRecord).toList()
        );
    }

    public NagiosTicketSlaSummaryDto fetchSummary(LocalDate fromDate, LocalDate toDate) {
        LocalDate effectiveToDate = toDate != null ? toDate : LocalDate.now();
        LocalDateTime fromDateTime = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime toDateInclusive = effectiveToDate.atTime(23, 59, 59);
        LocalDateTime toDateExclusive = effectiveToDate.plusDays(1).atStartOfDay();

        NagiosTicketSlaSummaryAggregateDto aggregate = ticketSlaRepository.fetchSummary(fromDateTime, toDateExclusive);

        long totalTickets = aggregate.totalTickets();
        long breachedTickets = aggregate.breachedTickets();
        long breachedTicketsInLast1Day = getBreachedTicketsCountInLastNDays(1);
        long breachedTicketsInLast3Days = getBreachedTicketsCountInLastNDays(3);
        long breachedTicketsInLast15Days = getBreachedTicketsCountInLastNDays(15);
        long breachedTicketsInLast30Days = getBreachedTicketsCountInLastNDays(30);
        BreachedTicketStatusCounts statusCounts = buildBreachedTicketStatusCounts(fromDateTime, toDateExclusive);
        long nonBreachedTickets = Math.max(totalTickets - breachedTickets, 0);

        BigDecimal breachPercentage = calculatePercentage(breachedTickets, totalTickets);
        BigDecimal compliancePercentage = calculatePercentage(nonBreachedTickets, totalTickets);

        LocalDateTime responseFromDate = fromDateTime != null ? fromDateTime : aggregate.minReportedDate();
        if (responseFromDate == null) {
            responseFromDate = toDateInclusive;
        }

        return new NagiosTicketSlaSummaryDto(
                "ticketing-system",
                Instant.now(),
                responseFromDate,
                toDateInclusive,
                totalTickets,
                breachedTickets,
                breachedTicketsInLast1Day,
                breachedTicketsInLast3Days,
                breachedTicketsInLast15Days,
                breachedTicketsInLast30Days,
                statusCounts.resolvedOrClosedBreachedTickets(),
                statusCounts.onHoldBreachedTickets(),
                statusCounts.pendingWithRequestorBreachedTickets(),
                statusCounts.pendingWithFciBreachedTickets(),
                statusCounts.pendingWithServiceProviderBreachedTickets(),
                statusCounts.openReopenedAssignedBreachedTickets(),
                nonBreachedTickets,
                breachPercentage,
                compliancePercentage,
                toBigDecimal(aggregate.averageResolutionTimeMinutes()),
                toBigDecimal(aggregate.averageResponseTimeMinutes()),
                toBigDecimal(aggregate.averageBreachMinutes()),
                buildSeveritySummary(fromDateTime, toDateExclusive),
                Map.of()
        );
    }

    public NagiosBreachedTicketsCountDto fetchBreachedTicketsCountInLastNDays(int days) {
        return new NagiosBreachedTicketsCountDto(
                "ticketing-system",
                Instant.now(),
                days,
                getBreachedTicketsCountInLastNDays(days)
        );
    }

    public long getBreachedTicketsCountInLastNDays(int days) {
        if (days <= 0) {
            throw new IllegalArgumentException("days must be greater than 0");
        }
        LocalDateTime toDateExclusive = LocalDateTime.now();
        LocalDateTime fromDateTime = toDateExclusive.minusDays(days);
        return ticketSlaRepository.countBreachedTicketsReportedBetween(fromDateTime, toDateExclusive);
    }

    public NagiosTicketSlaSummaryDto fetchSummaryDetailed(LocalDate fromDate, LocalDate toDate) {
        LocalDate effectiveToDate = toDate != null ? toDate : LocalDate.now();
        LocalDateTime fromDateTime = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime toDateInclusive = effectiveToDate.atTime(23, 59, 59);
        LocalDateTime toDateExclusive = effectiveToDate.plusDays(1).atStartOfDay();

        NagiosTicketSlaSummaryAggregateDto aggregate = ticketSlaRepository.fetchSummary(fromDateTime, toDateExclusive);

        long totalTickets = aggregate.totalTickets();
        long breachedTickets = aggregate.breachedTickets();
        long breachedTicketsInLast1Day = getBreachedTicketsCountInLastNDays(1);
        long breachedTicketsInLast3Days = getBreachedTicketsCountInLastNDays(3);
        long breachedTicketsInLast15Days = getBreachedTicketsCountInLastNDays(15);
        long breachedTicketsInLast30Days = getBreachedTicketsCountInLastNDays(30);
        BreachedTicketStatusCounts statusCounts = buildBreachedTicketStatusCounts(fromDateTime, toDateExclusive);
        long nonBreachedTickets = Math.max(totalTickets - breachedTickets, 0);

        BigDecimal breachPercentage = calculatePercentage(breachedTickets, totalTickets);
        BigDecimal compliancePercentage = calculatePercentage(nonBreachedTickets, totalTickets);

        LocalDateTime responseFromDate = fromDateTime != null ? fromDateTime : aggregate.minReportedDate();
        if (responseFromDate == null) {
            responseFromDate = toDateInclusive;
        }

        return new NagiosTicketSlaSummaryDto(
                "ticketing-system",
                Instant.now(),
                responseFromDate,
                toDateInclusive,
                totalTickets,
                breachedTickets,
                breachedTicketsInLast1Day,
                breachedTicketsInLast3Days,
                breachedTicketsInLast15Days,
                breachedTicketsInLast30Days,
                statusCounts.resolvedOrClosedBreachedTickets(),
                statusCounts.onHoldBreachedTickets(),
                statusCounts.pendingWithRequestorBreachedTickets(),
                statusCounts.pendingWithFciBreachedTickets(),
                statusCounts.pendingWithServiceProviderBreachedTickets(),
                statusCounts.openReopenedAssignedBreachedTickets(),
                nonBreachedTickets,
                breachPercentage,
                compliancePercentage,
                toBigDecimal(aggregate.averageResolutionTimeMinutes()),
                toBigDecimal(aggregate.averageResponseTimeMinutes()),
                toBigDecimal(aggregate.averageBreachMinutes()),
                buildSeveritySummary(fromDateTime, toDateExclusive),
                buildDetailedBreakdown(fromDateTime, toDateExclusive)
        );
    }

    private BreachedTicketStatusCounts buildBreachedTicketStatusCounts(LocalDateTime fromDateTime,
                                                                       LocalDateTime toDateExclusive) {
        return new BreachedTicketStatusCounts(
                ticketSlaRepository.countBreachedTicketsByStatuses(
                        fromDateTime,
                        toDateExclusive,
                        List.of(TicketStatus.RESOLVED, TicketStatus.CLOSED)
                ),
                ticketSlaRepository.countBreachedTicketsByStatuses(
                        fromDateTime,
                        toDateExclusive,
                        List.of(TicketStatus.ON_HOLD)
                ),
                ticketSlaRepository.countBreachedTicketsByStatuses(
                        fromDateTime,
                        toDateExclusive,
                        List.of(TicketStatus.PENDING_WITH_REQUESTER)
                ),
                ticketSlaRepository.countBreachedTicketsByStatuses(
                        fromDateTime,
                        toDateExclusive,
                        List.of(TicketStatus.PENDING_WITH_FCI)
                ),
                ticketSlaRepository.countBreachedTicketsByStatuses(
                        fromDateTime,
                        toDateExclusive,
                        List.of(TicketStatus.PENDING_WITH_SERVICE_PROVIDER)
                ),
                ticketSlaRepository.countBreachedTicketsByStatuses(
                        fromDateTime,
                        toDateExclusive,
                        List.of(TicketStatus.OPEN, TicketStatus.REOPENED, TicketStatus.ASSIGNED)
                )
        );
    }

    private record BreachedTicketStatusCounts(long resolvedOrClosedBreachedTickets,
                                              long onHoldBreachedTickets,
                                              long pendingWithRequestorBreachedTickets,
                                              long pendingWithFciBreachedTickets,
                                              long pendingWithServiceProviderBreachedTickets,
                                              long openReopenedAssignedBreachedTickets) {
    }

    private Map<String, Object> buildSeveritySummary(LocalDateTime fromDateTime,
                                                     LocalDateTime toDateExclusive) {
        Map<String, Object> severitySummary = new LinkedHashMap<>();
        putSeverityMetrics(severitySummary, "S1", 0L, 0L, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
        putSeverityMetrics(severitySummary, "S2", 0L, 0L, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
        putSeverityMetrics(severitySummary, "S3", 0L, 0L, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
        putSeverityMetrics(severitySummary, "S4", 0L, 0L, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);

        List<NagiosSeveritySlaAggregateView> severityAggregates = ticketSlaRepository.fetchSummaryBySeverity(fromDateTime, toDateExclusive);
        for (NagiosSeveritySlaAggregateView aggregate : severityAggregates) {
            String normalizedSeverity = normalizeSeverity(aggregate.getSeverity());
            if (normalizedSeverity == null) {
                continue;
            }

            long totalCount = aggregate.getTotalCount() != null ? aggregate.getTotalCount() : 0L;
            long breachCount = aggregate.getBreachCount() != null ? aggregate.getBreachCount() : 0L;

            putSeverityMetrics(
                    severitySummary,
                    normalizedSeverity,
                    totalCount,
                    breachCount,
                    calculatePercentage(breachCount, totalCount),
                    toBigDecimal(aggregate.getAverageResolutionTimeMinutes()),
                    toBigDecimal(aggregate.getAverageResponseTimeMinutes())
            );
        }
        return severitySummary;
    }

    private Map<String, Long> buildDetailedBreakdown(LocalDateTime fromDateTime, LocalDateTime toDateExclusive) {
        Map<String, Long> detailedBreakdown = new LinkedHashMap<>();

        ticketSlaRepository.fetchModuleCounts(fromDateTime, toDateExclusive)
                .forEach(row -> detailedBreakdown.put("Module - " + row.getGroupValue(), row.getTotalCount()));

        ticketSlaRepository.fetchIssueTypeCounts(fromDateTime, toDateExclusive)
                .forEach(row -> detailedBreakdown.put("Issue Type - " + row.getGroupValue(), row.getTotalCount()));

        return detailedBreakdown;
    }

    private void putSeverityMetrics(Map<String, Object> severitySummary,
                                    String severity,
                                    long totalCount,
                                    long breachCount,
                                    BigDecimal breachPercentage,
                                    BigDecimal averageResolutionTimeMinutes,
                                    BigDecimal averageResponseTimeMinutes) {
        severitySummary.put(severity + "TotalCount", totalCount);
        severitySummary.put(severity + "BreachCount", breachCount);
        severitySummary.put(severity + "BreachPercentage", breachPercentage);
        severitySummary.put(severity + "AverageResolutionTimeMinutes", averageResolutionTimeMinutes);
        severitySummary.put(severity + "AverageResponseTimeMinutes", averageResponseTimeMinutes);
    }

    private String normalizeSeverity(String severity) {
        if (severity == null) {
            return null;
        }
        String normalized = severity.toUpperCase();
        if (normalized.contains("S1")) {
            return "S1";
        }
        if (normalized.contains("S2")) {
            return "S2";
        }
        if (normalized.contains("S3")) {
            return "S3";
        }
        if (normalized.contains("S4")) {
            return "S4";
        }
        return null;
    }

    private BigDecimal calculateCompliance(long totalRecords, long breachedRecords) {
        if (totalRecords == 0) {
            return BigDecimal.valueOf(100);
        }
        BigDecimal compliant = BigDecimal.valueOf(totalRecords - breachedRecords)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(totalRecords), 2, RoundingMode.HALF_UP);
        return compliant.max(BigDecimal.ZERO);
    }

    private BigDecimal calculatePercentage(long numerator, long denominator) {
        if (denominator <= 0) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(numerator)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(denominator), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal toBigDecimal(Double value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP);
    }

    private NagiosTicketSlaRecordDto toRecord(TicketSla ticketSla) {
        Ticket ticket = ticketSla.getTicket();
        return new NagiosTicketSlaRecordDto(
                ticketSla.getId(),
                ticket != null ? ticket.getId() : null,
                ticket != null && ticket.getTicketStatus() != null ? ticket.getTicketStatus().name() : null,
                ticketSla.getBreachedByMinutes(),
                ticketSla.getResponseTimeMinutes(),
                ticketSla.getResolutionTimeMinutes(),
                ticketSla.getDueAt(),
                ticketSla.getActualDueAt(),
                ticketSla.getDueAtAfterEscalation()
        );
    }

    private int normalizeLimit(Integer limit) {
        if (limit == null || limit <= 0) {
            return DEFAULT_RECORD_LIMIT;
        }
        return Math.min(limit, MAX_RECORD_LIMIT);
    }
}
