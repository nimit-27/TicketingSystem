package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.models.Status;
import com.ticketingSystem.api.service.StatusMasterService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/ticket-statuses")
@CrossOrigin(origins = "http://localhost:3000")
@AllArgsConstructor
public class TicketStatusController {
    private final StatusMasterService service;

    @GetMapping
    public ResponseEntity<List<Status>> getStatuses() {
        return ResponseEntity.ok(service.getAllStatuses());
    }
}
