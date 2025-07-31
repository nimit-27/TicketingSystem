package com.example.api.controller;

import com.example.api.models.StatusMaster;
import com.example.api.models.TicketStatusWorkflow;
import com.example.api.service.TicketStatusWorkflowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/status-workflow")
@CrossOrigin(origins = "http://localhost:3000")
public class TicketStatusWorkflowController {
    private final TicketStatusWorkflowService service;

    public TicketStatusWorkflowController(TicketStatusWorkflowService service) {
        this.service = service;
    }

    @GetMapping("/status/{statusId}")
    public ResponseEntity<List<StatusMaster>> getNextStatuses(@PathVariable String statusId) {
        return ResponseEntity.ok(service.getNextStatusesByCurrentStatus(statusId));
    }

    @GetMapping("/mappings")
    public ResponseEntity<List<TicketStatusWorkflow>> getMappings() {
        return ResponseEntity.ok(service.getAllMappings());
    }
}
