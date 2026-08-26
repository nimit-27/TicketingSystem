package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.TicketHistoryConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketHistoryConfigRepository extends JpaRepository<TicketHistoryConfig, Long> {
    List<TicketHistoryConfig> findByTableNameAndIsTrackableTrueOrderByDisplayOrderAsc(String tableName);
}
