package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.models.HeadquarterMaster;
import com.ticketingSystem.api.service.HeadquarterMasterService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/headquarters")
@CrossOrigin(origins = "http://localhost:3000")
@AllArgsConstructor
public class HeadquarterMasterController {

    private final HeadquarterMasterService headquarterMasterService;

    @GetMapping
    public ResponseEntity<List<HeadquarterMaster>> getHeadquarters() {
        return ResponseEntity.ok(headquarterMasterService.getAll());
    }
}
