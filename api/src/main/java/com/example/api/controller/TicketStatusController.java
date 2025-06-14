package com.example.api.controller;

import com.example.api.enums.TicketStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/ticket-statuses")
@CrossOrigin(origins = "http://localhost:3000")
public class TicketStatusController {

    @GetMapping
    public ResponseEntity<List<String>> getStatuses() {
        List<String> statuses = Arrays.stream(TicketStatus.values())
                .map(Enum::name)
                .collect(Collectors.toList());
        return ResponseEntity.ok(statuses);
    }
}
