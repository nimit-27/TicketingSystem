package com.example.api.controller;

import com.example.api.dto.RoleDto;
import com.example.api.models.Role;
import com.example.api.service.RoleService;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}
