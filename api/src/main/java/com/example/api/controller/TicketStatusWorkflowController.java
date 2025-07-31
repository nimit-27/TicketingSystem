package com.example.api.controller;

import com.example.api.models.Status;
import com.example.api.models.TicketStatusWorkflow;
import com.example.api.service.TicketStatusWorkflowService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/status-workflow")
@CrossOrigin(origins = "http://localhost:3000")
@AllArgsConstructor
public class TicketStatusWorkflowController {
    private final TicketStatusWorkflowService service;

    @GetMapping("/status/{statusId}")
    public ResponseEntity<List<Status>> getNextStatuses(@PathVariable String statusId) {
        return ResponseEntity.ok(service.getNextStatusesByCurrentStatus(statusId));
    }

    @GetMapping("/mappings")
    public ResponseEntity<List<TicketStatusWorkflow>> getMappings() {
        return ResponseEntity.ok(service.getAllMappings());
    }
}
