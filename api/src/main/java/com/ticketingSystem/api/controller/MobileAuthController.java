package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.ClientTokenResponse;
import com.ticketingSystem.api.service.MobileClientAuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
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
    public ResponseEntity<?> issueClientToken() {
        // Previously accepted client credentials in the request body; remove once unused.
        // return mobileClientAuthService.exchangeCredentials(request)
        return mobileClientAuthService.issueMobileClientToken()
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid client credentials")));
    }
}
