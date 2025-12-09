package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.models.ParameterMaster;
import com.ticketingSystem.api.service.ParameterMasterService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/by-roles")
    public ResponseEntity<List<ParameterMaster>> getParametersByRoles(@RequestBody List<String> roleIds) {
        return ResponseEntity.ok(parameterMasterService.getParametersForRoles(roleIds));
    }
}
