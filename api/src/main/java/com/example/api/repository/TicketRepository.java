package com.example.api.repository;

import com.example.api.models.Ticket;
import com.example.api.enums.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, String> {
    public List<Ticket> findByIsMasterTrue();

    public List<Ticket> findByLastModifiedAfter(LocalDateTime lastSyncedTime);

    List<Ticket> findByTicketStatusAndLastModifiedBefore(TicketStatus ticketStatus, LocalDateTime time);

    List<Ticket> findByTicketStatusAndResolvedAtBefore(TicketStatus ticketStatus, LocalDateTime time);

    Page<Ticket> findByPriority(String priority, Pageable pageable);

    @Query("SELECT t FROM Ticket t LEFT JOIN t.status s " +
//            "WHERE (:statusId IS NULL OR s.statusId = :statusId) " +
//            "WHERE (:statusId IS NULL OR function(FIND_IN_SET, s.statusId, :statusId) > 0)" +
            "WHERE (:statusIds IS NULL OR s.statusId IN (:statusIds))" +
            "AND (:master IS NULL OR t.isMaster = :master) " +
            "AND (:levelId IS NULL OR t.levelId = :levelId) " +
            "AND (:priority IS NULL OR t.priority = :priority) " +
            "AND (:severities IS NULL OR t.severity IN (:severities)) " +
            "AND ((:assignedTo IS NULL AND :assignedBy IS NULL AND :requestorId IS NULL) " +
            "OR (:assignedTo IS NOT NULL AND LOWER(t.assignedTo) = LOWER(:assignedTo)) " +
            "OR (:assignedBy IS NOT NULL AND LOWER(t.assignedBy) = LOWER(:assignedBy)) " +
            "OR (:requestorId IS NOT NULL AND t.userId = :requestorId)) " +
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
                               Pageable pageable);
}
