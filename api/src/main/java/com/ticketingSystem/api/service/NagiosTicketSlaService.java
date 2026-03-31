package com.ticketingSystem.api.service;

import com.ticketingSystem.api.config.NagiosMonitoringProperties;
import com.ticketingSystem.api.dto.nagios.NagiosTicketSlaRecordDto;
import com.ticketingSystem.api.dto.nagios.NagiosTicketSlaSnapshotDto;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.models.TicketSla;
import com.ticketingSystem.api.repository.TicketSlaRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.Objects;

@Service
public class NagiosTicketSlaService {
    private static final int MAX_RECORD_LIMIT = 500;
    private static final int DEFAULT_RECORD_LIMIT = 200;

    private final TicketSlaRepository ticketSlaRepository;
    private final NagiosMonitoringProperties nagiosMonitoringProperties;

    public NagiosTicketSlaService(TicketSlaRepository ticketSlaRepository,
                                  NagiosMonitoringProperties nagiosMonitoringProperties) {
        this.ticketSlaRepository = ticketSlaRepository;
        this.nagiosMonitoringProperties = nagiosMonitoringProperties;
    }

    public NagiosTicketSlaSnapshotDto fetchSnapshot(Authentication authentication,
                                                    String providedApiKey,
                                                    Integer limit) {
        String clientId = resolveClientId(authentication);
        validateAllowedClient(clientId);
        validateApiKey(providedApiKey);

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
                ticket != null ? ticket.getTicketNumber() : null,
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

    private String resolveClientId(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Client token is missing or invalid");
        }
        return authentication.getPrincipal().toString();
    }

    private void validateAllowedClient(String clientId) {
        List<String> allowedClientIds = nagiosMonitoringProperties.getAllowedClientIds();
        if (allowedClientIds == null || allowedClientIds.isEmpty()) {
            return;
        }
        boolean allowed = allowedClientIds.stream()
                .filter(Objects::nonNull)
                .anyMatch(clientId::equals);
        if (!allowed) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Client is not allowed for Nagios monitoring");
        }
    }

    private void validateApiKey(String providedApiKey) {
        String configuredApiKey = nagiosMonitoringProperties.getApiKey();
        if (configuredApiKey == null || configuredApiKey.isBlank()) {
            return;
        }
        if (!configuredApiKey.equals(providedApiKey)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Nagios API key is missing or invalid");
        }
    }
}
