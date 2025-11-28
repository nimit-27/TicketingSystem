package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.models.RegionMaster;
import com.ticketingSystem.api.service.RegionMasterService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/regions")
@CrossOrigin(origins = "http://localhost:3000")
@AllArgsConstructor
public class RegionMasterController {

    private final RegionMasterService regionMasterService;

    @GetMapping
    public ResponseEntity<List<RegionMaster>> getRegions() {
        return ResponseEntity.ok(regionMasterService.getAll());
    }
}
