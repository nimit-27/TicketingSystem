package com.example.api.controller;

import com.example.api.permissions.RolePermission;
import com.example.api.service.PermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/permissions")
@CrossOrigin(origins = "http://localhost:3000")
public class PermissionController {
    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @PutMapping("/{role}")
    public ResponseEntity<Void> updatePermission(@PathVariable String role,
                                                 @RequestBody RolePermission permission) throws IOException {
        permissionService.updateRolePermissions(role, permission);
        return ResponseEntity.ok().build();
    }
}
