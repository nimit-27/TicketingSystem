package com.example.api.service;

import com.example.api.models.Employee;
import com.example.api.models.Ticket;
import com.example.api.models.TicketComment;
import com.example.api.repository.EmployeeRepository;
import com.example.api.repository.TicketCommentRepository;
import com.example.api.repository.TicketRepository;
import com.example.api.typesense.TypesenseClient;
import org.springframework.stereotype.Service;
import org.typesense.model.SearchResult;

import java.util.List;

@Service
public class TicketService {
    private final TypesenseClient typesenseClient;
    private final TicketRepository ticketRepository;
    private final EmployeeRepository employeeRepository;
    private final TicketCommentRepository commentRepository;


    public TicketService(TypesenseClient typesenseClient, TicketRepository ticketRepository,
                         EmployeeRepository employeeRepository, TicketCommentRepository commentRepository) {
        this.typesenseClient = typesenseClient;
        this.ticketRepository = ticketRepository;
        this.employeeRepository = employeeRepository;
        this.commentRepository = commentRepository;
    }

    public List<Ticket> getTickets() {
        System.out.println("Getting tickets...");
        return ticketRepository.findAll();
    }

    public Ticket getTicket(int id) {
        return ticketRepository.findById(id).orElse(null);
    }

    public Ticket addTicket(Ticket ticket) {
        System.out.println("TicketService: addTicket - method");
        if(ticket.isMaster()) ticket.setMasterId(null);

        Employee employee = employeeRepository.findById(ticket.getEmployeeId()).orElseThrow();
        ticket.setEmployee(employee);
        System.out.println("TicketService: Saving the ticket to repository now...");
        return ticketRepository.save(ticket);
    }

    public SearchResult search(String query) throws Exception {
        return typesenseClient.searchTickets(query);
    }

    public Ticket updateTicket(int id, Ticket updated) {
        Ticket existing = ticketRepository.findById(id).orElseThrow();
        existing.setCategory(updated.getCategory());
        existing.setStatus(updated.getStatus());
        existing.setSubCategory(updated.getSubCategory());
        existing.setPriority(updated.getPriority());
        existing.setDescription(updated.getDescription());
        existing.setAttachmentPath(updated.getAttachmentPath());
        return ticketRepository.save(existing);
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



    public List<Ticket> getMasterTickets() {
        return ticketRepository.findByIsMasterTrue();
    }
}
