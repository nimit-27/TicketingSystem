package com.example.api.controller;

import com.example.api.models.AssignmentHistory;
import com.example.api.service.AssignmentHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/assignment-history")
@CrossOrigin(origins = "http://localhost:3000")
public class AssignmentHistoryController {
    private final AssignmentHistoryService historyService;

    public AssignmentHistoryController(AssignmentHistoryService historyService) {
        this.historyService = historyService;
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<List<AssignmentHistory>> getHistory(@PathVariable String ticketId) {
        return ResponseEntity.ok(historyService.getHistoryForTicket(ticketId));
    }
}
