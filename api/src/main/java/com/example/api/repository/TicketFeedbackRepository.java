package com.example.api.repository;

import com.example.api.models.TicketFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TicketFeedbackRepository extends JpaRepository<TicketFeedback, Long>, JpaSpecificationExecutor<TicketFeedback> {
    Optional<TicketFeedback> findByTicketId(String ticketId);
}
