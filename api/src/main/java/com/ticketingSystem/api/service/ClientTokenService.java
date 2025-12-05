package com.ticketingSystem.api.service;

import com.ticketingSystem.api.config.ClientTokenProperties;
import com.ticketingSystem.api.config.JwtProperties;
import com.ticketingSystem.api.models.ClientCredential;
import com.ticketingSystem.api.models.ClientToken;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HexFormat;
import java.util.Optional;

@Service
public class ClientTokenService {
    private final ClientCredentialService clientCredentialService;
    private final ClientTokenProperties properties;
    private final JwtProperties jwtProperties;

    public ClientTokenService(ClientCredentialService clientCredentialService,
                              ClientTokenProperties properties,
                              JwtProperties jwtProperties) {
        this.clientCredentialService = clientCredentialService;
        this.properties = properties;
        this.jwtProperties = jwtProperties;
    }

    public IssuedClientToken issueAccessToken(ClientCredential credential) {
        TokenWithExpiry token = generateToken(credential);
        LocalDateTime accessExpiresAt = LocalDateTime.ofInstant(token.expiresAt(), ZoneOffset.UTC);
        clientCredentialService.recordAccessToken(credential, hashToken(token.value()), accessExpiresAt, null, null);
        return new IssuedClientToken(token.value(), properties.getAccessExpirationMinutes(), credential.getClientId());
    }

    public Optional<ClientToken> findActiveToken(String rawToken) {
        return clientCredentialService.findActiveToken(hashToken(rawToken));
    }

    public TokenVerificationResult verifyAccessToken(String token) {
        try {
            Claims claims = parseClaims(token);
            return TokenVerificationResult.valid(buildPayload(claims));
        } catch (ExpiredJwtException ex) {
            return TokenVerificationResult.expired(buildPayload(ex.getClaims()));
        } catch (JwtException | IllegalArgumentException ex) {
            return TokenVerificationResult.invalid();
        }
    }

    private TokenWithExpiry generateToken(ClientCredential credential) {
        Instant now = Instant.now();
        Instant expiry = now.plus(properties.getAccessExpirationMinutes(), ChronoUnit.MINUTES);

        String jwt = Jwts.builder()
                .claim("clientId", credential.getClientId())
                .claim("start", Date.from(now))
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiry))
                .signWith(signingKey())
                .compact();

        return new TokenWithExpiry(jwt, expiry);
    }

    private ClientTokenPayload buildPayload(Claims claims) {
        return new ClientTokenPayload(
                claims.get("clientId", String.class),
                claims.getIssuedAt() != null ? claims.getIssuedAt().toInstant() : null,
                claims.getExpiration() != null ? claims.getExpiration().toInstant() : null
        );
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 algorithm not available", ex);
        }
    }

    private Key signingKey() {
        if (!StringUtils.hasText(jwtProperties.getSecret())) {
            throw new IllegalStateException("security.jwt.secret must be configured");
        }
        byte[] keyBytes = jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public record IssuedClientToken(String accessToken, long expiresInMinutes, String clientId) {}

    public record ClientTokenPayload(String clientId, Instant issuedAt, Instant expiresAt) {}

    public record TokenVerificationResult(boolean valid, boolean expired, ClientTokenPayload payload) {
        public static TokenVerificationResult valid(ClientTokenPayload payload) {
            return new TokenVerificationResult(true, false, payload);
        }

        public static TokenVerificationResult expired(ClientTokenPayload payload) {
            return new TokenVerificationResult(false, true, payload);
        }

        public static TokenVerificationResult invalid() {
            return new TokenVerificationResult(false, false, null);
        }
    }

    private record TokenWithExpiry(String value, Instant expiresAt) {}
}
