package com.example.api.controller;

import com.example.api.models.Ticket;
import com.example.api.repository.TicketRepository;
import com.example.api.service.TicketService;
import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.typesense.model.SearchResult;

import java.util.List;

@RequestMapping("/tickets")
@CrossOrigin(origins = "http://localhost:3000")
@RestController
public class TicketController {
    private final TicketService ticketService;

    @Autowired
    public TicketController(TicketService ticketService, TicketRepository ticketRepository) {
        this.ticketService = ticketService;
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getTickets() throws Exception {
        return ResponseEntity.ok(ticketService.getTickets());
//        return ticketService.getTickets();
    }

    @PostMapping("/add")
    public ResponseEntity<Ticket> addTicket(@RequestBody Ticket ticket) {
        System.out.println("TicketController: addTicket - method");
        Ticket addedTicket = ticketService.addTicket(ticket);
        System.out.println("Ticket added with Id: " + addedTicket.getId());
        return ResponseEntity.ok(addedTicket);
//        return ResponseEntity.ok("Ticket with Id " + addedTicket.getId() + " added successfully");
    }

    @PostMapping
    public ResponseEntity<SearchResult> findTicketsBySearchQuery(@RequestBody String query) throws Exception {
        System.out.println("query : " + query);
        SearchResult result = ticketService.search(query);
        System.out.println(result);
        return ResponseEntity.ok(result);
    }
}
