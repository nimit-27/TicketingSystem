package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.TicketHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.time.LocalDateTime;
import java.util.Optional;

public interface TicketHistoryRepository extends JpaRepository<TicketHistory, Long> {
    List<TicketHistory> findByTicketIdOrderByUpdatedOnUtcDescUpdatedOnDescTicketHistoryIdDesc(String ticketId);
    List<TicketHistory> findByTicketIdAndUpdateTypeCodeOrderByUpdatedOnUtcDescUpdatedOnDescTicketHistoryIdDesc(String ticketId, String updateTypeCode);
    boolean existsBySourceTableAndSourceHistoryIdAndSourceColumnName(String sourceTable, String sourceHistoryId, String sourceColumnName);
    List<TicketHistory> findBySourceTableAndSourceHistoryId(String sourceTable, String sourceHistoryId);
    List<TicketHistory> findByTicketIdAndUpdatedOnBetween(String ticketId, LocalDateTime from, LocalDateTime to);
    Optional<TicketHistory> findFirstByTicketIdAndUpdatedOnAfterOrderByUpdatedOnAsc(String ticketId, LocalDateTime updatedOn);
}
