package com.example.api.service;

import com.example.api.models.Employee;
import com.example.api.models.Ticket;
import com.example.api.repository.EmployeeRepository;
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


    public TicketService(TypesenseClient typesenseClient, TicketRepository ticketRepository, EmployeeRepository employeeRepository) {
        this.typesenseClient = typesenseClient;
        this.ticketRepository = ticketRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<Ticket> getTickets() throws Exception {
        System.out.println("Getting tickets...");
        return ticketRepository.findAll();
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



    public List<Ticket> getMasterTickets() {
        return ticketRepository.findByIsMasterTrue();
    }
}
