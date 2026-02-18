package com.ticketingSystem.api.service;

import com.ticketingSystem.api.models.SlaConfig;
import com.ticketingSystem.api.models.StatusHistory;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.models.TicketSla;
import com.ticketingSystem.api.models.User;
import com.ticketingSystem.api.util.RoleUtils;
import com.ticketingSystem.api.repository.SlaConfigRepository;
import com.ticketingSystem.api.repository.StatusHistoryRepository;
import com.ticketingSystem.api.repository.TicketSlaRepository;
import com.ticketingSystem.api.repository.UserRepository;
import com.ticketingSystem.calendar.service.SlaCalculatorService;
import com.ticketingSystem.calendar.util.TimeUtils;
import com.ticketingSystem.notification.enums.ChannelType;
import com.ticketingSystem.notification.service.NotificationService;
import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Service;

import java.sql.Time;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

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
    private final SlaCalculatorService slaCalculatorService;
    private final IssueTypeService issueTypeService;

    public TicketSlaService(SlaConfigRepository slaConfigRepository,
                            TicketSlaRepository ticketSlaRepository,
                            StatusHistoryRepository statusHistoryRepository,
                            NotificationService notificationService,
                            UserRepository userRepository,
                            SlaCalculatorService slaCalculatorService,
                            IssueTypeService issueTypeService) {
        this.slaConfigRepository = slaConfigRepository;
        this.ticketSlaRepository = ticketSlaRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
        this.slaCalculatorService = slaCalculatorService;
        this.issueTypeService = issueTypeService;
    }

    @Deprecated(forRemoval = false)
    public TicketSla calculateAndSave(Ticket ticket, List<StatusHistory> history) {
        return calculateAndSaveByCalendar(ticket, history);
    }

    public TicketSla calculateAndSaveByCalendar(Ticket ticket, List<StatusHistory> history) {
        return calculateAndSaveByCalendarInternal(ticket, history, false);
    }

    public TicketSla calculateAndSaveByCalendarFromScratch(Ticket ticket, List<StatusHistory> history) {
        return calculateAndSaveByCalendarInternal(ticket, history, true);
    }

    private TicketSla calculateAndSaveByCalendarInternal(Ticket ticket, List<StatusHistory> history, boolean fromScratch) {
        if (ticket == null) return null;

        LocalDateTime reportedDate = ticket.getReportedDate();
        LocalDateTime resolvedAt = ticket.getResolvedAt();
        LocalDateTime calculationTime = resolvedAt != null ? resolvedAt : LocalDateTime.now();

        if (ticket.getMasterId() != null && !ticket.getMasterId().isBlank()) {
            long idleMinutes = 0L;
            if (reportedDate != null) {
                Duration workingElapsed = slaCalculatorService.computeWorkingDurationBetween(
                        reportedDate.atZone(TimeUtils.ZONE_ID),
                        calculationTime.atZone(TimeUtils.ZONE_ID)
                );
                idleMinutes = Math.max(workingElapsed.toMinutes(), 0L);
            }

            TicketSla ticketSla = ticketSlaRepository.findByTicket_Id(ticket.getId())
                    .orElseGet(TicketSla::new);

            ticketSla.setTicket(ticket);
            ticketSla.setSlaConfig(null);
            ticketSla.setDueAt(null);
            ticketSla.setActualDueAt(null);
            ticketSla.setDueAtAfterEscalation(null);
            ticketSla.setResolutionTimeMinutes(0L);
            ticketSla.setElapsedTimeMinutes(idleMinutes);
            ticketSla.setResponseTimeMinutes(0L);
            ticketSla.setBreachedByMinutes(0L);
            ticketSla.setIdleTimeMinutes(idleMinutes);
            ticketSla.setCreatedAt(ticket.getReportedDate());
            ticketSla.setTotalSlaMinutes(null);
            ticketSla.setTimeTillDueDate(null);
            ticketSla.setWorkingTimeLeftMinutes(null);

            return ticketSlaRepository.save(ticketSla);
        }

        if (!issueTypeService.isSlaEnabledForIssueType(ticket.getIssueTypeId())) {
            long idleMinutes = 0L;
            if (reportedDate != null) {
                Duration workingElapsed = slaCalculatorService.computeWorkingDurationBetween(
                        reportedDate.atZone(TimeUtils.ZONE_ID),
                        calculationTime.atZone(TimeUtils.ZONE_ID)
                );
                idleMinutes = Math.max(workingElapsed.toMinutes(), 0L);
            }

            TicketSla ticketSla = ticketSlaRepository.findByTicket_Id(ticket.getId())
                    .orElseGet(TicketSla::new);

            ticketSla.setTicket(ticket);
            ticketSla.setSlaConfig(null);
            ticketSla.setDueAt(null);
            ticketSla.setActualDueAt(null);
            ticketSla.setDueAtAfterEscalation(null);
            ticketSla.setResolutionTimeMinutes(0L);
            ticketSla.setElapsedTimeMinutes(idleMinutes);
            ticketSla.setResponseTimeMinutes(0L);
            ticketSla.setBreachedByMinutes(0L);
            ticketSla.setIdleTimeMinutes(idleMinutes);
            ticketSla.setCreatedAt(ticket.getReportedDate());
            ticketSla.setTotalSlaMinutes(null);
            ticketSla.setTimeTillDueDate(null);
            ticketSla.setWorkingTimeLeftMinutes(null);

            return ticketSlaRepository.save(ticketSla);
        }

        SlaConfig config = slaConfigRepository.findBySeverityLevel(ticket.getSeverity())
                .orElse(null);
        if (config == null) {
            throw new IllegalStateException("SLA configuration not found for severity: " + ticket.getSeverity());
        }

        long resolutionPolicy = Objects.requireNonNullElse(config.getResolutionMinutes(), 0L);
//        long resolutionPolicy = config.getResolutionMinutes() != null
//                ? config.getResolutionMinutes() : 0L;
        LocalDateTime baseDueAt = computeCalendarEnd(reportedDate, resolutionPolicy);

        List<StatusHistory> orderedHistory = history != null
                ? new ArrayList<>(history)
                : new ArrayList<>();
        orderedHistory.removeIf(h -> h == null || h.getTimestamp() == null);
        if (resolvedAt != null) {
            orderedHistory.removeIf(h -> h.getTimestamp().isAfter(resolvedAt));
        }
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
            Duration responseMinutesDuration = slaCalculatorService.computeWorkingDurationBetween(
                    reportedDate.atZone(TimeUtils.ZONE_ID),
                    assignTime.atZone(TimeUtils.ZONE_ID)
            );
            responseMinutes = Math.max(responseMinutesDuration.toMinutes(), 0L);
        }

        LocalDateTime endTime = resolvedAt != null ? resolvedAt : calculationTime;
        long elapsed = 0L;
        if (reportedDate != null) {
            Duration workingElapsed = slaCalculatorService.computeWorkingDurationBetween(
                    reportedDate.atZone(TimeUtils.ZONE_ID),
                    endTime.atZone(TimeUtils.ZONE_ID)
            );
            elapsed = Math.max(workingElapsed.toMinutes(), 0L);
        }

        long resolution = 0L;
        long idle = 0L;

