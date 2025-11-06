package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.reports.CustomerSatisfactionReportDto;
import com.ticketingSystem.api.dto.reports.ProblemCategoryStatDto;
import com.ticketingSystem.api.dto.reports.ProblemManagementReportDto;
import com.ticketingSystem.api.dto.reports.SlaPerformanceReportDto;
import com.ticketingSystem.api.dto.reports.SupportDashboardOpenResolvedDto;
import com.ticketingSystem.api.dto.reports.SupportDashboardSlaCompliancePointDto;
import com.ticketingSystem.api.dto.reports.SupportDashboardSummaryDto;
import com.ticketingSystem.api.dto.reports.SupportDashboardSummarySectionDto;
import com.ticketingSystem.api.dto.reports.SupportDashboardTicketVolumePointDto;
import com.ticketingSystem.api.dto.reports.TicketResolutionTimeReportDto;
import com.ticketingSystem.api.dto.reports.TicketSummaryReportDto;
import com.ticketingSystem.api.enums.TicketStatus;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.models.TicketFeedback;
import com.ticketingSystem.api.models.TicketSla;
import com.ticketingSystem.api.models.User;
import com.ticketingSystem.api.repository.TicketFeedbackRepository;
import com.ticketingSystem.api.repository.TicketRepository;
import com.ticketingSystem.api.repository.TicketSlaRepository;
import com.ticketingSystem.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
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
import java.time.temporal.TemporalAdjusters;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final TicketRepository ticketRepository;
    private final TicketFeedbackRepository ticketFeedbackRepository;
    private final TicketSlaRepository ticketSlaRepository;
    private final TicketSlaService ticketSlaService;
    private final UserRepository userRepository;

    private static final EnumSet<TicketStatus> RESOLVED_STATUSES = EnumSet.of(
            TicketStatus.RESOLVED,
            TicketStatus.CLOSED,
            TicketStatus.CANCELLED
    );

    private static final DateTimeFormatter DAY_FORMATTER = DateTimeFormatter.ofPattern("dd MMM");
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("MMM yyyy");

    public SupportDashboardSummaryDto getSupportDashboardSummary(String userId,
                                                                 String timeScale,
                                                                 String timeRange,
                                                                 Integer customStartYear,
                                                                 Integer customEndYear) {
        TimeSeriesDefinition timeSeries = resolveTimeSeries(timeScale, timeRange, customStartYear, customEndYear);
        DateRange dateRange = timeSeries.dateRange();

        SupportDashboardSummarySectionDto allTickets = buildSummarySection(null, dateRange);
        SupportDashboardSummarySectionDto myWorkload = resolveUsername(userId)
                .map(username -> buildSummarySection(username, dateRange))
                .orElse(null);

        SupportDashboardOpenResolvedDto openResolved = buildOpenResolvedSnapshot(dateRange);
        List<SupportDashboardSlaCompliancePointDto> slaCompliance = buildSlaComplianceTrend(timeSeries);
        List<SupportDashboardTicketVolumePointDto> ticketVolume = buildTicketVolumeTrend(timeSeries);

        return SupportDashboardSummaryDto.builder()
                .allTickets(allTickets)
                .myWorkload(myWorkload)
                .openResolved(openResolved)
                .slaCompliance(slaCompliance)
                .ticketVolume(ticketVolume)
                .build();
    }

    private SupportDashboardSummarySectionDto buildSummarySection(String assignedTo, DateRange dateRange) {
        Map<String, Long> severityCounts = createEmptySeverityCounts();

        ticketRepository.countTicketsBySeverity(TicketStatus.OPEN, assignedTo, dateRange.from(), dateRange.to())
                .forEach(projection -> {
                    if (projection.getSeverity() == null) {
                        return;
                    }

                    String severityKey = projection.getSeverity().toUpperCase(Locale.ROOT);
                    if (severityCounts.containsKey(severityKey)) {
                        severityCounts.put(severityKey, Optional.ofNullable(projection.getCount()).orElse(0L));
                    }
                });

        long pendingCount = ticketRepository.countTicketsByStatusAndFilters(
                TicketStatus.OPEN,
                assignedTo,
                dateRange.from(),
                dateRange.to()
        );

        long totalTickets = ticketRepository.countTicketsByStatusAndFilters(
                null,
                assignedTo,
                dateRange.from(),
                dateRange.to()
        );

        return SupportDashboardSummarySectionDto.builder()
                .pendingForAcknowledgement(pendingCount)
                .severityCounts(severityCounts)
                .totalTickets(totalTickets)
                .build();
    }

    private SupportDashboardOpenResolvedDto buildOpenResolvedSnapshot(DateRange dateRange) {
        List<Ticket> reportedTickets = ticketRepository.findByReportedDateBetween(dateRange.from(), dateRange.to());
        EnumSet<TicketStatus> openLikeStatuses = EnumSet.allOf(TicketStatus.class);
        openLikeStatuses.removeAll(RESOLVED_STATUSES);

        long openTickets = reportedTickets.stream()
                .filter(Objects::nonNull)
                .filter(ticket -> {
                    TicketStatus status = ticket.getTicketStatus();
                    return status == null || openLikeStatuses.contains(status);
                })
                .count();

        List<Ticket> resolvedTickets = ticketRepository.findByResolvedAtBetween(dateRange.from(), dateRange.to());
        long resolvedCount = resolvedTickets.stream()
                .filter(ticket -> ticket != null && ticket.getTicketStatus() != null)
                .filter(ticket -> RESOLVED_STATUSES.contains(ticket.getTicketStatus()))
                .count();

        return SupportDashboardOpenResolvedDto.builder()
                .openTickets(openTickets)
                .resolvedTickets(resolvedCount)
                .build();
    }

    private List<SupportDashboardSlaCompliancePointDto> buildSlaComplianceTrend(TimeSeriesDefinition timeSeries) {
        List<TimeBucket> buckets = timeSeries.buckets();
        if (buckets.isEmpty()) {
            return List.of();
        }

        Map<String, SlaComplianceAccumulator> accumulatorMap = new LinkedHashMap<>();
        buckets.forEach(bucket -> accumulatorMap.put(bucket.label(), new SlaComplianceAccumulator()));

        List<TicketSla> slaEntries = ticketSlaRepository.findAllWithTicket();

        for (TicketSla sla : slaEntries) {
            if (sla == null) {
                continue;
            }

            LocalDateTime reference = resolveSlaReferenceTimestamp(sla);
            if (reference == null || !isWithinRange(reference, timeSeries.dateRange())) {
                continue;
            }

            TimeBucket bucket = findBucketForTimestamp(buckets, reference);
            if (bucket == null) {
                continue;
            }

            SlaComplianceAccumulator accumulator = accumulatorMap.get(bucket.label());
            if (accumulator == null) {
                continue;
            }

            boolean breached = Optional.ofNullable(sla.getBreachedByMinutes()).orElse(0L) > 0L;

            if (breached) {
                accumulator.incrementOverdue();
            } else {
                accumulator.incrementWithin();
            }
        }

        return buckets.stream()
                .map(bucket -> {
                    SlaComplianceAccumulator accumulator = accumulatorMap.get(bucket.label());
                    long within = accumulator != null ? accumulator.getWithin() : 0L;
                    long overdue = accumulator != null ? accumulator.getOverdue() : 0L;
                    return SupportDashboardSlaCompliancePointDto.builder()
                            .label(bucket.label())
                            .withinSla(within)
                            .overdue(overdue)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<SupportDashboardTicketVolumePointDto> buildTicketVolumeTrend(TimeSeriesDefinition timeSeries) {
        List<TimeBucket> buckets = timeSeries.buckets();
        if (buckets.isEmpty()) {
            return List.of();
        }

        Map<String, Long> countsByLabel = new LinkedHashMap<>();
        buckets.forEach(bucket -> countsByLabel.put(bucket.label(), 0L));

        List<Ticket> tickets = ticketRepository.findByReportedDateBetween(timeSeries.dateRange().from(), timeSeries.dateRange().to());

        for (Ticket ticket : tickets) {
            if (ticket == null || ticket.getReportedDate() == null) {
                continue;
            }

            LocalDateTime reportedDate = ticket.getReportedDate();
            if (!isWithinRange(reportedDate, timeSeries.dateRange())) {
                continue;
            }

            TimeBucket bucket = findBucketForTimestamp(buckets, reportedDate);
            if (bucket == null) {
                continue;
            }

            String label = bucket.label();
            countsByLabel.computeIfPresent(label, (key, current) -> current + 1L);
        }

        return buckets.stream()
                .map(bucket -> SupportDashboardTicketVolumePointDto.builder()
                        .label(bucket.label())
                        .tickets(countsByLabel.getOrDefault(bucket.label(), 0L))
                        .build())
                .collect(Collectors.toList());
    }

    private LocalDateTime resolveSlaReferenceTimestamp(TicketSla sla) {
        if (sla == null) {
            return null;
        }

        if (sla.getActualDueAt() != null) {
            return sla.getActualDueAt();
        }

        if (sla.getDueAt() != null) {
            return sla.getDueAt();
        }

        Ticket ticket = sla.getTicket();
        if (ticket == null) {
            return null;
        }

        if (ticket.getResolvedAt() != null) {
            return ticket.getResolvedAt();
        }

        return ticket.getReportedDate();
    }

    private boolean isWithinRange(LocalDateTime value, DateRange dateRange) {
        if (value == null) {
            return false;
        }

        if (dateRange.from() != null && value.isBefore(dateRange.from())) {
            return false;
        }

        if (dateRange.to() != null && value.isAfter(dateRange.to())) {
            return false;
        }

        return true;
    }

    private Map<String, Long> createEmptySeverityCounts() {
        Map<String, Long> severityCounts = new LinkedHashMap<>();
        severityCounts.put("S1", 0L);
        severityCounts.put("S2", 0L);
        severityCounts.put("S3", 0L);
        severityCounts.put("S4", 0L);
        return severityCounts;
    }

    private Optional<String> resolveUsername(String userId) {
        if (!StringUtils.hasText(userId)) {
            return Optional.empty();
        }

        Optional<String> resolved = userRepository.findById(userId)
                .map(User::getUsername)
                .filter(StringUtils::hasText);

        if (resolved.isPresent()) {
            return resolved;
        }

        resolved = userRepository.findByUsername(userId)
                .map(User::getUsername)
                .filter(StringUtils::hasText);

        if (resolved.isPresent()) {
            return resolved;
        }

        return Optional.of(userId);
    }

    private TimeSeriesDefinition resolveTimeSeries(String timeScale,
                                                   String timeRange,
                                                   Integer customStartYear,
                                                   Integer customEndYear) {
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();
        String normalizedScale = StringUtils.hasText(timeScale) ? timeScale.trim().toUpperCase(Locale.ROOT) : "";
        String normalizedRange = StringUtils.hasText(timeRange) ? timeRange.trim().toUpperCase(Locale.ROOT) : "";

        List<TimeBucket> buckets = new ArrayList<>();

        switch (normalizedScale) {
            case "DAILY" -> {
                int days;
                if ("LAST_DAY".equals(normalizedRange)) {
                    days = 1;
                } else if ("LAST_30_DAYS".equals(normalizedRange)) {
                    days = 30;
                } else {
                    days = 7;
                }

                LocalDate startDate = today.minusDays(days - 1L);
                for (int index = 0; index < days; index++) {
                    LocalDate date = startDate.plusDays(index);
                    LocalDateTime bucketStart = date.atStartOfDay();
                    LocalDateTime bucketEnd = date.plusDays(1).atStartOfDay().minusNanos(1);
                    if (bucketEnd.isAfter(now)) {
                        bucketEnd = now;
                    }
                    buckets.add(new TimeBucket(bucketStart, bucketEnd, date.format(DAY_FORMATTER)));
                }
            }
            case "WEEKLY" -> {
                LocalDate startOfCurrentWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                if ("LAST_WEEK".equals(normalizedRange)) {
                    LocalDate weekStart = startOfCurrentWeek.minusWeeks(1);
                    LocalDateTime bucketStart = weekStart.atStartOfDay();
                    LocalDateTime bucketEnd = startOfCurrentWeek.atStartOfDay().minusNanos(1);
                    buckets.add(new TimeBucket(bucketStart, bucketEnd, "Week of " + weekStart.format(DAY_FORMATTER)));
                } else {
                    int weeks = "LAST_4_WEEKS".equals(normalizedRange) ? 4 : 1;
                    LocalDate firstWeekStart = startOfCurrentWeek.minusWeeks(weeks - 1L);
                    for (int index = 0; index < weeks; index++) {
                        LocalDate weekStart = firstWeekStart.plusWeeks(index);
                        LocalDateTime bucketStart = weekStart.atStartOfDay();
                        LocalDateTime bucketEnd = weekStart.plusWeeks(1).atStartOfDay().minusNanos(1);
                        if (weekStart.equals(startOfCurrentWeek) && bucketEnd.isAfter(now)) {
                            bucketEnd = now;
                        }
                        buckets.add(new TimeBucket(bucketStart, bucketEnd, "Week of " + weekStart.format(DAY_FORMATTER)));
                    }
                }
            }
            case "MONTHLY" -> {
                YearMonth currentMonth = YearMonth.from(today);
                List<YearMonth> months = new ArrayList<>();

                switch (normalizedRange) {
                    case "LAST_6_MONTHS" -> {
                        YearMonth start = currentMonth.minusMonths(5);
                        for (int index = 0; index < 6; index++) {
                            months.add(start.plusMonths(index));
                        }
                    }
                    case "CURRENT_YEAR" -> {
                        YearMonth start = YearMonth.of(today.getYear(), 1);
                        YearMonth pointer = start;
                        while (!pointer.isAfter(currentMonth)) {
                            months.add(pointer);
                            pointer = pointer.plusMonths(1);
                        }
                    }
                    case "LAST_YEAR" -> {
                        int targetYear = today.getYear() - 1;
                        YearMonth pointer = YearMonth.of(targetYear, 1);
                        for (int month = 0; month < 12; month++) {
                            months.add(pointer.plusMonths(month));
                        }
                    }
                    case "LAST_5_YEARS" -> {
                        YearMonth start = currentMonth.minusMonths(5 * 12L - 1L);
                        YearMonth pointer = start;
                        while (!pointer.isAfter(currentMonth)) {
                            months.add(pointer);
                            pointer = pointer.plusMonths(1);
                        }
                    }
                    case "CUSTOM_MONTH_RANGE" -> {
                        if (customStartYear != null && customEndYear != null) {
                            int startYear = Math.min(customStartYear, customEndYear);
                            int endYear = Math.max(customStartYear, customEndYear);
                            YearMonth start = YearMonth.of(startYear, 1);
                            YearMonth end = YearMonth.of(endYear, 12);
                            YearMonth pointer = start;
                            while (!pointer.isAfter(end)) {
                                months.add(pointer);
                                pointer = pointer.plusMonths(1);
                            }
                        }
                    }
                    case "ALL_TIME" -> {
                        Optional<YearMonth> earliest = resolveEarliestTicketMonth();
                        Optional<YearMonth> latest = resolveLatestTicketMonth();
                        if (earliest.isPresent() && latest.isPresent()) {
                            YearMonth start = earliest.get();
                            YearMonth end = latest.get();
                            if (end.isBefore(start)) {
                                end = start;
                            }
                            YearMonth pointer = start;
                            while (!pointer.isAfter(end)) {
                                months.add(pointer);
                                pointer = pointer.plusMonths(1);
                            }
                        }
                    }
                    default -> {
                        if (months.isEmpty()) {
                            YearMonth start = currentMonth.minusMonths(5);
                            for (int index = 0; index < 6; index++) {
                                months.add(start.plusMonths(index));
                            }
                        }
                    }
                }

                if (months.isEmpty()) {
                    YearMonth start = currentMonth.minusMonths(5);
                    for (int index = 0; index < 6; index++) {
                        months.add(start.plusMonths(index));
                    }
                }

                for (YearMonth month : months) {
                    LocalDateTime bucketStart = month.atDay(1).atStartOfDay();
                    LocalDateTime bucketEnd = month.plusMonths(1).atDay(1).atStartOfDay().minusNanos(1);
                    if (month.equals(currentMonth) && bucketEnd.isAfter(now)) {
                        bucketEnd = now;
                    }
                    buckets.add(new TimeBucket(bucketStart, bucketEnd, month.format(MONTH_FORMATTER)));
                }
            }
            case "YEARLY" -> {
                int currentYear = today.getYear();
                List<Integer> years = new ArrayList<>();

                if ("LAST_YEAR".equals(normalizedRange)) {
                    years.add(currentYear - 1);
                } else if ("LAST_5_YEARS".equals(normalizedRange)) {
                    for (int year = currentYear - 4; year <= currentYear; year++) {
                        years.add(year);
                    }
                } else {
                    years.add(currentYear);
                }

                for (Integer year : years) {
                    LocalDateTime bucketStart = LocalDate.of(year, 1, 1).atStartOfDay();
                    LocalDateTime bucketEnd = LocalDate.of(year, 12, 31).atTime(23, 59, 59);
                    if (year == currentYear && bucketEnd.isAfter(now)) {
                        bucketEnd = now;
                    }
                    buckets.add(new TimeBucket(bucketStart, bucketEnd, String.valueOf(year)));
                }
            }
            default -> {
                if (buckets.isEmpty()) {
                    LocalDate startDate = today.minusDays(6);
                    for (int index = 0; index < 7; index++) {
                        LocalDate date = startDate.plusDays(index);
                        LocalDateTime bucketStart = date.atStartOfDay();
                        LocalDateTime bucketEnd = date.plusDays(1).atStartOfDay().minusNanos(1);
                        if (bucketEnd.isAfter(now)) {
                            bucketEnd = now;
                        }
                        buckets.add(new TimeBucket(bucketStart, bucketEnd, date.format(DAY_FORMATTER)));
                    }
                }
            }
        }

        if (buckets.isEmpty()) {
            LocalDateTime fallbackFrom = now.minusDays(7);
            buckets.add(new TimeBucket(fallbackFrom, now, now.format(DAY_FORMATTER)));
        }

        LocalDateTime from = buckets.stream()
                .map(TimeBucket::from)
                .min(LocalDateTime::compareTo)
                .orElse(now.minusDays(7));
        LocalDateTime to = buckets.stream()
                .map(TimeBucket::to)
                .max(LocalDateTime::compareTo)
                .orElse(now);

        if (to.isBefore(from)) {
            to = from;
        }

        return new TimeSeriesDefinition(new DateRange(from, to), buckets);
    }

    private TimeBucket findBucketForTimestamp(List<TimeBucket> buckets, LocalDateTime timestamp) {
        for (TimeBucket bucket : buckets) {
            if ((timestamp.isEqual(bucket.from()) || timestamp.isAfter(bucket.from()))
                    && (timestamp.isEqual(bucket.to()) || timestamp.isBefore(bucket.to()))) {
                return bucket;
            }
        }
        return null;
    }

    private Optional<YearMonth> resolveEarliestTicketMonth() {
        return ticketRepository.findFirstByReportedDateNotNullOrderByReportedDateAsc()
                .map(Ticket::getReportedDate)
                .filter(Objects::nonNull)
                .map(YearMonth::from);
    }

    private Optional<YearMonth> resolveLatestTicketMonth() {
        return ticketRepository.findFirstByReportedDateNotNullOrderByReportedDateDesc()
                .map(Ticket::getReportedDate)
                .filter(Objects::nonNull)
                .map(YearMonth::from);
    }

    private record DateRange(LocalDateTime from, LocalDateTime to) {
        private DateRange {
        }
    }

    private record TimeSeriesDefinition(DateRange dateRange, List<TimeBucket> buckets) {
        private TimeSeriesDefinition {
        }
    }

    private record TimeBucket(LocalDateTime from, LocalDateTime to, String label) {
        private TimeBucket {
        }
    }

    private static class SlaComplianceAccumulator {
        private long within;
        private long overdue;

        private void incrementWithin() {
            within++;
        }

        private void incrementOverdue() {
            overdue++;
        }

        private long getWithin() {
            return within;
        }

        private long getOverdue() {
            return overdue;
        }
    }

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
