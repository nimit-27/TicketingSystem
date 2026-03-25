package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.HelpdeskUserDto;
import com.ticketingSystem.api.dto.RoleDto;
import com.ticketingSystem.api.dto.RequesterUserDto;
import com.ticketingSystem.api.dto.reports.CustomerSatisfactionCategoryStatDto;
import com.ticketingSystem.api.dto.reports.CustomerSatisfactionReportDto;
import com.ticketingSystem.api.dto.reports.ProblemCategoryStatDto;
import com.ticketingSystem.api.dto.reports.ProblemManagementReportDto;
import com.ticketingSystem.api.dto.reports.ResolutionCategoryStatDto;
import com.ticketingSystem.api.dto.reports.SlaPerformanceReportDto;
import com.ticketingSystem.api.dto.reports.SupportDashboardCategorySummaryDto;
import com.ticketingSystem.api.dto.reports.SupportDashboardAssigneeCountDto;
import com.ticketingSystem.api.dto.reports.SupportDashboardOpenResolvedDto;
import com.ticketingSystem.api.dto.reports.SupportDashboardSlaCompliancePointDto;
import com.ticketingSystem.api.dto.reports.SupportDashboardSummaryDto;
import com.ticketingSystem.api.dto.reports.SupportDashboardSummarySectionDto;
import com.ticketingSystem.api.dto.reports.SupportDashboardTicketVolumePointDto;
import com.ticketingSystem.api.dto.reports.TicketResolutionTimeReportDto;
import com.ticketingSystem.api.dto.reports.TicketSummaryReportDto;
import com.ticketingSystem.api.enums.TicketStatus;
import com.ticketingSystem.api.models.ParameterMaster;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.models.TicketFeedback;
import com.ticketingSystem.api.models.TicketSla;
import com.ticketingSystem.api.models.User;
import com.ticketingSystem.api.repository.CategoryRepository;
import com.ticketingSystem.api.repository.SubCategoryRepository;
import com.ticketingSystem.api.repository.TicketFeedbackRepository;
import com.ticketingSystem.api.repository.TicketRepository;
import com.ticketingSystem.api.repository.TicketSlaRepository;
import com.ticketingSystem.api.repository.UserRepository;
import com.ticketingSystem.api.util.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
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
import java.util.Set;
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
    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final RequesterUserService requesterUserService;
    private final RoleService roleService;
    private final ParameterMasterService parameterMasterService;

    private static final EnumSet<TicketStatus> RESOLVED_STATUSES = EnumSet.of(
            TicketStatus.RESOLVED,
            TicketStatus.CLOSED,
            TicketStatus.CANCELLED
    );

    private static final DateTimeFormatter DAY_FORMATTER = DateTimeFormatter.ofPattern("dd MMM");
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("MMM yyyy");

    private ParameterCriteria resolveParameterCriteria(String parameterKey, String parameterValue) {
        if (!StringUtils.hasText(parameterKey) || !StringUtils.hasText(parameterValue)) {
            return null;
        }

        String normalizedKey = parameterKey.trim().toLowerCase(Locale.ROOT);
        String normalizedValue = parameterValue.trim();

        return switch (normalizedKey) {
            case "assigned_to", "assignee", "assignto" -> new ParameterCriteria(normalizedValue, null, null, null, null, null, null, null, null);
            case "assigned_by", "assigner" -> new ParameterCriteria(null, normalizedValue, null, null, null, null, null, null, null);
            case "updated_by", "updatedby", "modifier" -> new ParameterCriteria(null, null, normalizedValue, null, null, null, null, null, null);
            case "created_by", "createdby", "creator"-> new ParameterCriteria(null, null, null, normalizedValue, null, null, null, null, null);
            case "requester", "requestor", "user", "user_id" -> new ParameterCriteria(null, null, null, null, normalizedValue, null, null, null, null);
            default -> null;
        };
    }

    private record ParameterCriteria(String assignedTo, String assignedBy, String updatedBy, String createdBy, String userId, String zoneCode, String regionCode, String districtCode, String issueTypeId) {
        boolean hasFilters() {
            return Stream.of(assignedTo, assignedBy, updatedBy, createdBy, userId, zoneCode, regionCode, districtCode, issueTypeId).anyMatch(StringUtils::hasText);
        }

        boolean matches(Ticket ticket) {
            if (ticket == null) {
                return false;
            }

            if (StringUtils.hasText(assignedTo) && !matchesValue(assignedTo, ticket.getAssignedTo())) {
                return false;
            }

            if (StringUtils.hasText(assignedBy) && !matchesValue(assignedBy, ticket.getAssignedBy())) {
                return false;
            }

            if (StringUtils.hasText(updatedBy) && !matchesValue(updatedBy, ticket.getUpdatedBy())) {
                return false;
            }

            if (StringUtils.hasText(createdBy) && !matchesValue(createdBy, ticket.getCreatedBy())) {
                return false;
            }

            if (StringUtils.hasText(userId) && !matchesValue(userId, ticket.getUserId())) {
                return false;
            }

            if (StringUtils.hasText(zoneCode) && !matchesValue(zoneCode, ticket.getZoneCode())) {
                return false;
            }

            if (StringUtils.hasText(regionCode) && !matchesValue(regionCode, ticket.getRegionCode())) {
                return false;
            }

            if (StringUtils.hasText(districtCode) && !matchesValue(districtCode, ticket.getDistrictCode())) {
                return false;
            }

            return !StringUtils.hasText(issueTypeId) || matchesValue(issueTypeId, ticket.getIssueTypeId());
        }

        private boolean matchesValue(String expected, String actual) {
            if (!StringUtils.hasText(expected)) {
                return true;
            }

            return expected.equalsIgnoreCase(StringUtils.hasText(actual) ? actual : "");
        }
    }

    public SupportDashboardSummaryDto getSupportDashboardSummary(String userId,
                                                                 String timeScale,
                                                                 String timeRange,
                                                                 Integer customStartYear,
                                                                 Integer customEndYear,
                                                                 String fromDate,
                                                                 String toDate) {
        TimeSeriesDefinition timeSeries = resolveTimeSeries(timeScale, timeRange, customStartYear, customEndYear, fromDate, toDate);
        DateRange dateRange = timeSeries.dateRange();

        SupportDashboardSummarySectionDto allTickets = buildSummarySection(null, dateRange);
        List<SupportDashboardCategorySummaryDto> allTicketsByCategory = buildCategorySummarySection(null, dateRange);
        SupportDashboardSummarySectionDto myWorkload = resolveUsername(userId)
                .map(username -> buildSummarySection(username, dateRange))
                .orElse(null);
        List<SupportDashboardCategorySummaryDto> myWorkloadByCategory = resolveUsername(userId)
                .map(username -> buildCategorySummarySection(username, dateRange))
                .orElse(null);

        SupportDashboardOpenResolvedDto openResolved = buildOpenResolvedSnapshot(dateRange);
        List<SupportDashboardSlaCompliancePointDto> slaCompliance = buildSlaComplianceTrend(timeSeries);
        List<SupportDashboardTicketVolumePointDto> ticketVolume = buildTicketVolumeTrend(timeSeries);
        List<SupportDashboardAssigneeCountDto> assignedTicketsByAssignee = buildAssignedTicketsByAssignee(dateRange, null);
        long unresolvedBreachedTickets = buildUnresolvedBreachedCount(dateRange, null);

        return SupportDashboardSummaryDto.builder()
                .allTickets(allTickets)
                .myWorkload(myWorkload)
                .allTicketsByCategory(allTicketsByCategory)
                .myWorkloadByCategory(myWorkloadByCategory)
                .openResolved(openResolved)
                .slaCompliance(slaCompliance)
                .ticketVolume(ticketVolume)
                .assignedTicketsByAssignee(assignedTicketsByAssignee)
                .unresolvedBreachedTickets(unresolvedBreachedTickets)
                .build();
    }

    public SupportDashboardSummaryDto getSupportDashboardSummaryFiltered(String userId,
                                                                         String timeScale,
                                                                         String timeRange,
                                                                         Integer customStartYear,
                                                                         Integer customEndYear,
                                                                         String fromDate,
                                                                         String toDate,
                                                                         String parameterKey,
                                                                         String parameterValue,
                                                                         String issueTypeId,
                                                                         MultiValueMap<String, String> allParams) {
        List<String> roleIds = userService.getHelpdeskUserDetails(userId)
                .map(HelpdeskUserDto::getRoleIds)
                .orElseGet(List::of);
        if (roleIds.isEmpty()) {
            roleIds = requesterUserService.getRequesterUser(userId)
                    .map(RequesterUserDto::getRoleIds)
                    .orElseGet(List::of);
        }

        List<ParameterMaster> parametersListByRoleId = parameterMasterService
                .getParametersForRoles(roleIds);

        List<String> parameterKeysList = parametersListByRoleId.stream()
                .map(ParameterMaster::getParameterKey)
                .filter(StringUtils::hasText)
                .toList();

        TimeSeriesDefinition timeSeries = resolveTimeSeries(timeScale, timeRange, customStartYear, customEndYear, fromDate, toDate);
        DateRange dateRange = timeSeries.dateRange();

        ParameterCriteria parameterCriteria = resolveDashboardParameterCriteria(userId, allParams, parameterKeysList, issueTypeId);

        SupportDashboardSummarySectionDto allTickets = buildSummarySection(null, dateRange, parameterCriteria);
        List<SupportDashboardCategorySummaryDto> allTicketsByCategory = buildCategorySummarySection(null, dateRange, parameterCriteria);
        SupportDashboardSummarySectionDto myWorkload = resolveUsername(userId)
                .map(username -> buildSummarySection(username, dateRange, parameterCriteria))
                .orElse(null);
        List<SupportDashboardCategorySummaryDto> myWorkloadByCategory = resolveUsername(userId)
                .map(username -> buildCategorySummarySection(username, dateRange, parameterCriteria))
                .orElse(null);

        SupportDashboardOpenResolvedDto openResolved = buildOpenResolvedSnapshot(dateRange, parameterCriteria);
        List<SupportDashboardSlaCompliancePointDto> slaCompliance = buildSlaComplianceTrend(timeSeries, parameterCriteria);
        List<SupportDashboardTicketVolumePointDto> ticketVolume = buildTicketVolumeTrend(timeSeries, parameterCriteria);
        List<SupportDashboardAssigneeCountDto> assignedTicketsByAssignee = buildAssignedTicketsByAssignee(dateRange, parameterCriteria);
        long unresolvedBreachedTickets = buildUnresolvedBreachedCount(dateRange, parameterCriteria);

        return SupportDashboardSummaryDto.builder()
                .allTickets(allTickets)
                .myWorkload(myWorkload)
                .allTicketsByCategory(allTicketsByCategory)
                .myWorkloadByCategory(myWorkloadByCategory)
                .openResolved(openResolved)
                .slaCompliance(slaCompliance)
                .ticketVolume(ticketVolume)
                .assignedTicketsByAssignee(assignedTicketsByAssignee)
                .unresolvedBreachedTickets(unresolvedBreachedTickets)
                .build();
    }

    private List<SupportDashboardAssigneeCountDto> buildAssignedTicketsByAssignee(DateRange dateRange,
                                                                                   ParameterCriteria parameterCriteria) {
        List<TicketRepository.AssignedToCountProjection> projections;
        if (parameterCriteria != null && parameterCriteria.hasFilters()) {
            projections = ticketRepository.countTicketsByAssigneeForStatusWithFiltersAndParameters(
                    TicketStatus.ASSIGNED,
                    null,
                    dateRange.from(),
                    dateRange.to(),
                    parameterCriteria.assignedTo(),
                    parameterCriteria.assignedBy(),
                    parameterCriteria.updatedBy(),
                    parameterCriteria.createdBy(),
                    parameterCriteria.userId(),
                    parameterCriteria.zoneCode(),
                    parameterCriteria.regionCode(),
                    parameterCriteria.districtCode(),
                    parameterCriteria.issueTypeId()
            );
        } else {
            projections = ticketRepository.countTicketsByAssigneeForStatusWithFilters(
                    TicketStatus.ASSIGNED,
                    null,
                    dateRange.from(),
                    dateRange.to()
            );
        }

        return projections.stream()
                .map(projection -> SupportDashboardAssigneeCountDto.builder()
                        .assignee(StringUtils.hasText(projection.getAssignedTo()) ? projection.getAssignedTo() : "Unassigned")
                        .count(Optional.ofNullable(projection.getCount()).orElse(0L))
                        .build())
                .sorted(Comparator.comparingLong(SupportDashboardAssigneeCountDto::getCount).reversed())
                .toList();
    }

    private ParameterCriteria resolveDashboardParameterCriteria(String userId,
                                                                MultiValueMap<String, String> allParams,
                                                                List<String> parameterKeysList,
                                                                String issueTypeId) {
        if (!StringUtils.hasText(userId) || parameterKeysList == null || parameterKeysList.isEmpty()) {
            return null;
        }

        List<String> normalizedParameters = parameterKeysList.stream()
                .filter(StringUtils::hasText)
                .map(param -> param.trim().toLowerCase(Locale.ROOT))
                .toList();

        if (normalizedParameters.isEmpty()) {
            return null;
        }

        List<String> normalizedRequestParams = Optional.ofNullable(allParams)
                .map(MultiValueMap::keySet)
                .orElseGet(Set::of)
                .stream()
                .filter(StringUtils::hasText)
                .map(param -> param.trim().toLowerCase(Locale.ROOT))
                .collect(Collectors.toCollection(ArrayList::new));

        List<String> matchingParameters = normalizedParameters.stream()
                .filter(normalizedRequestParams::contains)
                .toList();

        List<String> effectiveParameters;
        if (matchingParameters.isEmpty()) {
            if (normalizedParameters.contains("all")) {
                return null;
            }
            effectiveParameters = List.of(normalizedParameters.get(0));
        } else {
            effectiveParameters = matchingParameters;
        }

        String parameterAssignedTo = null;
        String parameterAssignedBy = null;
        String parameterUpdatedBy = null;
        String parameterCreatedBy = null;
        String user_id = null;

        for (String parameter : effectiveParameters) {
            switch (parameter) {
                case "assignedto" -> parameterAssignedTo = userId;
                case "assignedby" -> parameterAssignedBy = userId;
                case "updatedby" -> parameterUpdatedBy = userId;
                case "createdby" -> parameterCreatedBy = userId;
                case "requestedby" -> user_id = userId;
                default -> {
                }
            }
        }

        String zoneCode = StringUtils.hasText(allParams.getFirst("zoneCode")) ? allParams.getFirst("zoneCode") : null;
        String regionCode = StringUtils.hasText(allParams.getFirst("regionCode")) ? allParams.getFirst("regionCode") : null;
        String districtCode = StringUtils.hasText(allParams.getFirst("districtCode")) ? allParams.getFirst("districtCode") : null;
        String normalizedIssueTypeId = StringUtils.hasText(issueTypeId) ? issueTypeId : null;

        ParameterCriteria parameterCriteria = new ParameterCriteria(
                parameterAssignedTo,
                parameterAssignedBy,
                parameterUpdatedBy,
                parameterCreatedBy,
                user_id,
                zoneCode,
                regionCode,
                districtCode,
                normalizedIssueTypeId
        );

        return parameterCriteria.hasFilters() ? parameterCriteria : null;
    }

    private SupportDashboardSummarySectionDto buildSummarySection(String assignedTo, DateRange dateRange) {
        return buildSummarySection(assignedTo, dateRange, null);
    }

    private SupportDashboardSummarySectionDto buildSummarySection(String assignedTo,
                                                                  DateRange dateRange,
                                                                  ParameterCriteria parameterCriteria) {
        Map<String, Long> severityCounts = createEmptySeverityCounts();
        Map<String, Long> statusCounts = createEmptyStatusCounts();

        List<TicketRepository.SeverityCountProjection> severityProjections;
        if (parameterCriteria != null && parameterCriteria.hasFilters()) {
            severityProjections = ticketRepository.countTicketsBySeverityWithParameter(
                    TicketStatus.OPEN,
                    assignedTo,
                    dateRange.from(),
                    dateRange.to(),
                    parameterCriteria.assignedTo(),
                    parameterCriteria.assignedBy(),
                    parameterCriteria.updatedBy(),
                    parameterCriteria.createdBy(),
                    parameterCriteria.userId(),
                    parameterCriteria.zoneCode(),
                    parameterCriteria.regionCode(),
                    parameterCriteria.districtCode(),
                    parameterCriteria.issueTypeId()
            );
        } else {
            severityProjections = ticketRepository.countTicketsBySeverity(
                    TicketStatus.OPEN,
                    assignedTo,
                    dateRange.from(),
                    dateRange.to()
            );
        }

        severityProjections.forEach(projection -> {
            if (projection.getSeverity() == null) {
                return;
            }

            String severityKey = projection.getSeverity().toUpperCase(Locale.ROOT);
            if (severityCounts.containsKey(severityKey)) {
                severityCounts.put(severityKey, Optional.ofNullable(projection.getCount()).orElse(0L));
            }
        });

        List<TicketRepository.StatusCountProjection> statusProjections;
        if (parameterCriteria != null && parameterCriteria.hasFilters()) {
            statusProjections = ticketRepository.countTicketsByStatusWithFiltersAndParameters(
                    assignedTo,
                    dateRange.from(),
                    dateRange.to(),
                    parameterCriteria.assignedTo(),
                    parameterCriteria.assignedBy(),
                    parameterCriteria.updatedBy(),
                    parameterCriteria.createdBy(),
                    parameterCriteria.userId,
                    parameterCriteria.zoneCode(),
                    parameterCriteria.regionCode(),
                    parameterCriteria.districtCode(),
                    parameterCriteria.issueTypeId()
            );
        } else {
            statusProjections = ticketRepository.countTicketsByStatusWithFilters(
                    assignedTo,
                    dateRange.from(),
                    dateRange.to()
            );
        }

        statusProjections.forEach(projection -> {
            if (projection.getStatus() == null) {
                return;
            }

            String statusKey = projection.getStatus().name();
            if (statusCounts.containsKey(statusKey)) {
                statusCounts.put(statusKey, Optional.ofNullable(projection.getCount()).orElse(0L));
            }
        });

        long pendingCount;
        long totalTickets;

        if (parameterCriteria != null && parameterCriteria.hasFilters()) {
            pendingCount = ticketRepository.countTicketsByStatusAndFiltersWithParameter(
                    TicketStatus.OPEN,
                    assignedTo,
                    dateRange.from(),
                    dateRange.to(),
                    parameterCriteria.assignedTo(),
                    parameterCriteria.assignedBy(),
                    parameterCriteria.updatedBy(),
                    parameterCriteria.createdBy(),
                    parameterCriteria.userId,
                    parameterCriteria.zoneCode(),
                    parameterCriteria.regionCode(),
                    parameterCriteria.districtCode(),
                    parameterCriteria.issueTypeId()
            );

            totalTickets = ticketRepository.countTicketsByStatusAndFiltersWithParameter(
                    null,
                    assignedTo,
                    dateRange.from(),
                    dateRange.to(),
                    parameterCriteria.assignedTo(),
                    parameterCriteria.assignedBy(),
                    parameterCriteria.updatedBy(),
                    parameterCriteria.createdBy(),
                    parameterCriteria.userId,
                    parameterCriteria.zoneCode(),
                    parameterCriteria.regionCode(),
                    parameterCriteria.districtCode(),
                    parameterCriteria.issueTypeId()
            );
        } else {
            pendingCount = ticketRepository.countTicketsByStatusAndFilters(
                    TicketStatus.OPEN,
                    assignedTo,
                    dateRange.from(),
                    dateRange.to()
            );

            totalTickets = ticketRepository.countTicketsByStatusAndFilters(
                    null,
                    assignedTo,
                    dateRange.from(),
                    dateRange.to()
            );
        }

        return SupportDashboardSummarySectionDto.builder()
                .pendingForAcknowledgement(pendingCount)
                .severityCounts(severityCounts)
                .statusCounts(statusCounts)
                .totalTickets(totalTickets)
                .build();
    }

    private List<SupportDashboardCategorySummaryDto> buildCategorySummarySection(String assignedTo, DateRange dateRange) {
        return buildCategorySummarySection(assignedTo, dateRange, null);
    }

    private List<SupportDashboardCategorySummaryDto> buildCategorySummarySection(String assignedTo,
                                                                                 DateRange dateRange,
                                                                                 ParameterCriteria parameterCriteria) {
        Map<String, Long> baseSeverityCounts = createEmptySeverityCounts();

        List<TicketRepository.DashboardCategoryAggregation> aggregations;
        if (parameterCriteria != null && parameterCriteria.hasFilters()) {
            aggregations = ticketRepository.aggregateDashboardStatsByCategoryWithParameter(
                    assignedTo,
                    dateRange.from(),
                    dateRange.to(),
                    parameterCriteria.assignedTo(),
                    parameterCriteria.assignedBy(),
                    parameterCriteria.updatedBy(),
                    parameterCriteria.createdBy(),
                    parameterCriteria.zoneCode(),
                    parameterCriteria.regionCode(),
                    parameterCriteria.districtCode(),
                    parameterCriteria.issueTypeId()
            );
        } else {
            aggregations = ticketRepository.aggregateDashboardStatsByCategory(assignedTo, dateRange.from(), dateRange.to());
        }

        return aggregations.stream()
                .map(aggregation -> {
                    Map<String, Long> severityCounts = new LinkedHashMap<>(baseSeverityCounts);
                    severityCounts.put("S1", Optional.ofNullable(aggregation.getS1Count()).orElse(0L));
                    severityCounts.put("S2", Optional.ofNullable(aggregation.getS2Count()).orElse(0L));
                    severityCounts.put("S3", Optional.ofNullable(aggregation.getS3Count()).orElse(0L));
                    severityCounts.put("S4", Optional.ofNullable(aggregation.getS4Count()).orElse(0L));

                    return SupportDashboardCategorySummaryDto.builder()
                            .zone(aggregation.getZone())
                            .regionName(aggregation.getRegionName())
                            .districtName(aggregation.getDistrictName())
                            .category(Optional.ofNullable(aggregation.getCategoryId()).orElse(aggregation.getCategoryName()))
                            .subcategory(Optional.ofNullable(aggregation.getSubcategoryId()).orElse(aggregation.getSubcategoryName()))
                            .categoryName(aggregation.getCategoryName())
                            .subcategoryName(aggregation.getSubcategoryName())
                            .pendingForAcknowledgement(Optional.ofNullable(aggregation.getPendingCount()).orElse(0L))
                            .totalTickets(Optional.ofNullable(aggregation.getTotalCount()).orElse(0L))
                            .severityCounts(severityCounts)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private SupportDashboardOpenResolvedDto buildOpenResolvedSnapshot(DateRange dateRange) {
        return buildOpenResolvedSnapshot(dateRange, null);
    }

    private SupportDashboardOpenResolvedDto buildOpenResolvedSnapshot(DateRange dateRange, ParameterCriteria parameterCriteria) {
        List<Ticket> reportedTickets = (parameterCriteria != null && parameterCriteria.hasFilters())
                ? ticketRepository.findByReportedDateBetweenWithParameters(
                dateRange.from(),
                dateRange.to(),
                parameterCriteria.assignedTo(),
                parameterCriteria.assignedBy(),
                parameterCriteria.updatedBy(),
                parameterCriteria.createdBy(),
                parameterCriteria.userId(),
                parameterCriteria.zoneCode(),
                parameterCriteria.regionCode(),
                parameterCriteria.districtCode(),
                parameterCriteria.issueTypeId()
        ) : ticketRepository.findByReportedDateBetween(dateRange.from(), dateRange.to());

        EnumSet<TicketStatus> openLikeStatuses = EnumSet.allOf(TicketStatus.class);
        openLikeStatuses.removeAll(RESOLVED_STATUSES);

        long openTickets = reportedTickets.stream()
                .filter(Objects::nonNull)
                .filter(ticket -> {
                    TicketStatus status = ticket.getTicketStatus();
                    return status == null || openLikeStatuses.contains(status);
                })
                .count();

        List<Ticket> resolvedTickets = (parameterCriteria != null && parameterCriteria.hasFilters())
                ? ticketRepository.findByResolvedAtBetweenWithParameters(
                dateRange.from(),
                dateRange.to(),
                parameterCriteria.assignedTo(),
                parameterCriteria.assignedBy(),
                parameterCriteria.updatedBy(),
                parameterCriteria.createdBy(),
                parameterCriteria.zoneCode(),
                parameterCriteria.regionCode(),
                parameterCriteria.districtCode(),
                parameterCriteria.issueTypeId()
        ) : ticketRepository.findByResolvedAtBetween(dateRange.from(), dateRange.to());

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
        return buildSlaComplianceTrend(timeSeries, null);
    }

    private List<SupportDashboardSlaCompliancePointDto> buildSlaComplianceTrend(TimeSeriesDefinition timeSeries,
                                                                                ParameterCriteria parameterCriteria) {
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

            Ticket ticket = sla.getTicket();
            if (ticket == null || ticket.getTicketStatus() == null) {
                continue;
            }

            if (!RESOLVED_STATUSES.contains(ticket.getTicketStatus())) {
                continue;
            }

            if (parameterCriteria != null && parameterCriteria.hasFilters() && !parameterCriteria.matches(ticket)) {
                continue;
            }

            LocalDateTime resolvedAt = ticket.getResolvedAt();
            if (resolvedAt == null || !isWithinRange(resolvedAt, timeSeries.dateRange())) {
                continue;
            }

            TimeBucket bucket = findBucketForTimestamp(buckets, resolvedAt);
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
        return buildTicketVolumeTrend(timeSeries, null);
    }

    private List<SupportDashboardTicketVolumePointDto> buildTicketVolumeTrend(TimeSeriesDefinition timeSeries,
                                                                              ParameterCriteria parameterCriteria) {
        List<TimeBucket> buckets = timeSeries.buckets();
        if (buckets.isEmpty()) {
            return List.of();
        }

        Map<String, Long> countsByLabel = new LinkedHashMap<>();
        buckets.forEach(bucket -> countsByLabel.put(bucket.label(), 0L));

        List<Ticket> tickets = (parameterCriteria != null && parameterCriteria.hasFilters())
                ? ticketRepository.findByReportedDateBetweenWithParameters(
                timeSeries.dateRange().from(),
                timeSeries.dateRange().to(),
                parameterCriteria.assignedTo(),
                parameterCriteria.assignedBy(),
                parameterCriteria.updatedBy(),
                parameterCriteria.createdBy(),
                parameterCriteria.userId,
                parameterCriteria.zoneCode(),
                parameterCriteria.regionCode(),
                parameterCriteria.districtCode(),
                parameterCriteria.issueTypeId()
        ) : ticketRepository.findByReportedDateBetween(timeSeries.dateRange().from(), timeSeries.dateRange().to());

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

    private long buildUnresolvedBreachedCount(DateRange dateRange, ParameterCriteria parameterCriteria) {
        List<TicketSla> slaEntries = ticketSlaRepository.findAllWithTicket();

        EnumSet<TicketStatus> resolvedStatuses = EnumSet.copyOf(RESOLVED_STATUSES);

        return slaEntries.stream()
                .filter(Objects::nonNull)
                .filter(sla -> Optional.ofNullable(sla.getBreachedByMinutes()).orElse(0L) > 0L)
                .map(TicketSla::getTicket)
                .filter(Objects::nonNull)
                .filter(ticket -> ticket.getTicketStatus() == null || !resolvedStatuses.contains(ticket.getTicketStatus()))
                .filter(ticket -> {
                    if (parameterCriteria != null && parameterCriteria.hasFilters() && !parameterCriteria.matches(ticket)) {
                        return false;
                    }
                    return isWithinRange(ticket.getReportedDate(), dateRange);
                })
                .count();
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

    private Map<String, Long> createEmptyStatusCounts() {
        Map<String, Long> statusCounts = new LinkedHashMap<>();
        for (TicketStatus status : TicketStatus.values()) {
            statusCounts.put(status.name(), 0L);
        }
        return statusCounts;
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
                                                   Integer customEndYear,
                                                   String fromDate,
                                                   String toDate) {
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();
        String normalizedScale = StringUtils.hasText(timeScale) ? timeScale.trim().toUpperCase(Locale.ROOT) : "";
        String normalizedRange = StringUtils.hasText(timeRange) ? timeRange.trim().toUpperCase(Locale.ROOT) : "";

        List<TimeBucket> buckets = new ArrayList<>();

        if ("CUSTOM".equals(normalizedScale) || "CUSTOM_DATE_RANGE".equals(normalizedRange)) {
            TimeSeriesDefinition customDefinition = buildCustomDateRangeSeries(fromDate, toDate, now);
            if (customDefinition != null) {
                return customDefinition;
            }
        }

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

    private TimeSeriesDefinition buildCustomDateRangeSeries(String fromDate, String toDate, LocalDateTime fallbackNow) {
        LocalDateTime parsedFrom = parseStartDate(fromDate);
        LocalDateTime parsedTo = parseEndDate(toDate);

        if (parsedFrom == null && parsedTo == null) {
            return null;
        }

        if (parsedFrom == null) {
            parsedFrom = parsedTo;
        }

        if (parsedTo == null) {
            parsedTo = parsedFrom;
        }

        if (parsedTo.isBefore(parsedFrom)) {
            LocalDateTime temp = parsedFrom;
            parsedFrom = parsedTo;
            parsedTo = temp;
        }

        if (parsedFrom.isAfter(fallbackNow)) {
            parsedFrom = fallbackNow;
        }

        if (parsedTo.isAfter(fallbackNow)) {
            parsedTo = fallbackNow;
        }

        List<TimeBucket> buckets = new ArrayList<>();
        LocalDate startDate = parsedFrom.toLocalDate();
        LocalDate endDate = parsedTo.toLocalDate();
        LocalDate cursor = startDate;

        while (!cursor.isAfter(endDate)) {
            LocalDateTime bucketStart = cursor.equals(startDate) ? parsedFrom : cursor.atStartOfDay();
            LocalDateTime bucketEnd = cursor.equals(endDate)
                    ? parsedTo
                    : cursor.plusDays(1).atStartOfDay().minusNanos(1);
            buckets.add(new TimeBucket(bucketStart, bucketEnd, cursor.format(DAY_FORMATTER)));
            cursor = cursor.plusDays(1);
        }

        if (buckets.isEmpty()) {
            buckets.add(new TimeBucket(parsedFrom, parsedTo, parsedFrom.toLocalDate().format(DAY_FORMATTER)));
        }

        return new TimeSeriesDefinition(new DateRange(parsedFrom, parsedTo), buckets);
    }

    private LocalDateTime parseStartDate(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            LocalDate date = LocalDate.parse(value.trim());
            return date.atStartOfDay();
        } catch (DateTimeParseException ignored) {
        }
        return DateTimeUtils.parseToLocalDateTime(value);
    }

    private LocalDateTime parseEndDate(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            LocalDate date = LocalDate.parse(value.trim());
            return date.atTime(23, 59, 59, 999_999_999);
        } catch (DateTimeParseException ignored) {
        }
        return DateTimeUtils.parseToLocalDateTime(value);
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

    private static class CategoryResolutionAccumulator {
        private final String category;
        private final String subcategory;
        private final String categoryName;
        private final String subcategoryName;
        private long resolvedCount;
        private long closedCount;
        private double totalResolutionHours;

        private CategoryResolutionAccumulator(String category, String subcategory, String categoryName, String subcategoryName) {
            this.category = category;
            this.subcategory = subcategory;
            this.categoryName = categoryName;
            this.subcategoryName = subcategoryName;
        }

        private void recordResolution(double hours) {
            resolvedCount++;
            totalResolutionHours += hours;
        }

        private void incrementClosed() {
            closedCount++;
        }

        private ResolutionCategoryStatDto toDto() {
            double average = resolvedCount == 0 ? 0.0 : round(totalResolutionHours / resolvedCount);
            return ResolutionCategoryStatDto.builder()
                    .category(category)
                    .subcategory(subcategory)
                    .categoryName(categoryName)
                    .subcategoryName(subcategoryName)
                    .resolvedTickets(resolvedCount)
                    .closedTickets(closedCount)
                    .averageResolutionHours(average)
                    .build();
        }
    }

    private List<Ticket> getFilteredTickets(String fromDate,
                                            String toDate,
                                            String categoryId,
                                            String subCategoryId,
                                            String zoneCode,
                                            String regionCode,
                                            String districtCode,
                                            String issueTypeId,
                                            String divisionId,
                                            String assignedTo) {
        LocalDateTime from = parseFromDateTime(fromDate);
        LocalDateTime to = parseToDateTime(toDate);
        return ticketRepository.findAll().stream()
                .filter(ticket -> matchesFilter(ticket.getCategory(), categoryId))
                .filter(ticket -> matchesFilter(ticket.getSubCategory(), subCategoryId))
                .filter(ticket -> matchesFilter(ticket.getZoneCode(), zoneCode))
                .filter(ticket -> matchesFilter(ticket.getRegionCode(), regionCode))
                .filter(ticket -> matchesFilter(ticket.getDistrictCode(), districtCode))
                .filter(ticket -> matchesFilter(ticket.getIssueTypeId(), issueTypeId))
                .filter(ticket -> matchesFilter(ticket.getDivision(), divisionId))
                .filter(ticket -> matchesFilter(ticket.getAssignedTo(), assignedTo))
                .filter(ticket -> matchesDateRange(ticket.getReportedDate(), from, to))
                .collect(Collectors.toList());
    }

    private boolean matchesFilter(String actual, String expected) {
        if (!StringUtils.hasText(expected)) {
            return true;
        }
        return StringUtils.hasText(actual) && expected.trim().equalsIgnoreCase(actual.trim());
    }

    private boolean matchesDateRange(LocalDateTime ticketDate, LocalDateTime from, LocalDateTime to) {
        if (from == null && to == null) {
            return true;
        }
        if (ticketDate == null) {
            return false;
        }
        if (from != null && ticketDate.isBefore(from)) {
            return false;
        }
        return to == null || !ticketDate.isAfter(to);
    }

    private LocalDateTime parseFromDateTime(String fromDate) {
        if (!StringUtils.hasText(fromDate)) {
            return null;
        }
        try {
            return LocalDate.parse(fromDate).atStartOfDay();
        } catch (DateTimeParseException ignored) {
            return null;
        }
    }

    private LocalDateTime parseToDateTime(String toDate) {
        if (!StringUtils.hasText(toDate)) {
            return null;
        }
        try {
            return LocalDate.parse(toDate).plusDays(1).atStartOfDay().minusNanos(1);
        } catch (DateTimeParseException ignored) {
            return null;
        }
    }

    private Map<String, String> getCategoryNameLookup() {
        return categoryRepository.findAll().stream()
                .collect(Collectors.toMap(
                        category -> category.getCategoryId() == null ? "" : category.getCategoryId(),
                        category -> category.getCategory() == null ? "" : category.getCategory(),
                        (first, second) -> first,
                        LinkedHashMap::new
                ));
    }

    private Map<String, String> getSubCategoryNameLookup() {
        return subCategoryRepository.findAll().stream()
                .collect(Collectors.toMap(
                        subCategory -> subCategory.getSubCategoryId() == null ? "" : subCategory.getSubCategoryId(),
                        subCategory -> subCategory.getSubCategory() == null ? "" : subCategory.getSubCategory(),
                        (first, second) -> first,
                        LinkedHashMap::new
                ));
    }

    public TicketSummaryReportDto getTicketSummaryReport(String fromDate,
                                                         String toDate,
                                                         String categoryId,
                                                         String subCategoryId,
                                                         String zoneCode,
                                                         String regionCode,
                                                         String districtCode,
                                                         String issueTypeId,
                                                         String divisionId,
                                                         String assignedTo) {
        List<Ticket> filteredTickets = getFilteredTickets(fromDate, toDate, categoryId, subCategoryId, zoneCode, regionCode, districtCode, issueTypeId, divisionId, assignedTo);

        long totalTickets = filteredTickets.size();
        long openTickets = filteredTickets.stream().filter(ticket -> TicketStatus.OPEN.equals(ticket.getTicketStatus())).count();
        long closedTickets = filteredTickets.stream().filter(ticket -> TicketStatus.CLOSED.equals(ticket.getTicketStatus())).count();

        Map<String, Long> statusCounts = filteredTickets.stream()
                .collect(Collectors.groupingBy(
                        ticket -> ticket.getTicketStatus() != null ? ticket.getTicketStatus().name() : "UNKNOWN",
                        LinkedHashMap::new,
                        Collectors.counting()
                ));

        Map<String, Long> modeCounts = filteredTickets.stream()
                .collect(Collectors.groupingBy(
                        ticket -> ticket.getMode() != null ? ticket.getMode().name().toUpperCase(Locale.ROOT) : "UNSPECIFIED",
                        LinkedHashMap::new,
                        Collectors.counting()
                ));

        return TicketSummaryReportDto.builder()
                .totalTickets(totalTickets)
                .openTickets(openTickets)
                .closedTickets(closedTickets)
                .statusCounts(statusCounts)
                .modeCounts(modeCounts)
                .build();
    }

    public TicketResolutionTimeReportDto getTicketResolutionTimeReport(String fromDate,
                                                                     String toDate,
                                                                     String categoryId,
                                                                     String subCategoryId,
                                                                     String zoneCode,
                                                                     String regionCode,
                                                                     String districtCode,
                                                                     String issueTypeId,
                                                                     String divisionId,
                                                                     String assignedTo) {
        List<Ticket> filteredTickets = getFilteredTickets(fromDate, toDate, categoryId, subCategoryId, zoneCode, regionCode, districtCode, issueTypeId, divisionId, assignedTo);

        List<Ticket> resolvedTickets = filteredTickets.stream()
                .filter(ticket -> ticket.getReportedDate() != null && ticket.getResolvedAt() != null)
                .filter(ticket -> ticket.getTicketStatus() == TicketStatus.RESOLVED || ticket.getTicketStatus() == TicketStatus.CLOSED)
                .collect(Collectors.toList());

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

        Map<String, List<Ticket>> ticketsByCategory = resolvedTickets.stream()
                .collect(Collectors.groupingBy(
                        ticket -> (ticket.getCategory() == null ? "N/A" : ticket.getCategory()) + "||" + (ticket.getSubCategory() == null ? "N/A" : ticket.getSubCategory())
                ));

        List<ResolutionCategoryStatDto> categoryStats = ticketsByCategory.entrySet().stream()
                .map(entry -> {
                    List<Ticket> tickets = entry.getValue();
                    Ticket first = tickets.get(0);
                    long closedCount = tickets.stream().filter(t -> TicketStatus.CLOSED.equals(t.getTicketStatus())).count();
                    double averageHours = tickets.stream()
                            .mapToDouble(ticket -> getResolutionDurationInHours(ticket.getReportedDate(), ticket.getResolvedAt()))
                            .average()
                            .orElse(0.0);

                    return ResolutionCategoryStatDto.builder()
                            .category(first.getCategory())
                            .subcategory(first.getSubCategory())
                            .categoryName(first.getCategory())
                            .subcategoryName(first.getSubCategory())
                            .resolvedTickets(tickets.size())
                            .closedTickets(closedCount)
                            .averageResolutionHours(round(averageHours))
                            .build();
                })
                .sorted(Comparator.comparingLong(ResolutionCategoryStatDto::getResolvedTickets).reversed())
                .collect(Collectors.toList());

        long resolvedTicketCount = categoryStats.stream()
                .mapToLong(ResolutionCategoryStatDto::getResolvedTickets)
                .sum();

        double weightedAverageResolutionHours = resolvedTicketCount == 0 ? 0.0
                : round(resolvedTickets.stream()
                .mapToDouble(ticket -> getResolutionDurationInHours(ticket.getReportedDate(), ticket.getResolvedAt()))
                .average()
                .orElse(0.0));

        return TicketResolutionTimeReportDto.builder()
                .resolvedTicketCount(resolvedTicketCount)
                .averageResolutionHours(weightedAverageResolutionHours)
                .averageResolutionHoursByStatus(averageByStatus)
                .categoryStats(categoryStats)
                .build();
    }

    public CustomerSatisfactionReportDto getCustomerSatisfactionReport(String fromDate,
                                                                     String toDate,
                                                                     String categoryId,
                                                                     String subCategoryId,
                                                                     String zoneCode,
                                                                     String regionCode,
                                                                     String districtCode,
                                                                     String issueTypeId,
                                                                     String divisionId,
                                                                     String assignedTo) {
        List<Ticket> filteredTickets = getFilteredTickets(fromDate, toDate, categoryId, subCategoryId, zoneCode, regionCode, districtCode, issueTypeId, divisionId, assignedTo);
        List<String> ticketIds = filteredTickets.stream().map(Ticket::getId).filter(Objects::nonNull).toList();
        List<TicketFeedback> feedbacks = ticketIds.isEmpty() ? List.of() : ticketFeedbackRepository.findByTicketIdIn(ticketIds);

        if (feedbacks.isEmpty()) {
            return CustomerSatisfactionReportDto.builder()
                    .totalResponses(0)
                    .overallSatisfactionAverage(0.0)
                    .resolutionEffectivenessAverage(0.0)
                    .communicationSupportAverage(0.0)
                    .timelinessAverage(0.0)
                    .compositeScore(0.0)
                    .categoryStats(List.of())
                    .build();
        }

        long totalResponses = feedbacks.size();

        double overallSatisfaction = feedbacks.stream()
                .mapToDouble(feedback -> Optional.ofNullable(feedback.getOverallSatisfaction()).orElse(0))
                .sum();

        double resolutionEffectiveness = feedbacks.stream()
                .mapToDouble(feedback -> Optional.ofNullable(feedback.getResolutionEffectiveness()).orElse(0))
                .sum();

        double communicationSupport = feedbacks.stream()
                .mapToDouble(feedback -> Optional.ofNullable(feedback.getCommunicationSupport()).orElse(0))
                .sum();

        double timeliness = feedbacks.stream()
                .mapToDouble(feedback -> Optional.ofNullable(feedback.getTimeliness()).orElse(0))
                .sum();

        double compositeScore = feedbacks.stream()
                .mapToDouble(feedback -> (
                        Optional.ofNullable(feedback.getOverallSatisfaction()).orElse(0)
                                + Optional.ofNullable(feedback.getResolutionEffectiveness()).orElse(0)
                                + Optional.ofNullable(feedback.getCommunicationSupport()).orElse(0)
                                + Optional.ofNullable(feedback.getTimeliness()).orElse(0)
                ) / 4.0)
                .sum();

        Map<String, List<TicketFeedback>> feedbacksByCategory = feedbacks.stream()
                .collect(Collectors.groupingBy(feedback -> {
                    Ticket ticket = filteredTickets.stream()
                            .filter(t -> Objects.equals(t.getId(), feedback.getTicketId()))
                            .findFirst()
                            .orElse(null);
                    String category = ticket != null ? ticket.getCategory() : "N/A";
                    String subCategory = ticket != null ? ticket.getSubCategory() : "N/A";
                    return category + "||" + subCategory;
                }));

        List<CustomerSatisfactionCategoryStatDto> categoryStats = feedbacksByCategory.entrySet().stream()
                .map(entry -> {
                    String[] parts = entry.getKey().split("\\|\\|", 2);
                    List<TicketFeedback> categoryFeedbacks = entry.getValue();
                    long responses = categoryFeedbacks.size();
                    double overall = categoryFeedbacks.stream().mapToDouble(f -> Optional.ofNullable(f.getOverallSatisfaction()).orElse(0)).average().orElse(0.0);
                    double resolution = categoryFeedbacks.stream().mapToDouble(f -> Optional.ofNullable(f.getResolutionEffectiveness()).orElse(0)).average().orElse(0.0);
                    double communication = categoryFeedbacks.stream().mapToDouble(f -> Optional.ofNullable(f.getCommunicationSupport()).orElse(0)).average().orElse(0.0);
                    double timely = categoryFeedbacks.stream().mapToDouble(f -> Optional.ofNullable(f.getTimeliness()).orElse(0)).average().orElse(0.0);

                    return CustomerSatisfactionCategoryStatDto.builder()
                            .category(parts[0])
                            .subcategory(parts.length > 1 ? parts[1] : "N/A")
                            .categoryName(parts[0])
                            .subcategoryName(parts.length > 1 ? parts[1] : "N/A")
                            .totalResponses(responses)
                            .overallSatisfactionAverage(round(overall))
                            .resolutionEffectivenessAverage(round(resolution))
                            .communicationSupportAverage(round(communication))
                            .timelinessAverage(round(timely))
                            .compositeScore(round((overall + resolution + communication + timely) / 4.0))
                            .build();
                })
                .collect(Collectors.toList());

        return CustomerSatisfactionReportDto.builder()
                .totalResponses(totalResponses)
                .overallSatisfactionAverage(totalResponses == 0 ? 0.0 : round(overallSatisfaction / totalResponses))
                .resolutionEffectivenessAverage(totalResponses == 0 ? 0.0 : round(resolutionEffectiveness / totalResponses))
                .communicationSupportAverage(totalResponses == 0 ? 0.0 : round(communicationSupport / totalResponses))
                .timelinessAverage(totalResponses == 0 ? 0.0 : round(timeliness / totalResponses))
                .compositeScore(totalResponses == 0 ? 0.0 : round(compositeScore / totalResponses))
                .categoryStats(categoryStats)
                .build();
    }

    public ProblemManagementReportDto getProblemManagementReport(String fromDate,
                                                               String toDate,
                                                               String categoryId,
                                                               String subCategoryId,
                                                               String zoneCode,
                                                               String regionCode,
                                                               String districtCode,
                                                               String issueTypeId,
                                                               String divisionId,
                                                               String assignedTo) {
        List<Ticket> filteredTickets = getFilteredTickets(fromDate, toDate, categoryId, subCategoryId, zoneCode, regionCode, districtCode, issueTypeId, divisionId, assignedTo);
        Map<String, String> categoryNameLookup = getCategoryNameLookup();
        Map<String, String> subCategoryNameLookup = getSubCategoryNameLookup();

        List<ProblemCategoryStatDto> categoryStats = filteredTickets.stream()
                .filter(ticket -> ticket.getTicketStatus() == TicketStatus.RESOLVED || ticket.getTicketStatus() == TicketStatus.CLOSED)
                .collect(Collectors.groupingBy(ticket -> (ticket.getCategory() == null ? "N/A" : ticket.getCategory()) + "||" + (ticket.getSubCategory() == null ? "N/A" : ticket.getSubCategory()), Collectors.counting()))
                .entrySet().stream()
                .map(entry -> {
                    String[] parts = entry.getKey().split("\\|\\|", 2);
                    String categoryCode = parts[0];
                    String subCategoryCode = parts.length > 1 ? parts[1] : "N/A";
                    String categoryName = categoryNameLookup.getOrDefault(categoryCode, categoryCode);
                    String subCategoryName = subCategoryNameLookup.getOrDefault(subCategoryCode, subCategoryCode);
                    return ProblemCategoryStatDto.builder()
                            .category(categoryCode)
                            .subcategory(subCategoryCode)
                            .categoryName(categoryName)
                            .subcategoryName(subCategoryName)
                            .ticketCount(entry.getValue())
                            .build();
                })
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

    private static double round(double value) {
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
