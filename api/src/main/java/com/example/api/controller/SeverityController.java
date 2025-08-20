package com.example.api.controller;

import com.example.api.models.Severity;
import com.example.api.service.SeverityService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/severities")
@CrossOrigin(origins = "http://localhost:3000")
@AllArgsConstructor
public class SeverityController {

    private final SeverityService severityService;

    @GetMapping
    public ResponseEntity<List<Severity>> getSeverities() {
        return ResponseEntity.ok(severityService.getAll());
    }
}
