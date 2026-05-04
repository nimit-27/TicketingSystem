package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.TicketCrHistoryConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketCrHistoryConfigRepository extends JpaRepository<TicketCrHistoryConfig, Long> {
    List<TicketCrHistoryConfig> findByTableNameAndIsTrackableTrueOrderByDisplayOrderAsc(String tableName);
}
