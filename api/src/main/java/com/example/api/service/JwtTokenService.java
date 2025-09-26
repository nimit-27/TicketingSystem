package com.example.api.service;

import com.example.api.config.JwtProperties;
import com.example.api.dto.LoginPayload;
import com.example.api.permissions.RolePermission;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
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
        claims.put("roles", payload.getRoles());
        claims.put("levels", payload.getLevels());
        claims.put("allowedStatusActionIds", payload.getAllowedStatusActionIds());
        RolePermission permissions = payload.getPermissions();
        if (permissions != null) {
            Map<String, Object> permissionMap = new HashMap<>();
            permissionMap.put("sidebar", permissions.getSidebar());
            permissionMap.put("pages", permissions.getPages());
            claims.put("permissions", permissionMap);
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
                    .roles(convertList(claims.get("roles")))
                    .levels(convertList(claims.get("levels")))
                    .allowedStatusActionIds(convertSet(claims.get("allowedStatusActionIds")))
                    .permissions(convertPermissions(claims.get("permissions")))
                    .build();
            return Optional.of(payload);
        } catch (ExpiredJwtException | JwtException ex) {
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

    private RolePermission convertPermissions(Object value) {
        if (value == null) {
            return null;
        }
        Map<String, Object> permissions = objectMapper.convertValue(value, new TypeReference<Map<String, Object>>() {});
        RolePermission rolePermission = new RolePermission();
        rolePermission.setSidebar(castToMap(permissions.get("sidebar")));
        rolePermission.setPages(castToMap(permissions.get("pages")));
        return rolePermission;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> castToMap(Object value) {
        if (value instanceof Map<?, ?> map) {
            return (Map<String, Object>) map;
        }
        return value == null ? null : objectMapper.convertValue(value, new TypeReference<Map<String, Object>>() {});
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

    private Key signingKey() {
        if (!StringUtils.hasText(properties.getSecret())) {
            throw new IllegalStateException("security.jwt.secret must be configured");
        }
        byte[] keyBytes = properties.getSecret().getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
