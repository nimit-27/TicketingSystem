package com.example.api.repository;

import com.example.api.models.RootCauseAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.Collection;
import java.util.List;

public interface RootCauseAnalysisRepository extends JpaRepository<RootCauseAnalysis, String> {
    Optional<RootCauseAnalysis> findByTicket_Id(String ticketId);

    @Query("SELECT r.ticket.id FROM RootCauseAnalysis r WHERE r.ticket.id IN (:ticketIds)")
    List<String> findTicketIdsWithRca(@Param("ticketIds") Collection<String> ticketIds);
}
