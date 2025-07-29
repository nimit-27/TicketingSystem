package com.example.api.controller;

import com.example.api.dto.RoleDto;
import com.example.api.models.Role;
import com.example.api.service.RoleService;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Collections;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/roles")
@AllArgsConstructor
public class RoleController {
    private final RoleService roleService;

    @GetMapping
    public ResponseEntity<List<RoleDto>> getAllRoles() {
        return ResponseEntity.ok(roleService.getAllRoles());
    }

    @PostMapping
    public ResponseEntity<RoleDto> addRole(@RequestBody RoleDto roleDto) throws JsonProcessingException {
        return ResponseEntity.ok(roleService.addRole(roleDto));
    }

    @PutMapping("/{role}")
    public ResponseEntity<Void> updateRole(@PathVariable String role, @RequestBody RoleDto roleDto) {
        roleDto.setRole(role);
        roleService.updateRole(roleDto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{role}")
    public ResponseEntity<Void> deleteRole(@PathVariable String role,
                                           @RequestParam(required = false, defaultValue = "false") boolean hard) {
        roleService.deleteRoles(Collections.singletonList(role), hard);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteRoles(@RequestParam List<String> ids,
                                            @RequestParam(required = false, defaultValue = "false") boolean hard) {
        roleService.deleteRoles(ids, hard);
        return ResponseEntity.noContent().build();
    }
}
