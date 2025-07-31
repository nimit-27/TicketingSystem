package com.example.api.controller;

import com.example.api.models.Status;
import com.example.api.service.StatusMasterService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/status-master")
@CrossOrigin(origins = "http://localhost:3000")
@AllArgsConstructor
public class StatusMasterController {

    private final StatusMasterService service;

    @GetMapping
    public ResponseEntity<List<Status>> getStatuses() {
        return ResponseEntity.ok(service.getAllStatuses());
    }
}
