package com.ticketingSystem.api.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.Map;

@RestController
@RequestMapping("/m")
public class MobileStatusController {

    @GetMapping("/ping")
    public Map<String, Object> ping(Authentication authentication) {
        return Map.of(
                "message", "Mobile client authenticated",
                "clientId", authentication != null ? authentication.getPrincipal() : "unknown",
                "timestamp", OffsetDateTime.now()
        );
    }
}
