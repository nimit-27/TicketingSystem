package com.ticketingSystem.api.service;

import com.ticketingSystem.api.enums.TicketStatus;
import com.ticketingSystem.api.enums.FeedbackStatus;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.repository.TicketRepository;
import com.ticketingSystem.api.repository.StatusMasterRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class TicketStatusScheduler {
    private final TicketRepository ticketRepository;
    private final TicketStatusWorkflowService workflowService;
    private final StatusMasterRepository statusMasterRepository;
    private final StatusHistoryService statusHistoryService;
    private final boolean autoClosureEnabled;
    private final long autoClosureAfterHours;

    public TicketStatusScheduler(TicketRepository ticketRepository,
                                 TicketStatusWorkflowService workflowService,
                                 StatusMasterRepository statusMasterRepository,
                                 StatusHistoryService statusHistoryService,
                                 @Value("${app.ticket.auto-close-resolved.enabled:true}") boolean autoClosureEnabled,
                                 @Value("${app.ticket.auto-close-resolved.after-hours:72}") long autoClosureAfterHours) {
        this.ticketRepository = ticketRepository;
        this.workflowService = workflowService;
        this.statusMasterRepository = statusMasterRepository;
        this.statusHistoryService = statusHistoryService;
        this.autoClosureEnabled = autoClosureEnabled;
        this.autoClosureAfterHours = autoClosureAfterHours;
    }

    @Transactional
    @Scheduled(cron = "0 0 * * * *", zone = "Asia/Kolkata")
    public void closeResolvedTickets() {
        if (!autoClosureEnabled) {
            return;
        }

        LocalDateTime cutoff = LocalDateTime.now().minusHours(autoClosureAfterHours);
        List<Ticket> tickets = ticketRepository.findByTicketStatusAndLastModifiedBefore(TicketStatus.RESOLVED, cutoff);
        String closedId = workflowService.getStatusIdByCode(TicketStatus.CLOSED.name());
        for (Ticket t : tickets) {
            String previousStatusId = t.getStatus() != null
                    ? t.getStatus().getStatusId()
                    : (t.getTicketStatus() != null ? workflowService.getStatusIdByCode(t.getTicketStatus().name()) : null);

            t.setTicketStatus(TicketStatus.CLOSED);
            t.setUpdatedBy("SYSTEM");
            if (t.getResolvedAt() == null) {
                t.setResolvedAt(LocalDateTime.now());
            }
            if (t.getFeedbackStatus() == null) {
                t.setFeedbackStatus(FeedbackStatus.PENDING);
            }
            if (closedId != null) {
                statusMasterRepository.findById(closedId).ifPresent(t::setStatus);
                if (previousStatusId == null || !closedId.equals(previousStatusId)) {
                    Boolean slaFlag = workflowService.getSlaFlagByStatusAndIssueType(closedId, t.getIssueTypeId());
                    statusHistoryService.addHistory(
                            t.getId(),
                            "SYSTEM",
                            previousStatusId,
                            closedId,
                            slaFlag,
                            "Auto-closed after resolved timeout"
                    );
                }
            }
        }
        ticketRepository.saveAll(tickets);
    }
}
