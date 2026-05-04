package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.TicketCrHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketCrHistoryRepository extends JpaRepository<TicketCrHistory, Long> {
}
