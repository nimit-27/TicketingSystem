package com.ticketingSystem.api.controller;

import com.ticketingSystem.notification.dto.RoleNotificationChannelBatchUpdateRequest;
import com.ticketingSystem.notification.dto.RoleNotificationChannelBatchUpdateResponse;
import com.ticketingSystem.notification.dto.RoleNotificationChannelGridResponse;
import com.ticketingSystem.notification.service.RoleNotificationChannelMappingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/role-notification-channel-mappings")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class RoleNotificationChannelMappingController {
    private final RoleNotificationChannelMappingService service;

    @GetMapping
    public ResponseEntity<RoleNotificationChannelGridResponse> getGrid() {
        return ResponseEntity.ok(service.getGrid());
    }

    @PutMapping("/batch")
    public ResponseEntity<RoleNotificationChannelBatchUpdateResponse> batchUpdate(
            @Valid @RequestBody RoleNotificationChannelBatchUpdateRequest request
    ) {
        return ResponseEntity.ok(service.batchUpdate(request));
    }
}
