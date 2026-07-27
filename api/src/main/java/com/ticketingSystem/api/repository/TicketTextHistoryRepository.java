package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.TicketTextHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TicketTextHistoryRepository extends JpaRepository<TicketTextHistory, Long> {
    Optional<TicketTextHistory> findByTicketHistory_TicketHistoryId(Long ticketHistoryId);
}
