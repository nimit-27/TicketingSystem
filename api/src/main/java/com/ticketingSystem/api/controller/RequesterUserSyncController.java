package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.requestersync.RequesterUserSyncBatchRequest;
import com.ticketingSystem.api.dto.requestersync.RequesterUserSyncBatchResponse;
import com.ticketingSystem.api.dto.requestersync.RequesterUserSyncFailureResponse;
import com.ticketingSystem.api.service.RequesterUserSyncService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ext/requester-users")
@RequiredArgsConstructor
public class RequesterUserSyncController {
    private final RequesterUserSyncService requesterUserSyncService;

    @PostMapping("/batches")
    public ResponseEntity<RequesterUserSyncBatchResponse> ingestBatch(@Valid @RequestBody RequesterUserSyncBatchRequest request) {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(requesterUserSyncService.ingestBatch(request));
    }

    @GetMapping("/batches/{batchId}/failures")
    public ResponseEntity<RequesterUserSyncFailureResponse> getFailures(@RequestParam String sourceSystem,
                                                                        @PathVariable String batchId) {
        return ResponseEntity.ok(requesterUserSyncService.getFailures(sourceSystem, batchId));
    }
}
