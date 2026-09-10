package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.StatusHistoryDto;
import com.ticketingSystem.api.dto.UpdateStatusTimestampRequest;
import com.ticketingSystem.api.service.StatusHistoryService;
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

    @PatchMapping("/{historyId}/timestamp")
    public ResponseEntity<StatusHistoryDto> updateTimestamp(@PathVariable String historyId,
                                                            @RequestBody UpdateStatusTimestampRequest request) {
        return ResponseEntity.ok(historyService.updateTimestamp(historyId, request));
    }
}
