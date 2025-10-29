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

@Repository
public interface TicketRepository extends JpaRepository<Ticket, String> {
    public List<Ticket> findByIsMasterTrue();

    List<Ticket> findByMasterId(String masterId);

    public List<Ticket> findByLastModifiedAfter(LocalDateTime lastSyncedTime);

    long countByTicketStatus(TicketStatus ticketStatus);

    @Query("SELECT t.ticketStatus AS status, COUNT(t) AS count FROM Ticket t GROUP BY t.ticketStatus")
    List<StatusCountProjection> countTicketsByStatus();

    @Query("SELECT t.mode AS mode, COUNT(t) AS count FROM Ticket t GROUP BY t.mode")
    List<ModeCountProjection> countTicketsByMode();

    @Query("SELECT t.category AS category, COUNT(t) AS count FROM Ticket t WHERE t.category IS NOT NULL GROUP BY t.category")
    List<CategoryCountProjection> countTicketsByCategory();

    @Query("SELECT LOWER(t.severity) AS severity, COUNT(t) AS count FROM Ticket t " +
            "WHERE t.severity IS NOT NULL " +
            "AND (:status IS NULL OR t.ticketStatus = :status) " +
            "GROUP BY LOWER(t.severity)")
    List<SeverityCountProjection> countTicketsBySeverity(@Param("status") TicketStatus status);

    @Query("SELECT t FROM Ticket t WHERE t.reportedDate IS NOT NULL AND t.resolvedAt IS NOT NULL")
    List<Ticket> findResolvedTickets();

    List<Ticket> findByTicketStatusAndLastModifiedBefore(TicketStatus ticketStatus, LocalDateTime time);

    List<Ticket> findByTicketStatusAndResolvedAtBefore(TicketStatus ticketStatus, LocalDateTime time);

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
            "AND (:fromDate IS NULL OR t.reportedDate >= :fromDate) " +
            "AND (:toDate IS NULL OR t.reportedDate <= :toDate)")
    Page<Ticket> findClosedTicketsForRootCauseAnalysis(@Param("status") TicketStatus status,
                                                       @Param("severityTokens") Collection<String> severityTokens,
                                                       @Param("updatedBy") String updatedBy,
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
            "AND ((:assignedTo IS NULL AND :assignedBy IS NULL AND :requestorId IS NULL AND :createdBy IS NULL) " +
            "OR (:assignedTo IS NOT NULL AND LOWER(t.assignedTo) = LOWER(:assignedTo)) " +
            "OR (:assignedBy IS NOT NULL AND LOWER(t.assignedBy) = LOWER(:assignedBy)) " +
            "OR (:requestorId IS NOT NULL AND t.userId = :requestorId) " +
            "OR (:createdBy IS NOT NULL AND LOWER(t.updatedBy) = LOWER(:createdBy))) " +
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
                               @Param("fromDate") LocalDateTime fromDate,
                               @Param("toDate") LocalDateTime toDate,
                               Pageable pageable);

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

        Long getCount();
    }

    interface SeverityCountProjection {
        String getSeverity();

        Long getCount();
    }
}
