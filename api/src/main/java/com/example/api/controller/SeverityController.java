package com.example.api.controller;

import com.example.api.service.SeverityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/severities")
@CrossOrigin(origins = "http://localhost:3000")
public class SeverityController {

    private final SeverityService severityService;

    public SeverityController(SeverityService severityService) {
        this.severityService = severityService;
    }

    @GetMapping
    public ResponseEntity<List<String>> getSeverities() {
        return ResponseEntity.ok(severityService.getAllValues());
    }
}
