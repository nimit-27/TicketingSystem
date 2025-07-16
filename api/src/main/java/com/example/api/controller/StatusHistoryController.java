package com.example.api.controller;

import com.example.api.models.StatusHistory;
import com.example.api.service.StatusHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/status-history")
@CrossOrigin(origins = "http://localhost:3000")
public class StatusHistoryController {
    private final StatusHistoryService historyService;

    public StatusHistoryController(StatusHistoryService historyService) {
        this.historyService = historyService;
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<List<StatusHistory>> getHistory(@PathVariable String ticketId) {
        return ResponseEntity.ok(historyService.getHistoryForTicket(Integer.parseInt(ticketId)));
    }
}
