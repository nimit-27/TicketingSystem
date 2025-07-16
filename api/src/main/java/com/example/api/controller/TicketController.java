package com.example.api.controller;

import com.example.api.dto.PaginationResponse;
import com.example.api.dto.TicketDto;
import com.example.api.models.Ticket;
import com.example.api.models.TicketComment;
import com.example.api.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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
    public ResponseEntity<PaginationResponse<TicketDto>> getTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<TicketDto> p = ticketService.getTickets(PageRequest.of(page, size));
        PaginationResponse<TicketDto> resp = new PaginationResponse<>(
                p.getContent(), p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages());
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketDto> getTicket(@PathVariable String id) {
        TicketDto dto = ticketService.getTicket(Integer.parseInt(id));
        if (dto == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/add")
    public ResponseEntity<TicketDto> addTicket(@RequestBody Ticket ticket) {
        TicketDto addedTicket = ticketService.addTicket(ticket);
        return ResponseEntity.ok(addedTicket);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketDto> updateTicket(@PathVariable String id, @RequestBody Ticket ticket) {
        return ResponseEntity.ok(ticketService.updateTicket(Integer.parseInt(id), ticket));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketComment> addComment(@PathVariable String id, @RequestBody String comment) {
        return ResponseEntity.ok(ticketService.addComment(Integer.parseInt(id), comment));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<TicketComment>> getComments(@PathVariable String id, @RequestParam(required = false) Integer count) {
        return ResponseEntity.ok(ticketService.getComments(Integer.parseInt(id), count));
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<TicketComment> updateComment(@PathVariable String commentId, @RequestBody String comment) {
        return ResponseEntity.ok(ticketService.updateComment(Integer.parseInt(commentId), comment));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable String commentId) {
        ticketService.deleteComment(Integer.parseInt(commentId));
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<SearchResult> findTicketsBySearchQuery(@RequestBody String query) throws Exception {
        System.out.println("query : " + query);
        SearchResult result = ticketService.search(query);
        System.out.println(result);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}/link/{masterId}")
    public ResponseEntity<TicketDto> linkToMaster(@PathVariable String id, @PathVariable String masterId) {
        return ResponseEntity.ok(ticketService.linkToMaster(Integer.parseInt(id), Integer.parseInt(masterId)));
    }
}
