package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.models.ZoneMaster;
import com.ticketingSystem.api.service.ZoneMasterService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/zones")
@CrossOrigin(origins = "http://localhost:3000")
@AllArgsConstructor
public class ZoneMasterController {

    private final ZoneMasterService zoneMasterService;

    @GetMapping
    public ResponseEntity<List<ZoneMaster>> getZones() {
        return ResponseEntity.ok(zoneMasterService.getAll());
    }
}
