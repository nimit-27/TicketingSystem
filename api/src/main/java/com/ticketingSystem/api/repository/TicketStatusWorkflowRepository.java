package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.TicketStatusWorkflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketStatusWorkflowRepository extends JpaRepository<TicketStatusWorkflow, Integer> {
    List<TicketStatusWorkflow> findByCurrentStatus(Integer currentStatus);
}
