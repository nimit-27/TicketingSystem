package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.config.JwtProperties;
import com.ticketingSystem.api.dto.LoginPayload;
import com.ticketingSystem.api.dto.LoginRequest;
import com.ticketingSystem.api.dto.RefreshTokenRequest;
import com.ticketingSystem.api.dto.TokenPair;
import com.ticketingSystem.api.enums.ClientType;
import com.ticketingSystem.api.permissions.RolePermission;
import com.ticketingSystem.api.service.AuthService;
import com.ticketingSystem.api.service.JwtTokenService;
import com.ticketingSystem.api.service.TokenPairService;
import com.ticketingSystem.api.service.PermissionService;
import com.ticketingSystem.api.repository.RoleRepository;
import jakarta.servlet.http.HttpSession;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.util.StringUtils;

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
    private final TokenPairService tokenPairService;

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

                    ClientType clientType = ClientType.INTERNAL;

                    LoginPayload payload = LoginPayload.builder()
                            .userId(user.getUserId())
                            .name(user.getName())
                            .firstName(user.getFirstName())
                            .lastName(user.getLastName())
                            .username(user.getUsername())
                            .roles(roles)
                            .levels(levels)
                            .permissions(permissions)
                            .allowedStatusActionIds(allowedStatusActionIds)
                            .clientType(clientType)
                            .build();

                    TokenPair tokenPair = tokenPairService.issueTokens(payload);

                    Map<String, Object> response = new LinkedHashMap<>();
                    response.put("token", tokenPair.token());
                    response.put("refreshToken", tokenPair.refreshToken());
                    response.put("expiresInMinutes", tokenPair.expiresInMinutes());
                    response.put("refreshExpiresInMinutes", tokenPair.refreshExpiresInMinutes());
                    response.put("userId", user.getUserId());
                    response.put("name", user.getName());
                    response.put("username", user.getUsername());
                    response.put("firstName", user.getFirstName());
                    response.put("lastName", user.getLastName());
                    response.put("roles", roles);
                    response.put("permissions", permissions);
                    response.put("levels", levels);
                    response.put("allowedStatusActionIds", allowedStatusActionIds);
                    response.put("clientType", clientType.name());

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

    @PostMapping("/refresh")
    /**
     * Rotates an access/refresh token pair. Clients should call this endpoint when the existing access
     * token is about to expire (or receives a 401 due to expiry) and present the current refresh token
     * in the request body. The endpoint validates the refresh token, issues a new access token for
     * immediate use, and returns a new refresh token so the client can continue the session without
     * re-entering credentials.
     */
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
        if (!StringUtils.hasText(request.getRefreshToken())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Refresh token is required"));
        }

        return jwtTokenService.parseRefreshToken(request.getRefreshToken())
                .flatMap(payload -> tokenPairService.rotateUsingProvidedRefreshToken(payload, request.getRefreshToken())
                        .map(tokenPair -> Map.<String, Object>of(
                                "token", tokenPair.token(),
                                "refreshToken", tokenPair.refreshToken(),
                                "expiresInMinutes", tokenPair.expiresInMinutes(),
                                "refreshExpiresInMinutes", tokenPair.refreshExpiresInMinutes()
                        )))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid or expired refresh token")));
    }

}
