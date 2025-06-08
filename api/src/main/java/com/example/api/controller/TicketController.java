package com.example.api.controller;

import com.example.api.models.Ticket;
import com.example.api.models.TicketComment;
import com.example.api.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
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
    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getTickets() throws Exception {
        return ResponseEntity.ok(ticketService.getTickets());
//        return ticketService.getTickets();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicket(@PathVariable int id) {
        Ticket t = ticketService.getTicket(id);
        if (t == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(t);
    }

    @PostMapping("/add")
    public ResponseEntity<Ticket> addTicket(@RequestBody Ticket ticket) {
        System.out.println("TicketController: addTicket - method");
        Ticket addedTicket = ticketService.addTicket(ticket);
        System.out.println("Ticket added with Id: " + addedTicket.getId());
        return ResponseEntity.ok(addedTicket);
//        return ResponseEntity.ok("Ticket with Id " + addedTicket.getId() + " added successfully");
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ticket> updateTicket(@PathVariable int id, @RequestBody Ticket ticket) {
        return ResponseEntity.ok(ticketService.updateTicket(id, ticket));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketComment> addComment(@PathVariable int id, @RequestBody String comment) {
        return ResponseEntity.ok(ticketService.addComment(id, comment));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<TicketComment>> getComments(@PathVariable int id, @RequestParam(required = false) Integer count) {
        return ResponseEntity.ok(ticketService.getComments(id, count));
    }

    @PostMapping
    public ResponseEntity<SearchResult> findTicketsBySearchQuery(@RequestBody String query) throws Exception {
        System.out.println("query : " + query);
        SearchResult result = ticketService.search(query);
        System.out.println(result);
        return ResponseEntity.ok(result);
    }
}
