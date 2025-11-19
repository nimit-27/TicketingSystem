package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.LoginPayload;
import com.ticketingSystem.api.dto.PaginationResponse;
import com.ticketingSystem.api.dto.TicketDto;
import com.ticketingSystem.api.models.Ticket;
import com.ticketingSystem.api.models.TicketComment;
import com.ticketingSystem.api.models.TicketSla;
import com.ticketingSystem.api.service.TicketService;
import com.ticketingSystem.api.dto.TicketSearchResultDto;
import com.ticketingSystem.api.service.FileStorageService;
import com.ticketingSystem.api.service.TicketSlaService;
import com.ticketingSystem.api.dto.TicketSlaDto;
import com.ticketingSystem.api.mapper.DtoMapper;
import com.ticketingSystem.api.service.TicketAuthorizationService;
import com.ticketingSystem.api.service.UserService;
import com.ticketingSystem.api.dto.UserDto;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import jakarta.servlet.http.HttpSession;

@RequestMapping("/tickets")
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@AllArgsConstructor
public class TicketController {
    private static final Logger logger = LoggerFactory.getLogger(TicketController.class);
    private final TicketService ticketService;
    private final FileStorageService fileStorageService;
    private final TicketSlaService ticketSlaService;
    private final TicketAuthorizationService ticketAuthorizationService;
    private final UserService userService;

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
    public ResponseEntity<TicketDto> getTicket(@PathVariable("id") String id,
                                               @AuthenticationPrincipal LoginPayload authenticatedUser,
                                               HttpSession session,
                                               @RequestHeader(value = "X-USER-ID", required = false) String userIdHeader) {
        logger.info("Request to get ticket {}", id);
        TicketDto dto = ticketService.getTicket(id);
        if (dto == null) {
            logger.warn("Ticket {} not found, returning {}", id, HttpStatus.NOT_FOUND);
            return ResponseEntity.notFound().build();
        }
        LoginPayload resolvedUser = resolveAuthenticatedUser(authenticatedUser, userIdHeader);
        String ticketAssigneeUserId = resolveTicketAssigneeUserId(dto.getAssignedTo());
        ticketAuthorizationService.assertCanAccessTicket(
                id,
                dto.getUserId(),
                ticketAssigneeUserId,
                resolvedUser,
                session);
        logger.info("Ticket {} retrieved successfully, returning {}", id, HttpStatus.OK);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{id}/sla")
    public ResponseEntity<TicketSlaDto> getTicketSla(@PathVariable("id") String id,
                                                     @AuthenticationPrincipal LoginPayload authenticatedUser,
                                                     HttpSession session,
                                                     @RequestHeader(value = "X-USER-ID", required = false) String userIdHeader) {
        logger.info("Request to get SLA for ticket {}", id);
        TicketSla sla = ticketSlaService.getByTicketId(id);
        if (sla == null) {
            logger.info("SLA for ticket {} not found, returning {}", id, HttpStatus.CREATED);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        }
        LoginPayload resolvedUser = resolveAuthenticatedUser(authenticatedUser, userIdHeader);
        String slaTicketOwnerId = sla.getTicket() != null ? sla.getTicket().getUserId() : null;
        String slaTicketAssigneeUserId = sla.getTicket() != null
                ? resolveTicketAssigneeUserId(sla.getTicket().getAssignedTo())
                : null;
        ticketAuthorizationService.assertCanAccessTicket(id,
                slaTicketOwnerId,
                slaTicketAssigneeUserId,
                resolvedUser,
                session);
        logger.info("SLA for ticket {} retrieved, returning {}", id, HttpStatus.OK);
        return ResponseEntity.ok(DtoMapper.toTicketSlaDto(sla));
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
    public ResponseEntity<List<TicketSearchResultDto>> findTicketsBySearchQuery(@RequestBody String query) throws Exception {
        logger.info("Search tickets by query: {}", query);
        List<TicketSearchResultDto> results = ticketService.search(query);
        logger.info("Search result returned with {} entries, status {}", results.size(), HttpStatus.OK);
        return ResponseEntity.ok(results);
    }


    @PutMapping("/{id}/link/{masterId}")
    public ResponseEntity<TicketDto> linkToMaster(@PathVariable String id,
                                                  @PathVariable String masterId,
                                                  @RequestParam(required = false) String updatedBy) {
        logger.info("Request to link ticket {} to master {} by {}", id, masterId, updatedBy);
        TicketDto dto = ticketService.linkToMaster(id, masterId, updatedBy);
        logger.info("Ticket {} linked to master {} by {}, returning {}", id, masterId, updatedBy, HttpStatus.OK);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}/unlink")
    public ResponseEntity<TicketDto> unlinkFromMaster(@PathVariable String id,
                                                      @RequestParam(required = false) String updatedBy) {
        logger.info("Request to unlink ticket {} from its master by {}", id, updatedBy);
        TicketDto dto = ticketService.unlinkFromMaster(id, updatedBy);
        logger.info("Ticket {} unlinked from master by {}, returning {}", id, updatedBy, HttpStatus.OK);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{id}/children")
    public ResponseEntity<List<TicketDto>> getChildTickets(@PathVariable String id) {
        logger.info("Request to fetch child tickets for master {}", id);
        List<TicketDto> children = ticketService.getChildTickets(id);
        logger.info("Returning {} child tickets for master {} with status {}", children.size(), id, HttpStatus.OK);
        return ResponseEntity.ok(children);
    }

    @PutMapping("/{id}/master")
    public ResponseEntity<TicketDto> markAsMaster(@PathVariable String id) {
        logger.info("Request to mark ticket {} as master", id);
        TicketDto dto = ticketService.markAsMaster(id);
        logger.info("Ticket {} marked as master, returning {}", id, HttpStatus.OK);
        return ResponseEntity.ok(dto);
    }

    private LoginPayload resolveAuthenticatedUser(LoginPayload authenticatedUser,
                                                  String userIdHeader) {
        if (authenticatedUser != null || userIdHeader == null || userIdHeader.isBlank()) {
            return authenticatedUser;
        }
        return userService.getUserDetails(userIdHeader.trim())
                .map(this::toLoginPayload)
                .orElse(null);
    }

    private String resolveTicketAssigneeUserId(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return null;
        }

        Optional<UserDto> userById = userService.getUserDetails(identifier);
        if (userById.isPresent()) {
            return userById.get().getUserId();
        }

        return userService.getUserDetailsByUsername(identifier)
                .map(UserDto::getUserId)
                .orElse(null);
    }

    private LoginPayload toLoginPayload(UserDto user) {
        List<String> roles = user.getRoleNames() != null && !user.getRoleNames().isEmpty()
                ? user.getRoleNames()
                : parseRoles(user.getRoles());
        return LoginPayload.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .name(user.getName())
//                .firstName(user.getFirstName())
//                .lastName(user.getLastName())
                .roles(roles)
                .levels(user.getLevels() != null ? user.getLevels() : Collections.emptyList())
                .build();
    }

    private List<String> parseRoles(String roles) {
        if (roles == null || roles.isBlank()) {
            return Collections.emptyList();
        }
        return Arrays.stream(roles.split("\\|"))
                .map(String::trim)
                .filter(role -> !role.isEmpty())
                .toList();
    }
}
