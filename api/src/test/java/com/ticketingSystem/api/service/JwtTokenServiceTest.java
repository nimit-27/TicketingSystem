package com.ticketingSystem.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketingSystem.api.config.JwtProperties;
import com.ticketingSystem.api.dto.LoginPayload;
import com.ticketingSystem.api.enums.ClientType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtTokenServiceTest {

    private JwtProperties jwtProperties;
    private JwtTokenService service;

    @BeforeEach
    void setUp() {
        jwtProperties = new JwtProperties();
        jwtProperties.setSecret("12345678901234567890123456789012"); // >= 32 bytes for HS256
        jwtProperties.setExpirationMinutes(5);
        jwtProperties.setRefreshExpirationMinutes(60);
        service = new JwtTokenService(jwtProperties, new ObjectMapper());
    }

    @Test
    void accessTokenRoundTripShouldPreserveClaims() {
        LoginPayload payload = payload();

        String token = service.generateAccessToken(payload);

        JwtTokenService.TokenVerificationResult verification = service.verifyAccessToken(token);
        assertThat(verification.valid()).isTrue();
        assertThat(verification.expired()).isFalse();
        assertThat(verification.payload().getUsername()).isEqualTo("admin");
        assertThat(verification.payload().getRoles()).containsExactly("ROLE_ADMIN");
        assertThat(verification.payload().getAllowedStatusActionIds()).containsExactly("A1", "A2");
    }

    @Test
    void refreshTokenShouldNotBeAcceptedAsAccessToken() {
        String refreshToken = service.generateRefreshToken(payload());

        assertThat(service.parseAccessToken(refreshToken)).isEmpty();
        assertThat(service.verifyAccessToken(refreshToken).valid()).isFalse();
        assertThat(service.parseRefreshToken(refreshToken)).isPresent();
    }

    @Test
    void regenerateAccessTokenShouldSucceedForValidAccessTokenAndFailForRefreshToken() {
        String accessToken = service.generateAccessToken(payload());
        String refreshToken = service.generateRefreshToken(payload());

        assertThat(service.regenerateAccessToken(accessToken)).isPresent();
        assertThat(service.regenerateAccessToken(refreshToken)).isEmpty();
    }

    @Test
    void parseShouldReturnEmptyForTamperedToken() {
        String token = service.generateAccessToken(payload());
        String tampered = token + "corrupt";

        assertThat(service.parseAccessToken(tampered)).isEmpty();
        assertThat(service.verifyAccessToken(tampered).valid()).isFalse();
    }

    @Test
    void generateShouldFailFastWhenSecretMissing() {
        JwtProperties badProps = new JwtProperties();
        badProps.setSecret(" ");
        JwtTokenService badService = new JwtTokenService(badProps, new ObjectMapper());

        assertThatThrownBy(() -> badService.generateAccessToken(payload()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("security.jwt.secret");
    }

    private LoginPayload payload() {
        return LoginPayload.builder()
                .userId("u1")
                .username("admin")
                .name("Admin")
                .firstName("A")
                .lastName("B")
                .roles(List.of("ROLE_ADMIN"))
                .levels(List.of("L1"))
                .allowedStatusActionIds(Set.of("A1", "A2"))
                .officeType("HQ")
                .officeCode("001")
                .zoneCode("Z")
                .regionCode("R")
                .districtCode("D")
                .clientType(ClientType.EXTERNAL)
                .build();
    }
}
