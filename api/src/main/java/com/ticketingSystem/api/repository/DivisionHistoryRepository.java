package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.DivisionHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DivisionHistoryRepository extends JpaRepository<DivisionHistory, String> {
}
