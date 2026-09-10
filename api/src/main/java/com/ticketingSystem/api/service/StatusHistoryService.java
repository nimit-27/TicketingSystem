package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.StatusHistoryDto;
import com.ticketingSystem.api.dto.UpdateStatusTimestampRequest;
import com.ticketingSystem.api.dto.StatusTimestampPreviewDto;
import com.ticketingSystem.api.exception.InvalidRequestException;
import com.ticketingSystem.api.models.AssignmentHistory;
import com.ticketingSystem.api.models.TicketHistory;
import com.ticketingSystem.api.repository.AssignmentHistoryRepository;
import com.ticketingSystem.api.repository.TicketHistoryRepository;
import com.ticketingSystem.api.service.TicketSlaService;
import com.ticketingSystem.calendar.service.SlaCalculatorService;
import com.ticketingSystem.api.exception.TicketNotFoundException;
import com.ticketingSystem.api.mapper.DtoMapper;
import com.ticketingSystem.api.models.Status;
import com.ticketingSystem.api.models.StatusHistory;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.repository.StatusHistoryRepository;
import com.ticketingSystem.api.repository.StatusMasterRepository;
import com.ticketingSystem.api.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Comparator;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.time.Duration;

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
    private final boolean developerMode;

    public StatusHistoryService(StatusHistoryRepository historyRepository,
                                TicketRepository ticketRepository,
                                StatusMasterRepository statusMasterRepository,
                                AssignmentHistoryRepository assignmentHistoryRepository,
                                TicketHistoryRepository ticketHistoryRepository,
                                TicketSlaService ticketSlaService,
                                SlaCalculatorService slaCalculatorService,
                                @Value("${app.developerMode:false}") boolean developerMode) {
        this.historyRepository = historyRepository;
        this.ticketRepository = ticketRepository;
        this.statusMasterRepository = statusMasterRepository;
        this.assignmentHistoryRepository = assignmentHistoryRepository;
        this.ticketHistoryRepository = ticketHistoryRepository;
        this.ticketSlaService = ticketSlaService;
        this.slaCalculatorService = slaCalculatorService;
        this.developerMode = developerMode;
    }

    @Transactional
    public StatusHistoryDto updateTimestamp(String historyId, UpdateStatusTimestampRequest request) {
        return applyTimestamp(historyId, request, false).history();
    }

    @Transactional
    public StatusTimestampPreviewDto previewTimestamp(String historyId, UpdateStatusTimestampRequest request) {
        StatusTimestampPreviewDto preview = applyTimestamp(historyId, request, true);
        TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
        return preview;
    }

    private StatusTimestampPreviewDto applyTimestamp(String historyId, UpdateStatusTimestampRequest request, boolean preview) {
        if (!developerMode) {
            throw new InvalidRequestException("Status timestamps can only be edited in developer mode");
        }
        if (request == null || (request.getTimestamp() == null) == (request.getAddMinutes() == null)) {
            throw new InvalidRequestException("Provide either timestamp or addMinutes, but not both");
        }
        StatusHistory history = historyRepository.findById(historyId)
                .orElseThrow(() -> new InvalidRequestException("Status history not found: " + historyId));
        LocalDateTime oldTimestamp = history.getTimestamp();
        if (oldTimestamp == null) {
            throw new InvalidRequestException("The status history does not have a timestamp");
        }

        LocalDateTime newTimestamp;
        if (request.getAddMinutes() != null) {
            if (request.getAddMinutes() < 0) {
                throw new InvalidRequestException("addMinutes must not be negative");
            }
            newTimestamp = slaCalculatorService.computeEnd(
                    oldTimestamp.atZone(BUSINESS_ZONE), Duration.ofMinutes(request.getAddMinutes()))
                    .toLocalDateTime();
        } else {
            newTimestamp = request.getTimestamp();
        }

        LocalDateTime matchFrom = oldTimestamp.minusMinutes(1);
        LocalDateTime matchTo = oldTimestamp.plusMinutes(1);
        List<TicketHistory> ticketRows = ticketHistoryRepository.findBySourceTableAndSourceHistoryId("status_history", historyId);
        if (ticketRows.isEmpty()) {
            List<TicketHistory> candidates = ticketHistoryRepository
                    .findByTicketIdAndUpdatedOnBetween(history.getTicket().getId(), matchFrom, matchTo);
            String closestGroup = candidates.stream()
                    .filter(row -> row.getUpdatedOn() != null)
                    .min(Comparator.comparingLong(row -> Math.abs(Duration.between(oldTimestamp, row.getUpdatedOn()).toMillis())))
                    .map(TicketHistory::getUpdateGroupId).orElse(null);
            ticketRows = closestGroup == null ? List.of() : candidates.stream()
                    .filter(row -> closestGroup.equals(row.getUpdateGroupId())).toList();
        }
        Set<Long> relatedTicketHistoryIds = ticketRows.stream()
                .map(TicketHistory::getTicketHistoryId).filter(Objects::nonNull).collect(Collectors.toSet());
        LocalDateTime nextStatusTimestamp = historyRepository
                .findFirstByTicketAndTimestampAfterOrderByTimestampAsc(history.getTicket(), oldTimestamp)
                .map(StatusHistory::getTimestamp).orElse(null);
        LocalDateTime nextTicketHistoryTimestamp = ticketHistoryRepository
                .findByTicketIdOrderByUpdatedOnAsc(history.getTicket().getId()).stream()
                .filter(row -> row.getUpdatedOn() != null && row.getUpdatedOn().isAfter(oldTimestamp))
                .filter(row -> !relatedTicketHistoryIds.contains(row.getTicketHistoryId()))
                .map(TicketHistory::getUpdatedOn).findFirst().orElse(null);
        LocalDateTime upperBound = earliest(nextStatusTimestamp, nextTicketHistoryTimestamp);
        if (upperBound != null && newTimestamp.isAfter(upperBound)) {
            throw new InvalidRequestException("Timestamp cannot exceed the next ticket history timestamp (" + upperBound + ")");
        }
        for (TicketHistory row : ticketRows) {
            row.setUpdatedOn(newTimestamp);
            row.setUpdatedOnUtc(newTimestamp.atZone(BUSINESS_ZONE).toInstant());
        }
        List<AssignmentHistory> assignmentCandidates = assignmentHistoryRepository
                .findByTicketAndTimestampBetween(history.getTicket(), matchFrom, matchTo);
        AssignmentHistory assignmentRow = assignmentCandidates.stream()
                .filter(row -> row.getTimestamp() != null)
                .min(Comparator.comparingLong(row -> Math.abs(Duration.between(oldTimestamp, row.getTimestamp()).toMillis())))
                .orElse(null);
        List<AssignmentHistory> assignmentRows = assignmentRow == null ? List.of() : List.of(assignmentRow);
        assignmentRows.forEach(row -> row.setTimestamp(newTimestamp));

        history.setTimestamp(newTimestamp);
        history.setTimestampUtc(newTimestamp.atZone(BUSINESS_ZONE).toInstant());
        historyRepository.save(history);
        ticketHistoryRepository.saveAll(ticketRows);
        assignmentHistoryRepository.saveAll(assignmentRows);
        var recalculatedSla = preview
                ? ticketSlaService.previewByCalendarFromScratch(
                        history.getTicket(), historyRepository.findByTicketOrderByTimestampAsc(history.getTicket()))
                : ticketSlaService.calculateAndSaveByCalendarFromScratch(
                        history.getTicket(), historyRepository.findByTicketOrderByTimestampAsc(history.getTicket()));
        return new StatusTimestampPreviewDto(
                DtoMapper.toStatusHistoryDto(history), DtoMapper.toTicketSlaDto(recalculatedSla));
    }

    private LocalDateTime earliest(LocalDateTime first, LocalDateTime second) {
        if (first == null) return second;
        if (second == null) return first;
        return first.isBefore(second) ? first : second;
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
