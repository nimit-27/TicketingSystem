package com.ticketingSystem.api.service;

import com.ticketingSystem.api.models.UserRefreshToken;
import com.ticketingSystem.api.repository.UserRefreshTokenRepository;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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
                .filter(token -> BCrypt.checkpw(refreshToken, token.getRefreshTokenHash()))
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
        return BCrypt.hashpw(refreshToken, BCrypt.gensalt());
    }
}
