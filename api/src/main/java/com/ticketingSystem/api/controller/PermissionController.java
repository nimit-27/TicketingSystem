package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.PermissionsConfigDto;
import com.ticketingSystem.api.permissions.RolePermission;
import com.ticketingSystem.api.permissions.PermissionsConfig;
import com.ticketingSystem.api.service.PermissionService;
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

    @GetMapping("/{roleId}")
    public ResponseEntity<RolePermission> getRolePermission(@PathVariable Integer roleId) {
        RolePermission perm = permissionService.getRolePermission(roleId);
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

    @PutMapping("/{roleId}")
    public ResponseEntity<Void> updatePermission(@PathVariable Integer roleId,
                                                 @RequestBody RolePermission permission) throws IOException {
        permissionService.updateRolePermissions(roleId, permission);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/load")
    public ResponseEntity<Void> loadPermissions() throws IOException {
        permissionService.loadPermissions();
        return ResponseEntity.ok().build();
    }
}
