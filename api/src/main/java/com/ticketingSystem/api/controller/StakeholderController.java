package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.StakeholderDto;
import com.ticketingSystem.api.service.StakeholderService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/stakeholders")
@CrossOrigin(origins = "http://localhost:3000")
@AllArgsConstructor
public class StakeholderController {
    private final StakeholderService stakeholderService;

    @GetMapping
    public ResponseEntity<List<StakeholderDto>> getStakeholders() {
        return ResponseEntity.ok(stakeholderService.getAll());
    }
}
