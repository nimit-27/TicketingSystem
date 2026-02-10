package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.enums.Mode;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.enums.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, String> {
    public List<Ticket> findByIsMasterTrue();

    List<Ticket> findByMasterId(String masterId);

    public List<Ticket> findByLastModifiedAfter(LocalDateTime lastSyncedTime);

    long countByTicketStatus(TicketStatus ticketStatus);

    @Query("SELECT t.ticketStatus AS status, COUNT(t) AS count FROM Ticket t GROUP BY t.ticketStatus")
    List<StatusCountProjection> countTicketsByStatus();

    @Query("SELECT t.ticketStatus AS status, COUNT(t) AS count FROM Ticket t " +
            "WHERE (:assignedTo IS NULL OR LOWER(t.assignedTo) = LOWER(:assignedTo)) " +
            "AND (:fromDate IS NULL OR t.reportedDate >= :fromDate) " +
            "AND (:toDate IS NULL OR t.reportedDate <= :toDate) " +
            "GROUP BY t.ticketStatus")
    List<StatusCountProjection> countTicketsByStatusWithFilters(@Param("assignedTo") String assignedTo,
                                                                @Param("fromDate") LocalDateTime fromDate,
                                                                @Param("toDate") LocalDateTime toDate);

    @Query("SELECT t.ticketStatus AS status, COUNT(t) AS count FROM Ticket t " +
            "WHERE (:assignedTo IS NULL OR LOWER(t.assignedTo) = LOWER(:assignedTo)) " +
            "AND (:parameterAssignedTo IS NULL OR LOWER(t.assignedTo) = LOWER(:parameterAssignedTo)) " +
            "AND (:parameterAssignedBy IS NULL OR LOWER(t.assignedBy) = LOWER(:parameterAssignedBy)) " +
            "AND (:parameterUpdatedBy IS NULL OR LOWER(t.updatedBy) = LOWER(:parameterUpdatedBy)) " +
            "AND (:parameterCreatedBy IS NULL OR LOWER(t.createdBy) = LOWER(:parameterCreatedBy)) " +
            "AND (:parameterRequestedBy IS NULL OR LOWER(t.userId) = LOWER(:parameterRequestedBy)) " +
            "AND (:zoneCode IS NULL OR LOWER(t.zoneCode) = LOWER(:zoneCode)) " +
            "AND (:regionCode IS NULL OR LOWER(t.regionCode) = LOWER(:regionCode)) " +
            "AND (:districtCode IS NULL OR LOWER(t.districtCode) = LOWER(:districtCode)) " +
            "AND (:issueTypeId IS NULL OR LOWER(t.issueTypeId) = LOWER(:issueTypeId)) " +
            "AND (:fromDate IS NULL OR t.reportedDate >= :fromDate) " +
            "AND (:toDate IS NULL OR t.reportedDate <= :toDate) " +
            "GROUP BY t.ticketStatus")
    List<StatusCountProjection> countTicketsByStatusWithFiltersAndParameters(
            @Param("assignedTo") String assignedTo,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            @Param("parameterAssignedTo") String parameterAssignedTo,
            @Param("parameterAssignedBy") String parameterAssignedBy,
            @Param("parameterUpdatedBy") String parameterUpdatedBy,
            @Param("parameterCreatedBy") String parameterCreatedBy,
            @Param("parameterRequestedBy") String userId,
            @Param("zoneCode") String zoneCode,
            @Param("regionCode") String regionCode,
            @Param("districtCode") String districtCode,
            @Param("issueTypeId") String issueTypeId);

    @Query("SELECT t.mode AS mode, COUNT(t) AS count FROM Ticket t GROUP BY t.mode")
    List<ModeCountProjection> countTicketsByMode();

    @Query(value = """
                SELECT
                    c.category_id AS categoryId,
                    c.category AS categoryName,
                    sc.sub_category_id AS subcategoryId,
                    sc.sub_category AS subcategoryName,
                    SUM(CASE WHEN t.status_id = '7' THEN 1 ELSE 0 END) AS resolvedCount,
                    SUM(CASE WHEN t.status_id = '8' THEN 1 ELSE 0 END) AS closedCount,
                    COUNT(*) AS totalCount
                FROM tickets t
                LEFT JOIN sub_categories sc ON sc.sub_category_id = t.sub_category
                LEFT JOIN categories c ON c.category_id = sc.category_id
                WHERE t.status_id IN ('7','8')
                GROUP BY c.category_id, c.category, sc.sub_category_id, sc.sub_category, t.status_id
                ORDER BY categoryName, subcategoryName
            """, nativeQuery = true)
    List<CategoryStatusAggregation> countResolvedClosedTicketsByCategory();

    @Query(value = """
                SELECT
                    c.category_id AS categoryId,
                    c.category AS categoryName,
                    sc.sub_category_id AS subcategoryId,
                    sc.sub_category AS subcategoryName,
                    SUM(CASE WHEN t.status_id = '7' THEN 1 ELSE 0 END) AS resolvedCount,
                    SUM(CASE WHEN t.status_id = '8' THEN 1 ELSE 0 END) AS closedCount,
                    AVG(TIMESTAMPDIFF(MINUTE, t.reported_date, t.resolved_at)) / 60 AS averageResolutionHours
                FROM tickets t
                LEFT JOIN sub_categories sc ON sc.sub_category_id = t.sub_category
                LEFT JOIN categories c ON c.category_id = sc.category_id
                WHERE t.reported_date IS NOT NULL
                  AND t.resolved_at IS NOT NULL
                GROUP BY c.category_id, c.category, sc.sub_category_id, sc.sub_category
                ORDER BY categoryName, subcategoryName
            """, nativeQuery = true)
    List<CategoryResolutionAggregation> aggregateResolutionTimeByCategory();

    @Query(value = """
                SELECT
                    c.category_id AS categoryId,
                    c.category AS categoryName,
                    sc.sub_category_id AS subcategoryId,
                    sc.sub_category AS subcategoryName,
                    COUNT(*) AS totalResponses,
                    AVG(tf.overall_satisfaction) AS overallSatisfactionAverage,
                    AVG(tf.resolution_effectiveness) AS resolutionEffectivenessAverage,
                    AVG(tf.communication_support) AS communicationSupportAverage,
                    AVG(tf.timeliness) AS timelinessAverage,
                    AVG((tf.overall_satisfaction + tf.resolution_effectiveness + tf.communication_support + tf.timeliness) / 4.0) AS compositeScore
                FROM ticket_feedback tf
                JOIN tickets t ON t.ticket_id = tf.ticket_id
                LEFT JOIN sub_categories sc ON sc.sub_category_id = t.sub_category
                LEFT JOIN categories c ON c.category_id = sc.category_id
                GROUP BY c.category_id, c.category, sc.sub_category_id, sc.sub_category
                ORDER BY categoryName, subcategoryName
            """, nativeQuery = true)
    List<CustomerSatisfactionAggregation> aggregateCustomerSatisfactionByCategory();

    @Query("SELECT t.category AS category, t.subCategory AS subcategory, COUNT(t) AS count " +
            "FROM Ticket t WHERE t.category IS NOT NULL GROUP BY t.category, t.subCategory")
    List<CategoryCountProjection> countTicketsByCategory();

    @Query(value = """
                SELECT
                    c.category_id AS categoryId,
                    c.category AS categoryName,
                    sc.sub_category_id AS subcategoryId,
                    sc.sub_category AS subcategoryName,
                    t.zone_code AS zone,
                    t.region_name AS regionName,
                    t.district_name AS districtName,
                    SUM(CASE WHEN t.status = 'OPEN' THEN 1 ELSE 0 END) AS pendingCount,
                    COUNT(*) AS totalCount,
                    SUM(CASE WHEN LOWER(t.severity) = 's1' THEN 1 ELSE 0 END) AS s1Count,
                    SUM(CASE WHEN LOWER(t.severity) = 's2' THEN 1 ELSE 0 END) AS s2Count,
                    SUM(CASE WHEN LOWER(t.severity) = 's3' THEN 1 ELSE 0 END) AS s3Count,
                    SUM(CASE WHEN LOWER(t.severity) = 's4' THEN 1 ELSE 0 END) AS s4Count
                FROM tickets t
                LEFT JOIN sub_categories sc ON sc.sub_category_id = t.sub_category
                LEFT JOIN categories c ON c.category_id = sc.category_id
                WHERE (:assignedTo IS NULL OR LOWER(t.assigned_to) = LOWER(:assignedTo))
                  AND (:fromDate IS NULL OR t.reported_date >= :fromDate)
                  AND (:toDate IS NULL OR t.reported_date <= :toDate)
                GROUP BY c.category_id, c.category, sc.sub_category_id, sc.sub_category, t.zone_code, t.region_name, t.district_name
                ORDER BY categoryName, subcategoryName
            """, nativeQuery = true)
    List<DashboardCategoryAggregation> aggregateDashboardStatsByCategory(@Param("assignedTo") String assignedTo,
                                                                         @Param("fromDate") LocalDateTime fromDate,
                                                                         @Param("toDate") LocalDateTime toDate);

    @Query(value = """
                SELECT
                    c.category_id AS categoryId,
                    c.category AS categoryName,
                    sc.sub_category_id AS subcategoryId,
                    sc.sub_category AS subcategoryName,
                    t.zone_code AS zone,
                    t.region_name AS regionName,
                    t.district_name AS districtName,
                    SUM(CASE WHEN t.status = 'OPEN' THEN 1 ELSE 0 END) AS pendingCount,
                    COUNT(*) AS totalCount,
                    SUM(CASE WHEN LOWER(t.severity) = 's1' THEN 1 ELSE 0 END) AS s1Count,
                    SUM(CASE WHEN LOWER(t.severity) = 's2' THEN 1 ELSE 0 END) AS s2Count,
                    SUM(CASE WHEN LOWER(t.severity) = 's3' THEN 1 ELSE 0 END) AS s3Count,
                    SUM(CASE WHEN LOWER(t.severity) = 's4' THEN 1 ELSE 0 END) AS s4Count
                FROM tickets t
                LEFT JOIN sub_categories sc ON sc.sub_category_id = t.sub_category
                LEFT JOIN categories c ON c.category_id = sc.category_id
                WHERE (:assignedTo IS NULL OR LOWER(t.assigned_to) = LOWER(:assignedTo))
                  AND (:parameterAssignedTo IS NULL OR LOWER(t.assigned_to) = LOWER(:parameterAssignedTo))
                  AND (:parameterAssignedBy IS NULL OR LOWER(t.assigned_by) = LOWER(:parameterAssignedBy))
                  AND (:parameterUpdatedBy IS NULL OR LOWER(t.updated_by) = LOWER(:parameterUpdatedBy))
                  AND (:parameterCreatedBy IS NULL OR LOWER(t.user_id) = LOWER(:parameterCreatedBy))
                  AND (:zoneCode IS NULL OR LOWER(t.zone_code) = LOWER(:zoneCode))
                  AND (:regionCode IS NULL OR LOWER(t.region_code) = LOWER(:regionCode))
                  AND (:districtCode IS NULL OR LOWER(t.district_code) = LOWER(:districtCode))
                  AND (:issueTypeId IS NULL OR LOWER(t.issue_type_id) = LOWER(:issueTypeId))
                  AND (:fromDate IS NULL OR t.reported_date >= :fromDate)
                  AND (:toDate IS NULL OR t.reported_date <= :toDate)
                GROUP BY c.category_id, c.category, sc.sub_category_id, sc.sub_category, t.zone_code, t.region_name, t.district_name
                ORDER BY categoryName, subcategoryName
            """, nativeQuery = true)
    List<DashboardCategoryAggregation> aggregateDashboardStatsByCategoryWithParameter(
            @Param("assignedTo") String assignedTo,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            @Param("parameterAssignedTo") String parameterAssignedTo,
            @Param("parameterAssignedBy") String parameterAssignedBy,
            @Param("parameterUpdatedBy") String parameterUpdatedBy,
            @Param("parameterCreatedBy") String parameterCreatedBy,
            @Param("zoneCode") String zoneCode,
            @Param("regionCode") String regionCode,
            @Param("districtCode") String districtCode,
            @Param("issueTypeId") String issueTypeId);

    @Query("SELECT LOWER(t.severity) AS severity, COUNT(t) AS count FROM Ticket t " +
            "WHERE t.severity IS NOT NULL " +
            "AND (:status IS NULL OR t.ticketStatus = :status) " +
            "AND (:assignedTo IS NULL OR LOWER(t.assignedTo) = LOWER(:assignedTo)) " +
            "AND (:fromDate IS NULL OR t.reportedDate >= :fromDate) " +
            "AND (:toDate IS NULL OR t.reportedDate <= :toDate) " +
            "GROUP BY LOWER(t.severity)")
    List<SeverityCountProjection> countTicketsBySeverity(@Param("status") TicketStatus status,
                                                         @Param("assignedTo") String assignedTo,
                                                         @Param("fromDate") LocalDateTime fromDate,
                                                         @Param("toDate") LocalDateTime toDate);

    @Query("SELECT LOWER(t.severity) AS severity, COUNT(t) AS count FROM Ticket t " +
            "WHERE t.severity IS NOT NULL " +
            "AND (:status IS NULL OR t.ticketStatus = :status) " +
            "AND (:assignedTo IS NULL OR LOWER(t.assignedTo) = LOWER(:assignedTo)) " +
            "AND (:parameterAssignedTo IS NULL OR LOWER(t.assignedTo) = LOWER(:parameterAssignedTo)) " +
            "AND (:parameterAssignedBy IS NULL OR LOWER(t.assignedBy) = LOWER(:parameterAssignedBy)) " +
            "AND (:parameterUpdatedBy IS NULL OR LOWER(t.updatedBy) = LOWER(:parameterUpdatedBy)) " +
            "AND (:parameterCreatedBy IS NULL OR LOWER(t.createdBy) = LOWER(:parameterCreatedBy)) " +
            "AND (:parameterRequestedBy IS NULL OR LOWER(t.userId) = LOWER(:parameterRequestedBy)) " +
            "AND (:zoneCode IS NULL OR LOWER(t.zoneCode) = LOWER(:zoneCode)) " +
            "AND (:regionCode IS NULL OR LOWER(t.regionCode) = LOWER(:regionCode)) " +
            "AND (:districtCode IS NULL OR LOWER(t.districtCode) = LOWER(:districtCode)) " +
            "AND (:issueTypeId IS NULL OR LOWER(t.issueTypeId) = LOWER(:issueTypeId)) " +
            "AND (:fromDate IS NULL OR t.reportedDate >= :fromDate) " +
            "AND (:toDate IS NULL OR t.reportedDate <= :toDate) " +
            "GROUP BY LOWER(t.severity)")
    List<SeverityCountProjection> countTicketsBySeverityWithParameter(@Param("status") TicketStatus status,
                                                                      @Param("assignedTo") String assignedTo,
                                                                      @Param("fromDate") LocalDateTime fromDate,
                                                                      @Param("toDate") LocalDateTime toDate,
                                                                      @Param("parameterAssignedTo") String parameterAssignedTo,
                                                                      @Param("parameterAssignedBy") String parameterAssignedBy,
                                                                      @Param("parameterUpdatedBy") String parameterUpdatedBy,
                                                                      @Param("parameterCreatedBy") String parameterCreatedBy,
                                                                      @Param("parameterRequestedBy") String userId,
            @Param("zoneCode") String zoneCode,
            @Param("regionCode") String regionCode,
            @Param("districtCode") String districtCode,
            @Param("issueTypeId") String issueTypeId);

    @Query("SELECT COUNT(t) FROM Ticket t " +
            "WHERE (:status IS NULL OR t.ticketStatus = :status) " +
            "AND (:assignedTo IS NULL OR LOWER(t.assignedTo) = LOWER(:assignedTo)) " +
            "AND (:fromDate IS NULL OR t.reportedDate >= :fromDate) " +
            "AND (:toDate IS NULL OR t.reportedDate <= :toDate)")
    long countTicketsByStatusAndFilters(@Param("status") TicketStatus status,
                                        @Param("assignedTo") String assignedTo,
                                        @Param("fromDate") LocalDateTime fromDate,
                                        @Param("toDate") LocalDateTime toDate);

    @Query("SELECT COUNT(t) FROM Ticket t " +
            "WHERE (:status IS NULL OR t.ticketStatus = :status) " +
            "AND (:assignedTo IS NULL OR LOWER(t.assignedTo) = LOWER(:assignedTo)) " +
            "AND (:parameterAssignedTo IS NULL OR LOWER(t.assignedTo) = LOWER(:parameterAssignedTo)) " +
            "AND (:parameterAssignedBy IS NULL OR LOWER(t.assignedBy) = LOWER(:parameterAssignedBy)) " +
            "AND (:parameterUpdatedBy IS NULL OR LOWER(t.updatedBy) = LOWER(:parameterUpdatedBy)) " +
            "AND (:parameterCreatedBy IS NULL OR LOWER(t.createdBy) = LOWER(:parameterCreatedBy)) " +
            "AND (:parameterRequestedBy IS NULL OR LOWER(t.userId) = LOWER(:parameterRequestedBy)) " +
            "AND (:zoneCode IS NULL OR LOWER(t.zoneCode) = LOWER(:zoneCode)) " +
            "AND (:regionCode IS NULL OR LOWER(t.regionCode) = LOWER(:regionCode)) " +
            "AND (:districtCode IS NULL OR LOWER(t.districtCode) = LOWER(:districtCode)) " +
            "AND (:issueTypeId IS NULL OR LOWER(t.issueTypeId) = LOWER(:issueTypeId)) " +
            "AND (:fromDate IS NULL OR t.reportedDate >= :fromDate) " +
            "AND (:toDate IS NULL OR t.reportedDate <= :toDate)")
    long countTicketsByStatusAndFiltersWithParameter(@Param("status") TicketStatus status,
                                                     @Param("assignedTo") String assignedTo,
                                                     @Param("fromDate") LocalDateTime fromDate,
                                                     @Param("toDate") LocalDateTime toDate,
                                                     @Param("parameterAssignedTo") String parameterAssignedTo,
                                                     @Param("parameterAssignedBy") String parameterAssignedBy,
                                                     @Param("parameterUpdatedBy") String parameterUpdatedBy,
                                                     @Param("parameterCreatedBy") String parameterCreatedBy,
                                                     @Param("parameterRequestedBy") String userId,
            @Param("zoneCode") String zoneCode,
            @Param("regionCode") String regionCode,
            @Param("districtCode") String districtCode,
            @Param("issueTypeId") String issueTypeId);

    @Query("SELECT t FROM Ticket t WHERE t.reportedDate IS NOT NULL AND t.resolvedAt IS NOT NULL")
    List<Ticket> findResolvedTickets();

    List<Ticket> findByTicketStatusAndLastModifiedBefore(TicketStatus ticketStatus, LocalDateTime time);

    List<Ticket> findByTicketStatusAndResolvedAtBefore(TicketStatus ticketStatus, LocalDateTime time);

    List<Ticket> findByReportedDateBetween(LocalDateTime fromDate, LocalDateTime toDate);

    List<Ticket> findByResolvedAtBetween(LocalDateTime fromDate, LocalDateTime toDate);

    @Query("SELECT t FROM Ticket t " +
            "WHERE (:parameterAssignedTo IS NULL OR LOWER(t.assignedTo) = LOWER(:parameterAssignedTo)) " +
            "AND (:parameterAssignedBy IS NULL OR LOWER(t.assignedBy) = LOWER(:parameterAssignedBy)) " +
            "AND (:parameterUpdatedBy IS NULL OR LOWER(t.updatedBy) = LOWER(:parameterUpdatedBy)) " +
            "AND (:parameterCreatedBy IS NULL OR LOWER(t.createdBy) = LOWER(:parameterCreatedBy)) " +
            "AND (:parameterRequestedBy IS NULL OR LOWER(t.userId) = LOWER(:parameterRequestedBy)) " +
            "AND (:zoneCode IS NULL OR LOWER(t.zoneCode) = LOWER(:zoneCode)) " +
            "AND (:regionCode IS NULL OR LOWER(t.regionCode) = LOWER(:regionCode)) " +
            "AND (:districtCode IS NULL OR LOWER(t.districtCode) = LOWER(:districtCode)) " +
            "AND (:issueTypeId IS NULL OR LOWER(t.issueTypeId) = LOWER(:issueTypeId)) " +
            "AND (:fromDate IS NULL OR t.reportedDate >= :fromDate) " +
            "AND (:toDate IS NULL OR t.reportedDate <= :toDate)")
    List<Ticket> findByReportedDateBetweenWithParameters(@Param("fromDate") LocalDateTime fromDate,
                                                         @Param("toDate") LocalDateTime toDate,
                                                         @Param("parameterAssignedTo") String parameterAssignedTo,
                                                         @Param("parameterAssignedBy") String parameterAssignedBy,
                                                         @Param("parameterUpdatedBy") String parameterUpdatedBy,
                                                         @Param("parameterCreatedBy") String parameterCreatedBy,
                                                         @Param("parameterRequestedBy") String userId,
            @Param("zoneCode") String zoneCode,
            @Param("regionCode") String regionCode,
            @Param("districtCode") String districtCode,
            @Param("issueTypeId") String issueTypeId);

    @Query("SELECT t FROM Ticket t " +
            "WHERE (:parameterAssignedTo IS NULL OR LOWER(t.assignedTo) = LOWER(:parameterAssignedTo)) " +
            "AND (:parameterAssignedBy IS NULL OR LOWER(t.assignedBy) = LOWER(:parameterAssignedBy)) " +
            "AND (:parameterUpdatedBy IS NULL OR LOWER(t.updatedBy) = LOWER(:parameterUpdatedBy)) " +
            "AND (:parameterCreatedBy IS NULL OR LOWER(t.userId) = LOWER(:parameterCreatedBy)) " +
            "AND (:zoneCode IS NULL OR LOWER(t.zoneCode) = LOWER(:zoneCode)) " +
            "AND (:regionCode IS NULL OR LOWER(t.regionCode) = LOWER(:regionCode)) " +
            "AND (:districtCode IS NULL OR LOWER(t.districtCode) = LOWER(:districtCode)) " +
            "AND (:issueTypeId IS NULL OR LOWER(t.issueTypeId) = LOWER(:issueTypeId)) " +
            "AND (:fromDate IS NULL OR t.resolvedAt >= :fromDate) " +
            "AND (:toDate IS NULL OR t.resolvedAt <= :toDate)")
    List<Ticket> findByResolvedAtBetweenWithParameters(@Param("fromDate") LocalDateTime fromDate,
                                                       @Param("toDate") LocalDateTime toDate,
                                                       @Param("parameterAssignedTo") String parameterAssignedTo,
                                                       @Param("parameterAssignedBy") String parameterAssignedBy,
                                                       @Param("parameterUpdatedBy") String parameterUpdatedBy,
                                                       @Param("parameterCreatedBy") String parameterCreatedBy,
            @Param("zoneCode") String zoneCode,
            @Param("regionCode") String regionCode,
            @Param("districtCode") String districtCode,
            @Param("issueTypeId") String issueTypeId);

    Optional<Ticket> findFirstByReportedDateNotNullOrderByReportedDateAsc();

    Optional<Ticket> findFirstByReportedDateNotNullOrderByReportedDateDesc();

    Page<Ticket> findByPriority(String priority, Pageable pageable);

    @Query("SELECT t FROM Ticket t " +
            "WHERE t.isMaster = true " +
            "AND (t.masterId IS NULL OR t.masterId = '') " +
            "AND (LOWER(t.subject) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(t.id) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Ticket> searchMasterTicketsBySubjectOrId(@Param("query") String query, Pageable pageable);

    @Query("SELECT t FROM Ticket t " +
            "WHERE t.ticketStatus = :status " +
            "AND t.severity IS NOT NULL " +
            "AND LOWER(t.severity) IN (:severityTokens) " +
            "AND (:updatedBy IS NULL OR LOWER(t.updatedBy) = LOWER(:updatedBy)) " +
            "AND (:categoryId IS NULL OR t.category = :categoryId) " +
            "AND (:subCategoryId IS NULL OR t.subCategory = :subCategoryId) " +
            "AND (:fromDate IS NULL OR t.reportedDate >= :fromDate) " +
            "AND (:toDate IS NULL OR t.reportedDate <= :toDate)")
    Page<Ticket> findClosedTicketsForRootCauseAnalysis(@Param("status") TicketStatus status,
                                                       @Param("severityTokens") Collection<String> severityTokens,
                                                       @Param("updatedBy") String updatedBy,
                                                       @Param("categoryId") String categoryId,
                                                       @Param("subCategoryId") String subCategoryId,
                                                       @Param("fromDate") LocalDateTime fromDate,
                                                       @Param("toDate") LocalDateTime toDate,
                                                       Pageable pageable);

    @Query("SELECT t FROM Ticket t LEFT JOIN t.status s " +
//            "WHERE (:statusId IS NULL OR s.statusId = :statusId) " +
//            "WHERE (:statusId IS NULL OR function(FIND_IN_SET, s.statusId, :statusId) > 0)" +
            "WHERE (:statusIds IS NULL OR s.statusId IN (:statusIds))" +
            "AND (:master IS NULL OR t.isMaster = :master) " +
            "AND (:levelId IS NULL OR t.levelId = :levelId) " +
            "AND (:priority IS NULL OR t.priority = :priority) " +
            "AND (:severities IS NULL OR t.severity IN (:severities)) " +
            "AND (:category IS NULL OR t.category = :category) " +
            "AND (:subCategory IS NULL OR t.subCategory = :subCategory)" +
            "AND (:zoneCode IS NULL OR t.zoneCode = :zoneCode) " +
            "AND (:regionCode IS NULL OR t.regionCode = :regionCode) " +
            "AND (:districtCode IS NULL OR t.districtCode = :districtCode) " +
            "AND (:issueTypeId IS NULL OR t.issueTypeId = :issueTypeId) " +
            "AND ((:assignedTo IS NULL AND :assignedBy IS NULL AND :requestorId IS NULL AND :createdBy IS NULL) " +
            "OR (:assignedTo IS NOT NULL AND LOWER(t.assignedTo) = LOWER(:assignedTo)) " +
            "OR (:assignedBy IS NOT NULL AND LOWER(t.assignedBy) = LOWER(:assignedBy)) " +
            "OR (:requestorId IS NOT NULL AND t.userId = :requestorId) " +
            "OR (:createdBy IS NOT NULL AND LOWER(t.createdBy) = LOWER(:createdBy))) " +
            "AND (:fromDate IS NULL OR t.reportedDate >= :fromDate) " +
            "AND (:toDate IS NULL OR t.reportedDate <= :toDate) " +
            "AND (LOWER(t.requestorName) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(t.category) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(t.subCategory) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(t.subject) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(t.id) LIKE LOWER(CONCAT('%', :query, '%')) )")
    Page<Ticket> searchTickets(@Param("query") String query, @Param("statusIds") ArrayList<String> statusName,
                               @Param("master") Boolean master, @Param("assignedTo") String assignedTo,
                               @Param("assignedBy") String assignedBy, @Param("requestorId") String requestorId,
                               @Param("levelId") String levelId, @Param("priority") String priority,
                               @Param("severities") List<String> severities,
                               @Param("createdBy") String createdBy,
                               @Param("category") String category,
                               @Param("subCategory") String subCategory,
                               @Param("zoneCode") String zoneCode,
                               @Param("regionCode") String regionCode,
                               @Param("districtCode") String districtCode,
                               @Param("issueTypeId") String issueTypeId,
                               @Param("fromDate") LocalDateTime fromDate,
                               @Param("toDate") LocalDateTime toDate,
                               Pageable pageable);

    @Query("SELECT t FROM Ticket t LEFT JOIN t.status s " +
            "WHERE (:statusIds IS NULL OR s.statusId IN (:statusIds))" +
            "AND (:master IS NULL OR t.isMaster = :master) " +
            "AND (:levelId IS NULL OR t.levelId = :levelId) " +
            "AND (:priority IS NULL OR t.priority = :priority) " +
            "AND (:severities IS NULL OR t.severity IN (:severities)) " +
            "AND (:category IS NULL OR t.category = :category) " +
            "AND (:subCategory IS NULL OR t.subCategory = :subCategory)" +
            "AND (:zoneCode IS NULL OR t.zoneCode = :zoneCode) " +
            "AND (:regionCode IS NULL OR t.regionCode = :regionCode) " +
            "AND (:districtCode IS NULL OR t.districtCode = :districtCode) " +
            "AND (:issueTypeId IS NULL OR t.issueTypeId = :issueTypeId) " +
            "AND ((:assignedTo IS NULL AND :assignedBy IS NULL AND :requestorId IS NULL AND :createdBy IS NULL) " +
            "OR (:assignedTo IS NOT NULL AND LOWER(t.assignedTo) = LOWER(:assignedTo)) " +
            "OR (:assignedBy IS NOT NULL AND LOWER(t.assignedBy) = LOWER(:assignedBy)) " +
            "OR (:requestorId IS NOT NULL AND t.userId = :requestorId) " +
            "OR (:createdBy IS NOT NULL AND LOWER(t.createdBy) = LOWER(:createdBy))) " +
            "AND (:fromDate IS NULL OR t.reportedDate >= :fromDate) " +
            "AND (:toDate IS NULL OR t.reportedDate <= :toDate) " +
            "AND (LOWER(t.requestorName) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(t.category) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(t.subCategory) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(t.subject) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(t.id) LIKE LOWER(CONCAT('%', :query, '%')) )")
    List<Ticket> searchTicketsList(@Param("query") String query, @Param("statusIds") ArrayList<String> statusName,
                                   @Param("master") Boolean master, @Param("assignedTo") String assignedTo,
                                   @Param("assignedBy") String assignedBy, @Param("requestorId") String requestorId,
                                   @Param("levelId") String levelId, @Param("priority") String priority,
                                   @Param("severities") List<String> severities,
                                   @Param("createdBy") String createdBy,
                                   @Param("category") String category,
                                   @Param("subCategory") String subCategory,
                                   @Param("zoneCode") String zoneCode,
                                   @Param("regionCode") String regionCode,
                                   @Param("districtCode") String districtCode,
                                   @Param("issueTypeId") String issueTypeId,
                                   @Param("fromDate") LocalDateTime fromDate,
                                   @Param("toDate") LocalDateTime toDate);

    interface StatusCountProjection {
        TicketStatus getStatus();

        Long getCount();
    }

    interface ModeCountProjection {
        Mode getMode();

        Long getCount();
    }

    interface CategoryCountProjection {
        String getCategory();

        String getSubcategory();

        Long getCount();
    }

    interface CategoryStatusAggregation {
        String getCategoryId();

        String getCategoryName();

        String getSubcategoryId();

        String getSubcategoryName();

        Long getResolvedCount();

        Long getClosedCount();

        Long getTotalCount();
    }

    interface CategoryResolutionAggregation {
        String getCategoryId();

        String getCategoryName();

        String getSubcategoryId();

        String getSubcategoryName();

        Long getResolvedCount();

        Long getClosedCount();

        Double getAverageResolutionHours();
    }

    interface CustomerSatisfactionAggregation {
        String getCategoryId();

        String getCategoryName();

        String getSubcategoryId();

        String getSubcategoryName();

        Long getTotalResponses();

        Double getOverallSatisfactionAverage();

        Double getResolutionEffectivenessAverage();

        Double getCommunicationSupportAverage();

        Double getTimelinessAverage();

        Double getCompositeScore();
    }

    interface DashboardCategoryAggregation {
        String getCategoryId();

        String getCategoryName();

        String getSubcategoryId();

        String getSubcategoryName();

        String getZone();

        String getRegionName();

        String getDistrictName();

        Long getPendingCount();

        Long getTotalCount();

        Long getS1Count();

        Long getS2Count();

        Long getS3Count();

        Long getS4Count();
    }

    interface SeverityCountProjection {
        String getSeverity();

        Long getCount();
    }
}
