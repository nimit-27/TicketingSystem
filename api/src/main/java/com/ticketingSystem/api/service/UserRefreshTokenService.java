package com.ticketingSystem.api.service;

import com.ticketingSystem.api.models.UserRefreshToken;
import com.ticketingSystem.api.repository.UserRefreshTokenRepository;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
public class UserRefreshTokenService {
    private final UserRefreshTokenRepository userRefreshTokenRepository;

    public UserRefreshTokenService(UserRefreshTokenRepository userRefreshTokenRepository) {
        this.userRefreshTokenRepository = userRefreshTokenRepository;
    }

    public void storeToken(String userId, String refreshToken, long expiresInMinutes) {
        revokeActiveTokens(userId);
        UserRefreshToken token = new UserRefreshToken();
        token.setUserId(userId);
        token.setRefreshTokenHash(hash(refreshToken));
        token.setExpiresAt(LocalDateTime.now().plusMinutes(expiresInMinutes));
        userRefreshTokenRepository.save(token);
    }

    public Optional<UserRefreshToken> findActiveToken(String userId) {
        return userRefreshTokenRepository
                .findFirstByUserIdAndRevokedAtIsNullAndExpiresAtAfterOrderByIssuedAtDesc(userId, LocalDateTime.now());
    }

    public boolean hasActiveToken(String userId) {
        return findActiveToken(userId).isPresent();
    }

    public boolean isRefreshTokenValid(String userId, String refreshToken) {
        return findActiveToken(userId)
                .filter(token -> BCrypt.checkpw(sha256(refreshToken), token.getRefreshTokenHash()))
                .isPresent();
    }

    private void revokeActiveTokens(String userId) {
        List<UserRefreshToken> activeTokens = userRefreshTokenRepository.findByUserIdAndRevokedAtIsNull(userId);
        if (activeTokens.isEmpty()) {
            return;
        }
        LocalDateTime now = LocalDateTime.now();
        activeTokens.forEach(token -> token.setRevokedAt(now));
        userRefreshTokenRepository.saveAll(activeTokens);
    }

    private String hash(String refreshToken) {
        return BCrypt.hashpw(sha256(refreshToken), BCrypt.gensalt());
    }

    private String sha256(String refreshToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(refreshToken.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }
}
