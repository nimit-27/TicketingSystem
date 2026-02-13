package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.sla.SlaCalculationJobOverviewDto;
import com.ticketingSystem.api.dto.sla.SlaCalculationJobRunDto;
import com.ticketingSystem.api.enums.SlaJobRunStatus;
import com.ticketingSystem.api.enums.SlaJobScope;
import com.ticketingSystem.api.enums.SlaJobTriggerType;
import com.ticketingSystem.api.enums.TicketStatus;
import com.ticketingSystem.api.models.SlaCalculationJobRun;
import com.ticketingSystem.api.models.StatusHistory;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.repository.SlaCalculationJobRunRepository;
import com.ticketingSystem.api.repository.StatusHistoryRepository;
import com.ticketingSystem.api.repository.TicketRepository;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class SlaCalculationJobService {
    private static final Logger log = LoggerFactory.getLogger(SlaCalculationJobService.class);
    private static final Set<TicketStatus> EXCLUDED_STATUSES = EnumSet.of(TicketStatus.CLOSED, TicketStatus.RESOLVED);

    private final TicketRepository ticketRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final TicketSlaService ticketSlaService;
    private final SlaCalculationJobRunRepository runRepository;

    private final AtomicBoolean running = new AtomicBoolean(false);
    private final ExecutorService executorService = Executors.newSingleThreadExecutor();

    @Value("${app.sla-calculation-job.cron:0 0 */4 * * *}")
    private String cronExpression;

    @Value("${app.sla-calculation-job.batch-size:100}")
    private int batchSize;

    @Value("${app.sla-calculation-job.zone:Asia/Kolkata}")
    private String schedulerZone;

    @Value("${app.sla-calculation-job.enabled:true}")
    private boolean schedulerEnabled;

    public SlaCalculationJobService(TicketRepository ticketRepository,
                                    StatusHistoryRepository statusHistoryRepository,
                                    TicketSlaService ticketSlaService,
                                    SlaCalculationJobRunRepository runRepository) {
        this.ticketRepository = ticketRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.ticketSlaService = ticketSlaService;
        this.runRepository = runRepository;
    }

    public SlaCalculationJobRunDto triggerManual(String triggeredBy) {
        return triggerRun(SlaJobTriggerType.MANUAL, triggeredBy, SlaJobScope.ACTIVE_ONLY);
    }

    public SlaCalculationJobRunDto triggerManualAllTickets(String triggeredBy) {
        return triggerRun(SlaJobTriggerType.MANUAL, triggeredBy, SlaJobScope.ALL_TICKETS);
    }

    public SlaCalculationJobRunDto triggerScheduled() {
        return triggerRun(SlaJobTriggerType.SCHEDULED, "SYSTEM", SlaJobScope.ACTIVE_ONLY);
    }

    public boolean isSchedulerEnabled() {
        return schedulerEnabled;
    }

    public SlaCalculationJobOverviewDto getOverview(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 200));
        List<SlaCalculationJobRunDto> history = runRepository.findAllByOrderByStartedAtDesc(PageRequest.of(0, safeLimit))
                .stream()
                .map(this::toDto)
                .toList();

        LocalDateTime next = computeNextScheduledAt();
        Long minutesUntilNext = next == null ? null : Duration.between(LocalDateTime.now(), next).toMinutes();

        String runningJobId = runRepository.findTopByOrderByStartedAtDesc()
                .filter(run -> run.getRunStatus() == SlaJobRunStatus.RUNNING)
                .map(SlaCalculationJobRun::getId)
                .orElse(null);

        return SlaCalculationJobOverviewDto.builder()
                .running(running.get())
                .runningJobId(runningJobId)
                .cronExpression(cronExpression)
                .batchSize(batchSize)
                .nextScheduledAt(next)
                .minutesUntilNextRun(minutesUntilNext)
                .history(history)
                .build();
    }

    private SlaCalculationJobRunDto triggerRun(SlaJobTriggerType triggerType, String triggeredBy, SlaJobScope scope) {
        if (!running.compareAndSet(false, true)) {
            return runRepository.findTopByOrderByStartedAtDesc().map(this::toDto).orElse(null);
        }

        SlaCalculationJobRun run = new SlaCalculationJobRun();
        run.setTriggerType(triggerType);
        run.setRunStatus(SlaJobRunStatus.RUNNING);
        run.setScope(scope);
        run.setTriggeredBy((triggeredBy == null || triggeredBy.isBlank()) ? "SYSTEM" : triggeredBy);
        run.setStartedAt(LocalDateTime.now());
        run.setBatchSize(batchSize);
        run.setTotalCandidateTickets(0L);
        run.setProcessedTickets(0L);
        run.setSucceededTickets(0L);
        run.setFailedTickets(0L);
        SlaCalculationJobRun savedRun = runRepository.save(run);

        executorService.submit(() -> executeRun(savedRun.getId()));
        return toDto(savedRun);
    }

    private void executeRun(String runId) {
        LocalDateTime startedAt = LocalDateTime.now();

        try {
            SlaCalculationJobRun run = runRepository.findById(runId).orElse(null);
            if (run == null) {
                return;
            }

            long processed = 0L;
            long success = 0L;
            long failed = 0L;
            long total = 0L;
            List<String> errors = new ArrayList<>();

            int page = 0;
            Page<Ticket> ticketPage;
            do {
                ticketPage = fetchTicketPage(run.getScope(), page);

                if (page == 0) {
                    total = ticketPage.getTotalElements();
                }

                List<Ticket> tickets = ticketPage.getContent();
                Map<String, List<StatusHistory>> historyByTicketId = buildHistoryMap(tickets);

                for (Ticket ticket : tickets) {
                    processed++;
                    try {
                        ticketSlaService.calculateAndSaveByCalendar(ticket, historyByTicketId.getOrDefault(ticket.getId(), List.of()));
                        success++;
                    } catch (Exception ex) {
                        failed++;
                        if (errors.size() < 10) {
                            errors.add("Ticket " + ticket.getId() + ": " + ex.getMessage());
                        }
                        log.warn("Failed to calculate SLA for ticket {} in batch run {}", ticket.getId(), runId, ex);
                    }
                }

                page++;
            } while (!ticketPage.isLast());

            run.setTotalCandidateTickets(total);
            run.setProcessedTickets(processed);
            run.setSucceededTickets(success);
            run.setFailedTickets(failed);
            run.setRunStatus(failed > 0 ? SlaJobRunStatus.COMPLETED_WITH_ERRORS : SlaJobRunStatus.COMPLETED);
            run.setErrorSummary(errors.isEmpty() ? null : String.join(" | ", errors));
            run.setCompletedAt(LocalDateTime.now());
            run.setDurationMs(Duration.between(startedAt, run.getCompletedAt()).toMillis());
            runRepository.save(run);
        } catch (Exception ex) {
            runRepository.findById(runId).ifPresent(run -> {
                run.setRunStatus(SlaJobRunStatus.FAILED);
                run.setErrorSummary(ex.getMessage());
                run.setCompletedAt(LocalDateTime.now());
                run.setDurationMs(Duration.between(startedAt, run.getCompletedAt()).toMillis());
                runRepository.save(run);
            });
            log.error("SLA batch run {} failed", runId, ex);
        } finally {
            running.set(false);
        }
    }


    private Page<Ticket> fetchTicketPage(SlaJobScope scope, int page) {
        PageRequest pageRequest = PageRequest.of(page, batchSize, Sort.by(Sort.Direction.ASC, "reportedDate", "id"));
        if (scope == SlaJobScope.ALL_TICKETS) {
            return ticketRepository.findAll(pageRequest);
        }

        return ticketRepository.findByTicketStatusNotIn(new ArrayList<>(EXCLUDED_STATUSES), pageRequest);
    }

    private Map<String, List<StatusHistory>> buildHistoryMap(List<Ticket> tickets) {
        Map<String, List<StatusHistory>> historyByTicketId = new HashMap<>();
        if (tickets == null || tickets.isEmpty()) {
            return historyByTicketId;
        }

        List<StatusHistory> allHistory = statusHistoryRepository.findByTicketInOrderByTimestampAsc(tickets);
        for (StatusHistory history : allHistory) {
            if (history == null || history.getTicket() == null || history.getTicket().getId() == null) {
                continue;
            }
            historyByTicketId.computeIfAbsent(history.getTicket().getId(), key -> new ArrayList<>()).add(history);
        }
        return historyByTicketId;
    }

    private LocalDateTime computeNextScheduledAt() {
        if (!schedulerEnabled) {
            return null;
        }

        try {
            CronExpression cron = CronExpression.parse(cronExpression);
            ZoneId zoneId = ZoneId.of(schedulerZone);
            ZonedDateTime next = cron.next(ZonedDateTime.now(zoneId));
            return next != null ? next.toLocalDateTime() : null;
        } catch (Exception ex) {
            log.warn("Unable to parse SLA calculation cron expression: {}", cronExpression, ex);
            return null;
        }
    }

    private SlaCalculationJobRunDto toDto(SlaCalculationJobRun run) {
        return SlaCalculationJobRunDto.builder()
                .id(run.getId())
                .triggerType(run.getTriggerType())
                .scope(run.getScope())
                .runStatus(run.getRunStatus())
                .triggeredBy(run.getTriggeredBy())
                .startedAt(run.getStartedAt())
                .completedAt(run.getCompletedAt())
                .durationMs(run.getDurationMs())
                .totalCandidateTickets(run.getTotalCandidateTickets())
                .processedTickets(run.getProcessedTickets())
                .succeededTickets(run.getSucceededTickets())
                .failedTickets(run.getFailedTickets())
                .batchSize(run.getBatchSize())
                .errorSummary(run.getErrorSummary())
                .build();
    }

    @PreDestroy
    public void shutdownExecutor() {
        executorService.shutdown();
    }
}
