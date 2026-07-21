package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.TicketHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketHistoryRepository extends JpaRepository<TicketHistory, Long> {
    List<TicketHistory> findByTicketIdOrderByChangedOnDesc(String ticketId);
    List<TicketHistory> findByTicketIdAndChangeTypeCodeOrderByChangedOnDesc(String ticketId, String changeTypeCode);
}
