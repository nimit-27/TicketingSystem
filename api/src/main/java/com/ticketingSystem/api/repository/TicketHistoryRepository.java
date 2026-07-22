package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.TicketHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketHistoryRepository extends JpaRepository<TicketHistory, Long> {
    List<TicketHistory> findByTicketIdOrderByUpdatedOnUtcDescUpdatedOnDescTicketHistoryIdDesc(String ticketId);
    List<TicketHistory> findByTicketIdAndUpdateTypeCodeOrderByUpdatedOnUtcDescUpdatedOnDescTicketHistoryIdDesc(String ticketId, String updateTypeCode);
    boolean existsBySourceTableAndSourceHistoryIdAndSourceColumnName(String sourceTable, String sourceHistoryId, String sourceColumnName);
}
