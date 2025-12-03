package com.ticketingSystem.api.service;

import com.ticketingSystem.api.config.JwtProperties;
import com.ticketingSystem.api.dto.LoginPayload;
import com.ticketingSystem.api.dto.TokenPair;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class TokenPairService {
    private final JwtTokenService jwtTokenService;
    private final JwtProperties jwtProperties;
    private final UserRefreshTokenService userRefreshTokenService;

    public TokenPairService(JwtTokenService jwtTokenService,
                            JwtProperties jwtProperties,
                            UserRefreshTokenService userRefreshTokenService) {
        this.jwtTokenService = jwtTokenService;
        this.jwtProperties = jwtProperties;
        this.userRefreshTokenService = userRefreshTokenService;
    }

    public TokenPair issueTokens(LoginPayload payload) {
        String accessToken = jwtTokenService.generateAccessToken(payload);
        String refreshToken = jwtTokenService.generateRefreshToken(payload);
        userRefreshTokenService.storeToken(payload.getUserId(), refreshToken, jwtProperties.getRefreshExpirationMinutes());
        return new TokenPair(accessToken, refreshToken, jwtProperties.getExpirationMinutes(),
                jwtProperties.getRefreshExpirationMinutes());
    }

    public Optional<TokenPair> rotateUsingStoredToken(LoginPayload payload) {
        if (!userRefreshTokenService.hasActiveToken(payload.getUserId())) {
            return Optional.empty();
        }
        return Optional.of(issueTokens(payload));
    }

    public Optional<TokenPair> rotateUsingProvidedRefreshToken(LoginPayload payload, String providedRefreshToken) {
        if (!userRefreshTokenService.isRefreshTokenValid(payload.getUserId(), providedRefreshToken)) {
            return Optional.empty();
        }
        return Optional.of(issueTokens(payload));
    }
}
