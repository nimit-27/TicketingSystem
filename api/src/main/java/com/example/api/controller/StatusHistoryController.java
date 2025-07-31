package com.example.api.controller;

import com.example.api.dto.StatusHistoryDto;
import com.example.api.models.StatusHistory;
import com.example.api.service.StatusHistoryService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/status-history")
@CrossOrigin(origins = "http://localhost:3000")
@AllArgsConstructor
public class StatusHistoryController {
    private final StatusHistoryService historyService;

    @GetMapping("/{ticketId}")
    public ResponseEntity<List<StatusHistoryDto>> getHistory(@PathVariable String ticketId) {
        return ResponseEntity.ok(historyService.getHistoryForTicket(ticketId));
    }
}
