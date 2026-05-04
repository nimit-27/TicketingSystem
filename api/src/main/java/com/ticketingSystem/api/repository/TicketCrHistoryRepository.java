package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.TicketCrHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketCrHistoryRepository extends JpaRepository<TicketCrHistory, Long> {
    List<TicketCrHistory> findByTicketCrIdOrderByChangedOnDesc(String ticketCrId);
    List<TicketCrHistory> findByTicketCrIdAndChangeTypeCodeOrderByChangedOnDesc(String ticketCrId, String changeTypeCode);
}
