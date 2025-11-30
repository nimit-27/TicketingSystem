package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.RnoAppointedUserHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RnoAppointedUserHistoryRepository extends JpaRepository<RnoAppointedUserHistory, String> {
}
