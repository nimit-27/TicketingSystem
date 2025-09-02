package com.example.api.service;

import com.example.api.enums.TicketStatus;
import com.example.api.enums.FeedbackStatus;
import com.example.api.models.Ticket;
import com.example.api.repository.TicketRepository;
import com.example.api.repository.StatusMasterRepository;
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
        LocalDateTime cutoff = LocalDateTime.now().minusHours(48);
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
