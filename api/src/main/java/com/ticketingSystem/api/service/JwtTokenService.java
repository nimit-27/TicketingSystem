package com.ticketingSystem.api.service;

import com.ticketingSystem.api.config.JwtProperties;
import com.ticketingSystem.api.dto.LoginPayload;
import com.ticketingSystem.api.enums.ClientType;
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
    private static final String CLAIM_TOKEN_TYPE = "tokenType";
    private static final TypeReference<List<String>> LIST_OF_STRING = new TypeReference<>() {};
    private static final TypeReference<Set<String>> SET_OF_STRING = new TypeReference<>() {};

    private enum TokenType {
        ACCESS,
        REFRESH
    }

    private final JwtProperties properties;
    private final ObjectMapper objectMapper;

    public JwtTokenService(JwtProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    public String generateAccessToken(LoginPayload payload) {
        return generateToken(payload, properties.getExpirationMinutes(), TokenType.ACCESS);
    }

    public String generateRefreshToken(LoginPayload payload) {
        return generateToken(payload, properties.getRefreshExpirationMinutes(), TokenType.REFRESH);
    }

    private String generateToken(LoginPayload payload, long expirationMinutes, TokenType tokenType) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", payload.getUserId());
        claims.put("username", payload.getUsername());
        claims.put("name", payload.getName());
        claims.put("firstName", payload.getFirstName());
        claims.put("lastName", payload.getLastName());
        claims.put("roles", payload.getRoles());
        claims.put("levels", payload.getLevels());
        claims.put("allowedStatusActionIds", payload.getAllowedStatusActionIds());
        claims.put("officeType", payload.getOfficeType());
        claims.put("officeCode", payload.getOfficeCode());
        claims.put("zoneCode", payload.getZoneCode());
        claims.put("regionCode", payload.getRegionCode());
        claims.put("districtCode", payload.getDistrictCode());
        if (payload.getClientType() != null) {
            claims.put("clientType", payload.getClientType().name());
        }
        claims.put(CLAIM_TOKEN_TYPE, tokenType.name());

        Instant now = Instant.now();
        Instant expiry = now.plus(expirationMinutes, ChronoUnit.MINUTES);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(payload.getUsername())
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiry))
                .signWith(signingKey())
                .compact();
    }

    public boolean isTokenValid(String token) {
        return verifyAccessToken(token).valid();
    }

    public Optional<LoginPayload> parseAccessToken(String token) {
        return parseToken(token, TokenType.ACCESS);
    }

    /**
     * Decode an existing access token and generate a new one using the same payload structure.
     *
     * @param token existing access token
     * @return a newly generated access token or {@link Optional#empty()} if the input token is invalid
     */
    public Optional<String> regenerateAccessToken(String token) {
        try {
            Claims claims = parseClaims(token);
            if (resolveTokenType(claims.get(CLAIM_TOKEN_TYPE, String.class)) != TokenType.ACCESS) {
                return Optional.empty();
            }
            return Optional.of(generateAccessToken(buildPayload(claims)));
        } catch (ExpiredJwtException ex) {
            Claims claims = ex.getClaims();
            if (resolveTokenType(claims.get(CLAIM_TOKEN_TYPE, String.class)) != TokenType.ACCESS) {
                return Optional.empty();
            }
            return Optional.of(generateAccessToken(buildPayload(claims)));
        } catch (JwtException | IllegalArgumentException ex) {
            return Optional.empty();
        }
    }

    public TokenVerificationResult verifyAccessToken(String token) {
        try {
            Claims claims = parseClaims(token);
            TokenType tokenType = resolveTokenType(claims.get(CLAIM_TOKEN_TYPE, String.class));
            if (tokenType != TokenType.ACCESS) {
                return TokenVerificationResult.invalid();
            }
            return TokenVerificationResult.valid(buildPayload(claims));
        } catch (ExpiredJwtException ex) {
            Claims claims = ex.getClaims();
            TokenType tokenType = resolveTokenType(claims.get(CLAIM_TOKEN_TYPE, String.class));
            if (tokenType != TokenType.ACCESS) {
                return TokenVerificationResult.invalid();
            }
            return TokenVerificationResult.expired(buildPayload(claims));
        } catch (JwtException | IllegalArgumentException ex) {
            return TokenVerificationResult.invalid();
        }
    }

    public Optional<LoginPayload> parseRefreshToken(String token) {
        return parseToken(token, TokenType.REFRESH);
    }

    private Optional<LoginPayload> parseToken(String token, TokenType expectedType) {
        try {
            Claims claims = parseClaims(token);
            TokenType tokenType = resolveTokenType(claims.get(CLAIM_TOKEN_TYPE, String.class));
            if (tokenType != expectedType) {
                return Optional.empty();
            }
            return Optional.of(buildPayload(claims));
        } catch (JwtException | IllegalArgumentException ex) {
            return Optional.empty();
        }
    }

    private LoginPayload buildPayload(Claims claims) {
        return LoginPayload.builder()
                .userId(claims.get("userId", String.class))
                .username(claims.get("username", String.class))
                .name(claims.get("name", String.class))
                .firstName(claims.get("firstName", String.class))
                .lastName(claims.get("lastName", String.class))
                .roles(convertList(claims.get("roles")))
                .levels(convertList(claims.get("levels")))
                .allowedStatusActionIds(convertSet(claims.get("allowedStatusActionIds")))
                .officeType(claims.get("officeType", String.class))
                .officeCode(claims.get("officeCode", String.class))
                .zoneCode(claims.get("zoneCode", String.class))
                .regionCode(claims.get("regionCode", String.class))
                .districtCode(claims.get("districtCode", String.class))
                .clientType(resolveClientType(claims.get("clientType", String.class)))
                .build();
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

    private TokenType resolveTokenType(String tokenType) {
        if (!StringUtils.hasText(tokenType)) {
            return TokenType.ACCESS;
        }
        try {
            return TokenType.valueOf(tokenType);
        } catch (IllegalArgumentException ex) {
            return TokenType.ACCESS;
        }
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

    public record TokenVerificationResult(boolean valid, boolean expired, LoginPayload payload) {
        public static TokenVerificationResult valid(LoginPayload payload) {
            return new TokenVerificationResult(true, false, payload);
        }

        public static TokenVerificationResult expired(LoginPayload payload) {
            return new TokenVerificationResult(false, true, payload);
        }

        public static TokenVerificationResult invalid() {
            return new TokenVerificationResult(false, false, null);
        }
    }
}
