package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.TicketFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketFeedbackRepository extends JpaRepository<TicketFeedback, Long>, JpaSpecificationExecutor<TicketFeedback> {
    Optional<TicketFeedback> findByTicketId(String ticketId);
    List<TicketFeedback> findByTicketIdIn(Collection<String> ticketIds);
}
