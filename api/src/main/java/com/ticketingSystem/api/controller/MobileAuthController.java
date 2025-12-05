package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.ClientCredentialRequest;
import com.ticketingSystem.api.dto.ClientTokenResponse;
import com.ticketingSystem.api.service.MobileClientAuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/m/auth")
public class MobileAuthController {
    private final MobileClientAuthService mobileClientAuthService;

    public MobileAuthController(MobileClientAuthService mobileClientAuthService) {
        this.mobileClientAuthService = mobileClientAuthService;
    }

    @PostMapping("/token")
    public ResponseEntity<?> issueClientToken(@RequestBody @Valid ClientCredentialRequest request) {
        return mobileClientAuthService.exchangeCredentials(request)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid client credentials")));
    }
}
