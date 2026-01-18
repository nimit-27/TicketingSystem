package com.ticketingSystem.api.service;

import com.ticketingSystem.api.enums.TicketStatus;
import com.ticketingSystem.api.enums.FeedbackStatus;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.repository.TicketRepository;
import com.ticketingSystem.api.repository.StatusMasterRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class TicketStatusScheduler {
    private final TicketRepository ticketRepository;
    private final TicketStatusWorkflowService workflowService;
    private final StatusMasterRepository statusMasterRepository;

    public TicketStatusScheduler(TicketRepository ticketRepository,
                                 TicketStatusWorkflowService workflowService,
                                 StatusMasterRepository statusMasterRepository) {
        this.ticketRepository = ticketRepository;
        this.workflowService = workflowService;
        this.statusMasterRepository = statusMasterRepository;
    }

    @Scheduled(cron = "0 0 * * * *")
    public void closeResolvedTickets() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(72);
        List<Ticket> tickets = ticketRepository.findByTicketStatusAndLastModifiedBefore(TicketStatus.RESOLVED, cutoff);
        String closedId = workflowService.getStatusIdByCode(TicketStatus.CLOSED.name());
        for (Ticket t : tickets) {
            t.setTicketStatus(TicketStatus.CLOSED);
            if (t.getResolvedAt() == null) {
                t.setResolvedAt(LocalDateTime.now());
            }
            if (t.getFeedbackStatus() == null) {
                t.setFeedbackStatus(FeedbackStatus.PENDING);
            }
            if (closedId != null) {
                statusMasterRepository.findById(closedId).ifPresent(t::setStatus);
            }
        }
        ticketRepository.saveAll(tickets);
    }
}
