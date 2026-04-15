package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.dto.nagios.NagiosTicketSlaSummaryAggregateDto;
import com.ticketingSystem.api.models.TicketSla;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketSlaRepository extends JpaRepository<TicketSla, String> {
    Optional<TicketSla> findByTicket_Id(String ticketId);

    @Query("SELECT DISTINCT sla FROM TicketSla sla LEFT JOIN FETCH sla.ticket")
    List<TicketSla> findAllWithTicket();

    @Query("SELECT DISTINCT sla FROM TicketSla sla LEFT JOIN FETCH sla.ticket WHERE sla.breachedByMinutes IS NOT NULL AND sla.breachedByMinutes > 0")
    List<TicketSla> findBreachedWithTicket();

    @Query("""
            SELECT new com.ticketingSystem.api.dto.nagios.NagiosTicketSlaSummaryAggregateDto(
                COUNT(sla),
                COALESCE(SUM(CASE WHEN COALESCE(sla.breachedByMinutes, 0) > 0 THEN 1 ELSE 0 END), 0),
                AVG(sla.resolutionTimeMinutes),
                AVG(sla.responseTimeMinutes),
                AVG(CASE WHEN COALESCE(sla.breachedByMinutes, 0) > 0 THEN sla.breachedByMinutes ELSE NULL END),
                MIN(t.reportedDate),
                MAX(t.reportedDate)
            )
            FROM TicketSla sla
            JOIN sla.ticket t
            WHERE (:fromDate IS NULL OR t.reportedDate >= :fromDate)
              AND t.reportedDate < :toDateExclusive
            """)
    NagiosTicketSlaSummaryAggregateDto fetchSummary(@Param("fromDate") LocalDateTime fromDate,
                                                    @Param("toDateExclusive") LocalDateTime toDateExclusive);

    long countByBreachedByMinutesGreaterThan(Long breachedByMinutes);
}
