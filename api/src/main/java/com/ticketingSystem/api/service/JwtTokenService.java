package com.ticketingSystem.api.service;

import com.ticketingSystem.api.config.JwtProperties;
import com.ticketingSystem.api.dto.LoginPayload;
import com.ticketingSystem.api.enums.ClientType;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class JwtTokenService {
    private static final TypeReference<List<String>> LIST_OF_STRING = new TypeReference<>() {};
    private static final TypeReference<Set<String>> SET_OF_STRING = new TypeReference<>() {};

    private final JwtProperties properties;
    private final ObjectMapper objectMapper;

    public JwtTokenService(JwtProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    public String generateToken(LoginPayload payload) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", payload.getUserId());
        claims.put("username", payload.getUsername());
        claims.put("name", payload.getName());
        claims.put("firstName", payload.getFirstName());
        claims.put("lastName", payload.getLastName());
        claims.put("roles", payload.getRoles());
        claims.put("levels", payload.getLevels());
        claims.put("allowedStatusActionIds", payload.getAllowedStatusActionIds());
        if (payload.getClientType() != null) {
            claims.put("clientType", payload.getClientType().name());
        }

        Instant now = Instant.now();
        Instant expiry = now.plus(properties.getExpirationMinutes(), ChronoUnit.MINUTES);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(payload.getUsername())
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiry))
                .signWith(signingKey())
                .compact();
    }

    public boolean isTokenValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    public Optional<LoginPayload> parseToken(String token) {
        try {
            Claims claims = parseClaims(token);
            LoginPayload payload = LoginPayload.builder()
                    .userId(claims.get("userId", String.class))
                    .username(claims.get("username", String.class))
                    .name(claims.get("name", String.class))
                    .firstName(claims.get("firstName", String.class))
                    .lastName(claims.get("lastName", String.class))
                    .roles(convertList(claims.get("roles")))
                    .levels(convertList(claims.get("levels")))
                    .allowedStatusActionIds(convertSet(claims.get("allowedStatusActionIds")))
                    .clientType(resolveClientType(claims.get("clientType", String.class)))
                    .build();
            return Optional.of(payload);
        } catch (JwtException ex) {
            return Optional.empty();
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private List<String> convertList(Object value) {
        if (value == null) {
            return Collections.emptyList();
        }
        return objectMapper.convertValue(value, LIST_OF_STRING);
    }

    private Set<String> convertSet(Object value) {
        if (value == null) {
            return Collections.emptySet();
        }
        return objectMapper.convertValue(value, SET_OF_STRING);
    }

    private ClientType resolveClientType(String clientType) {
        if (clientType == null || clientType.isBlank()) {
            return ClientType.INTERNAL;
        }
        try {
            return ClientType.valueOf(clientType);
        } catch (IllegalArgumentException ex) {
            return ClientType.INTERNAL;
        }
    }

    private Key signingKey() {
        if (!StringUtils.hasText(properties.getSecret())) {
            throw new IllegalStateException("security.jwt.secret must be configured");
        }
        byte[] keyBytes = properties.getSecret().getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
