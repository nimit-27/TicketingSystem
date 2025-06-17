package com.example.api.service;

import com.example.api.dto.TicketDto;
import com.example.api.mapper.DtoMapper;
import com.example.api.models.Employee;
import com.example.api.models.Ticket;
import com.example.api.models.TicketComment;
import com.example.api.repository.EmployeeRepository;
import com.example.api.repository.TicketCommentRepository;
import com.example.api.repository.TicketRepository;
import com.example.api.repository.LevelRepository;
import com.example.api.service.AssignmentHistoryService;
import com.example.api.typesense.TypesenseClient;
import org.springframework.stereotype.Service;
import org.typesense.model.SearchResult;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class TicketService {
    private final TypesenseClient typesenseClient;
    private final TicketRepository ticketRepository;
    private final EmployeeRepository employeeRepository;
    private final TicketCommentRepository commentRepository;
    private final AssignmentHistoryService assignmentHistoryService;
    private final LevelRepository levelRepository;


    public TicketService(TypesenseClient typesenseClient, TicketRepository ticketRepository,
                         EmployeeRepository employeeRepository, TicketCommentRepository commentRepository,
                         AssignmentHistoryService assignmentHistoryService, LevelRepository levelRepository) {
        this.typesenseClient = typesenseClient;
        this.ticketRepository = ticketRepository;
        this.employeeRepository = employeeRepository;
        this.commentRepository = commentRepository;
        this.assignmentHistoryService = assignmentHistoryService;
        this.levelRepository = levelRepository;
    }

    public List<Ticket> getTickets() {
        System.out.println("Getting tickets...");
        return ticketRepository.findAll();
    }

    public Page<TicketDto> getTickets(Pageable pageable) {
        Page<Ticket> ticketPage = ticketRepository.findAll(pageable);

        return ticketPage.map(DtoMapper::toTicketDto);
    }

    public TicketDto getTicket(int id) {
        Ticket ticket = ticketRepository.findById(id).orElse(null);
        return DtoMapper.toTicketDto(ticket);
    }

    public TicketDto addTicket(Ticket ticket) {
        System.out.println("TicketService: addTicket - method");
        if(ticket.isMaster()) ticket.setMasterId(null);


        if (ticket.getEmployeeId() != 0) {
            Employee employee = employeeRepository.findById(ticket.getEmployeeId()).orElseThrow();
            ticket.setEmployee(employee);
        }

        if (ticket.getAssignedToLevel() == null || ticket.getAssignedToLevel().isEmpty()) {
            ticket.setAssignedToLevel("L1");
        }
        if (ticket.getAssignedTo() == null || ticket.getAssignedTo().isEmpty()) {
            levelRepository.findByLevelName("L1").ifPresent(level -> {
                if (level.getEmployees() != null && !level.getEmployees().isEmpty()) {
                    Employee emp = level.getEmployees().iterator().next();
                    ticket.setAssignedTo(emp.getUserId());
                }
            });
        }
        System.out.println("TicketService: Saving the ticket to repository now...");
        Ticket saved = ticketRepository.save(ticket);
        return DtoMapper.toTicketDto(saved);
    }

    public SearchResult search(String query) throws Exception {
        return typesenseClient.searchTickets(query);
    }

    public TicketDto updateTicket(int id, Ticket updated) {
        Ticket existing = ticketRepository.findById(id).orElseThrow();
        String previousAssignedTo = existing.getAssignedTo();
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
        return DtoMapper.toTicketDto(saved);
    }

    public TicketDto linkToMaster(int id, int masterId) {
        Ticket ticket = ticketRepository.findById(id).orElseThrow();
        ticket.setMasterId(masterId);
        Ticket saved = ticketRepository.save(ticket);
        return DtoMapper.toTicketDto(saved);
    }

    public TicketComment addComment(int ticketId, String comment) {
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow();
        TicketComment tc = new TicketComment();
        tc.setTicket(ticket);
        tc.setComment(comment);
        tc.setCreatedAt(java.time.LocalDateTime.now());
        return commentRepository.save(tc);
    }

    public List<TicketComment> getComments(int ticketId, Integer count) {
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow();
        List<TicketComment> list = commentRepository.findByTicketOrderByCreatedAtDesc(ticket);
        if (count == null || count >= list.size()) {
            return list;
        }
        return list.subList(0, count);
    }

    public TicketComment updateComment(int commentId, String comment) {
        TicketComment existing = commentRepository.findById(commentId).orElseThrow();
        existing.setComment(comment);
        return commentRepository.save(existing);
    }

    public void deleteComment(int commentId) {
        commentRepository.deleteById(commentId);
    }



    public List<Ticket> getMasterTickets() {
        return ticketRepository.findByIsMasterTrue();
    }
}

