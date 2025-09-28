package com.example.api.service;

import com.example.api.models.SlaConfig;
import com.example.api.models.StatusHistory;
import com.example.api.models.Ticket;
import com.example.api.models.TicketSla;
import com.example.api.models.User;
import com.example.api.repository.SlaConfigRepository;
import com.example.api.repository.StatusHistoryRepository;
import com.example.api.repository.TicketSlaRepository;
import com.example.api.repository.UserRepository;
import com.example.notification.enums.ChannelType;
import com.example.notification.service.NotificationService;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class TicketSlaService {
    private static final Logger log = LoggerFactory.getLogger(TicketSlaService.class);
    private static final String SLA_BREACHED_NOTIFICATION_CODE = "TICKET_SLA_BREACHED";
    private final SlaConfigRepository slaConfigRepository;
    private final TicketSlaRepository ticketSlaRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public TicketSlaService(SlaConfigRepository slaConfigRepository,
                            TicketSlaRepository ticketSlaRepository,
                            StatusHistoryRepository statusHistoryRepository,
                            NotificationService notificationService,
                            UserRepository userRepository) {
        this.slaConfigRepository = slaConfigRepository;
        this.ticketSlaRepository = ticketSlaRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
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
        Long previousBreached = ticketSla.getBreachedByMinutes();
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
        TicketSla saved = ticketSlaRepository.save(ticketSla);

        boolean hasBreached = breachedBy > 0;
        boolean breachJustOccurred = hasBreached && (previousBreached == null || previousBreached <= 0);
        if (breachJustOccurred) {
            notifyAssigneeOfSlaBreach(ticket, breachedBy, effectiveDueAt);
        }

        return saved;
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

    private void notifyAssigneeOfSlaBreach(Ticket ticket, long breachedByMinutes, LocalDateTime dueAt) {
        if (ticket == null) {
            return;
        }

        String assigneeIdentifier = ticket.getAssignedTo();
        if (assigneeIdentifier == null || assigneeIdentifier.isBlank()) {
            return;
        }

        Optional<User> assignee = findUserByIdOrUsername(assigneeIdentifier);
        Map<String, Object> data = new HashMap<>();
        data.put("ticketId", ticket.getId());
        data.put("ticketNumber", ticket.getId());
        data.put("breachedByMinutes", breachedByMinutes);
        data.put("breachedAt", DateTimeFormatter.ISO_LOCAL_DATE_TIME.format(LocalDateTime.now()));
        if (dueAt != null) {
            data.put("dueAt", DateTimeFormatter.ISO_LOCAL_DATE_TIME.format(dueAt));
        }

        assignee.ifPresent(user -> {
            if (user.getName() != null && !user.getName().isBlank()) {
                data.put("assigneeName", user.getName());
            } else if (user.getUsername() != null && !user.getUsername().isBlank()) {
                data.put("assigneeName", user.getUsername());
            }
        });
        if (!data.containsKey("assigneeName")) {
            data.put("assigneeName", assigneeIdentifier);
        }

        String recipient = assignee
                .map(this::resolveRecipientIdentifier)
                .orElse(assigneeIdentifier);

        try {
            notificationService.sendNotification(
                    ChannelType.IN_APP,
                    SLA_BREACHED_NOTIFICATION_CODE,
                    data,
                    recipient
            );
        } catch (Exception ex) {
            log.warn("Failed to send SLA breach notification for ticket {} to recipient {}", ticket.getId(), recipient, ex);
        }
    }

    private Optional<User> findUserByIdOrUsername(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return Optional.empty();
        }

        Optional<User> byId = userRepository.findById(identifier);
        if (byId.isPresent()) {
            return byId;
        }
        return userRepository.findByUsername(identifier);
    }

    private String resolveRecipientIdentifier(User user) {
        if (user == null) {
            return null;
        }
        if (user.getUserId() != null && !user.getUserId().isBlank()) {
            return user.getUserId();
        }
        if (user.getUsername() != null && !user.getUsername().isBlank()) {
            return user.getUsername();
        }
        if (user.getEmailId() != null && !user.getEmailId().isBlank()) {
            return user.getEmailId();
        }
        return null;
    }
}
