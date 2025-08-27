package com.example.api.controller;

import com.example.api.dto.PaginationResponse;
import com.example.api.dto.TicketDto;
import com.example.api.models.Ticket;
import com.example.api.models.TicketComment;
import com.example.api.service.TicketService;
import com.example.api.service.FileStorageService;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.multipart.MultipartFile;
import org.typesense.model.SearchResult;
import com.example.api.enums.TicketStatus;

import java.io.IOException;
import java.util.List;

@RequestMapping("/tickets")
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@AllArgsConstructor
public class TicketController {
    private final TicketService ticketService;
    private final FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<PaginationResponse<TicketDto>> getTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String priority,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction) {
        Page<TicketDto> p = ticketService.getTickets(priority,
                PageRequest.of(page, size, org.springframework.data.domain.Sort.by(
                        org.springframework.data.domain.Sort.Direction.fromString(direction), sortBy)));
        PaginationResponse<TicketDto> resp = new PaginationResponse<>(
                p.getContent(), p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages());
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketDto> getTicket(@PathVariable("id") String id) {
        TicketDto dto = ticketService.getTicket(id);
        if (dto == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(dto);
    }

    @PostMapping(value = "/add", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<TicketDto> addTicket(
            @ModelAttribute Ticket ticket,
            @RequestParam(value = "attachment", required = false) MultipartFile attachment) throws IOException {
        if (attachment != null && !attachment.isEmpty()) {
            String path = fileStorageService.save(attachment);
            ticket.setAttachmentPath(path);
        }
        TicketDto addedTicket = ticketService.addTicket(ticket);
        return ResponseEntity.ok(addedTicket);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketDto> updateTicket(@PathVariable String id, @RequestBody Ticket ticket) {
        return ResponseEntity.ok(ticketService.updateTicket(id, ticket));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketComment> addComment(@PathVariable String id, @RequestBody String comment) {
        return ResponseEntity.ok(ticketService.addComment(id, comment));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<TicketComment>> getComments(@PathVariable String id, @RequestParam(required = false) Integer count) {
        return ResponseEntity.ok(ticketService.getComments(id, count));
    }

    @GetMapping("/search")
    public ResponseEntity<PaginationResponse<TicketDto>> searchTickets(
            @RequestParam String query,
            @RequestParam(required = false, name = "status") String statusId,
            @RequestParam(required = false) Boolean master,
            @RequestParam(required = false) String assignedTo,
            @RequestParam(required = false) String assignedBy,
            @RequestParam(required = false) String requestorId,
            @RequestParam(required = false) String levelId,
            @RequestParam(required = false) String priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction) {
        Page<TicketDto> p = ticketService.searchTickets(query, statusId, master, assignedTo, assignedBy, requestorId, levelId, priority,
                PageRequest.of(page, size, org.springframework.data.domain.Sort.by(
                        org.springframework.data.domain.Sort.Direction.fromString(direction), sortBy)));
        PaginationResponse<TicketDto> resp = new PaginationResponse<>(p.getContent(), p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages());
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<TicketComment> updateComment(@PathVariable String commentId, @RequestBody String comment) {
        return ResponseEntity.ok(ticketService.updateComment(commentId, comment));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable String commentId) {
        ticketService.deleteComment(commentId);
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
        return ResponseEntity.ok(ticketService.linkToMaster(id, masterId));
    }
}
