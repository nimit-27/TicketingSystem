package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.models.ParameterMaster;
import com.ticketingSystem.api.service.ParameterMasterService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/parameters")
@CrossOrigin(origins = "http://localhost:3000")
@AllArgsConstructor
public class ParameterMasterController {
    private final ParameterMasterService parameterMasterService;

    @GetMapping
    public ResponseEntity<List<ParameterMaster>> getParameters() {
        return ResponseEntity.ok(parameterMasterService.getAll());
    }
}
