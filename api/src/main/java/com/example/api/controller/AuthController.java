package com.example.api.controller;

import com.example.api.dto.LoginRequest;
import com.example.api.models.User;
import com.example.api.permissions.RolePermission;
import com.example.api.service.AuthService;
import com.example.api.service.PermissionService;
import jakarta.servlet.http.HttpSession;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

import java.util.Arrays;
import java.util.Map;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@AllArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final PermissionService permissionService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpSession session) {
        try {
            // Reload permissions on each login so that any changes in the database
            // are reflected in the login response.
            permissionService.loadPermissions();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to load permissions"));
        }

        return authService.authenticate(request.getUsername(), request.getPassword())
                .map(emp -> {
                    session.setAttribute("userId", emp.getUserId());
                    session.setAttribute("username", request.getUsername());
                    session.setAttribute("password", request.getPassword());
                    session.setAttribute("roles", emp.getRoles());

                    List<String> roles = emp.getRoles() == null ? List.of()
                            : Arrays.asList(emp.getRoles().split("\\|")); // split roles into list

                    RolePermission permissions = permissionService.mergeRolePermissions(roles);
                    System.out.println("Perm: " + permissions);

                    return ResponseEntity.ok(Map.of(
                            "userId", emp.getUserId(),
                            "name", emp.getName(),
                            "username", emp.getUsername(),
                            "roles", roles,
                            "permissions", permissions
                    ));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid credentials")));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok().build();
    }
}
