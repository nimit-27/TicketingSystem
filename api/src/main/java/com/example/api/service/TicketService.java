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
import com.example.api.repository.LevelRepository;
import com.example.api.service.AssignmentHistoryService;
import com.example.api.service.StatusHistoryService;
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
    private final LevelRepository levelRepository;
    private final StatusHistoryService statusHistoryService;
    private final NotificationService notificationService;


    public TicketService(TypesenseClient typesenseClient, TicketRepository ticketRepository,
                         UserRepository userRepository, TicketCommentRepository commentRepository,
                         AssignmentHistoryService assignmentHistoryService, LevelRepository levelRepository,
                         StatusHistoryService statusHistoryService, NotificationService notificationService) {
        this.typesenseClient = typesenseClient;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.assignmentHistoryService = assignmentHistoryService;
        this.levelRepository = levelRepository;
        this.statusHistoryService = statusHistoryService;
        this.notificationService = notificationService;
    }

    public List<Ticket> getTickets() {
        System.out.println("Getting tickets...");
        return ticketRepository.findAll();
    }

    public Page<TicketDto> getTickets(Pageable pageable) {
        Page<Ticket> ticketPage = ticketRepository.findAll(pageable);

        return ticketPage.map(DtoMapper::toTicketDto);
    }

    public TicketDto getTicket(String id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException(id));
        return DtoMapper.toTicketDto(ticket);
    }

    public TicketDto addTicket(Ticket ticket) {
        System.out.println("TicketService: addTicket - method");
        if(ticket.isMaster()) ticket.setMasterId(null);


        if (ticket.getUserId() != null && !ticket.getUserId().isEmpty()) {
            User user = userRepository.findById(ticket.getUserId()).orElseThrow();
            ticket.setUser(user);
        }

        if (ticket.getAssignedToLevel() == null || ticket.getAssignedToLevel().isEmpty()) {
            ticket.setAssignedToLevel("L1");
        }
        if (ticket.getAssignedTo() == null || ticket.getAssignedTo().isEmpty()) {
            levelRepository.findByLevelName("L1").ifPresent(level -> {
                if (level.getUsers() != null && !level.getUsers().isEmpty()) {
                    User emp = level.getUsers().iterator().next();
                    ticket.setAssignedTo(String.valueOf(emp.getUserId()));
                }
            });
        }
        System.out.println("TicketService: Saving the ticket to repository now...");
        Ticket saved = ticketRepository.save(ticket);

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

        return DtoMapper.toTicketDto(saved);
    }

    public SearchResult search(String query) throws Exception {
        return typesenseClient.searchTickets(query);
    }

    public Page<TicketDto> searchTickets(String query, TicketStatus status, Boolean master, Pageable pageable) {
        Page<Ticket> page = ticketRepository.searchTickets(query, status, master, pageable);
        return page.map(DtoMapper::toTicketDto);
    }

    public TicketDto updateTicket(String id, Ticket updated) {
        Ticket existing = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException(id));

        String previousAssignedTo = existing.getAssignedTo();
        TicketStatus previousStatus = existing.getStatus();
        existing.setCategory(updated.getCategory());
        existing.setStatus(updated.getStatus());
        existing.setSubCategory(updated.getSubCategory());
        existing.setPriority(updated.getPriority());
        existing.setSeverity(updated.getSeverity());
        existing.setRecommendedSeverity(updated.getRecommendedSeverity());
        existing.setImpact(updated.getImpact());
        existing.setSeverityRecommendedBy(updated.getSeverityRecommendedBy());
        existing.setDescription(updated.getDescription());
        existing.setAttachmentPath(updated.getAttachmentPath());
        existing.setAssignedToLevel(updated.getAssignedToLevel());
        existing.setAssignedTo(updated.getAssignedTo());
        Ticket saved = ticketRepository.save(existing);
        if (updated.getAssignedTo() != null && !updated.getAssignedTo().equals(previousAssignedTo)) {
            assignmentHistoryService.addHistory(id, previousAssignedTo, updated.getAssignedTo());
        }
        if (updated.getStatus() != null && !updated.getStatus().equals(previousStatus)) {
            String updatedBy = updated.getAssignedBy() != null ? updated.getAssignedBy() : existing.getAssignedBy();
            statusHistoryService.addHistory(id, updatedBy, previousStatus, updated.getStatus());
        }
        return DtoMapper.toTicketDto(saved);
    }

    public TicketDto linkToMaster(String id, String masterId) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException(id));

        ticket.setMasterId(masterId);
        Ticket saved = ticketRepository.save(ticket);
        return DtoMapper.toTicketDto(saved);
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

