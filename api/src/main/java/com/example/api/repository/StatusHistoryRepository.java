package com.example.api.repository;

import com.example.api.models.StatusHistory;
import com.example.api.models.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StatusHistoryRepository extends JpaRepository<StatusHistory, String> {
    List<StatusHistory> findByTicketOrderByTimestampAsc(Ticket ticket);
}
