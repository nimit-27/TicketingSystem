package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.TicketCrCreateRequestDto;
import com.ticketingSystem.api.dto.TicketCrDto;
import com.ticketingSystem.api.service.TicketCrService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ticket-cr")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class TicketCrController {

    private final TicketCrService ticketCrService;

    @PostMapping
    public ResponseEntity<TicketCrDto> create(@RequestBody TicketCrCreateRequestDto request) {
        TicketCrDto created = ticketCrService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{ticketCrId}")
    public ResponseEntity<TicketCrDto> getById(@PathVariable String ticketCrId) {
        return ResponseEntity.ok(ticketCrService.getById(ticketCrId));
    }

    @GetMapping
    public ResponseEntity<List<TicketCrDto>> getAll() {
        return ResponseEntity.ok(ticketCrService.getAll());
    }
}
