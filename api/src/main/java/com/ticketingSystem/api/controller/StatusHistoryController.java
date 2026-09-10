package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.StatusHistoryDto;
import com.ticketingSystem.api.dto.StatusTimestampUpdateRequest;
import com.ticketingSystem.api.exception.ForbiddenOperationException;
import com.ticketingSystem.api.service.StatusHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/status-history")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class StatusHistoryController {
    private final StatusHistoryService historyService;

    @GetMapping("/{ticketId}")
    public ResponseEntity<List<StatusHistoryDto>> getHistory(@PathVariable String ticketId) {
        return ResponseEntity.ok(historyService.getHistoryForTicket(ticketId));
    }

    @PatchMapping("/{historyId}/timestamp")
    public ResponseEntity<StatusHistoryDto> updateTimestamp(
            @PathVariable String historyId,
            @RequestParam(value = "devMode", defaultValue = "false") boolean uiDevMode,
            @RequestBody StatusTimestampUpdateRequest request) {
        if (!uiDevMode) {
            throw new ForbiddenOperationException("Enable UI dev mode to edit status timestamps");
        }
        return ResponseEntity.ok(historyService.updateTimestamp(historyId, request));
    }
}
