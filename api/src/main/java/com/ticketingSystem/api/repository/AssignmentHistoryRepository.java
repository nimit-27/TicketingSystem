package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.AssignmentHistory;
import com.ticketingSystem.api.models.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentHistoryRepository extends JpaRepository<AssignmentHistory, String> {
    List<AssignmentHistory> findByTicketOrderByTimestampAsc(Ticket ticket);
}
