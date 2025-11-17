package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.config.JwtProperties;
import com.ticketingSystem.api.dto.LoginPayload;
import com.ticketingSystem.api.dto.LoginRequest;
import com.ticketingSystem.api.permissions.RolePermission;
import com.ticketingSystem.api.service.AuthService;
import com.ticketingSystem.api.service.JwtTokenService;
import com.ticketingSystem.api.service.PermissionService;
import com.ticketingSystem.api.repository.RoleRepository;
import jakarta.servlet.http.HttpSession;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

import java.util.*;

@RestController
@RequestMapping("/auth")
@AllArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final PermissionService permissionService;
    private final RoleRepository roleRepository;
    private final JwtTokenService jwtTokenService;
    private final JwtProperties jwtProperties;

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

        return authService.authenticate(request.getUsername(), request.getPassword(), request.getPortal())
                .map(user -> {
                    List<String> roles = user.getRoles() == null ? List.of()
                            : Arrays.asList(user.getRoles().split("\\|"));
                    List<Integer> roleIds = roles.stream()
                            .filter(r -> !r.isBlank())
                            .map(Integer::parseInt)
                            .toList();

                    List<String> levels = user.getUserLevel() == null || user.getUserLevel().getLevelIds() == null
                            ? List.of()
                            : Arrays.asList(user.getUserLevel().getLevelIds().split("\\|"));

                    RolePermission permissions = permissionService.mergeRolePermissions(roleIds);

                    Set<String> allowedStatusActionIds = new HashSet<>();
                    roleRepository.findAllById(roleIds).forEach(r -> {
                        if (r.getAllowedStatusActionIds() != null) {
                            for (String s : r.getAllowedStatusActionIds().split("\\|")) {
                                if (!s.isBlank()) {
                                    allowedStatusActionIds.add(s.trim());
                                }
                            }
                        }
                    });

                    if (jwtProperties.isBypassEnabled()) {
                        session.setAttribute("userId", user.getUserId());
                        session.setAttribute("username", request.getUsername());
                        session.setAttribute("roles", user.getRoles());
                        session.setAttribute("levels", user.getUserLevel() != null ? user.getUserLevel().getLevelIds() : null);
                    }

                    LoginPayload payload = LoginPayload.builder()
                            .userId(user.getUserId())
                            .name(user.getName())
                            .username(user.getUsername())
                            .roles(roles)
                            .levels(levels)
                            .permissions(permissions)
                            .allowedStatusActionIds(allowedStatusActionIds)
                            .build();

                    String token = jwtTokenService.generateToken(payload);

                    Map<String, Object> response = new LinkedHashMap<>();
                    response.put("token", token);
                    response.put("userId", user.getUserId());
                    response.put("name", user.getName());
                    response.put("username", user.getUsername());
                    response.put("roles", roles);
                    response.put("permissions", permissions);
                    response.put("levels", levels);
                    response.put("allowedStatusActionIds", allowedStatusActionIds);

                    return ResponseEntity.ok(response);
//                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
//                            .body(response);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid credentials")));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpSession session) {
        if (jwtProperties.isBypassEnabled()) {
            session.invalidate();
        }
        return ResponseEntity.ok().build();
    }
}
