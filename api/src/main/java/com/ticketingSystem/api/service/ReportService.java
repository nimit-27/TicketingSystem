package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.reports.CustomerSatisfactionReportDto;
import com.ticketingSystem.api.dto.reports.ProblemCategoryStatDto;
import com.ticketingSystem.api.dto.reports.ProblemManagementReportDto;
import com.ticketingSystem.api.dto.reports.SlaPerformanceReportDto;
import com.ticketingSystem.api.dto.reports.TicketResolutionTimeReportDto;
import com.ticketingSystem.api.dto.reports.TicketSummaryReportDto;
import com.ticketingSystem.api.enums.TicketStatus;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.models.TicketFeedback;
import com.ticketingSystem.api.models.TicketSla;
import com.ticketingSystem.api.repository.TicketFeedbackRepository;
import com.ticketingSystem.api.repository.TicketRepository;
import com.ticketingSystem.api.repository.TicketSlaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.DoubleSummaryStatistics;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.OptionalDouble;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final TicketRepository ticketRepository;
    private final TicketFeedbackRepository ticketFeedbackRepository;
    private final TicketSlaRepository ticketSlaRepository;
    private final TicketSlaService ticketSlaService;

    public TicketSummaryReportDto getTicketSummaryReport() {
        long totalTickets = ticketRepository.count();
        long openTickets = ticketRepository.countByTicketStatus(TicketStatus.OPEN);
        long closedTickets = ticketRepository.countByTicketStatus(TicketStatus.CLOSED);

        Map<String, Long> statusCounts = ticketRepository.countTicketsByStatus().stream()
                .collect(Collectors.toMap(
                        projection -> projection.getStatus() != null
                                ? projection.getStatus().name()
                                : "UNKNOWN",
                        projection -> Optional.ofNullable(projection.getCount()).orElse(0L),
                        Long::sum,
                        LinkedHashMap::new
                ));

        Map<String, Long> modeCounts = ticketRepository.countTicketsByMode().stream()
                .collect(Collectors.toMap(
                        projection -> projection.getMode() != null
                                ? projection.getMode().name().toUpperCase(Locale.ROOT)
                                : "UNSPECIFIED",
                        projection -> Optional.ofNullable(projection.getCount()).orElse(0L),
                        Long::sum,
                        LinkedHashMap::new
                ));

        return TicketSummaryReportDto.builder()
                .totalTickets(totalTickets)
                .openTickets(openTickets)
                .closedTickets(closedTickets)
                .statusCounts(statusCounts)
                .modeCounts(modeCounts)
                .build();
    }

    public TicketResolutionTimeReportDto getTicketResolutionTimeReport() {
        List<Ticket> resolvedTickets = ticketRepository.findResolvedTickets();

        Map<String, DoubleSummaryStatistics> statsByStatus = resolvedTickets.stream()
                .filter(ticket -> ticket.getReportedDate() != null && ticket.getResolvedAt() != null)
                .collect(Collectors.groupingBy(
                        ticket -> ticket.getTicketStatus() != null ? ticket.getTicketStatus().name() : "RESOLVED",
                        Collectors.summarizingDouble(ticket -> getResolutionDurationInHours(ticket.getReportedDate(), ticket.getResolvedAt()))
                ));

        Map<String, Double> averageByStatus = statsByStatus.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> entry.getValue().getCount() == 0 ? 0.0 : round(entry.getValue().getAverage()),
                        (a, b) -> b,
                        LinkedHashMap::new
                ));

        double overallAverage = resolvedTickets.stream()
                .filter(ticket -> ticket.getReportedDate() != null && ticket.getResolvedAt() != null)
                .mapToDouble(ticket -> getResolutionDurationInHours(ticket.getReportedDate(), ticket.getResolvedAt()))
                .average()
                .orElse(0.0);

        return TicketResolutionTimeReportDto.builder()
                .resolvedTicketCount(resolvedTickets.size())
                .averageResolutionHours(round(overallAverage))
                .averageResolutionHoursByStatus(averageByStatus)
                .build();
    }

    public CustomerSatisfactionReportDto getCustomerSatisfactionReport() {
        List<TicketFeedback> feedbackList = ticketFeedbackRepository.findAll();

        if (feedbackList.isEmpty()) {
            return CustomerSatisfactionReportDto.builder()
                    .totalResponses(0)
                    .overallSatisfactionAverage(0.0)
                    .resolutionEffectivenessAverage(0.0)
                    .communicationSupportAverage(0.0)
                    .timelinessAverage(0.0)
                    .compositeScore(0.0)
                    .build();
        }

        OptionalDouble overallSatisfaction = feedbackList.stream()
                .mapToInt(TicketFeedback::getOverallSatisfaction)
                .average();
        OptionalDouble resolutionEffectiveness = feedbackList.stream()
                .mapToInt(TicketFeedback::getResolutionEffectiveness)
                .average();
        OptionalDouble communicationSupport = feedbackList.stream()
                .mapToInt(TicketFeedback::getCommunicationSupport)
                .average();
        OptionalDouble timeliness = feedbackList.stream()
                .mapToInt(TicketFeedback::getTimeliness)
                .average();

        double compositeScore = feedbackList.stream()
                .mapToDouble(feedback -> (
                        feedback.getOverallSatisfaction()
                                + feedback.getResolutionEffectiveness()
                                + feedback.getCommunicationSupport()
                                + feedback.getTimeliness()
                ) / 4.0)
                .average()
                .orElse(0.0);

        return CustomerSatisfactionReportDto.builder()
                .totalResponses(feedbackList.size())
                .overallSatisfactionAverage(round(overallSatisfaction.orElse(0.0)))
                .resolutionEffectivenessAverage(round(resolutionEffectiveness.orElse(0.0)))
                .communicationSupportAverage(round(communicationSupport.orElse(0.0)))
                .timelinessAverage(round(timeliness.orElse(0.0)))
                .compositeScore(round(compositeScore))
                .build();
    }

    public ProblemManagementReportDto getProblemManagementReport() {
        List<ProblemCategoryStatDto> categoryStats = ticketRepository.countTicketsByCategory().stream()
                .sorted(Comparator.comparingLong(TicketRepository.CategoryCountProjection::getCount).reversed())
                .map(projection -> ProblemCategoryStatDto.builder()
                        .category(projection.getCategory())
                        .ticketCount(Optional.ofNullable(projection.getCount()).orElse(0L))
                        .build())
                .collect(Collectors.toList());

        return ProblemManagementReportDto.builder()
                .categoryStats(categoryStats)
                .build();
    }

    public SlaPerformanceReportDto getSlaPerformanceReport() {
        List<TicketSla> slaEntries = ticketSlaRepository.findAllWithTicket();

        if (slaEntries.isEmpty()) {
            return SlaPerformanceReportDto.builder()
                    .totalTicketsWithSla(0L)
                    .totalBreachedTickets(0L)
                    .totalOnTrackTickets(0L)
                    .totalResolvedWithinSla(0L)
                    .totalResolvedAfterBreach(0L)
                    .totalInProgressTickets(0L)
                    .inProgressBreachedTickets(0L)
                    .inProgressOnTrackTickets(0L)
                    .breachRate(0.0)
                    .averageBreachMinutes(0.0)
                    .statusBreakdown(List.of())
                    .severityBreakdown(List.of())
                    .breachTrend(List.of())
                    .breachedTickets(List.of())
                    .build();
        }

        LocalDate today = LocalDate.now();

        long total = slaEntries.size();
        EnumSet<TicketStatus> resolvedStatuses = EnumSet.of(
                TicketStatus.RESOLVED,
                TicketStatus.CLOSED,
                TicketStatus.CANCELLED
        );

        long totalBreached = 0L;
        long resolvedWithinSla = 0L;
        long resolvedAfterBreach = 0L;
        long inProgress = 0L;
        long inProgressBreached = 0L;
        long inProgressOnTrack = 0L;

        Map<String, Long> severityTotals = new LinkedHashMap<>();
        Map<String, Long> severityBreached = new LinkedHashMap<>();
        Map<String, Long> severityOnTrack = new LinkedHashMap<>();
        Map<String, Long> severityResolvedWithin = new LinkedHashMap<>();
        Map<String, Long> severityResolvedAfter = new LinkedHashMap<>();

        Map<LocalDate, TrendAccumulator> trendAccumulatorMap = new LinkedHashMap<>();
        List<SlaPerformanceReportDto.SlaBreachedTicketSummaryDto> breachedTickets = new ArrayList<>();

        List<Long> breachDurations = new ArrayList<>();

        for (TicketSla sla : slaEntries) {
            if (sla == null) {
                continue;
            }

            Ticket ticket = sla.getTicket();
            TicketStatus status = ticket != null ? ticket.getTicketStatus() : null;
            boolean isResolved = status != null && resolvedStatuses.contains(status);
            long breachedBy = Optional.ofNullable(sla.getBreachedByMinutes()).orElse(0L);
            boolean hasBreached = breachedBy > 0;

            if (hasBreached) {
                totalBreached++;
                breachDurations.add(breachedBy);
            }

            if (isResolved) {
                if (hasBreached) {
                    resolvedAfterBreach++;
                } else {
                    resolvedWithinSla++;
                }
            } else {
                inProgress++;
                if (hasBreached) {
                    inProgressBreached++;
                } else {
                    inProgressOnTrack++;
                }
            }

            String severity = ticket != null && ticket.getSeverity() != null
                    ? ticket.getSeverity().trim().toUpperCase(Locale.ROOT)
                    : "UNSPECIFIED";
            severityTotals.merge(severity, 1L, Long::sum);
            if (hasBreached) {
                severityBreached.merge(severity, 1L, Long::sum);
            } else if (!isResolved) {
                severityOnTrack.merge(severity, 1L, Long::sum);
            }
            if (isResolved && !hasBreached) {
                severityResolvedWithin.merge(severity, 1L, Long::sum);
            }
            if (isResolved && hasBreached) {
                severityResolvedAfter.merge(severity, 1L, Long::sum);
            }

            String statusLabel = status != null ? status.name() : "UNSPECIFIED";

            LocalDate dueDate = Stream.of(
                            sla.getDueAtAfterEscalation(),
                            sla.getDueAt(),
                            sla.getActualDueAt(),
                            ticket != null ? ticket.getResolvedAt() : null,
                            ticket != null ? ticket.getReportedDate() : null
                    )
                    .filter(Objects::nonNull)
                    .map(LocalDateTime::toLocalDate)
                    .findFirst()
                    .orElse(today);

            TrendAccumulator trendAccumulator = trendAccumulatorMap.computeIfAbsent(dueDate, d -> new TrendAccumulator());
            trendAccumulator.incrementDue();
            if (hasBreached) {
                trendAccumulator.incrementBreached();
            }
            if (isResolved) {
                trendAccumulator.incrementResolved();
            }

            if (hasBreached) {
                breachedTickets.add(SlaPerformanceReportDto.SlaBreachedTicketSummaryDto.builder()
                        .ticketId(ticket != null ? ticket.getId() : null)
                        .ticketNumber(ticket != null ? ticket.getId() : null)
                        .subject(ticket != null ? ticket.getSubject() : null)
                        .assignee(ticket != null ? ticket.getAssignedTo() : null)
                        .severity(severity)
                        .status(statusLabel)
                        .dueAt(sla.getDueAtAfterEscalation() != null ? sla.getDueAtAfterEscalation() : sla.getDueAt())
                        .breachedByMinutes(breachedBy)
                        .build());
            }
        }

        double breachRate = total == 0 ? 0.0 : (double) totalBreached * 100.0 / (double) total;
        double averageBreachMinutes = breachDurations.isEmpty()
                ? 0.0
                : breachDurations.stream().mapToLong(Long::longValue).average().orElse(0.0);

        List<SlaPerformanceReportDto.SlaStatusBreakdownDto> statusBreakdown = buildStatusBreakdown(
                resolvedWithinSla,
                resolvedAfterBreach,
                inProgressOnTrack,
                inProgressBreached
        );

        List<SlaPerformanceReportDto.SlaSeverityBreakdownDto> severityBreakdown = severityTotals.entrySet().stream()
                .map(entry -> {
                    String severity = entry.getKey();
                    long totalCount = Optional.ofNullable(entry.getValue()).orElse(0L);
                    long breachedCount = Optional.ofNullable(severityBreached.get(severity)).orElse(0L);
                    long onTrackCount = Optional.ofNullable(severityOnTrack.get(severity)).orElse(0L);
                    long resolvedWithinCount = Optional.ofNullable(severityResolvedWithin.get(severity)).orElse(0L);
                    long resolvedAfterCount = Optional.ofNullable(severityResolvedAfter.get(severity)).orElse(0L);
                    return SlaPerformanceReportDto.SlaSeverityBreakdownDto.builder()
                            .severity(severity)
                            .total(totalCount)
                            .breached(breachedCount)
                            .onTrack(onTrackCount)
                            .resolvedWithinSla(resolvedWithinCount)
                            .resolvedAfterBreach(resolvedAfterCount)
                            .build();
                })
                .sorted(Comparator.comparing(SlaPerformanceReportDto.SlaSeverityBreakdownDto::getSeverity))
                .collect(Collectors.toList());

        List<SlaPerformanceReportDto.SlaTrendPointDto> trendPoints = trendAccumulatorMap.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> SlaPerformanceReportDto.SlaTrendPointDto.builder()
                        .date(entry.getKey())
                        .dueCount(entry.getValue().getDueCount())
                        .breachedCount(entry.getValue().getBreachedCount())
                        .resolvedCount(entry.getValue().getResolvedCount())
                        .build())
                .collect(Collectors.toList());

        breachedTickets.sort(Comparator.comparingLong(summary -> Optional.ofNullable(((SlaPerformanceReportDto.SlaBreachedTicketSummaryDto) summary).getBreachedByMinutes()).orElse(0L)).reversed());

        return SlaPerformanceReportDto.builder()
                .totalTicketsWithSla(total)
                .totalBreachedTickets(totalBreached)
                .totalOnTrackTickets(resolvedWithinSla + inProgressOnTrack)
                .totalResolvedWithinSla(resolvedWithinSla)
                .totalResolvedAfterBreach(resolvedAfterBreach)
                .totalInProgressTickets(inProgress)
                .inProgressBreachedTickets(inProgressBreached)
                .inProgressOnTrackTickets(inProgressOnTrack)
                .breachRate(round(breachRate))
                .averageBreachMinutes(round(averageBreachMinutes))
                .statusBreakdown(statusBreakdown)
                .severityBreakdown(severityBreakdown)
                .breachTrend(trendPoints)
                .breachedTickets(breachedTickets.stream().limit(15).collect(Collectors.toList()))
                .build();
    }

    public void notifyBreachedSlaAssignees() {
        List<TicketSla> breachedTickets = ticketSlaRepository.findBreachedWithTicket();
        ticketSlaService.notifyAssigneesOfBreachedTickets(breachedTickets);
    }

    private List<SlaPerformanceReportDto.SlaStatusBreakdownDto> buildStatusBreakdown(
            long resolvedWithinSla,
            long resolvedAfterBreach,
            long inProgressOnTrack,
            long inProgressBreached
    ) {
        List<SlaPerformanceReportDto.SlaStatusBreakdownDto> breakdown = new ArrayList<>();
        breakdown.add(SlaPerformanceReportDto.SlaStatusBreakdownDto.builder()
                .key("RESOLVED_WITHIN_SLA")
                .label("Resolved Within SLA")
                .count(resolvedWithinSla)
                .build());
        breakdown.add(SlaPerformanceReportDto.SlaStatusBreakdownDto.builder()
                .key("RESOLVED_AFTER_BREACH")
                .label("Resolved After Breach")
                .count(resolvedAfterBreach)
                .build());
        breakdown.add(SlaPerformanceReportDto.SlaStatusBreakdownDto.builder()
                .key("IN_PROGRESS_ON_TRACK")
                .label("In Progress - On Track")
                .count(inProgressOnTrack)
                .build());
        breakdown.add(SlaPerformanceReportDto.SlaStatusBreakdownDto.builder()
                .key("IN_PROGRESS_BREACHED")
                .label("In Progress - Breached")
                .count(inProgressBreached)
                .build());
        return breakdown;
    }

    private double getResolutionDurationInHours(LocalDateTime reportedAt, LocalDateTime resolvedAt) {
        Duration duration = Duration.between(reportedAt, resolvedAt);
        return duration.toMinutes() / 60.0;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private static class TrendAccumulator {
        private long dueCount;
        private long breachedCount;
        private long resolvedCount;

        void incrementDue() {
            dueCount++;
        }

        void incrementBreached() {
            breachedCount++;
        }

        void incrementResolved() {
            resolvedCount++;
        }

        long getDueCount() {
            return dueCount;
        }

        long getBreachedCount() {
            return breachedCount;
        }

        long getResolvedCount() {
            return resolvedCount;
        }
    }
}
