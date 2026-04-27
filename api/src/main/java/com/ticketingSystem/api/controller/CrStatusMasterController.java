package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.models.CrStatusMaster;
import com.ticketingSystem.api.service.CrStatusMasterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/cr-status-master")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class CrStatusMasterController {

    private final CrStatusMasterService crStatusMasterService;

    @GetMapping
    public ResponseEntity<List<CrStatusMaster>> getStatuses() {
        return ResponseEntity.ok(crStatusMasterService.getAllStatuses());
    }
}
