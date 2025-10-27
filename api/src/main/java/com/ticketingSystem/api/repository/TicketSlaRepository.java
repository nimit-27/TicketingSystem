package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.TicketSla;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketSlaRepository extends JpaRepository<TicketSla, String> {
    Optional<TicketSla> findByTicket_Id(String ticketId);

    @Query("SELECT DISTINCT sla FROM TicketSla sla LEFT JOIN FETCH sla.ticket")
    List<TicketSla> findAllWithTicket();

    @Query("SELECT DISTINCT sla FROM TicketSla sla LEFT JOIN FETCH sla.ticket WHERE sla.breachedByMinutes IS NOT NULL AND sla.breachedByMinutes > 0")
    List<TicketSla> findBreachedWithTicket();
}
