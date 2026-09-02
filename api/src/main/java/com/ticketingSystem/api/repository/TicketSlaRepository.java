package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.dto.nagios.NagiosTicketSlaSummaryAggregateDto;
import com.ticketingSystem.api.dto.nagios.NagiosSeveritySlaAggregateView;
import com.ticketingSystem.api.dto.nagios.NagiosGroupedCountView;
import com.ticketingSystem.api.dto.nagios.NagiosCountBySeverityView;
import com.ticketingSystem.api.enums.TicketStatus;
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

    @Query("SELECT DISTINCT sla FROM TicketSla sla LEFT JOIN FETCH sla.ticket WHERE sla.breachedByMinutes IS NOT NULL AND sla.breachedByMinutes > 0 AND sla.isSlaApplicable")
    List<TicketSla> findBreachedWithTicket();

    @Query("""
            SELECT new com.ticketingSystem.api.dto.nagios.NagiosTicketSlaSummaryAggregateDto(
                COUNT(sla),
                COALESCE(SUM(CASE WHEN (COALESCE(sla.breachedByMinutes, 0) > 0 AND sla.isSlaApplicable) THEN 1 ELSE 0 END), 0),
                AVG(CASE
                         WHEN sla.isSlaApplicable IS TRUE
                         THEN sla.resolutionTimeMinutes
                    END),
                AVG(CASE
                         WHEN sla.isSlaApplicable IS TRUE
                         THEN sla.responseTimeMinutes
                    END),
                AVG(CASE WHEN COALESCE(sla.breachedByMinutes, 0) > 0 AND sla.isSlaApplicable THEN sla.breachedByMinutes ELSE NULL END),
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

    @Query(value = """
            SELECT
                t.severity AS severity,
                COUNT(sla.ticket_sla_id) AS totalCount,
                COALESCE(SUM(CASE WHEN COALESCE(sla.breached_by_minutes, 0) > 0 AND sla.is_sla_applicable IS TRUE THEN 1 ELSE 0 END), 0) AS breachCount,
                AVG(CASE 
                        WHEN sla.is_sla_applicable IS TRUE
                        THEN sla.resolution_time_minutes
                    END) AS averageResolutionTimeMinutes,
                AVG(CASE 
                        WHEN sla.is_sla_applicable IS TRUE
                        THEN sla.response_time_minutes
                    END) AS averageResponseTimeMinutes
            FROM ticket_sla sla
            JOIN tickets t ON t.ticket_id = sla.ticket_id
            WHERE (:fromDate IS NULL OR t.reported_date >= :fromDate)
              AND t.reported_date < :toDateExclusive
            GROUP BY t.severity
            """, nativeQuery = true)
    List<NagiosSeveritySlaAggregateView> fetchSummaryBySeverity(@Param("fromDate") LocalDateTime fromDate,
                                                                @Param("toDateExclusive") LocalDateTime toDateExclusive);

    @Query(value = """
            SELECT COALESCE(NULLIF(TRIM(t.category), ''), 'Unknown') AS groupValue,
                   COUNT(sla.ticket_sla_id) AS totalCount
            FROM ticket_sla sla
            JOIN tickets t ON t.ticket_id = sla.ticket_id
            WHERE (:fromDate IS NULL OR t.reported_date >= :fromDate)
              AND t.reported_date < :toDateExclusive
            GROUP BY COALESCE(NULLIF(TRIM(t.category), ''), 'Unknown')
            """, nativeQuery = true)
    List<NagiosGroupedCountView> fetchModuleCounts(@Param("fromDate") LocalDateTime fromDate,
                                                   @Param("toDateExclusive") LocalDateTime toDateExclusive);

    @Query(value = """
            SELECT COALESCE(NULLIF(TRIM(it.name), ''), 'Unknown') AS groupValue,
                   COUNT(sla.ticket_sla_id) AS totalCount
            FROM ticket_sla sla
            JOIN tickets t ON t.ticket_id = sla.ticket_id
            LEFT JOIN issue_type_master it ON it.issue_type_id = t.issue_type_id
            WHERE (:fromDate IS NULL OR t.reported_date >= :fromDate)
              AND t.reported_date < :toDateExclusive
            GROUP BY COALESCE(NULLIF(TRIM(it.name), ''), 'Unknown')
            """, nativeQuery = true)
    List<NagiosGroupedCountView> fetchIssueTypeCounts(@Param("fromDate") LocalDateTime fromDate,
                                                      @Param("toDateExclusive") LocalDateTime toDateExclusive);

    @Query(value = """
            SELECT t.severity AS severity,
                   COUNT(sla.ticket_sla_id) AS totalCount,
                   COALESCE(SUM(CASE WHEN COALESCE(sla.breached_by_minutes, 0) > 0
                                          AND sla.is_sla_applicable IS TRUE THEN 1 ELSE 0 END), 0) AS breachCount
            FROM ticket_sla sla
            JOIN tickets t ON t.ticket_id = sla.ticket_id
            JOIN issue_type_master it ON it.issue_type_id = t.issue_type_id
            WHERE (:fromDate IS NULL OR t.reported_date >= :fromDate)
              AND t.reported_date < :toDateExclusive
              AND it.sla_flag IS TRUE
            GROUP BY t.severity
            """, nativeQuery = true)
    List<NagiosCountBySeverityView> fetchProblemBugIncidentCountsBySeverity(
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDateExclusive") LocalDateTime toDateExclusive);

    @Query(value = """
            SELECT COUNT(sla.ticket_sla_id)
            FROM ticket_sla sla
            JOIN tickets t ON t.ticket_id = sla.ticket_id
            LEFT JOIN issue_type_master it ON it.issue_type_id = t.issue_type_id
            WHERE (:fromDate IS NULL OR t.reported_date >= :fromDate)
              AND t.reported_date < :toDateExclusive
              AND it.sla_flag IS NOT TRUE
            """, nativeQuery = true)
    long countOtherIssueTypeTickets(@Param("fromDate") LocalDateTime fromDate,
                                    @Param("toDateExclusive") LocalDateTime toDateExclusive);

    long countByBreachedByMinutesGreaterThan(Long breachedByMinutes);

    @Query("""
            SELECT COUNT(sla)
            FROM TicketSla sla
            JOIN sla.ticket t
            WHERE COALESCE(sla.breachedByMinutes, 0) > 0
              AND sla.isSlaApplicable
              AND sla.dueAt >= :fromDate
              AND sla.dueAt < :toDateExclusive
            """)
    long countBreachedTicketsReportedBetween(@Param("fromDate") LocalDateTime fromDate,
                                             @Param("toDateExclusive") LocalDateTime toDateExclusive);

    @Query("""
            SELECT COUNT(sla)
            FROM TicketSla sla
            JOIN sla.ticket t
            WHERE COALESCE(sla.breachedByMinutes, 0) > 0
              AND sla.isSlaApplicable is TRUE
              AND (:fromDate IS NULL OR t.reportedDate >= :fromDate)
              AND t.reportedDate < :toDateExclusive
              AND t.ticketStatus IN :statuses
            """)
    long countBreachedTicketsByStatuses(@Param("fromDate") LocalDateTime fromDate,
                                         @Param("toDateExclusive") LocalDateTime toDateExclusive,
                                         @Param("statuses") List<TicketStatus> statuses);
}
