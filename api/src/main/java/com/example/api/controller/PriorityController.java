package com.example.api.controller;

import com.example.api.models.Priority;
import com.example.api.service.PriorityService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/priorities")
@CrossOrigin(origins = "http://localhost:3000")
@AllArgsConstructor
public class PriorityController {

    private final PriorityService priorityService;

    @GetMapping
    public ResponseEntity<List<Priority>> getPriorities() {
        return ResponseEntity.ok(priorityService.getAll());
    }
}
