package com.example.api.controller;

import com.example.api.dto.PermissionsConfigDto;
import com.example.api.permissions.RolePermission;
import com.example.api.permissions.PermissionsConfig;
import com.example.api.service.PermissionService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/permissions")
@CrossOrigin(origins = "http://localhost:3000")
@AllArgsConstructor
public class PermissionController {
    private final PermissionService permissionService;

    @GetMapping
    public ResponseEntity<PermissionsConfig> getAllPermissions() {
        PermissionsConfig cfg = new PermissionsConfig();
        cfg.setRoles(permissionService.getAllRolePermissions());
        return ResponseEntity.ok(cfg);
    }

    @GetMapping("/{role}")
    public ResponseEntity<RolePermission> getRolePermission(@PathVariable String role) {
        RolePermission perm = permissionService.getRolePermission(role);
        if (perm == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(perm);
    }

    @PostMapping
    public ResponseEntity<Void> overwritePermissions(@RequestBody PermissionsConfigDto dto) throws IOException {
        PermissionsConfig config = new PermissionsConfig();
        config.setRoles(dto.getRoles());
        permissionService.overwritePermissions(config);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{role}")
    public ResponseEntity<Void> updatePermission(@PathVariable String role,
                                                 @RequestBody RolePermission permission) throws IOException {
        permissionService.updateRolePermissions(role, permission);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/load")
    public ResponseEntity<Void> loadPermissions() throws IOException {
        permissionService.loadPermissions();
        return ResponseEntity.ok().build();
    }
}
