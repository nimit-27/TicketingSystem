package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.reports.CustomerSatisfactionReportDto;
import com.ticketingSystem.api.dto.reports.ProblemCategoryStatDto;
import com.ticketingSystem.api.dto.reports.ProblemManagementReportDto;
import com.ticketingSystem.api.dto.reports.TicketResolutionTimeReportDto;
import com.ticketingSystem.api.dto.reports.TicketSummaryReportDto;
import com.ticketingSystem.api.enums.TicketStatus;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.models.TicketFeedback;
import com.ticketingSystem.api.repository.TicketFeedbackRepository;
import com.ticketingSystem.api.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.DoubleSummaryStatistics;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.OptionalDouble;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final TicketRepository ticketRepository;
    private final TicketFeedbackRepository ticketFeedbackRepository;

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

    private double getResolutionDurationInHours(LocalDateTime reportedAt, LocalDateTime resolvedAt) {
        Duration duration = Duration.between(reportedAt, resolvedAt);
        return duration.toMinutes() / 60.0;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
