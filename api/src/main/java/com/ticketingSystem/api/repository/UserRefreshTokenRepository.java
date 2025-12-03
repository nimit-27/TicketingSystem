package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.UserRefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRefreshTokenRepository extends JpaRepository<UserRefreshToken, String> {
    Optional<UserRefreshToken> findFirstByUserIdAndRevokedAtIsNullAndExpiresAtAfterOrderByIssuedAtDesc(
            String userId, LocalDateTime now);

    List<UserRefreshToken> findByUserIdAndRevokedAtIsNull(String userId);
}
