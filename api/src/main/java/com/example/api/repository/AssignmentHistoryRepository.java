package com.example.api.repository;

import com.example.api.models.AssignmentHistory;
import com.example.api.models.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentHistoryRepository extends JpaRepository<AssignmentHistory, Integer> {
    List<AssignmentHistory> findByTicketOrderByTimestampAsc(Ticket ticket);
}
