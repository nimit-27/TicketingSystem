package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.FeedbackFormDTO;
import com.ticketingSystem.api.dto.SubmitFeedbackRequest;
import com.ticketingSystem.api.dto.TicketFeedbackResponse;
import com.ticketingSystem.api.exception.FeedbackNotFoundException;
import com.ticketingSystem.api.exception.FeedbackSubmissionException;
import com.ticketingSystem.api.exception.ForbiddenOperationException;
import com.ticketingSystem.api.exception.InvalidRequestException;
import com.ticketingSystem.api.exception.TicketNotFoundException;
import com.ticketingSystem.api.enums.FeedbackStatus;
import com.ticketingSystem.api.enums.TicketStatus;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.models.TicketFeedback;
import com.ticketingSystem.api.repository.TicketFeedbackRepository;
import com.ticketingSystem.api.repository.TicketRepository;
import com.ticketingSystem.api.repository.StatusMasterRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class TicketFeedbackService {
    private final TicketRepository ticketRepository;
    private final TicketFeedbackRepository feedbackRepository;
    private final TicketStatusWorkflowService workflowService;
    private final StatusMasterRepository statusMasterRepository;
    private final StatusHistoryService statusHistoryService;

    public TicketFeedbackService(TicketRepository ticketRepository,
                                 TicketFeedbackRepository feedbackRepository,
                                 TicketStatusWorkflowService workflowService,
                                 StatusMasterRepository statusMasterRepository,
                                 StatusHistoryService statusHistoryService) {
        this.ticketRepository = ticketRepository;
        this.feedbackRepository = feedbackRepository;
        this.workflowService = workflowService;
        this.statusMasterRepository = statusMasterRepository;
        this.statusHistoryService = statusHistoryService;
    }

    public FeedbackFormDTO getForm(String ticketId, String currentUserId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));
        if (!isTicketOwner(ticket.getUserId(), currentUserId)) {
            throw new ForbiddenOperationException("You are not allowed to access feedback for this ticket.");
        }
        if (ticket.getTicketStatus() != TicketStatus.CLOSED) {
            throw new InvalidRequestException("Feedback can only be provided for closed tickets.");
        }
        if (ticket.getFeedbackStatus() != FeedbackStatus.PENDING) {
            throw new InvalidRequestException("Feedback is not pending for this ticket.");
        }
        if (ticket.getResolvedAt() == null ||
                ticket.getResolvedAt().plusHours(72).isBefore(LocalDateTime.now())) {
            throw new InvalidRequestException("Feedback window has expired for this ticket.");
        }
        if (feedbackRepository.findByTicketId(ticketId).isPresent()) {
            throw new InvalidRequestException("Feedback has already been submitted for this ticket.");
        }
        return new FeedbackFormDTO(ticketId, ticket.getResolvedAt());
    }

    @Transactional
    public TicketFeedbackResponse submit(String ticketId, String currentUserId, SubmitFeedbackRequest req) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));
        if (!isTicketOwner(ticket.getUserId(), currentUserId)) {
            throw new ForbiddenOperationException("You are not allowed to submit feedback for this ticket.");
        }
        if (feedbackRepository.findByTicketId(ticketId).isPresent()) {
            throw new InvalidRequestException("Feedback has already been submitted for this ticket.");
        }
        TicketFeedback feedback = new TicketFeedback();
        feedback.setTicketId(ticketId);
        feedback.setSubmittedBy(currentUserId);
        feedback.setOverallSatisfaction(req.overallSatisfaction());
        feedback.setResolutionEffectiveness(req.resolutionEffectiveness());
        feedback.setCommunicationSupport(req.communicationSupport());
        feedback.setTimeliness(req.timeliness());
        feedback.setComments(req.comments());
        try {
            TicketFeedback saved = feedbackRepository.save(feedback);

            String previousStatusId = ticket.getStatus() != null
                    ? ticket.getStatus().getStatusId()
                    : (ticket.getTicketStatus() != null ? workflowService.getStatusIdByCode(ticket.getTicketStatus().name()) : null);

            ticket.setTicketStatus(TicketStatus.CLOSED);
            ticket.setFeedbackStatus(FeedbackStatus.PROVIDED);
            String closedId = workflowService.getStatusIdByCode(TicketStatus.CLOSED.name());
            if (closedId != null) {
                statusMasterRepository.findById(closedId).ifPresent(ticket::setStatus);
            }
            ticketRepository.save(ticket);

            if (closedId != null && (previousStatusId == null || !closedId.equals(previousStatusId))) {
                Boolean slaFlag = workflowService.getSlaFlagByStatusAndIssueType(closedId, ticket.getIssueTypeId());
                statusHistoryService.addHistory(ticket.getId(), currentUserId, previousStatusId, closedId, slaFlag, "Closed after feedback submission");
            }

            return toResponse(ticket, saved);
        } catch (Exception ex) {
            throw new FeedbackSubmissionException(ticketId, ex);
        }
    }

    public TicketFeedbackResponse getFeedback(String ticketId, String currentUserId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));
        if (!isTicketOwner(ticket.getUserId(), currentUserId)) {
            throw new ForbiddenOperationException("You are not allowed to access feedback for this ticket.");
        }
        TicketFeedback feedback = feedbackRepository.findByTicketId(ticketId)
                .orElseThrow(() -> new FeedbackNotFoundException(ticketId));
        return toResponse(ticket, feedback);
    }

    private TicketFeedbackResponse toResponse(Ticket ticket, TicketFeedback feedback) {
        return new TicketFeedbackResponse(ticket.getId(), feedback.getOverallSatisfaction(),
                feedback.getResolutionEffectiveness(), feedback.getCommunicationSupport(),
                feedback.getTimeliness(), feedback.getComments(), feedback.getSubmittedAt(),
                feedback.getSubmittedBy(), ticket.getResolvedAt());
    }

    private boolean isTicketOwner(String ticketUserId, String currentUserId) {
        if (ticketUserId == null || currentUserId == null) {
            return false;
        }
        return ticketUserId.trim().equalsIgnoreCase(currentUserId.trim());
    }

    public Page<TicketFeedback> search(Optional<String> ticketId, Optional<FeedbackStatus> status,
                                       Optional<LocalDateTime> from, Optional<LocalDateTime> to, Pageable pageable) {
        Specification<TicketFeedback> spec = (root, query, cb) -> cb.conjunction();
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
