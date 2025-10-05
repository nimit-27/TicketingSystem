package com.example.api.controller;

import com.example.api.dto.PaginationResponse;
import com.example.api.dto.TicketDto;
import com.example.api.dto.TypesenseTicketDto;
import com.example.api.dto.TypesenseTicketPageResponse;
import com.example.api.models.Ticket;
import com.example.api.models.TicketComment;
import com.example.api.models.TicketSla;
import com.example.api.service.TicketService;
import com.example.api.service.FileStorageService;
import com.example.api.service.TicketSlaService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.multipart.MultipartFile;
import org.typesense.model.SearchResult;
import com.example.api.enums.TicketStatus;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RequestMapping("/tickets")
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@AllArgsConstructor
public class TicketController {
    private static final Logger logger = LoggerFactory.getLogger(TicketController.class);
    private final TicketService ticketService;
    private final FileStorageService fileStorageService;
    private final TicketSlaService ticketSlaService;

    @GetMapping
    public ResponseEntity<PaginationResponse<TicketDto>> getTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String priority,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction) {
        logger.info("Request to get tickets page={} size={} priority={} sortBy={} direction={}",
                page, size, priority, sortBy, direction);
        Page<TicketDto> p = ticketService.getTickets(priority,
                PageRequest.of(page, size, Sort.by(
                        Sort.Direction.fromString(direction), sortBy)));
        PaginationResponse<TicketDto> resp = new PaginationResponse<>(
                p.getContent(), p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages());
        logger.info("Returning {} tickets with status {}", p.getNumberOfElements(), HttpStatus.OK);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketDto> getTicket(@PathVariable("id") String id) {
        logger.info("Request to get ticket {}", id);
        TicketDto dto = ticketService.getTicket(id);
        if (dto == null) {
            logger.warn("Ticket {} not found, returning {}", id, HttpStatus.NOT_FOUND);
            return ResponseEntity.notFound().build();
        }
        logger.info("Ticket {} retrieved successfully, returning {}", id, HttpStatus.OK);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{id}/sla")
    public ResponseEntity<TicketSla> getTicketSla(@PathVariable("id") String id) {
        logger.info("Request to get SLA for ticket {}", id);
        TicketSla sla = ticketSlaService.getByTicketId(id);
        if (sla == null) {
            logger.info("SLA for ticket {} not found, returning {}", id, HttpStatus.CREATED);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        }
        logger.info("SLA for ticket {} retrieved, returning {}", id, HttpStatus.OK);
        return ResponseEntity.ok(sla);
    }

    @PostMapping(value = "/add", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<TicketDto> addTicket(
            @ModelAttribute Ticket ticket,
            @RequestParam(value = "attachments", required = false) MultipartFile[] attachments) throws IOException {
        logger.info("Request to add a new ticket");
        TicketDto addedTicket = ticketService.addTicket(ticket);

//        MANAGING ATTACHMENTS
        if (attachments != null && attachments.length > 0) {
            List<String> paths = new ArrayList<>();
            for (MultipartFile file : attachments) {
                if (file != null && !file.isEmpty()) {
                    String path = fileStorageService.save(file, addedTicket.getId(), ticket.getUpdatedBy());
                    paths.add(path);
                }
            }
            if (!paths.isEmpty()) {
                addedTicket = ticketService.addAttachments(addedTicket.getId(), paths);
            }
        }
        logger.info("Ticket {} created successfully, returning {}", addedTicket.getId(), HttpStatus.OK);
        return ResponseEntity.ok(addedTicket);
    }

    @PostMapping(value = "/{id}/attachments", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<TicketDto> addAttachments(@PathVariable String id,
            @RequestParam("attachments") MultipartFile[] attachments) throws IOException {
        logger.info("Request to add attachments to ticket {}", id);
        List<String> paths = new ArrayList<>();
        if (attachments != null) {
            for (MultipartFile file : attachments) {
                if (file != null && !file.isEmpty()) {
                    paths.add(fileStorageService.save(file, id, null));
                }
            }
        }
        TicketDto dto = ticketService.addAttachments(id, paths);
        logger.info("Attachments added to ticket {}, returning {}", id, HttpStatus.OK);
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}/attachments")
    public ResponseEntity<TicketDto> deleteAttachment(@PathVariable String id, @RequestParam String path) {
        logger.info("Request to delete attachment {} from ticket {}", path, id);
        TicketDto dto = ticketService.removeAttachment(id, path);
        logger.info("Attachment {} removed from ticket {}, returning {}", path, id, HttpStatus.OK);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<java.util.Map<String, Object>> updateTicket(@PathVariable String id, @RequestBody Ticket ticket) {
        logger.info("Request to update ticket {}", id);
        TicketDto dto = ticketService.updateTicket(id, ticket);
        logger.info("Ticket {} updated successfully, returning {}", id, HttpStatus.OK);
        return ResponseEntity.ok(java.util.Map.of("ticket", dto));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketComment> addComment(@PathVariable String id, @RequestBody String comment) {
        logger.info("Request to add comment to ticket {}", id);
        TicketComment addedComment = ticketService.addComment(id, comment);
        logger.info("Comment added to ticket {}, returning {}", id, HttpStatus.OK);
        return ResponseEntity.ok(addedComment);
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<TicketComment>> getComments(@PathVariable String id, @RequestParam(required = false) Integer count) {
        logger.info("Request to get comments for ticket {} count={}", id, count);
        List<TicketComment> comments = ticketService.getComments(id, count);
        logger.info("Returning {} comments for ticket {} with status {}", comments.size(), id, HttpStatus.OK);
        return ResponseEntity.ok(comments);
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
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String createdBy,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String subCategory,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction) {
        logger.info("Request to search tickets query={} status={} master={} assignedTo={} assignedBy={} requestorId={} levelId={} priority={} severity={} createdBy={} category={} subCategory={} fromDate={} toDate={} page={} size={} sortBy={} direction={}",
                query, statusId, master, assignedTo, assignedBy, requestorId, levelId, priority, severity, createdBy, category, subCategory, fromDate, toDate, page, size, sortBy, direction);
        Page<TicketDto> p = ticketService.searchTickets(
                query,
                statusId,
                master,
                assignedTo,
                assignedBy,
                requestorId,
                levelId,
                priority,
                severity,
                createdBy,
                category,
                subCategory,
                fromDate,
                toDate,
                PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(direction), sortBy))
        );
        PaginationResponse<TicketDto> resp = new PaginationResponse<>(p.getContent(), p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages());
        logger.info("Search returned {} tickets with status {}", p.getNumberOfElements(), HttpStatus.OK);
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<TicketComment> updateComment(@PathVariable String commentId, @RequestBody String comment) {
        logger.info("Request to update comment {}", commentId);
        TicketComment updated = ticketService.updateComment(commentId, comment);
        logger.info("Comment {} updated successfully, returning {}", commentId, HttpStatus.OK);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable String commentId) {
        logger.info("Request to delete comment {}", commentId);
        ticketService.deleteComment(commentId);
        logger.info("Comment {} deleted, returning {}", commentId, HttpStatus.NO_CONTENT);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<SearchResult> findTicketsBySearchQuery(@RequestBody String query) throws Exception {
        logger.info("Search tickets by query: {}", query);
        SearchResult result = ticketService.search(query);
        logger.info("Search result returned, status {}", HttpStatus.OK);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/master/typesense")
    public ResponseEntity<List<TypesenseTicketDto>> getTypesenseMasterTickets() {
        logger.info("Request to fetch all master tickets from Typesense");
        List<TypesenseTicketDto> tickets = ticketService.getAllMasterTicketsFromTypesense();
        logger.info("Returning {} master tickets from Typesense", tickets.size());
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/master/typesense/page")
    public ResponseEntity<TypesenseTicketPageResponse> getTypesenseMasterTicketsPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Request to fetch master tickets from Typesense page={} size={}", page, size);
        TypesenseTicketPageResponse response = ticketService.getMasterTicketsPageFromTypesense(page, size);
        logger.info("Returning {} master tickets from Typesense with totalFound={} totalPages={}",
                response.getTickets().size(), response.getTotalFound(), response.getTotalPages());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/link/{masterId}")
    public ResponseEntity<TicketDto> linkToMaster(@PathVariable String id, @PathVariable String masterId) {
        logger.info("Request to link ticket {} to master {}", id, masterId);
        TicketDto dto = ticketService.linkToMaster(id, masterId);
        logger.info("Ticket {} linked to master {}, returning {}", id, masterId, HttpStatus.OK);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}/master")
    public ResponseEntity<TicketDto> markAsMaster(@PathVariable String id) {
        logger.info("Request to mark ticket {} as master", id);
        TicketDto dto = ticketService.markAsMaster(id);
        logger.info("Ticket {} marked as master, returning {}", id, HttpStatus.OK);
        return ResponseEntity.ok(dto);
    }
}