//        IF STATUS HISTORY LIST HAS ONLY 1 ELEMENT
        if (orderedHistory.size() == 1) {
            StatusHistory item = orderedHistory.get(0);
            LocalDateTime timestamp = item.getTimestamp();
            Boolean flag = item.getSlaFlag();

            Duration diffDuration = slaCalculatorService.computeWorkingDurationBetween(
                    timestamp.atZone(TimeUtils.ZONE_ID),
                    endTime.atZone(TimeUtils.ZONE_ID)
            );
            long diff = Math.max(diffDuration.toMinutes(), 0L);

            if (Boolean.TRUE.equals(flag)) resolution += diff;
            else idle += diff;

        } else {
//            IF STATUS HISTORY HAS MORE THAN 1 ELEMENT
            StatusHistory firstElement = orderedHistory.get(0);
            LocalDateTime prevTimestamp = firstElement.getTimestamp();
            Boolean prevFlag = firstElement.getSlaFlag();
            String prevStatus = normalizeStatus(firstElement.getCurrentStatus());
//            START FROM THE SECOND ELEMENT
            for(int i = 1; i < orderedHistory.size(); i++) {
                StatusHistory currElement = orderedHistory.get(i);
                LocalDateTime currTimestamp = currElement.getTimestamp();
                Boolean currFlag = currElement.getSlaFlag();

                if (shouldSkipResolvedToReopened(prevStatus, currElement)) {
                    prevTimestamp = currTimestamp;
                    prevFlag = currFlag;
                    prevStatus = normalizeStatus(currElement.getCurrentStatus());
                    continue;
                }

                Duration diffDuration = slaCalculatorService.computeWorkingDurationBetween(
                  prevTimestamp.atZone(TimeUtils.ZONE_ID),
                  currTimestamp .atZone(TimeUtils.ZONE_ID)
                );

                long diff = Math.max(diffDuration.toMinutes(), 0L);
                if(Boolean.TRUE.equals(prevFlag)) {
                    resolution += diff;
                } else {
                    idle += diff;
                }
                prevFlag = currFlag;
                prevTimestamp = currTimestamp;
                prevStatus = normalizeStatus(currElement.getCurrentStatus());
            }
            Duration finalDiffDuration = slaCalculatorService.computeWorkingDurationBetween(
              prevTimestamp.atZone(TimeUtils.ZONE_ID),
              endTime.atZone(TimeUtils.ZONE_ID)
            );
            long finalDiff = Math.max(finalDiffDuration.toMinutes(), 0L);
            if (Boolean.TRUE.equals(prevFlag)) {
                resolution += finalDiff;
            } else {
                idle += finalDiff;
            }
        }
        if (elapsed > 0 && resolution > elapsed) {
            resolution = elapsed;
        }
        if (elapsed > 0) {
            idle = Math.max(elapsed - resolution, idle);
        }

        TicketSla ticketSla = ticketSlaRepository.findByTicket_Id(ticket.getId())
                .orElseGet(TicketSla::new);
        boolean severityChanged = ticketSla.getSlaConfig() != null
                && config != null
                && !Objects.equals(ticketSla.getSlaConfig().getId(), config.getId());

        Long previousBreached = ticketSla.getBreachedByMinutes();
        LocalDateTime originalDueAt = fromScratch
                ? baseDueAt
                : Objects.requireNonNullElse(ticketSla.getActualDueAt(), baseDueAt);

        LocalDateTime escalatedDueAt = fromScratch ? null : ticketSla.getDueAtAfterEscalation();
        if (!fromScratch && severityChanged) {
            escalatedDueAt = baseDueAt;
        }

        LocalDateTime currentDueAt = originalDueAt;
        if (idle > 0L) {
            currentDueAt = computeCalendarEnd(currentDueAt, idle);
        }

        LocalDateTime slaTargetDueAt = escalatedDueAt != null ? escalatedDueAt : originalDueAt;

        long allowedMinutes = 0L;
        if (reportedDate != null) {
            Duration allowedMinutesDuration = slaCalculatorService.computeWorkingDurationBetween(
                    reportedDate.atZone(TimeUtils.ZONE_ID),
                    slaTargetDueAt.atZone(TimeUtils.ZONE_ID)
            );
            allowedMinutes = Math.max(allowedMinutesDuration.toMinutes(), 0L);
        }
        long breachedBy = resolution - allowedMinutes;
        Long timeTillDueDate = null;
        Long workingTimeLeft = null;
        if (currentDueAt != null) {
            timeTillDueDate = Duration.between(calculationTime, currentDueAt).toMinutes();
            Duration workingDuration = slaCalculatorService.computeWorkingDurationBetween(
                    calculationTime.atZone(TimeUtils.ZONE_ID),
                    currentDueAt.atZone(TimeUtils.ZONE_ID)
            );
            workingTimeLeft = workingDuration != null ? workingDuration.toMinutes() : null;
        }

        ticketSla.setTicket(ticket);
        ticketSla.setSlaConfig(config);
        ticketSla.setDueAt(currentDueAt);
        ticketSla.setActualDueAt(originalDueAt);
        ticketSla.setDueAtAfterEscalation(escalatedDueAt);
        ticketSla.setResolutionTimeMinutes(resolution);
        ticketSla.setElapsedTimeMinutes(elapsed);
        ticketSla.setResponseTimeMinutes(responseMinutes);
        ticketSla.setBreachedByMinutes(breachedBy);
        ticketSla.setIdleTimeMinutes(idle);
        ticketSla.setCreatedAt(ticket.getReportedDate());
        if (reportedDate != null && slaTargetDueAt != null) {
            ticketSla.setTotalSlaMinutes(Duration.between(reportedDate, slaTargetDueAt).toMinutes());
        } else {
            ticketSla.setTotalSlaMinutes(null);
        }
        ticketSla.setTimeTillDueDate(timeTillDueDate);
        ticketSla.setWorkingTimeLeftMinutes(workingTimeLeft);
        TicketSla saved = ticketSlaRepository.save(ticketSla);
        saved.setWorkingTimeLeftMinutes(workingTimeLeft);

        boolean hasBreached = breachedBy > 0;
        boolean breachJustOccurred = hasBreached && (previousBreached == null || previousBreached <= 0);
        if (breachJustOccurred) {
            notifyAssigneeOfSlaBreach(ticket, breachedBy, slaTargetDueAt);
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
                    TicketSla refreshed = calculateAndSaveByCalendar(ticket, history);
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

    private boolean shouldSkipResolvedToReopened(String previousStatus, StatusHistory current) {
        String normalizedPrevious = previousStatus;
        String normalizedCurrent = normalizeStatus(current.getCurrentStatus());
        if (!"REOPENED".equals(normalizedCurrent)) {
            return false;
        }

        if ("RESOLVED".equals(normalizedPrevious)) {
            return true;
        }

        String currentPreviousStatus = normalizeStatus(current.getPreviousStatus());
        return "RESOLVED".equals(currentPreviousStatus);
    }

    private String normalizeStatus(String status) {
        return status == null ? null : status.trim().toUpperCase(Locale.ROOT);
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

        String assigneeDisplayName = assignee.map(this::resolveUserDisplayName).orElse(null);
        if (assigneeDisplayName != null && !assigneeDisplayName.isBlank()) {
            data.put("assigneeName", assigneeDisplayName);
        } else if (assigneeIdentifier != null && !assigneeIdentifier.isBlank()) {
            data.put("assigneeName", assigneeIdentifier);
        }

        Map<String, String> recipients = new LinkedHashMap<>();
        String primaryRecipient = assignee
                .map(this::resolveRecipientIdentifier)
                .orElse(assigneeIdentifier);
        if (primaryRecipient != null && !primaryRecipient.isBlank()) {
            recipients.put(primaryRecipient, assigneeDisplayName);
        }

        List<User> escalationUsers = userRepository.findAll();
        for (User escalationUser : escalationUsers) {
            if (escalationUser == null || isRequestorOnly(escalationUser)) {
                continue;
            }
            String escalationRecipient = resolveRecipientIdentifier(escalationUser);
            if (escalationRecipient == null || escalationRecipient.isBlank()) {
                continue;
            }

            String displayName = resolveUserDisplayName(escalationUser);
            if (!recipients.containsKey(escalationRecipient)) {
                recipients.put(escalationRecipient, displayName);
            } else {
                String existingName = recipients.get(escalationRecipient);
                if ((existingName == null || existingName.isBlank())
                        && displayName != null && !displayName.isBlank()) {
                    recipients.put(escalationRecipient, displayName);
                }
            }
        }

        for (Map.Entry<String, String> entry : recipients.entrySet()) {
            String recipient = entry.getKey();
            if (recipient == null || recipient.isBlank()) {
                continue;
            }

            Map<String, Object> recipientData = new HashMap<>(data);
            String recipientName = entry.getValue();
            if (recipientName != null && !recipientName.isBlank()) {
                recipientData.put("recipientName", recipientName);
            }

            try {
                notificationService.sendNotification(
                        ChannelType.IN_APP,
                        SLA_BREACHED_NOTIFICATION_CODE,
                        recipientData,
                        recipient
                );
            } catch (Exception ex) {
                log.warn("Failed to send SLA breach notification for ticket {} to recipient {}", ticket.getId(), recipient, ex);
            }
        }
    }

    public void notifyAssigneeOfExistingSlaBreach(TicketSla ticketSla) {
        if (ticketSla == null) {
            return;
        }

        Long breached = ticketSla.getBreachedByMinutes();
        if (breached == null || breached <= 0) {
            return;
        }

        Ticket ticket = ticketSla.getTicket();
        LocalDateTime dueAt = ticketSla.getDueAtAfterEscalation() != null
                ? ticketSla.getDueAtAfterEscalation()
                : ticketSla.getDueAt();
        notifyAssigneeOfSlaBreach(ticket, breached, dueAt);
    }

    public void notifyAssigneesOfBreachedTickets(Collection<TicketSla> breachedTickets) {
        if (breachedTickets == null || breachedTickets.isEmpty()) {
            return;
        }

        breachedTickets.stream()
                .filter(Objects::nonNull)
                .forEach(this::notifyAssigneeOfExistingSlaBreach);
    }

    private LocalDateTime computeCalendarEnd(LocalDateTime start, long durationMinutes) {
        if (start == null) {
            return null;
        }
        ZonedDateTime startZoned = start.atZone(TimeUtils.ZONE_ID);
        Duration duration = Duration.ofMinutes(Math.max(durationMinutes, 0L));
        ZonedDateTime end = slaCalculatorService.computeEnd(startZoned, duration);
        return end.withZoneSameInstant(TimeUtils.ZONE_ID).toLocalDateTime();
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

    private String resolveUserDisplayName(User user) {
        if (user == null) {
            return null;
        }
        if (user.getName() != null && !user.getName().isBlank()) {
            return user.getName();
        }
        if (user.getUsername() != null && !user.getUsername().isBlank()) {
            return user.getUsername();
        }
        if (user.getEmailId() != null && !user.getEmailId().isBlank()) {
            return user.getEmailId();
        }
        return null;
    }

    private boolean isRequestorOnly(User user) {
        if (user == null) {
            return false;
        }

        String roles = user.getRoles();
        if (roles == null || roles.isBlank()) {
            return false;
        }

        String[] parts = roles.split("\\|");
        List<String> normalized = new ArrayList<>();
        for (String part : parts) {
            if (part == null) {
                continue;
            }
            String trimmed = part.trim();
            if (!trimmed.isEmpty()) {
                normalized.add(trimmed);
            }
        }

        return RoleUtils.isRequestorOnly(normalized);
    }
}
