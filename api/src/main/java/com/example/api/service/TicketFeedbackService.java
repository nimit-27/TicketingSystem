package com.example.api.service;

import com.example.api.dto.FeedbackFormDTO;
import com.example.api.dto.SubmitFeedbackRequest;
import com.example.api.dto.TicketFeedbackResponse;
import com.example.api.enums.FeedbackStatus;
import com.example.api.enums.TicketStatus;
import com.example.api.models.Ticket;
import com.example.api.models.TicketFeedback;
import com.example.api.repository.TicketFeedbackRepository;
import com.example.api.repository.TicketRepository;
import com.example.api.repository.StatusMasterRepository;
import com.example.api.service.TicketStatusWorkflowService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class TicketFeedbackService {
    private final TicketRepository ticketRepository;
    private final TicketFeedbackRepository feedbackRepository;
    private final TicketStatusWorkflowService workflowService;
    private final StatusMasterRepository statusMasterRepository;

    public TicketFeedbackService(TicketRepository ticketRepository,
                                 TicketFeedbackRepository feedbackRepository,
                                 TicketStatusWorkflowService workflowService,
                                 StatusMasterRepository statusMasterRepository) {
        this.ticketRepository = ticketRepository;
        this.feedbackRepository = feedbackRepository;
        this.workflowService = workflowService;
        this.statusMasterRepository = statusMasterRepository;
    }

    public FeedbackFormDTO getForm(String ticketId, String currentUserId) {
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow();
        if (!ticket.getUserId().equals(currentUserId)) {
            throw new RuntimeException("Forbidden");
        }
        if (ticket.getTicketStatus() != TicketStatus.CLOSED) {
            throw new RuntimeException("Ticket not closed");
        }
        if (ticket.getFeedbackStatus() != FeedbackStatus.PENDING) {
            throw new RuntimeException("Feedback not pending");
        }
        if (ticket.getResolvedAt() == null ||
                ticket.getResolvedAt().plusHours(72).isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Feedback window closed");
        }
        if (feedbackRepository.findByTicketId(ticketId).isPresent()) {
            throw new RuntimeException("Feedback already submitted");
        }
        return new FeedbackFormDTO(ticketId, ticket.getResolvedAt());
    }

    public TicketFeedbackResponse submit(String ticketId, String currentUserId, SubmitFeedbackRequest req) {
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow();
        if (!ticket.getUserId().equals(currentUserId)) {
            throw new RuntimeException("Forbidden");
        }
        if (feedbackRepository.findByTicketId(ticketId).isPresent()) {
            throw new RuntimeException("Feedback already submitted");
        }
        TicketFeedback feedback = new TicketFeedback();
        feedback.setTicketId(ticketId);
        feedback.setSubmittedBy(currentUserId);
        feedback.setOverallSatisfaction(req.overallSatisfaction());
        feedback.setResolutionEffectiveness(req.resolutionEffectiveness());
        feedback.setCommunicationSupport(req.communicationSupport());
        feedback.setTimeliness(req.timeliness());
        feedback.setComments(req.comments());
        TicketFeedback saved = feedbackRepository.save(feedback);

        ticket.setTicketStatus(TicketStatus.CLOSED);
        ticket.setFeedbackStatus(FeedbackStatus.PROVIDED);
        String closedId = workflowService.getStatusIdByCode(TicketStatus.CLOSED.name());
        if (closedId != null) {
            statusMasterRepository.findById(closedId).ifPresent(ticket::setStatus);
        }
        ticketRepository.save(ticket);
        return new TicketFeedbackResponse(ticketId, saved.getOverallSatisfaction(),
                saved.getResolutionEffectiveness(), saved.getCommunicationSupport(),
                saved.getTimeliness(), saved.getComments(), saved.getSubmittedAt(), saved.getSubmittedBy());
    }

    public Optional<TicketFeedbackResponse> getFeedback(String ticketId, String currentUserId) {
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow();
        if (!ticket.getUserId().equals(currentUserId)) {
            throw new RuntimeException("Forbidden");
        }
        return feedbackRepository.findByTicketId(ticketId)
                .map(f -> new TicketFeedbackResponse(ticketId, f.getOverallSatisfaction(),
                        f.getResolutionEffectiveness(), f.getCommunicationSupport(),
                        f.getTimeliness(), f.getComments(), f.getSubmittedAt(), f.getSubmittedBy()));
    }

    public Page<TicketFeedback> search(Optional<String> ticketId, Optional<FeedbackStatus> status,
                                       Optional<LocalDateTime> from, Optional<LocalDateTime> to, Pageable pageable) {
        Specification<TicketFeedback> spec = Specification.where(null);
        if (ticketId.isPresent()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("ticketId"), ticketId.get()));
        }
        if (from.isPresent()) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("submittedAt"), from.get()));
        }
        if (to.isPresent()) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("submittedAt"), to.get()));
        }
        return feedbackRepository.findAll(spec, pageable);
    }

    @Scheduled(fixedRate = 1800000)
    public void autoCloseUnreviewed() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(72);
        for (Ticket t : ticketRepository.findByTicketStatusAndResolvedAtBefore(TicketStatus.CLOSED, cutoff)) {
            if (t.getFeedbackStatus() == FeedbackStatus.PENDING &&
                    feedbackRepository.findByTicketId(t.getId()).isEmpty()) {
                t.setFeedbackStatus(FeedbackStatus.NOT_PROVIDED);
                ticketRepository.save(t);
            }
        }
    }
}
