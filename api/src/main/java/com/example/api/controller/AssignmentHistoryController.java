package com.example.api.controller;

import com.example.api.models.AssignmentHistory;
import com.example.api.service.AssignmentHistoryService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/assignment-history")
@CrossOrigin(origins = "http://localhost:3000")
@AllArgsConstructor
public class AssignmentHistoryController {
    private final AssignmentHistoryService historyService;

    @GetMapping("/{ticketId}")
    public ResponseEntity<List<AssignmentHistory>> getHistory(@PathVariable String ticketId) {
        return ResponseEntity.ok(historyService.getHistoryForTicket(ticketId));
    }
}
