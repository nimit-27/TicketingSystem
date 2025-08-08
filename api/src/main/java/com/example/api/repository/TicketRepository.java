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
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, String> {
    public List<Ticket> findByIsMasterTrue();

    public List<Ticket> findByLastModifiedAfter(LocalDateTime lastSyncedTime);

    List<Ticket> findByTicketStatusAndLastModifiedBefore(TicketStatus ticketStatus, LocalDateTime time);

    @Query("SELECT t FROM Ticket t LEFT JOIN t.status s " +
            "WHERE (:statusId IS NULL OR s.statusId = :statusId) " +
            "AND (:master IS NULL OR t.isMaster = :master) " +
            "AND (LOWER(t.requestorName) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(t.category) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(t.subCategory) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(t.subject) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(t.id) LIKE LOWER(CONCAT('%', :query, '%')) )")
    Page<Ticket> searchTickets(@Param("query") String query, @Param("statusId") String statusName, @Param("master") Boolean master, Pageable pageable);
}
