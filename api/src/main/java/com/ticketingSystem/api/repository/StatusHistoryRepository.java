package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.StatusHistory;
import com.ticketingSystem.api.models.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StatusHistoryRepository extends JpaRepository<StatusHistory, String> {
    List<StatusHistory> findByTicketOrderByTimestampAsc(Ticket ticket);

    List<StatusHistory> findByTicketOrderByTimestampDesc(Ticket ticket);

    List<StatusHistory> findByTicketInOrderByTimestampAsc(List<Ticket> tickets);
}
