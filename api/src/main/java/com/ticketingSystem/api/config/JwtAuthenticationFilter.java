package com.ticketingSystem.api.config;

import com.ticketingSystem.api.dto.LoginPayload;
import com.ticketingSystem.api.dto.TokenPair;
import com.ticketingSystem.api.service.JwtTokenService;
import com.ticketingSystem.api.service.TokenPairService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final Set<String> PUBLIC_ENDPOINTS = Set.of(
            "helpdesk/auth/login",
            "helpdesk/auth/logout",
            "/auth/logout",
            "/auth/login",
            "/auth/refresh",
            "auth/logout",
            "auth/login",
            "auth/refresh",
            "helpdesk/auth/refresh",
            "http://localhost:8082/helpdesk/auth/login",
            "/m/auth/token",
            "helpdesk/m/auth/token"
    );

    private final JwtTokenService jwtTokenService;
    private final JwtProperties jwtProperties;
    private final TokenPairService tokenPairService;

    public JwtAuthenticationFilter(JwtTokenService jwtTokenService,
                                   JwtProperties jwtProperties,
                                   TokenPairService tokenPairService) {
        this.jwtTokenService = jwtTokenService;
        this.jwtProperties = jwtProperties;
        this.tokenPairService = tokenPairService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        if (shouldBypass(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        String token = resolveToken(header, request.getParameter("token"));

        if (token != null) {
            JwtTokenService.TokenVerificationResult result = jwtTokenService.verifyAccessToken(token);
            if (result.valid()) {
                authenticate(result.payload(), request);
            } else if (result.expired()) {
                handleExpiredAccessToken(result.payload(), request, response);
            }
        }

        filterChain.doFilter(request, response);
    }

    private void handleExpiredAccessToken(LoginPayload payload,
                                          HttpServletRequest request,
                                          HttpServletResponse response) {
        if (payload == null) {
            return;
        }

        tokenPairService.rotateUsingStoredToken(payload).ifPresent(tokenPair -> {
            authenticate(payload, request);
            writeTokenHeaders(response, tokenPair);
        });
    }

    private void authenticate(LoginPayload payload, HttpServletRequest request) {
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            return;
        }
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(payload, null, authorities(payload));
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private void writeTokenHeaders(HttpServletResponse response, TokenPair tokenPair) {
        response.setHeader(HttpHeaders.AUTHORIZATION, "Bearer " + tokenPair.token());
        response.setHeader("X-Access-Token", tokenPair.token());
        response.setHeader("X-Refresh-Token", tokenPair.refreshToken());
        response.setHeader("X-Access-Token-Expires-In-Minutes", String.valueOf(tokenPair.expiresInMinutes()));
        response.setHeader("X-Refresh-Token-Expires-In-Minutes", String.valueOf(tokenPair.refreshExpiresInMinutes()));
    }

    private String resolveToken(String authorizationHeader, String tokenParam) {
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);
        }

        if (tokenParam != null && !tokenParam.isBlank()) {
            return tokenParam.trim();
        }

        return null;
    }

    private boolean shouldBypass(HttpServletRequest request) {
        if (jwtProperties.isBypassEnabled()) {
            return true;
        }
        String path = request.getRequestURI();
        if (PUBLIC_ENDPOINTS.contains(path)) {
            return true;
        }
        return "OPTIONS".equalsIgnoreCase(request.getMethod());
    }

    private Collection<SimpleGrantedAuthority> authorities(LoginPayload payload) {
        List<String> roles = payload.getRoles();
        if (roles == null) {
            return List.of();
        }
        return roles.stream()
                .filter(role -> role != null && !role.isBlank())
                .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toSet());
    }
}
