package com.example.api.controller;

import com.example.api.dto.LoginRequest;
import com.example.api.models.User;
import com.example.api.service.AuthService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpSession session) {
        return authService.authenticate(request.getUsername(), request.getPassword())
                .map(emp -> {
                    session.setAttribute("userId", emp.getUserId());
                    session.setAttribute("username", request.getUsername());
                    session.setAttribute("password", request.getPassword());
                    return ResponseEntity.ok(Map.of(
                            "userId", emp.getUserId(),
                            "name", emp.getName()));
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
