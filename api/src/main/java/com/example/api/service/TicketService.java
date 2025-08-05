package com.example.api.service;

import com.example.api.dto.TicketDto;
import com.example.api.exception.TicketNotFoundException;
import com.example.api.mapper.DtoMapper;
import com.example.api.models.User;
import com.example.api.models.Ticket;
import com.example.api.models.TicketComment;
import com.example.api.repository.UserRepository;
import com.example.api.repository.TicketCommentRepository;
import com.example.api.repository.TicketRepository;
import com.example.api.repository.StatusMasterRepository;
import com.example.api.service.AssignmentHistoryService;
import com.example.api.service.StatusHistoryService;
import com.example.api.service.TicketStatusWorkflowService;
import com.example.api.enums.TicketStatus;
import com.example.api.typesense.TypesenseClient;
import com.example.notification.enums.ChannelType;
import com.example.notification.service.NotificationService;
import org.springframework.stereotype.Service;
import org.typesense.model.SearchResult;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class TicketService {
    private final TypesenseClient typesenseClient;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketCommentRepository commentRepository;
    private final AssignmentHistoryService assignmentHistoryService;
    private final StatusHistoryService statusHistoryService;
    private final NotificationService notificationService;
    private final TicketStatusWorkflowService workflowService;
    private final StatusMasterRepository statusMasterRepository;


    public TicketService(TypesenseClient typesenseClient, TicketRepository ticketRepository,
                         UserRepository userRepository, TicketCommentRepository commentRepository,
                         AssignmentHistoryService assignmentHistoryService,
                         StatusHistoryService statusHistoryService,
                         TicketStatusWorkflowService workflowService,
                         StatusMasterRepository statusMasterRepository,
                         NotificationService notificationService) {
        this.typesenseClient = typesenseClient;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.assignmentHistoryService = assignmentHistoryService;
        this.statusHistoryService = statusHistoryService;
        this.workflowService = workflowService;
        this.statusMasterRepository = statusMasterRepository;
        this.notificationService = notificationService;
    }

    public List<Ticket> getTickets() {
        System.out.println("Getting tickets...");
        return ticketRepository.findAll();
    }

    private TicketDto mapWithStatusId(Ticket ticket) {
        TicketDto dto = DtoMapper.toTicketDto(ticket);
        if (ticket.getStatus() != null) {
            dto.setStatusId(ticket.getStatus().getStatusId());
        } else if (ticket.getTicketStatus() != null) {
            String sid = workflowService.getStatusIdByCode(ticket.getTicketStatus().name());
            dto.setStatusId(sid);
        }
        return dto;
    }

    public Page<TicketDto> getTickets(Pageable pageable) {
        Page<Ticket> ticketPage = ticketRepository.findAll(pageable);

        return ticketPage.map(this::mapWithStatusId);
    }

    public TicketDto getTicket(String id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException(id));
        return mapWithStatusId(ticket);
    }

    public TicketDto addTicket(Ticket ticket) {
        System.out.println("TicketService: addTicket - method");
        if(ticket.isMaster()) ticket.setMasterId(null);


        if (ticket.getUserId() != null && !ticket.getUserId().isEmpty()) {
            User user = userRepository.findById(ticket.getUserId()).orElseThrow();
            ticket.setUser(user);
        }

        if (ticket.getStatus() == null && ticket.getTicketStatus() != null) {
            String id = workflowService.getStatusIdByCode(ticket.getTicketStatus().name());
            if (id != null) {
                statusMasterRepository.findById(id).ifPresent(ticket::setStatus);
            }
        }
        if (ticket.getTicketStatus() == null && ticket.getStatus() != null) {
            String code = ticket.getStatus().getStatusCode();
            if (code != null) {
                ticket.setTicketStatus(TicketStatus.valueOf(code));
            }
        }
        boolean isAssigned = ticket.getAssignedTo() != null && !ticket.getAssignedTo().isEmpty();
        if (!isAssigned) {
            ticket.setTicketStatus(TicketStatus.OPEN);
            String openId = workflowService.getStatusIdByCode(TicketStatus.OPEN.name());
            statusMasterRepository.findById(openId).ifPresent(ticket::setStatus);
        } else if (ticket.getStatus() == null) {
            ticket.setTicketStatus(TicketStatus.ASSIGNED);
            String assignId = workflowService.getStatusIdByCode(TicketStatus.ASSIGNED.name());
            statusMasterRepository.findById(assignId).ifPresent(ticket::setStatus);
        }
        System.out.println("TicketService: Saving the ticket to repository now...");
        Ticket saved = ticketRepository.save(ticket);

        String openId = workflowService.getStatusIdByCode(TicketStatus.OPEN.name());
        boolean sla = workflowService.getSlaFlagByStatusId(openId);
        statusHistoryService.addHistory(saved.getId(), saved.getAssignedBy(), null, openId, sla);
        if (isAssigned) {
            assignmentHistoryService.addHistory(saved.getId(), saved.getAssignedBy(), saved.getAssignedTo());
            String assignedId = workflowService.getStatusIdByCode(TicketStatus.ASSIGNED.name());
            boolean slaAssigned = workflowService.getSlaFlagByStatusId(assignedId);
            statusHistoryService.addHistory(saved.getId(), saved.getAssignedBy(), openId, assignedId, slaAssigned);
        }

        // Prepare data model for Freemarker template
        Map<String, Object> data = new HashMap<>();
        if (saved.getUser() != null) {
            data.put("username", saved.getUser().getName());
        } else {
            data.put("username", saved.getRequestorName());
        }
        data.put("ticketId", saved.getId());

        // Send notification using EMAIL channel and TicketCreated template
        try {
            notificationService.sendNotification(
                    ChannelType.EMAIL,
                    "email/TicketCreated",
                    data,
                    saved.getUser() != null ? saved.getUser().getEmailId() : saved.getRequestorEmailId()
            );
        } catch (Exception e) {
            e.printStackTrace();
        }

        return mapWithStatusId(saved);
    }

    public SearchResult search(String query) throws Exception {
        return typesenseClient.searchTickets(query);
    }

    public Page<TicketDto> searchTickets(String query, String statusId, Boolean master, Pageable pageable) {
        Page<Ticket> page = ticketRepository.searchTickets(query, statusId, master, pageable);
        return page.map(this::mapWithStatusId);
    }

    public TicketDto updateTicket(String id, Ticket updated) {
        Ticket existing = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException(id));

        String previousAssignedTo = existing.getAssignedTo();
        TicketStatus previousStatus = existing.getTicketStatus();
        String previousStatusId = existing.getStatus() != null ? existing.getStatus().getStatusId()
                : (previousStatus != null ? workflowService.getStatusIdByCode(previousStatus.name()) : null);

        TicketStatus updatedStatus = updated.getTicketStatus();
        String updatedStatusId = updated.getStatus() != null ? updated.getStatus().getStatusId() : null;
        if (updatedStatus == null && updatedStatusId != null) {
            String code = workflowService.getStatusCodeById(updatedStatusId);
            if (code != null) {
                updatedStatus = TicketStatus.valueOf(code);
            }
        }
        if (updatedStatusId == null && updatedStatus != null) {
            updatedStatusId = workflowService.getStatusIdByCode(updatedStatus.name());
        }
        if (updated.getCategory() != null) existing.setCategory(updated.getCategory());
        if (updatedStatus != null) existing.setTicketStatus(updatedStatus);
        if (updatedStatusId != null) statusMasterRepository.findById(updatedStatusId).ifPresent(existing::setStatus);
        if (updated.getSubCategory() != null) existing.setSubCategory(updated.getSubCategory());
        if (updated.getPriority() != null) existing.setPriority(updated.getPriority());
        if (updated.getSeverity() != null) existing.setSeverity(updated.getSeverity());
        if (updated.getRecommendedSeverity() != null) existing.setRecommendedSeverity(updated.getRecommendedSeverity());
        if (updated.getImpact() != null) existing.setImpact(updated.getImpact());
        if (updated.getSeverityRecommendedBy() != null) existing.setSeverityRecommendedBy(updated.getSeverityRecommendedBy());
        if (updated.getDescription() != null) existing.setDescription(updated.getDescription());
        if (updated.getAttachmentPath() != null) existing.setAttachmentPath(updated.getAttachmentPath());
        if (updated.getAssignedToLevel() != null) existing.setAssignedToLevel(updated.getAssignedToLevel());
        if (updated.getAssignedTo() != null) {
            existing.setAssignedTo(updated.getAssignedTo());
            if (!updated.getAssignedTo().equals(previousAssignedTo) && updatedStatus == null && updatedStatusId == null) {
                existing.setTicketStatus(TicketStatus.ASSIGNED);
                String assignId = workflowService.getStatusIdByCode(TicketStatus.ASSIGNED.name());
                statusMasterRepository.findById(assignId).ifPresent(existing::setStatus);
            }
        }
        Ticket saved = ticketRepository.save(existing);
        String updatedBy = updated.getAssignedBy() != null ? updated.getAssignedBy() : existing.getAssignedBy();
        if (updated.getAssignedTo() != null && !updated.getAssignedTo().equals(previousAssignedTo)) {
            assignmentHistoryService.addHistory(id, updated.getAssignedBy(), updated.getAssignedTo());
            if (updatedStatusId == null && updatedStatus == null && previousStatus != TicketStatus.ASSIGNED) {
                String assignedId = workflowService.getStatusIdByCode(TicketStatus.ASSIGNED.name());
                boolean slaAssigned = workflowService.getSlaFlagByStatusId(assignedId);
                String prevId = previousStatusId;
                statusHistoryService.addHistory(id, updatedBy, prevId, assignedId, slaAssigned);
                previousStatus = TicketStatus.ASSIGNED;
                previousStatusId = assignedId;
            }
        }
        // ensure status history is recorded whenever status changes via actions
        if (updatedStatusId == null && updatedStatus != null) {
            updatedStatusId = workflowService.getStatusIdByCode(updatedStatus.name());
        }
        if (updatedStatusId != null && !updatedStatusId.equals(previousStatusId)) {
            boolean slaCurr = workflowService.getSlaFlagByStatusId(updatedStatusId);
            statusHistoryService.addHistory(id, updatedBy, previousStatusId, updatedStatusId, slaCurr);
        }
        return mapWithStatusId(saved);
    }

    public TicketDto linkToMaster(String id, String masterId) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException(id));

        ticket.setMasterId(masterId);
        Ticket saved = ticketRepository.save(ticket);
        return mapWithStatusId(saved);
    }

    public TicketComment addComment(String id, String comment) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException(id));

        TicketComment tc = new TicketComment();
        tc.setTicket(ticket);
        tc.setComment(comment);
        tc.setCreatedAt(java.time.LocalDateTime.now());
        return commentRepository.save(tc);
    }

    public List<TicketComment> getComments(String id, Integer count) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException(id));
        List<TicketComment> list = commentRepository.findByTicketOrderByCreatedAtDesc(ticket);
        if (count == null || count >= list.size()) {
            return list;
        }
        return list.subList(0, count);
    }

    public TicketComment updateComment(String commentId, String comment) {
        TicketComment existing = commentRepository.findById(commentId).orElseThrow();
        existing.setComment(comment);
        return commentRepository.save(existing);
    }

    public void deleteComment(String commentId) {
        commentRepository.deleteById(commentId);
    }



    public List<Ticket> getMasterTickets() {
        return ticketRepository.findByIsMasterTrue();
    }
}

