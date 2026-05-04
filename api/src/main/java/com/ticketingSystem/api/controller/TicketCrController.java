package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.*;
import com.ticketingSystem.api.service.TicketCrService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ticket-cr")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class TicketCrController {
    private final TicketCrService ticketCrService;

    @PostMapping
    public ResponseEntity<TicketCrDto> create(@RequestBody TicketCrCreateRequestDto request) { return ResponseEntity.status(HttpStatus.CREATED).body(ticketCrService.create(request)); }
    @GetMapping("/{ticketCrId}")
    public ResponseEntity<TicketCrDto> getById(@PathVariable String ticketCrId) { return ResponseEntity.ok(ticketCrService.getById(ticketCrId)); }
    @GetMapping("/actions/{crStatusId}")
    public ResponseEntity<List<TicketCrStatusWorkflowDto>> getAvailableActions(@PathVariable String crStatusId) { return ResponseEntity.ok(ticketCrService.getAvailableActions(crStatusId)); }
    @PostMapping("/mappings")
    public ResponseEntity<Map<String, List<TicketCrStatusWorkflowDto>>> getMappingsByRole(@RequestBody List<String> roles) { return ResponseEntity.ok(ticketCrService.getMappingsByRoles(roles.stream().map(Integer::parseInt).toList())); }
    @PatchMapping("/{ticketCrId}/status")
    public ResponseEntity<TicketCrDto> updateStatus(@PathVariable String ticketCrId, @RequestBody TicketCrUpdateStatusRequestDto request) { return ResponseEntity.ok(ticketCrService.updateStatus(ticketCrId, request)); }
    @GetMapping("/{ticketCrId}/history")
    public ResponseEntity<List<TicketCrHistoryDto>> getHistory(@PathVariable String ticketCrId, @RequestParam(required = false) String changeTypeCode) { return ResponseEntity.ok(ticketCrService.getHistoryByTicketCrId(ticketCrId, changeTypeCode)); }
    @GetMapping
    public ResponseEntity<List<TicketCrDto>> getAll() { return ResponseEntity.ok(ticketCrService.getAll()); }
}
