package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.nagios.NagiosTicketSlaRecordDto;
import com.ticketingSystem.api.dto.nagios.NagiosTicketSlaSnapshotDto;
import com.ticketingSystem.api.dto.nagios.NagiosTicketSlaSummaryAggregateDto;
import com.ticketingSystem.api.dto.nagios.NagiosTicketSlaSummaryDto;
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
import java.util.List;

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
                nonBreachedTickets,
                breachPercentage,
                compliancePercentage,
                toBigDecimal(aggregate.averageResolutionTimeMinutes()),
                toBigDecimal(aggregate.averageResponseTimeMinutes()),
                toBigDecimal(aggregate.averageBreachMinutes())
        );
    }


    public NagiosTicketSlaSummaryDto fetchSummaryDetailed(LocalDate fromDate, LocalDate toDate) {
        LocalDate effectiveToDate = toDate != null ? toDate : LocalDate.now();
        LocalDateTime fromDateTime = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime toDateInclusive = effectiveToDate.atTime(23, 59, 59);
        LocalDateTime toDateExclusive = effectiveToDate.plusDays(1).atStartOfDay();

        NagiosTicketSlaSummaryAggregateDto aggregate = ticketSlaRepository.fetchSummary(fromDateTime, toDateExclusive);

        long totalTickets = aggregate.totalTickets();
        long breachedTickets = aggregate.breachedTickets();
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
                nonBreachedTickets,
                breachPercentage,
                compliancePercentage,
                toBigDecimal(aggregate.averageResolutionTimeMinutes()),
                toBigDecimal(aggregate.averageResponseTimeMinutes()),
                toBigDecimal(aggregate.averageBreachMinutes())
        );
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
