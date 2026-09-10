package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.AssignmentHistory;
import com.ticketingSystem.api.models.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface AssignmentHistoryRepository extends JpaRepository<AssignmentHistory, String> {
    List<AssignmentHistory> findByTicketOrderByTimestampAsc(Ticket ticket);
    List<AssignmentHistory> findByTicketAndTimestampBetween(Ticket ticket, LocalDateTime from, LocalDateTime to);
}
