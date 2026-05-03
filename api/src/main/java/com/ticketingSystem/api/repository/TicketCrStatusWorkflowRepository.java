package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.TicketCrStatusWorkflow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketCrStatusWorkflowRepository extends JpaRepository<TicketCrStatusWorkflow, String> {
    List<TicketCrStatusWorkflow> findByCurrentStatus_CrStatusIdAndActiveTrue(String currentStatusId);
}
