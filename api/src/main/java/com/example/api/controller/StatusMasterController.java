package com.example.api.controller;

import com.example.api.models.StatusMaster;
import com.example.api.service.StatusMasterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/status-master")
@CrossOrigin(origins = "http://localhost:3000")
public class StatusMasterController {

    private final StatusMasterService service;

    public StatusMasterController(StatusMasterService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<StatusMaster>> getStatuses() {
        return ResponseEntity.ok(service.getAllStatuses());
    }
}
