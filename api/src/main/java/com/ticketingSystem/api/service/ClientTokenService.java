package com.ticketingSystem.api.service;

import com.ticketingSystem.api.config.ClientTokenProperties;
import com.ticketingSystem.api.models.ClientCredential;
import com.ticketingSystem.api.models.ClientToken;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

@Service
public class ClientTokenService {
    private final ClientCredentialService clientCredentialService;
    private final ClientTokenProperties properties;

    public ClientTokenService(ClientCredentialService clientCredentialService,
                              ClientTokenProperties properties) {
        this.clientCredentialService = clientCredentialService;
        this.properties = properties;
    }

    public IssuedClientToken issueAccessToken(ClientCredential credential) {
        String rawToken = generateToken();
        LocalDateTime accessExpiresAt = LocalDateTime.now().plusMinutes(properties.getAccessExpirationMinutes());
        clientCredentialService.recordAccessToken(credential, hashToken(rawToken), accessExpiresAt, null, null);
        return new IssuedClientToken(rawToken, properties.getAccessExpirationMinutes(), credential.getClientId());
    }

    public Optional<ClientToken> findActiveToken(String rawToken) {
        return clientCredentialService.findActiveToken(hashToken(rawToken));
    }

    private String generateToken() {
        return UUID.randomUUID().toString().replace("-", "");
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

    public record IssuedClientToken(String accessToken, long expiresInMinutes, String clientId) {}
}
