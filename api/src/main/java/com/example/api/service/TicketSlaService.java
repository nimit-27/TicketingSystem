package com.example.api.service;

import com.example.api.models.SlaConfig;
import com.example.api.models.StatusHistory;
import com.example.api.models.Ticket;
import com.example.api.models.TicketSla;
import com.example.api.repository.SlaConfigRepository;
import com.example.api.repository.StatusHistoryRepository;
import com.example.api.repository.TicketSlaRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
public class TicketSlaService {
    private final SlaConfigRepository slaConfigRepository;
    private final TicketSlaRepository ticketSlaRepository;
    private final StatusHistoryRepository statusHistoryRepository;

    public TicketSlaService(SlaConfigRepository slaConfigRepository,
                            TicketSlaRepository ticketSlaRepository,
                            StatusHistoryRepository statusHistoryRepository) {
        this.slaConfigRepository = slaConfigRepository;
        this.ticketSlaRepository = ticketSlaRepository;
        this.statusHistoryRepository = statusHistoryRepository;
    }

    public TicketSla calculateAndSave(Ticket ticket, List<StatusHistory> history) {
        if (ticket == null) return null;

        SlaConfig config = slaConfigRepository.findBySeverityLevel(ticket.getSeverity())
                .orElse(null);
        if (config == null) {
            throw new IllegalStateException("SLA configuration not found for severity: " + ticket.getSeverity());
        }

        LocalDateTime reportedDate = ticket.getReportedDate();

        long resolutionPolicy = config.getResolutionMinutes() != null
                ? config.getResolutionMinutes() : 0L;
        LocalDateTime baseDueAt = reportedDate != null ? reportedDate.plusMinutes(resolutionPolicy) : null;

        List<StatusHistory> orderedHistory = history != null
                ? new ArrayList<>(history)
                : new ArrayList<>();
        orderedHistory.removeIf(h -> h == null || h.getTimestamp() == null);
        orderedHistory.sort(Comparator.comparing(StatusHistory::getTimestamp));

//        START OF RESOLUTION TIME
        LocalDateTime assignTime = orderedHistory.stream()
                .filter(h -> Boolean.TRUE.equals(h.getSlaFlag()))
                .map(StatusHistory::getTimestamp)
                .filter(Objects::nonNull)
                .findFirst()
                .orElseGet(() -> null);

        long responseMinutes = 0L;
        if (reportedDate != null && assignTime != null) {
            responseMinutes = Math.max(Duration.between(reportedDate, assignTime).toMinutes(), 0L);
        }

        LocalDateTime endTime = ticket.getResolvedAt() != null ? ticket.getResolvedAt() : LocalDateTime.now();
        long elapsed = 0L;
        if (reportedDate != null) {
            elapsed = Math.max(Duration.between(reportedDate, endTime).toMinutes(), 0L);
        }

        long resolution = 0L;
        long idle = 0L;
        LocalDateTime prevTime = reportedDate != null ? reportedDate : assignTime;
        Boolean prevFlag = Boolean.FALSE;

        for (StatusHistory sh : orderedHistory) {
            LocalDateTime timestamp = sh.getTimestamp();
            if (timestamp == null || prevTime == null) {
                prevTime = timestamp != null ? timestamp : prevTime;
                prevFlag = sh.getSlaFlag();
                continue;
            }
            long diff = Math.max(Duration.between(prevTime, timestamp).toMinutes(), 0L);
            if (Boolean.TRUE.equals(prevFlag)) {
                resolution += diff;
            } else {
                idle += diff;
            }
            prevTime = timestamp;
            prevFlag = sh.getSlaFlag();
        }

        if (prevTime == null) {
            prevTime = reportedDate != null ? reportedDate : endTime;
        }
        long finalDiff = Math.max(Duration.between(prevTime, endTime).toMinutes(), 0L);
        if (Boolean.TRUE.equals(prevFlag)) {
            resolution += finalDiff;
        } else {
            idle += finalDiff;
        }

//        if (elapsed > 0 && resolution > elapsed) {
//            resolution = elapsed;
//        }
//        if (elapsed > 0) {
//            idle = Math.max(elapsed - resolution, idle);
//        }

        TicketSla ticketSla = ticketSlaRepository.findByTicket_Id(ticket.getId())
                .orElseGet(TicketSla::new);
        LocalDateTime existingActualDueAt = ticketSla.getActualDueAt();
        if (existingActualDueAt == null) {
            existingActualDueAt = ticketSla.getDueAt() != null ? ticketSla.getDueAt() : baseDueAt;
        }

        boolean severityChanged = ticketSla.getSlaConfig() != null
                && config != null
                && !Objects.equals(ticketSla.getSlaConfig().getId(), config.getId());

        LocalDateTime escalatedDueAt = ticketSla.getDueAtAfterEscalation();
        if (severityChanged) {
            escalatedDueAt = baseDueAt;
        }

        LocalDateTime effectiveDueAt = escalatedDueAt != null ? escalatedDueAt : baseDueAt;

        long allowedMinutes = 0L;
        if (reportedDate != null && effectiveDueAt != null) {
            allowedMinutes = Math.max(Duration.between(reportedDate, effectiveDueAt).toMinutes(), 0L);
        }
        long breachedBy = resolution - allowedMinutes;
        long timeTillDueDate = allowedMinutes - resolution;

        ticketSla.setTicket(ticket);
        ticketSla.setSlaConfig(config);
        ticketSla.setDueAt(effectiveDueAt);
        ticketSla.setActualDueAt(existingActualDueAt);
        ticketSla.setDueAtAfterEscalation(escalatedDueAt);
        ticketSla.setResolutionTimeMinutes(resolution);
        ticketSla.setElapsedTimeMinutes(elapsed);
        ticketSla.setResponseTimeMinutes(responseMinutes);
        ticketSla.setBreachedByMinutes(breachedBy);
        ticketSla.setIdleTimeMinutes(idle);
        ticketSla.setCreatedAt(ticket.getReportedDate());
        if (reportedDate != null && effectiveDueAt != null) {
            ticketSla.setTotalSlaMinutes(Duration.between(reportedDate, effectiveDueAt).toMinutes());
        } else {
            ticketSla.setTotalSlaMinutes(null);
        }
        ticketSla.setTimeTillDueDate(timeTillDueDate > 0 ? timeTillDueDate : 0L);
        return ticketSlaRepository.save(ticketSla);
    }

    public TicketSla getByTicketId(String ticketId) {
        return ticketSlaRepository.findByTicket_Id(ticketId)
                .map(existing -> {
                    Ticket ticket = existing.getTicket();
                    if (ticket == null) {
                        return existing;
                    }
                    List<StatusHistory> history = statusHistoryRepository.findByTicketOrderByTimestampDesc(ticket);
                    TicketSla refreshed = calculateAndSave(ticket, history);
                    if (refreshed.getCreatedAt() == null) {
                        refreshed.setCreatedAt(ticket.getReportedDate());
                    }
                    if (refreshed.getTotalSlaMinutes() == null && ticket.getReportedDate() != null && refreshed.getDueAt() != null) {
                        refreshed.setTotalSlaMinutes(Duration.between(ticket.getReportedDate(), refreshed.getDueAt()).toMinutes());
                    }
                    return refreshed;
                })
                .orElse(null);
    }
}
