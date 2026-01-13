package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.config.JwtProperties;
import com.ticketingSystem.api.dto.LoginPayload;
import com.ticketingSystem.api.dto.LoginRequest;
import com.ticketingSystem.api.dto.RefreshTokenRequest;
import com.ticketingSystem.api.dto.TokenPair;
import com.ticketingSystem.api.enums.ClientType;
import com.ticketingSystem.api.models.SsoLoginPayload;
import com.ticketingSystem.api.permissions.RolePermission;
import com.ticketingSystem.api.service.AuthService;
import com.ticketingSystem.api.service.JwtTokenService;
import com.ticketingSystem.api.service.TokenPairService;
import com.ticketingSystem.api.service.PermissionService;
import com.ticketingSystem.api.service.SsoAuthService;
import com.ticketingSystem.api.service.TokenCookieService;
import com.ticketingSystem.api.repository.RoleRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
    private final SsoAuthService ssoAuthService;
    private final TokenCookieService tokenCookieService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpSession session, HttpServletResponse response) {
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
                    tokenCookieService.addTokenCookies(response, tokenPair);

                    Map<String, Object> responseBody = new LinkedHashMap<>();
                    responseBody.put("token", tokenPair.token());
                    responseBody.put("refreshToken", tokenPair.refreshToken());
                    responseBody.put("expiresInMinutes", tokenPair.expiresInMinutes());
                    responseBody.put("refreshExpiresInMinutes", tokenPair.refreshExpiresInMinutes());
                    responseBody.put("userId", user.getUserId());
                    responseBody.put("name", user.getName());
                    responseBody.put("username", user.getUsername());
                    responseBody.put("firstName", user.getFirstName());
                    responseBody.put("lastName", user.getLastName());
                    responseBody.put("roles", roles);
                    responseBody.put("permissions", permissions);
                    responseBody.put("levels", levels);
                    responseBody.put("allowedStatusActionIds", allowedStatusActionIds);
                    responseBody.put("clientType", clientType.name());

                    return ResponseEntity.ok(responseBody);
//                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
//                            .body(response);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid credentials")));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpSession session, HttpServletResponse response) {
        if (jwtProperties.isBypassEnabled()) {
            session.invalidate();
        }
        tokenCookieService.clearTokenCookies(response);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/sso")
    public ResponseEntity<?> ssoLogin(@RequestBody SsoLoginPayload ssoLoginPayload,
                                      HttpSession session,
                                      HttpServletResponse response) {
        try {
            permissionService.loadPermissions();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to load permissions"));
        }

        return ssoAuthService.login(ssoLoginPayload, session)
                .map(loginResponse -> {
                    buildTokenPair(loginResponse).ifPresent(tokenPair -> tokenCookieService.addTokenCookies(response, tokenPair));
                    return ResponseEntity.ok(loginResponse);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid SSO credentials")));
    }

    @PostMapping("/refresh")
    /**
     * Rotates an access/refresh token pair. Clients should call this endpoint when the existing access
     * token is about to expire (or receives a 401 due to expiry) and present the current refresh token
     * in the request body. The endpoint validates the refresh token, issues a new access token for
     * immediate use, and returns a new refresh token so the client can continue the session without
     * re-entering credentials.
     */
    public ResponseEntity<?> refreshToken(@RequestBody(required = false) RefreshTokenRequest request,
                                          HttpServletRequest httpRequest,
                                          HttpServletResponse response) {
        String refreshToken = request != null ? request.getRefreshToken() : null;
        if (!StringUtils.hasText(refreshToken)) {
            refreshToken = tokenCookieService.readRefreshToken(httpRequest).orElse(null);
        }
        if (!StringUtils.hasText(refreshToken)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Refresh token is required"));
        }

        return jwtTokenService.parseRefreshToken(refreshToken)
                .flatMap(payload -> tokenPairService.rotateUsingProvidedRefreshToken(payload, refreshToken)
                        .map(tokenPair -> Map.<String, Object>of(
                                "token", tokenPair.token(),
                                "refreshToken", tokenPair.refreshToken(),
                                "expiresInMinutes", tokenPair.expiresInMinutes(),
                                "refreshExpiresInMinutes", tokenPair.refreshExpiresInMinutes()
                        )))
                .map(body -> {
                    buildTokenPair(body).ifPresent(tokenPair -> tokenCookieService.addTokenCookies(response, tokenPair));
                    return ResponseEntity.ok(body);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid or expired refresh token")));
    }

    private Optional<TokenPair> buildTokenPair(Map<String, Object> body) {
        Object tokenValue = body.get("token");
        Object refreshValue = body.get("refreshToken");
        Object expiresValue = body.get("expiresInMinutes");
        Object refreshExpiresValue = body.get("refreshExpiresInMinutes");
        if (!(tokenValue instanceof String token) || !(refreshValue instanceof String refreshToken)) {
            return Optional.empty();
        }
        long expiresIn = expiresValue instanceof Number number ? number.longValue() : jwtProperties.getExpirationMinutes();
        long refreshExpiresIn = refreshExpiresValue instanceof Number number
                ? number.longValue()
                : jwtProperties.getRefreshExpirationMinutes();
        return Optional.of(new TokenPair(token, refreshToken, expiresIn, refreshExpiresIn));
    }

}
