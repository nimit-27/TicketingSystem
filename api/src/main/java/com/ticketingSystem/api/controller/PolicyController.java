package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.PolicyDto;
import com.ticketingSystem.api.dto.RolePolicyAssignmentRequest;
import com.ticketingSystem.api.service.PolicyService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/policies")
@CrossOrigin(origins = "http://localhost:3000")
@AllArgsConstructor
public class PolicyController {
    private final PolicyService policyService;

    @PostMapping
    public ResponseEntity<PolicyDto> createPolicy(@RequestBody PolicyDto dto) {
        return ResponseEntity.ok(policyService.createPolicy(dto));
    }

    @PutMapping("/{policyId}")
    public ResponseEntity<PolicyDto> updatePolicy(@PathVariable Integer policyId, @RequestBody PolicyDto dto) {
        return ResponseEntity.ok(policyService.updatePolicy(policyId, dto));
    }

    @GetMapping("/{policyId}")
    public ResponseEntity<PolicyDto> getPolicy(@PathVariable Integer policyId) {
        return ResponseEntity.ok(policyService.getPolicy(policyId));
    }

    @GetMapping
    public ResponseEntity<List<PolicyDto>> getPolicies(@RequestParam(required = false) String resource) {
        return ResponseEntity.ok(policyService.getPolicies(resource));
    }

    @PostMapping("/roles/{roleId}")
    public ResponseEntity<Void> assignPoliciesToRole(@PathVariable Integer roleId,
                                                     @RequestBody RolePolicyAssignmentRequest request) {
        policyService.assignPoliciesToRole(roleId, request.getPolicyIds(), request.getPolicyCodes(), request.getUpdatedBy());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/roles/{roleId}/effective-access")
    public ResponseEntity<List<PolicyDto>> getRoleEffectiveAccess(@PathVariable Integer roleId) {
        return ResponseEntity.ok(policyService.getRoleEffectivePolicies(roleId));
    }
}
