package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.ClientToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface ClientTokenRepository extends JpaRepository<ClientToken, String> {
    @Query("SELECT t FROM ClientToken t " +
            "WHERE t.accessTokenHash = :accessTokenHash " +
            "AND t.revokedAt IS NULL " +
            "AND t.accessTokenExpiresAt > :now")
    Optional<ClientToken> findActiveByAccessTokenHash(@Param("accessTokenHash") String accessTokenHash,
                                                      @Param("now") LocalDateTime now);

    @Query("SELECT t FROM ClientToken t " +
            "WHERE t.refreshTokenHash = :refreshTokenHash " +
            "AND t.revokedAt IS NULL " +
            "AND t.refreshTokenExpiresAt > :now")
    Optional<ClientToken> findActiveByRefreshTokenHash(@Param("refreshTokenHash") String refreshTokenHash,
                                                       @Param("now") LocalDateTime now);
}
