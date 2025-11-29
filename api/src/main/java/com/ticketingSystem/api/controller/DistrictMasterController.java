package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.models.DistrictMaster;
import com.ticketingSystem.api.service.DistrictMasterService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/districts")
@CrossOrigin(origins = "http://localhost:3000")
@AllArgsConstructor
public class DistrictMasterController {

    private final DistrictMasterService districtMasterService;

    @GetMapping
    public ResponseEntity<List<DistrictMaster>> getDistricts() {
        return ResponseEntity.ok(districtMasterService.getAll());
    }
}
