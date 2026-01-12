package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.service.AltchaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/altcha")
public class AltchaController {
    private final AltchaService altchaService;

    public AltchaController(AltchaService altchaService) {
        this.altchaService = altchaService;
    }

    @GetMapping("/challenge")
    public ResponseEntity<String> challenge() {
        return altchaService.fetchChallenge();
    }
}
