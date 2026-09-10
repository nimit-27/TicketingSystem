package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.StatusHistoryDto;
import com.ticketingSystem.api.dto.StatusTimestampUpdateRequest;
import com.ticketingSystem.api.dto.StatusTimestampPreviewDto;
import com.ticketingSystem.api.exception.InvalidRequestException;
import com.ticketingSystem.api.exception.TicketNotFoundException;
import com.ticketingSystem.api.mapper.DtoMapper;
import com.ticketingSystem.api.models.Status;
import com.ticketingSystem.api.models.StatusHistory;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.repository.StatusHistoryRepository;
import com.ticketingSystem.api.repository.StatusMasterRepository;
import com.ticketingSystem.api.repository.TicketRepository;
import com.ticketingSystem.api.repository.AssignmentHistoryRepository;
import com.ticketingSystem.api.repository.TicketHistoryRepository;
import com.ticketingSystem.calendar.service.SlaCalculatorService;
import com.ticketingSystem.calendar.util.TimeUtils;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class StatusHistoryService {
    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Kolkata");

    private final StatusHistoryRepository historyRepository;
    private final TicketRepository ticketRepository;
    private final StatusMasterRepository statusMasterRepository;
    private final AssignmentHistoryRepository assignmentHistoryRepository;
    private final TicketHistoryRepository ticketHistoryRepository;
    private final TicketSlaService ticketSlaService;
    private final SlaCalculatorService slaCalculatorService;

    public StatusHistoryService(StatusHistoryRepository historyRepository,
                                TicketRepository ticketRepository,
                                StatusMasterRepository statusMasterRepository,
                                AssignmentHistoryRepository assignmentHistoryRepository,
                                TicketHistoryRepository ticketHistoryRepository,
                                TicketSlaService ticketSlaService,
                                SlaCalculatorService slaCalculatorService) {
        this.historyRepository = historyRepository;
        this.ticketRepository = ticketRepository;
        this.statusMasterRepository = statusMasterRepository;
        this.assignmentHistoryRepository = assignmentHistoryRepository;
        this.ticketHistoryRepository = ticketHistoryRepository;
        this.ticketSlaService = ticketSlaService;
        this.slaCalculatorService = slaCalculatorService;
    }

    /**
     * Development-only timeline correction. Related legacy/unified history rows are kept
     * aligned and the SLA snapshot is rebuilt atomically.
     */
    @Transactional
    public StatusHistoryDto updateTimestamp(String historyId, StatusTimestampUpdateRequest request) {
        return applyTimestampUpdate(historyId, request, false);
    }

    @Transactional
    public StatusTimestampPreviewDto previewTimestamp(String historyId, StatusTimestampUpdateRequest request) {
        StatusHistory history = historyRepository.findById(historyId)
                .orElseThrow(() -> new InvalidRequestException("Status history entry was not found"));
        var currentSla = DtoMapper.toTicketSlaDto(ticketSlaService.getByTicketId(history.getTicket().getId()));
        applyTimestampUpdate(historyId, request, true);
        var newSla = DtoMapper.toTicketSlaDto(ticketSlaService.getByTicketId(history.getTicket().getId()));
        TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
        return new StatusTimestampPreviewDto(currentSla, newSla);
    }

    private StatusHistoryDto applyTimestampUpdate(String historyId, StatusTimestampUpdateRequest request,
                                                   boolean preview) {
        if (request == null || (request.timestamp() == null) == (request.addMinutes() == null)) {
            throw new InvalidRequestException("Provide exactly one of timestamp or addMinutes");
        }
        if (request.addMinutes() != null && request.addMinutes() < 0) {
            throw new InvalidRequestException("addMinutes must be zero or greater");
        }

        StatusHistory history = historyRepository.findById(historyId)
                .orElseThrow(() -> new InvalidRequestException("Status history entry was not found"));
        Ticket ticket = history.getTicket();
        LocalDateTime oldTimestamp = history.getTimestamp();
        LocalDateTime newTimestamp = request.timestamp() != null
                ? request.timestamp()
                : slaCalculatorService.computeEnd(
                        oldTimestamp.atZone(TimeUtils.ZONE_ID),
                        java.time.Duration.ofMinutes(request.addMinutes()))
                    .toLocalDateTime();

        List<StatusHistory> ordered = historyRepository.findByTicketOrderByTimestampAsc(ticket);
        LocalDateTime previous = null;
        LocalDateTime next = null;
        for (StatusHistory item : ordered) {
            if (item.getId().equals(historyId)) continue;
            if (!item.getTimestamp().isAfter(oldTimestamp)) previous = item.getTimestamp();
            if (item.getTimestamp().isAfter(oldTimestamp)) { next = item.getTimestamp(); break; }
        }
        // Rows emitted by one ticket update are written a few milliseconds apart. Treat
        // that small window as one event rather than accidentally using its companion
        // row as the upper bound.
        LocalDateTime eventWindowEnd = oldTimestamp.plusSeconds(5);
        LocalDateTime nextTicketHistory = ticketHistoryRepository
                .findFirstByTicketIdAndUpdatedOnAfterOrderByUpdatedOnAsc(ticket.getId(), eventWindowEnd)
                .map(com.ticketingSystem.api.models.TicketHistory::getUpdatedOn).orElse(null);
        LocalDateTime upperBound = next == null || (nextTicketHistory != null && nextTicketHistory.isBefore(next))
                ? nextTicketHistory : next;
        if (previous != null && newTimestamp.isBefore(previous)) {
            throw new InvalidRequestException("Timestamp cannot be before the previous status history timestamp");
        }
        if (upperBound != null && newTimestamp.isAfter(upperBound)) {
            throw new InvalidRequestException("Timestamp cannot exceed the next ticket history timestamp: " + upperBound);
        }

        history.setTimestamp(newTimestamp);
        history.setTimestampUtc(newTimestamp.atZone(BUSINESS_ZONE).toInstant());
        historyRepository.save(history);

        var linkedRows = ticketHistoryRepository.findBySourceTableAndSourceHistoryId("status_history", historyId);
        if (linkedRows.isEmpty()) {
            linkedRows = ticketHistoryRepository.findByTicketIdAndUpdatedOnBetween(
                    ticket.getId(), oldTimestamp.minusSeconds(5), eventWindowEnd);
        }
        linkedRows.forEach(row -> {
            row.setUpdatedOn(newTimestamp);
            row.setUpdatedOnUtc(newTimestamp.atZone(BUSINESS_ZONE).toInstant());
        });
        ticketHistoryRepository.saveAll(linkedRows);

        var assignments = assignmentHistoryRepository.findByTicketAndTimestampBetween(
                ticket, oldTimestamp.minusSeconds(5), eventWindowEnd);
        assignments.forEach(row -> row.setTimestamp(newTimestamp));
        assignmentHistoryRepository.saveAll(assignments);
        for (var assignment : assignments) {
            var rows = ticketHistoryRepository.findBySourceTableAndSourceHistoryId("assignment_history", assignment.getId());
            rows.forEach(row -> {
                row.setUpdatedOn(newTimestamp);
                row.setUpdatedOnUtc(newTimestamp.atZone(BUSINESS_ZONE).toInstant());
            });
            ticketHistoryRepository.saveAll(rows);
        }

        if (Objects.equals(ticket.getResolvedAt(), oldTimestamp)) ticket.setResolvedAt(newTimestamp);
        if (Objects.equals(ticket.getLastModifiedStatusDate(), oldTimestamp)) {
            ticket.setLastModifiedStatusDate(newTimestamp);
            ticket.setLastModifiedStatusDateUtc(newTimestamp.atZone(BUSINESS_ZONE).toInstant());
        }
        ticketRepository.save(ticket);
        if (preview) {
            ticketSlaService.calculatePreviewByCalendarFromScratch(
                    ticket, historyRepository.findByTicketOrderByTimestampAsc(ticket));
        } else {
            ticketSlaService.calculateAndSaveByCalendarFromScratch(
                    ticket, historyRepository.findByTicketOrderByTimestampAsc(ticket));
        }
        return getHistoryForTicket(ticket.getId()).stream()
                .filter(item -> historyId.equals(item.getId())).findFirst().orElseThrow();
    }

    public StatusHistory addHistory(String ticketId, String updatedBy, String previousStatus, String currentStatus, Boolean slaFlag, String remark) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));
        StatusHistory history = new StatusHistory();
        history.setTicket(ticket);
        history.setUpdatedBy(updatedBy);
        history.setPreviousStatus(previousStatus);
        history.setCurrentStatus(currentStatus);
        // Keep the existing local timestamp for backward compatibility, and also persist
        // an Instant-based UTC timestamp for reliable ordering/comparison across time zones.
        Instant timestampUtc = Instant.now();
        LocalDateTime timestamp = LocalDateTime.ofInstant(timestampUtc, BUSINESS_ZONE);
        history.setTimestamp(timestamp);
        history.setTimestampUtc(timestampUtc);
        history.setCreatedAtUtc(timestampUtc);
        history.setSlaFlag(slaFlag);
        history.setRemark(remark);
        return historyRepository.save(history);
    }

    public List<StatusHistoryDto> getHistoryForTicket(String ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));
        List<StatusHistory> histories = historyRepository.findByTicketOrderByTimestampAsc(ticket);

        Set<String> statusIds = histories.stream()
                .map(StatusHistory::getCurrentStatus)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<String, Status> statusById = statusMasterRepository.findAllById(statusIds).stream()
                .collect(Collectors.toMap(Status::getStatusId, Function.identity()));

        return histories.stream()
                .map(history -> {
                    StatusHistoryDto dto = DtoMapper.toStatusHistoryDto(history);
                    String currentStatus = dto.getCurrentStatus();
                    if (currentStatus != null) {
                        Status status = statusById.get(currentStatus);
                        if (status == null) {
                            status = statusMasterRepository.findByStatusCode(currentStatus);
                        }
                        if (status != null) {
                            dto.setStatusName(status.getStatusName());
                            dto.setLabel(status.getLabel());
                        }
                    }
                    return dto;
                })
                .collect(Collectors.toUnmodifiableList());
    }
}
