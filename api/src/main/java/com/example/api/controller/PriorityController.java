package com.example.api.controller;

import com.example.api.service.PriorityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/priorities")
@CrossOrigin(origins = "http://localhost:3000")
public class PriorityController {

    private final PriorityService priorityService;

    public PriorityController(PriorityService priorityService) {
        this.priorityService = priorityService;
    }

    @GetMapping
    public ResponseEntity<List<String>> getPriorities() {
        return ResponseEntity.ok(priorityService.getAllValues());
    }
}
