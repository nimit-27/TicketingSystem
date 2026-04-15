package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.nagios.NagiosTicketSlaRecordDto;
import com.ticketingSystem.api.dto.nagios.NagiosTicketSlaSnapshotDto;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.models.TicketSla;
import com.ticketingSystem.api.repository.TicketSlaRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
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

    private BigDecimal calculateCompliance(long totalRecords, long breachedRecords) {
        if (totalRecords == 0) {
            return BigDecimal.valueOf(100);
        }
        BigDecimal compliant = BigDecimal.valueOf(totalRecords - breachedRecords)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(totalRecords), 2, RoundingMode.HALF_UP);
        return compliant.max(BigDecimal.ZERO);
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
