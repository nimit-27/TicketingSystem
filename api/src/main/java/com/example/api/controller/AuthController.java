package com.example.api.controller;

import com.example.api.dto.LoginRequest;
import com.example.api.models.User;
import com.example.api.service.AuthService;
import com.example.api.service.PermissionService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {
    private final AuthService authService;
    private final PermissionService permissionService;

    public AuthController(AuthService authService, PermissionService permissionService) {
        this.authService = authService;
        this.permissionService = permissionService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpSession session) {
        return authService.authenticate(request.getUsername(), request.getPassword())
                .map(emp -> {
                    session.setAttribute("userId", emp.getUserId());
                    session.setAttribute("username", request.getUsername());
                    session.setAttribute("password", request.getPassword());

                    var permissions = permissionService.mergeRolePermissions(
                            request.getRoles() == null ? List.of() : request.getRoles());

                    return ResponseEntity.ok(Map.of(
                            "userId", emp.getUserId(),
                            "name", emp.getName(),
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
