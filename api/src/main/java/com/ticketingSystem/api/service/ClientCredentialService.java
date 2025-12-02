package com.ticketingSystem.api.service;

import com.ticketingSystem.api.models.ClientCredential;
import com.ticketingSystem.api.models.ClientToken;
import com.ticketingSystem.api.repository.ClientCredentialRepository;
import com.ticketingSystem.api.repository.ClientTokenRepository;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ClientCredentialService {
    private final ClientCredentialRepository clientCredentialRepository;
    private final ClientTokenRepository clientTokenRepository;

    public ClientCredentialService(ClientCredentialRepository clientCredentialRepository,
                                   ClientTokenRepository clientTokenRepository) {
        this.clientCredentialRepository = clientCredentialRepository;
        this.clientTokenRepository = clientTokenRepository;
    }

    public ClientCredential registerClient(String clientId, String rawSecret, String description) {
        ClientCredential credential = new ClientCredential();
        credential.setClientId(clientId);
        credential.setClientSecretHash(hashSecret(rawSecret));
        credential.setDescription(description);
        credential.setCreatedAt(LocalDateTime.now());
        return clientCredentialRepository.save(credential);
    }

    public boolean validateClientSecret(String clientId, String providedSecret) {
        return clientCredentialRepository.findByClientIdAndRevokedAtIsNull(clientId)
                .map(credential -> BCrypt.checkpw(providedSecret, credential.getClientSecretHash()))
                .orElse(false);
    }

    public ClientToken recordAccessToken(ClientCredential credential,
                                         String accessTokenHash,
                                         LocalDateTime accessTokenExpiresAt,
                                         String refreshTokenHash,
                                         LocalDateTime refreshTokenExpiresAt) {
        ClientToken token = new ClientToken();
        token.setClientCredential(credential);
        token.setAccessTokenHash(accessTokenHash);
        token.setRefreshTokenHash(refreshTokenHash);
        token.setAccessTokenExpiresAt(accessTokenExpiresAt);
        token.setRefreshTokenExpiresAt(refreshTokenExpiresAt);
        token.setIssuedAt(LocalDateTime.now());
        return clientTokenRepository.save(token);
    }

    public Optional<ClientToken> findActiveToken(String accessTokenHash) {
        return clientTokenRepository.findActiveByAccessTokenHash(accessTokenHash, LocalDateTime.now());
    }

    public void revokeCredential(ClientCredential credential) {
        credential.setRevokedAt(LocalDateTime.now());
        clientCredentialRepository.save(credential);
    }

    public void revokeToken(ClientToken token) {
        token.setRevokedAt(LocalDateTime.now());
        clientTokenRepository.save(token);
    }

    private String hashSecret(String rawSecret) {
        return BCrypt.hashpw(rawSecret, BCrypt.gensalt());
    }
}
